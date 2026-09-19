"use client";

import { groupGames } from "@/utils/gamesLists";
import { Checkbox, CheckboxGroup, Label } from "@heroui/react";
import { useState } from "react";

const controlClassName = "bg-success-soft before:bg-success";
const indicatorClassName =
  "**:data-[slot=checkbox-default-indicator--checkmark]:text-success-foreground";

export default function GroupGames() {
  const [selectedGames, setSelectedGames] = useState<string[]>([]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-base md:text-lg font-bold underline mt-5">
        Group Games
      </h1>

      {/* list of games */}
      <div className="flex flex-col gap-5 px-5">
        <CheckboxGroup
          className="w-full gap-8"
          name="games"
          value={selectedGames}
          onChange={setSelectedGames}
        >
          <div className="flex flex-col gap-2">
            <Label className="text-sm md:text-base font-semibold">Sports</Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {groupGames.sports.map((section) => {
                const Icon = section.icon;

                return (
                  <Checkbox key={section.id} value={section.name}>
                    <Checkbox.Content>
                      <Checkbox.Control className={controlClassName}>
                        <Checkbox.Indicator className={indicatorClassName} />
                      </Checkbox.Control>
                      <p className="flex items-center gap-5 justify-start">
                        <Icon className="text-2xl text-blue-600" />
                        {section.name}
                      </p>
                    </Checkbox.Content>
                  </Checkbox>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm md:text-base font-semibold">Arts</Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {groupGames.arts.map((section) => {
                const Icon = section.icon;

                return (
                  <Checkbox key={section.id} value={section.name}>
                    <Checkbox.Content>
                      <Checkbox.Control className={controlClassName}>
                        <Checkbox.Indicator className={indicatorClassName} />
                      </Checkbox.Control>
                      <p className="flex items-center gap-5 justify-start">
                        <Icon className="text-2xl text-blue-600" />
                        {section.name}
                      </p>
                    </Checkbox.Content>
                  </Checkbox>
                );
              })}
            </div>
          </div>
        </CheckboxGroup>
        <Label className="my-4 text-sm text-muted">
          Selected: {selectedGames.join(", ") || "None"}
        </Label>
      </div>
    </div>
  );
}
