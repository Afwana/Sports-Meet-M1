"use client";

import { Table } from "@heroui/react";

interface IndividualRow {
  employeeCode: string;
  employeeName: string;
}

interface GroupParticipant {
  employeeName: string;
  employeeCode: string;
}

interface GroupRow {
  groupName: string;
  participants: GroupParticipant[];
}

interface GameEntry {
  gameId: string;
  gameName: string;
  type: "Individual" | "Group";
  individual: IndividualRow[];
  group: GroupRow[];
}

// Name-on-top / code-below chip, used inside the Participants cell of both
// tables below.
function ParticipantChip({ name, code }: { name: string; code: string }) {
  return (
    <div>
      <p className="font-medium text-black">{name}</p>
      <p className="text-xs text-slate-400">{code}</p>
    </div>
  );
}

const individualColumns = [
  { id: "slno", name: "SL. NO" },
  { id: "game", name: "Game Name" },
  { id: "participants", name: "Participants" },
];

// One row per game — every individually-registered participant for that
// game is packed into the Participants cell as a wrapping grid of chips.
export function IndividualGamesTable({ games }: { games: GameEntry[] }) {
  const rows = games
    .filter((g) => g.type === "Individual" && g.individual.length > 0)
    .map((g, index) => ({
      key: g.gameId,
      slNo: index + 1,
      gameName: g.gameName,
      participants: g.individual,
    }));

  if (rows.length === 0) return null;

  return (
    <Table className="bg-transparent shadow-none p-0">
      <Table.ScrollContainer className="print:overflow-visible">
        <Table.Content
          aria-label="Individual Registrations Table"
          className="w-full rounded-none"
        >
          <Table.Header columns={individualColumns}>
            {(column) => (
              <Table.Column isRowHeader={column.id === "game"}>
                {column.name}
              </Table.Column>
            )}
          </Table.Header>

          <Table.Body items={rows} className="rounded-none">
            {(row) => (
              <Table.Row
                key={row.key}
                id={row.key}
                className="break-inside-avoid"
              >
                <Table.Cell className="align-top text-black">
                  {row.slNo}
                </Table.Cell>

                <Table.Cell className="align-top font-semibold text-black">
                  {row.gameName}
                </Table.Cell>

                <Table.Cell>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {row.participants.map((p, i) => (
                      <ParticipantChip
                        key={`${p.employeeCode}-${i}`}
                        name={p.employeeName}
                        code={p.employeeCode}
                      />
                    ))}
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

const groupColumns = [
  { id: "slno", name: "SL. NO" },
  { id: "game", name: "Game Name" },
  { id: "group", name: "Group Name" },
  { id: "participants", name: "Participants" },
];

// One row per group registration. SL. NO and Game Name are only shown on
// the first group belonging to a given game — later groups for the same
// game leave those two cells blank, matching the reference layout.
export function GroupGamesTable({ games }: { games: GameEntry[] }) {
  const rows: {
    key: string;
    slNo: number | null;
    gameName: string | null;
    groupName: string;
    participants: GroupParticipant[];
  }[] = [];

  let slNo = 0;

  for (const g of games) {
    if (g.type !== "Group" || g.group.length === 0) continue;

    slNo += 1;

    g.group.forEach((grp, i) => {
      rows.push({
        key: `${g.gameId}-${grp.groupName}-${i}`,
        slNo: i === 0 ? slNo : null,
        gameName: i === 0 ? g.gameName : null,
        groupName: grp.groupName,
        participants: grp.participants,
      });
    });
  }

  if (rows.length === 0) return null;

  return (
    <Table className="bg-transparent shadow-none p-0">
      <Table.ScrollContainer className="print:overflow-visible">
        <Table.Content
          aria-label="Group Registrations Table"
          className="w-full rounded-none"
        >
          <Table.Header columns={groupColumns}>
            {(column) => (
              <Table.Column isRowHeader={column.id === "game"}>
                {column.name}
              </Table.Column>
            )}
          </Table.Header>

          <Table.Body items={rows} className="rounded-none">
            {(row) => (
              <Table.Row
                key={row.key}
                id={row.key}
                className="break-inside-avoid"
              >
                <Table.Cell className="align-top text-black">
                  {row.slNo ?? ""}
                </Table.Cell>

                <Table.Cell className="align-top font-semibold text-black">
                  {row.gameName ?? ""}
                </Table.Cell>

                <Table.Cell className="align-top text-black">
                  {row.groupName}
                </Table.Cell>

                <Table.Cell>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {row.participants.map((p, i) => (
                      <ParticipantChip
                        key={`${p.employeeCode}-${i}`}
                        name={p.employeeName}
                        code={p.employeeCode}
                      />
                    ))}
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
