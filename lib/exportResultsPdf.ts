import type { ResultRow } from "@/components/admin/ResultsTable";

type PositionKey = "first" | "second" | "third";

const HEADERS = ["SL.NO", "GAME", "TYPE", "WINNER (1st)", "2nd", "3rd"];

/** Each PDF page holds this many results. */
const ROWS_PER_PAGE = 10;

function formatPosition(row: ResultRow, key: PositionKey) {
  if (row.type === "Individual") {
    const people = row.positions[key];

    if (people.length === 0) return "-";

    return people
      .map((p) => `${p.employeeName} (${p.employeeCode})\n${p.teamName}`)
      .join("\n\n");
  }

  const group = row.positions[key];

  if (!group) return "-";

  return `${group.groupName}\n${group.teamName}`;
}

async function getProgramName() {
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    const data = await res.json();

    return (data?.settings?.programName as string) || "Sports Meet";
  } catch {
    return "Sports Meet";
  }
}

/**
 * Downloads every result as a PDF. Mirrors the "All Results" table, minus the
 * Actions column, and ignores the table's search box and pagination.
 */
export async function exportResultsPdf(results: ResultRow[]) {
  // Loaded on demand so the PDF library isn't part of the page bundle.
  const [{ jsPDF }, { default: autoTable }, programName] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    getProgramName(),
  ]);

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 12;

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(`${programName} - Results`, marginX, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on ${today}  |  ${results.length} game(s)`, marginX, 21);

  // One table per page so every page holds exactly ROWS_PER_PAGE results
  // (the last page holds the remainder).
  for (let offset = 0; offset < results.length; offset += ROWS_PER_PAGE) {
    const isFirstPage = offset === 0;

    if (!isFirstPage) doc.addPage();

    autoTable(doc, {
      head: [HEADERS],
      body: results
        .slice(offset, offset + ROWS_PER_PAGE)
        .map((row, i) => [
          String(offset + i + 1),
          `${row.gameName}\n${row.category} | ${row.gender} | ${row.ageCategory}`,
          row.type,
          formatPosition(row, "first"),
          formatPosition(row, "second"),
          formatPosition(row, "third"),
        ]),
      startY: isFirstPage ? 26 : 14,
      margin: { top: 14, left: marginX, right: marginX, bottom: 14 },
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 2.5,
        valign: "top",
        lineColor: [203, 213, 225],
        lineWidth: 0.1,
        textColor: [15, 23, 42],
      },
      headStyles: {
        fillColor: [191, 219, 254],
        textColor: [30, 58, 138],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      columnStyles: {
        0: { cellWidth: 14, halign: "center" },
        1: { cellWidth: 55 },
        2: { cellWidth: 22 },
      },
    });
  }

  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - marginX,
      pageHeight - 6,
      {
        align: "right",
      },
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);

  doc.save(`Results-${stamp}.pdf`);
}
