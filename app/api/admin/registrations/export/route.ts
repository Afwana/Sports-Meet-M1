import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";
import Teams from "@/models/Teams";
import Games from "@/models/Games";
import IndividualRegistration from "@/models/IndividualRegistration";
import GroupRegistration from "@/models/GroupRegistration";

const CATEGORY_ORDER = ["Sports", "Off Stage", "Stage", "Games"];

type IndivRow = {
  gameName: string;
  gender: string;
  ageCategory: string;
  employeeCode: string;
  employeeName: string;
};

type GroupRow = {
  gameName: string;
  gender: string;
  ageCategory: string;
  groupName: string;
  participants: string;
};

// Excel sheet names: max 31 chars, no \ / ? * [ ] : , and must be unique
// within the workbook.
function sanitizeSheetName(name: string, used: Set<string>) {
  const base =
    name
      .replace(/[\\/?*[\]:]/g, " ")
      .trim()
      .slice(0, 31) || "Team";

  let candidate = base;
  let suffix = 2;

  while (used.has(candidate.toLowerCase())) {
    const tag = ` (${suffix})`;
    candidate = base.slice(0, 31 - tag.length) + tag;
    suffix += 1;
  }

  used.add(candidate.toLowerCase());
  return candidate;
}

export async function GET() {
  try {
    await connectDB();
    await getCurrentAdmin();

    const [teams, games, individualRegs, groupRegs] = await Promise.all([
      Teams.find({}).select("_id name").sort({ name: 1 }).lean(),
      Games.find({}).select("_id name type category gender ageCategory").lean(),
      IndividualRegistration.find({})
        .select("employeeCode employeeName teamId games")
        .lean(),
      GroupRegistration.find({})
        .populate("participants", "employeeName employeeCode")
        .select("groupName game team participants")
        .lean(),
    ]);

    const gameMap = new Map(games.map((g) => [String(g._id), g]));

    // team._id -> category -> { individual rows, group rows }
    const structure = new Map<
      string,
      {
        teamName: string;
        byCategory: Map<string, { individual: IndivRow[]; group: GroupRow[] }>;
      }
    >();

    for (const team of teams) {
      const byCategory = new Map<
        string,
        { individual: IndivRow[]; group: GroupRow[] }
      >();

      for (const category of CATEGORY_ORDER) {
        byCategory.set(category, { individual: [], group: [] });
      }

      structure.set(String(team._id), { teamName: team.name, byCategory });
    }

    for (const reg of individualRegs) {
      const teamEntry = structure.get(String(reg.teamId));
      if (!teamEntry) continue;

      for (const g of reg.games || []) {
        const game = gameMap.get(String(g.gameId));
        if (!game) continue;

        const catEntry = teamEntry.byCategory.get(game.category);
        if (!catEntry) continue;

        catEntry.individual.push({
          gameName: game.name,
          gender: game.gender,
          ageCategory: game.ageCategory,
          employeeCode: reg.employeeCode,
          employeeName: reg.employeeName,
        });
      }
    }

    for (const reg of groupRegs) {
      const teamEntry = structure.get(String(reg.team));
      if (!teamEntry) continue;

      const game = gameMap.get(String(reg.game));
      if (!game) continue;

      const catEntry = teamEntry.byCategory.get(game.category);
      if (!catEntry) continue;

      const participantNames = (reg.participants || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((p: any) => `${p.employeeName} (${p.employeeCode})`)
        .join(", ");

      catEntry.group.push({
        gameName: game.name,
        gender: game.gender,
        ageCategory: game.ageCategory,
        groupName: reg.groupName,
        participants: participantNames,
      });
    }

    const workbook = XLSX.utils.book_new();
    const usedNames = new Set<string>();

    // Sheet 1: everything flattened into one filterable table.
    const overviewRows: Record<string, string>[] = [];

    for (const team of teams) {
      const teamEntry = structure.get(String(team._id))!;

      for (const category of CATEGORY_ORDER) {
        const catEntry = teamEntry.byCategory.get(category)!;

        for (const row of catEntry.individual) {
          overviewRows.push({
            Team: team.name,
            Category: category,
            Type: "Individual",
            Gender: row.gender,
            "Age Category": row.ageCategory,
            Game: row.gameName,
            "Employee Code": row.employeeCode,
            "Employee Name": row.employeeName,
            "Group Name": "",
            Participants: "",
          });
        }

        for (const row of catEntry.group) {
          overviewRows.push({
            Team: team.name,
            Category: category,
            Type: "Group",
            Gender: row.gender,
            "Age Category": row.ageCategory,
            Game: row.gameName,
            "Employee Code": "",
            "Employee Name": "",
            "Group Name": row.groupName,
            Participants: row.participants,
          });
        }
      }
    }

    const overviewSheet = XLSX.utils.json_to_sheet(overviewRows);

    overviewSheet["!cols"] = [
      { wch: 16 },
      { wch: 12 },
      { wch: 10 },
      { wch: 8 },
      { wch: 12 },
      { wch: 26 },
      { wch: 14 },
      { wch: 22 },
      { wch: 18 },
      { wch: 42 },
    ];

    XLSX.utils.book_append_sheet(workbook, overviewSheet, "All Registrations");
    usedNames.add("all registrations");

    // One sheet per team: category sections, each split into
    // Individual / Group blocks.
    for (const team of teams) {
      const teamEntry = structure.get(String(team._id))!;

      const hasAnyRegistration = CATEGORY_ORDER.some((category) => {
        const catEntry = teamEntry.byCategory.get(category)!;
        return catEntry.individual.length > 0 || catEntry.group.length > 0;
      });

      if (!hasAnyRegistration) continue;

      const aoa: (string | number)[][] = [];

      for (const category of CATEGORY_ORDER) {
        const catEntry = teamEntry.byCategory.get(category)!;

        if (catEntry.individual.length === 0 && catEntry.group.length === 0) {
          continue;
        }

        aoa.push([category.toUpperCase()]);

        if (catEntry.individual.length > 0) {
          aoa.push(["Individual Registrations"]);
          aoa.push([
            "Game",
            "Gender",
            "Age Category",
            "Employee Code",
            "Employee Name",
          ]);

          for (const row of catEntry.individual) {
            aoa.push([
              row.gameName,
              row.gender,
              row.ageCategory,
              row.employeeCode,
              row.employeeName,
            ]);
          }

          aoa.push([]);
        }

        if (catEntry.group.length > 0) {
          aoa.push(["Group Registrations"]);
          aoa.push([
            "Game",
            "Gender",
            "Age Category",
            "Group Name",
            "Participants",
          ]);

          for (const row of catEntry.group) {
            aoa.push([
              row.gameName,
              row.gender,
              row.ageCategory,
              row.groupName,
              row.participants,
            ]);
          }

          aoa.push([]);
        }

        aoa.push([]);
      }

      const sheet = XLSX.utils.aoa_to_sheet(aoa);

      sheet["!cols"] = [
        { wch: 26 },
        { wch: 10 },
        { wch: 14 },
        { wch: 20 },
        { wch: 42 },
      ];

      const sheetName = sanitizeSheetName(team.name, usedNames);

      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    }

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "Content-Disposition":
          'attachment; filename="sports-meet-registrations.xlsx"',
      },
    });
  } catch (error) {
    console.error("Registrations export error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to export registrations.",
      },
      { status: 500 },
    );
  }
}
