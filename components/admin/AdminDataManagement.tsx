"use client";

import { Button, Card, Switch } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { FaFileExcel, FaGear, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import SettingsModal from "./SettingsModal";
import { useRouter } from "next/navigation";
import { FaPrint } from "react-icons/fa";

export default function AdminDataManagement() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [importing, setImporting] = useState(false);

  const [clearingTeams, setClearingTeams] = useState(false);
  const [clearingEmployees, setClearingEmployees] = useState(false);
  const [clearingResults, setClearingResults] = useState(false);
  const [clearingIndividuals, setClearingIndividuals] = useState(false);
  const [clearingGroups, setClearingGroups] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [loadingRegistration, setLoadingRegistration] = useState(true);
  const [updatingRegistration, setUpdatingRegistration] = useState(false);

  useEffect(() => {
    const loadRegistrationStatus = async () => {
      try {
        setLoadingRegistration(true);

        const res = await fetch("/api/admin/settings", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          toast.error(data.message || "Failed to load registration status.");
          return;
        }

        setRegistrationOpen(data.settings.registrationOpen === true);
      } catch (error) {
        console.error("Failed to load registration status:", error);

        toast.error("Failed to load registration status.");
      } finally {
        setLoadingRegistration(false);
      }
    };

    loadRegistrationStatus();
  }, []);

  const handleRegistrationToggle = async (value: boolean) => {
    try {
      setUpdatingRegistration(true);

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationOpen: value,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to update registration status.");
        return;
      }

      setRegistrationOpen(data.settings.registrationOpen === true);

      toast.success(
        value
          ? "Individual registration is now open."
          : "Individual registration is now closed.",
      );
    } catch (error) {
      console.error("Registration toggle error:", error);

      toast.error("Failed to update registration status.");
    } finally {
      setUpdatingRegistration(false);
    }
  };

  const importEmployees = async (file: File) => {
    try {
      setImporting(true);

      const formData = new FormData();

      formData.append("file", file);

      const res = await fetch("/api/admin/employees/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Import failed.");
        return;
      }

      toast.success(data.message || "Employees imported successfully.");
      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Failed to import employees.");
    } finally {
      setImporting(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearEmployees = async () => {
    const confirmed = window.confirm(
      "This will permanently delete all employee data, individual registrations and group registrations. This action cannot be undone. Continue?",
    );

    if (!confirmed) return;

    try {
      setClearingEmployees(true);

      const res = await fetch("/api/admin/employees/clear", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to clear employees.");
        return;
      }

      toast.success(data.message || "All employees data cleared successfully.");
      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Failed to clear employees.");
    } finally {
      setClearingTeams(false);
    }
  };

  const handleClearTeams = async () => {
    const confirmed = window.confirm(
      "This will delete all teams and reset team assignments and registrations. Continue?",
    );

    if (!confirmed) return;

    try {
      setClearingTeams(true);

      const res = await fetch("/api/admin/teams/clear", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to clear teams.");
        return;
      }

      toast.success(data.message);
      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Failed to clear teams.");
    } finally {
      setClearingEmployees(false);
    }
  };

  const handleClearResults = async () => {
    const confirmed = window.confirm(
      "This will permanently delete all individual and group results. The point table will also become empty. Registrations will remain. Continue?",
    );

    if (!confirmed) return;

    try {
      setClearingResults(true);

      const res = await fetch("/api/admin/settings/results/clear", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to clear results.");
        return;
      }

      toast.success(data.message || "All results cleared successfully.");
      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Failed to clear results.");
    } finally {
      setClearingResults(false);
    }
  };

  const handleClearIndividuals = async () => {
    const confirmed = window.confirm(
      "This will permanently delete all individual game registrations and reset employee registration status. Employee and team data will remain. Continue?",
    );

    if (!confirmed) return;

    try {
      setClearingIndividuals(true);

      const res = await fetch(
        "/api/admin/settings/registrations/individual/clear",
        {
          method: "DELETE",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.message || "Failed to clear individual registrations.",
        );
        return;
      }

      toast.success(
        data.message ||
          "All individual registrations are cleared successfully.",
      );
      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Failed to clear individual registrations.");
    } finally {
      setClearingIndividuals(false);
    }
  };

  const handleClearGroups = async () => {
    const confirmed = window.confirm(
      "This will permanently delete all group registrations and groups. Employee, team and individual registration data will remain. Continue?",
    );

    if (!confirmed) return;

    try {
      setClearingGroups(true);

      const res = await fetch("/api/admin/settings/registrations/group/clear", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to clear group registrations.");
        return;
      }

      toast.success(
        data.message || "All group registrations cleared successfully.",
      );
      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Failed to clear group registrations.");
    } finally {
      setClearingGroups(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4 text-black">
        {/* SETTINGS */}
        <Card className="p-5">
          <Card.Header>
            <div>
              <Card.Title className="text-black">
                Competition Settings
              </Card.Title>

              <Card.Description>
                Manage company branding and program information.
              </Card.Description>
            </div>
          </Card.Header>

          <Card.Content>
            <Button variant="outline" onPress={() => setSettingsOpen(true)}>
              <FaGear />
              Company Settings
            </Button>
            <Button
              variant="danger"
              onPress={handleClearResults}
              isDisabled={clearingResults}
            >
              <FaTrash />
              {clearingResults ? "Clearing..." : "Clear Results"}
            </Button>
          </Card.Content>
        </Card>

        {/* EMPLOYEE DATA */}
        <Card className="p-5">
          <Card.Header>
            <div>
              <Card.Title className="text-black">Employee Data</Card.Title>

              <Card.Description>
                Import, export and reset employee information.
              </Card.Description>
            </div>
          </Card.Header>

          <Card.Content>
            <div className="flex flex-wrap gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    importEmployees(file);
                  }
                }}
              />

              <Button
                onPress={() => fileInputRef.current?.click()}
                isDisabled={importing}
              >
                <FaFileExcel />

                {importing ? "Importing..." : "Import Excel"}
              </Button>

              <Button
                variant="outline"
                onPress={() => {
                  router.push("/api/admin/employees/export");
                }}
              >
                <FaFileExcel />
                Export Excel
              </Button>

              <Button
                variant="danger"
                onPress={handleClearEmployees}
                isDisabled={clearingEmployees}
              >
                <FaTrash />
                {clearingEmployees ? "Clearing..." : "Clear Employees"}
              </Button>
            </div>
          </Card.Content>
        </Card>

        {/* TEAMS */}
        <Card className="p-5">
          <Card.Header>
            <div>
              <Card.Title className="text-black">Team Data</Card.Title>

              <Card.Description>
                Remove all competition teams and their registrations.
              </Card.Description>
            </div>
          </Card.Header>

          <Card.Content>
            <Button
              variant="danger"
              onPress={handleClearTeams}
              isDisabled={clearingTeams}
            >
              <FaTrash />
              {clearingTeams ? "Clearing..." : "Clear Teams"}
            </Button>
          </Card.Content>
        </Card>
        {/* REGISTRATIONS */}
        <Card className="p-5">
          <Card.Header>
            <div>
              <Card.Title className="text-black">Registrations Data</Card.Title>

              <Card.Description>
                Remove all Individuals and Group Registrations.
              </Card.Description>
            </div>
          </Card.Header>

          <Card.Content>
            <div className="rounded-lg border p-4">
              <Switch
                isSelected={registrationOpen}
                isDisabled={loadingRegistration || updatingRegistration}
                onChange={handleRegistrationToggle}
              >
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>

                  <p className="text-sm text-slate-300">
                    {loadingRegistration
                      ? "Loading registration status..."
                      : updatingRegistration
                        ? "Updating registration status..."
                        : registrationOpen
                          ? "Employees can now register for games."
                          : "Registration is currently closed."}
                  </p>
                </Switch.Content>
              </Switch>
            </div>
            <div className="grid grdi-cols-1 md:grid-cols-2 gap-3 mt-2">
              <Button
                variant="outline"
                onPress={() => router.push("/api/admin/registrations/export")}
              >
                <FaFileExcel />
                Export Registrations
              </Button>
              <Button
                variant="primary"
                onPress={() => {
                  router.push("/admin/registrations");
                }}
              >
                <FaPrint />
                Print Registrations
              </Button>
              <Button
                variant="danger"
                onPress={handleClearIndividuals}
                isDisabled={clearingIndividuals}
              >
                <FaTrash />
                {clearingIndividuals ? "Clearing..." : "Clear Individuals"}
              </Button>
              <Button
                variant="danger"
                onPress={handleClearGroups}
                isDisabled={clearingGroups}
              >
                <FaTrash />
                {clearingGroups ? "Clearing..." : "Clear Groups"}
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>

      <SettingsModal isOpen={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
