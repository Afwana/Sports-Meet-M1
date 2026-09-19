"use client";

import { Button, Modal, Spinner } from "@heroui/react";
import { useState } from "react";
import { FaTrash, FaXmark } from "react-icons/fa6";
import { toast } from "sonner";

interface Fixture {
  _id: string;
  fixtureName: string;
  round: string;
  fixtureNumber: number;
  entries: unknown[];
}

interface DeleteFixtureModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fixture: Fixture | null;
  onDeleted: (id: string) => void;
}

export default function DeleteFixtureModal({
  isOpen,
  onOpenChange,
  fixture,
  onDeleted,
}: DeleteFixtureModalProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!fixture) {
      return;
    }

    try {
      setDeleting(true);

      const res = await fetch(`/api/admin/fixtures/${fixture._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete fixture.");
        return;
      }

      toast.success("Fixture deleted successfully.");

      onDeleted(fixture._id);

      onOpenChange(false);
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete fixture.");
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
          <Modal.Dialog>
            <Modal.CloseTrigger>
              <div className="rounded-full bg-default" aria-label="Close">
                <FaXmark />
              </div>
            </Modal.CloseTrigger>

            <Modal.Header>
              <Modal.Heading>Delete Fixture</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <div className="space-y-4">
                <div className="rounded-lg bg-danger-50 p-4">
                  <div className="flex items-center gap-2 text-danger">
                    <FaTrash />

                    <span className="font-semibold">Delete fixture?</span>
                  </div>

                  <p className="mt-2 text-sm text-danger-700">
                    Are you sure you want to delete{" "}
                    <strong>{fixture?.fixtureName}</strong>?
                  </p>
                </div>

                <p className="text-sm text-default-500">
                  The registered participants themselves will not be deleted.
                </p>
              </div>
            </Modal.Body>

            <Modal.Footer>
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
