"use client";

import { Label, ListBox, Select } from "@heroui/react";
import { X } from "lucide-react";

export interface PositionParticipant {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  team: string;
}

export default function PositionMultiSelect({
  label,
  participants,
  selectedIds,
  usedIds,
  onChange,
}: {
  label: string;
  participants: PositionParticipant[];
  selectedIds: string[];
  usedIds: Set<string>;
  onChange: (ids: string[]) => void;
}) {
  const byId = new Map(participants.map((p) => [p.employeeId, p]));
  const available = participants.filter((p) => !usedIds.has(p.employeeId));

  return (
    <div className="space-y-2">
      <Label className="text-black">{label}</Label>

      <Select
        key={selectedIds.length}
        aria-label={`add participant for ${label}`}
        placeholder={
          available.length === 0 ? "No more participants" : "Add participant"
        }
        isDisabled={available.length === 0}
        value=""
        onChange={(value) => {
          if (typeof value === "string" && value) {
            onChange([...selectedIds, value]);
          }
        }}
      >
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>

        <Select.Popover>
          <ListBox className="text-black">
            {available.map((employee) => (
              <ListBox.Item
                key={employee.employeeId}
                id={employee.employeeId}
                textValue={`${employee.employeeName} ${employee.employeeCode}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{employee.employeeName}</span>
                  <span className="text-xs text-slate-500">
                    {employee.employeeCode} • {employee.team}
                  </span>
                </div>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      {selectedIds.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {selectedIds.map((id) => {
            const employee = byId.get(id);

            return (
              <div
                key={id}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1.5"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-black">
                    {employee?.employeeName ?? id}
                  </span>
                  <span className="truncate text-xs text-slate-500">
                    {employee
                      ? `${employee.employeeCode} • ${employee.team}`
                      : ""}
                  </span>
                </div>

                <button
                  type="button"
                  aria-label={`Remove ${employee?.employeeName ?? "participant"}`}
                  onClick={() => onChange(selectedIds.filter((x) => x !== id))}
                  className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
