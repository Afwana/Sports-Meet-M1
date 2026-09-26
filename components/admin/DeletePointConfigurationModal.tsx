"use client";

import { Button, Modal, Spinner } from "@heroui/react";
import { useState } from "react";
import { toast } from "sonner";

import type { PointConfiguration } from "./PointConfigurationFormModal";
import { useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  configuration: PointConfiguration | null;
  onDeleted: () => void;
}

export default function DeletePointConfigurationModal({
  isOpen,
  onClose,
  configuration,
  onDeleted,
}: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!configuration) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `/api/admin/point-configurations/${configuration._id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to delete point configuration.");
        return;
      }

      toast.success("Point configuration deleted successfully.");

      onDeleted();
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Point configuration delete error:", error);

      toast.error("Failed to delete point configuration.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
        variant="opaque"
      >
        <Modal.Container size="sm">
          <Modal.Dialog className="p-0">
            <Modal.Header className="bg-red-600 p-5">
              <Modal.Heading className="text-white text-lg font-bold">
                Delete Point Configuration
              </Modal.Heading>

              <Modal.CloseTrigger />
            </Modal.Header>

            <Modal.Body className="p-4">
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-foreground">
                    {configuration?.name}
                  </span>
                  ?
                </p>

                <p className="text-sm text-danger">
                  This action cannot be undone.
                </p>
              </div>
            </Modal.Body>

            <Modal.Footer className="p-3">
              <Button variant="ghost" onPress={onClose} isDisabled={deleting}>
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
                  "Delete"
                )}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
