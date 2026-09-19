"use client";

import { iconMap, IconName } from "@/utils/iconMap";
import { Label, ListBox, Select } from "@heroui/react";

interface IconPickerProps {
  value: IconName;
  onChange: (value: IconName) => void;
  label?: string;
}

export default function IconPicker({
  value,
  onChange,
  label = "Icon",
}: IconPickerProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>

      <Select
        value={value}
        onChange={(nextValue) => onChange(nextValue as IconName)}
        placeholder="Choose an icon"
        aria-label="Select icon"
      >
        <Select.Trigger className="h-11">
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>

        <Select.Popover>
          <ListBox className="max-h-72 overflow-y-auto">
            {Object.entries(iconMap).map(([name, Icon]) => (
              <ListBox.Item key={name} id={name} textValue={name}>
                <div className="flex items-center gap-3">
                  <Icon className="text-xl text-blue-600" />
                  <span>{name}</span>
                </div>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
}
