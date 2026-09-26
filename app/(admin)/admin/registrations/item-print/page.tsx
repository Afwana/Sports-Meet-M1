"use client";

import {
  Button,
  Key,
  Label,
  ListBox,
  Select,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface GameEntry {
  gameId: string;
  gameName: string;
  type: string;
  participants: string[];
}

interface CategoryEntry {
  category: string;
  games: GameEntry[];
}

const CATEGORY_OPTIONS = ["Sports", "Off Stage", "Stage", "Games"];

export default function ItemPrintPage() {
  const [report, setReport] = useState<CategoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("Sports");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/registrations/item-print");
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load report.");
          return;
        }

        setReport(data.report || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load report.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const currentCategory = useMemo(
    () => report.find((r) => r.category === category),
    [report, category],
  );

  return (
    <div className="min-h-screen bg-white px-6 py-8 text-black print:p-0">
      <style>{`
        @page{
          size:A4;
          margin:14mm 12mm;
        }
      `}</style>

      {/* Toolbar */}
      <div className="mb-6 flex items-end justify-between gap-4 print:hidden">
        <div className="w-full md:w-1/4">
          <Label className="mb-2">Select Category</Label>

          <Select
            aria-label="select category"
            value={category}
            onChange={(value: Key | null) => {
              if (!value) return;
              setCategory(String(value));
            }}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>

            <Select.Popover>
              <ListBox>
                {CATEGORY_OPTIONS.map((category) => (
                  <ListBox.Item
                    key={category}
                    id={category}
                    textValue={category}
                  >
                    {category}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        <Button onPress={() => window.print()} isDisabled={loading}>
          <Printer size={16} />
          Print
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 print:hidden">
          <Spinner>Loading...</Spinner>
        </div>
      ) : !currentCategory ? (
        <div className="text-center text-default-500">
          No registrations found.
        </div>
      ) : (
        <section className="mx-auto max-w-5xl">
          <h1 className="mb-1 border-b-2 border-black pb-2 text-2xl font-bold">
            {currentCategory.category} Items
          </h1>

          <p className="mb-6 text-sm text-default-500 print:hidden">
            Item-wise registration report
          </p>

          <Table
            aria-label="Item wise registrations"
            // classNames={{
            //   table: "border-collapse border border-black",
            //   th: "bg-gray-100 border border-black text-black text-sm font-semibold",
            //   td: "border border-black text-black text-sm align-top",
            //   tr: "item-row",
            // }}
          >
            <Table.ScrollContainer>
              <Table.Content
                aria-label="Item-wise Registrations"
                className="w-full rounded-none"
              >
                <TableHeader>
                  <TableColumn width={220} isRowHeader>
                    ITEM NAME
                  </TableColumn>
                  <TableColumn>PARTICIPANTS</TableColumn>
                </TableHeader>

                <TableBody>
                  {currentCategory.games.map((game) => (
                    <TableRow key={game.gameId}>
                      <TableCell className="align-top font-semibold">
                        <div className="pt-1">{game.gameName}</div>
                      </TableCell>

                      <TableCell className="participants-cell">
                        {game.participants.length ? (
                          game.type === "Individual" ? (
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                              {game.participants.map((participant, index) => (
                                <div
                                  key={index}
                                  className="rounded-md border border-default-200 p-2 text-xs leading-5"
                                >
                                  {participant}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {game.participants.map((participant, index) => (
                                <div
                                  key={index}
                                  className="rounded-md border border-default-200 p-2 text-sm leading-6"
                                >
                                  {participant}
                                </div>
                              ))}
                            </div>
                          )
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </section>
      )}
    </div>
  );
}
