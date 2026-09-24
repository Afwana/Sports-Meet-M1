"use client";

import { Button, Input, Label, Modal, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CompanySettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsModal({
  isOpen,
  onOpenChange,
}: CompanySettingsModalProps) {
  const router = useRouter();
  const [programName, setProgramName] = useState("");

  const [companyLogo, setCompanyLogo] = useState("");

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadSettings = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/admin/settings", {
          cache: "no-store",
        });

        const text = await res.text();

        let data: {
          success?: boolean;
          message?: string;
          settings?: {
            programName: string;
            companyLogo: string;
          };
        };

        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          throw new Error("Server returned an invalid response.");
        }

        if (!res.ok) {
          toast.error(data.message || "Failed to load settings.");
          return;
        }

        setProgramName(data.settings?.programName || "Recreation Meet 2026");

        setCompanyLogo(data.settings?.companyLogo || "");
      } catch (error) {
        console.error("Failed to load settings:", error);

        toast.error(
          error instanceof Error ? error.message : "Failed to load settings.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [isOpen]);

  const handleLogoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("file", file);

      const res = await fetch("/api/upload/company-logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to upload logo.");
        return;
      }

      setCompanyLogo(data.url);

      toast.success("Logo uploaded successfully.");
      router.refresh();
    } catch (error) {
      console.error("Logo upload error:", error);

      toast.error("Failed to upload logo.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          programName,
          companyLogo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save settings.");
        return;
      }

      toast.success("Settings updated successfully.");

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!saving) {
            onOpenChange(open);
          }
        }}
      >
        <Modal.Container size="lg">
          <Modal.Dialog className="p-0">
            <Modal.Header className="bg-blue-600 p-3">
              <Modal.Heading className="text-lg font-bold text-white">
                Company Settings
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body className="p-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Spinner />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col gap-1 space-y-2">
                    <Label className="text-black">Program Name</Label>

                    <Input
                      value={programName}
                      onChange={(event) => setProgramName(event.target.value)}
                      placeholder="Enter program name"
                    />
                  </div>

                  <div className="flex flex-col gap-1 space-y-3">
                    <Label className="text-black">Company Logo</Label>

                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />

                    {companyLogo && (
                      <div className="flex h-32 w-32 items-center justify-center rounded-lg border p-3">
                        <Image
                          src={companyLogo}
                          alt="Company logo"
                          width={120}
                          height={120}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Modal.Body>

            <Modal.Footer className="p-3">
              <Button
                variant="outline"
                onPress={() => onOpenChange(false)}
                isDisabled={saving}
              >
                Cancel
              </Button>

              <Button onPress={handleSave} isDisabled={saving || loading}>
                {saving ? (
                  <>
                    <Spinner size="sm" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
