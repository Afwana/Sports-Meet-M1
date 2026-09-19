"use client";

import { Button, Modal, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaTrash, FaXmark } from "react-icons/fa6";
import { toast } from "sonner";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  link: string;
  isActive: boolean;
}

interface DeleteAnnouncementModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
  onDeleted: (id: string) => void;
}

export default function DeleteAnnouncementModal({
  isOpen,
  onOpenChange,
  announcement,
  onDeleted,
}: DeleteAnnouncementModalProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!announcement) {
      return;
    }

    try {
      setDeleting(true);

      const res = await fetch(`/api/admin/announcements/${announcement._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete announcement.");
        return;
      }

      toast.success("Announcement deleted successfully.");

      onDeleted(announcement._id);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Announcement delete error:", error);

      toast.error("Failed to delete announcement.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!deleting) {
            onOpenChange(open);
          }
        }}
      >
        <Modal.Container size="sm">
          <Modal.Dialog className="p-0">
            <Modal.CloseTrigger>
              <div className="rounded-full bg-default" aria-label="Close">
                <FaXmark />
              </div>
            </Modal.CloseTrigger>

            <Modal.Header className="bg-red-600 p-5">
              <Modal.Heading className="text-white text-xl font-semibold">
                Delete Announcement
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body className="px-4">
              <div className="space-y-4">
                <div className="rounded-lg bg-danger-50 p-4">
                  <div className="flex items-center gap-2 text-danger">
                    <FaTrash />

                    <span className="font-semibold">Delete announcement?</span>
                  </div>

                  <p className="mt-2 text-sm text-danger-700">
                    Are you sure you want to delete{" "}
                    <strong>{announcement?.title}</strong>?
                  </p>
                </div>

                <p className="text-sm text-default-500">
                  This action cannot be undone.
                </p>
              </div>
            </Modal.Body>

            <Modal.Footer className="p-4">
              <Button
                variant="outline"
                onPress={() => onOpenChange(false)}
                isDisabled={deleting}
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                onPress={handleDelete}
                isDisabled={deleting}
              >
                {deleting ? (
                  <>
                    <Spinner size="sm" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash />
                    Delete
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
