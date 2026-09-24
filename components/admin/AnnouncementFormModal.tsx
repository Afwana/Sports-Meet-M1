"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Label,
  Modal,
  Spinner,
  Switch,
  Input,
  TextArea,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";

const announcementSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  message: z.string().trim().min(1, "Message is required."),
  link: z.string().trim().optional(),
  isActive: z.boolean(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface Announcement {
  _id: string;
  title: string;
  message: string;
  link: string;
  isActive: boolean;
  createdAt: string;
}

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
  onSaved: (announcement: Announcement) => void;
}

export default function AnnouncementFormModal({
  isOpen,
  onOpenChange,
  announcement,
  onSaved,
}: AnnouncementFormModalProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const isEdit = announcement !== null;

  const { control, handleSubmit, reset } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      message: "",
      link: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({
      title: announcement?.title ?? "",
      message: announcement?.message ?? "",
      link: "",
      isActive: announcement?.isActive ?? true,
    });
  }, [isOpen, announcement, reset]);

  const onSubmit = async (values: AnnouncementFormData) => {
    try {
      setSaving(true);

      const url = isEdit
        ? `/api/admin/announcements/${announcement._id}`
        : "/api/admin/announcements";

      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save announcement.");
        return;
      }

      onSaved(data.announcement);

      toast.success(
        isEdit
          ? "Announcement updated successfully."
          : "Announcement created successfully.",
      );

      onOpenChange(false);
      reset({
        title: "",
        message: "",
        link: "",
        isActive: true,
      });
      router.refresh();
    } catch (error) {
      console.error("Announcement save error:", error);

      toast.error("Failed to save announcement.");
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
            <Modal.Header className="bg-blue-800 p-4">
              <Modal.Heading className="text-white font-bold text-xl">
                {isEdit ? "Edit Announcement" : "Create Announcement"}
              </Modal.Heading>
            </Modal.Header>

            <form id="announcement-form" onSubmit={handleSubmit(onSubmit)}>
              <Modal.Body className="p-5">
                <div className="space-y-5">
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-1 flex flex-col gap-1">
                        <Label>Title</Label>

                        <Input
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder="Enter announcement title"
                        />
                      </div>
                    )}
                  />

                  <Controller
                    name="message"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-1 flex flex-col gap-1">
                        <Label>Message</Label>

                        <TextArea
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder="Enter announcement message"
                          rows={5}
                        />
                      </div>
                    )}
                  />

                  <Controller
                    name="link"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-1 flex flex-col gap-1">
                        <Label>Link</Label>

                        <Input
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                    )}
                  />

                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        isSelected={field.value}
                        onChange={(value) => field.onChange(value)}
                      >
                        <Switch.Content>
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>

                          <div className="flex flex-col">
                            <span className="font-medium">Active</span>

                            <span className="text-sm text-slate-300">
                              Show this announcement to employees and captains
                            </span>
                          </div>
                        </Switch.Content>
                      </Switch>
                    )}
                  />
                </div>
              </Modal.Body>

              <Modal.Footer className="p-5">
                <Button
                  variant="outline"
                  type="button"
                  onPress={() => onOpenChange(false)}
                  isDisabled={saving}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  form="announcement-form"
                  isDisabled={saving}
                >
                  {saving ? (
                    <>
                      <Spinner size="sm" />
                      Saving...
                    </>
                  ) : isEdit ? (
                    "Save Changes"
                  ) : (
                    "Create Announcement"
                  )}
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
