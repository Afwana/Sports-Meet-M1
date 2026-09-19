"use client";

import { Game } from "@/types/game";
import {
  GroupRegistration,
  IndividualRegistration,
} from "@/types/registration";
import { Button, Modal, Spinner } from "@heroui/react";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaTrash, FaXmark } from "react-icons/fa6";
import { toast } from "sonner";

interface DeleteGroupRegistrationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  game: Game | null;
  registration: IndividualRegistration | GroupRegistration | null;
  onDeleted: (id: string) => void;
}

export default function DeleteGroupRegistrationModal({
  isOpen,
  onOpenChange,
  game,
  registration,
  onDeleted,
}: DeleteGroupRegistrationModalProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!registration || !game) return;

    try {
      setDeleting(true);

      const endpoint =
        game.type === "Group"
          ? `/api/captain/group-registrations/${registration._id}`
          : `/api/captain/individual-registrations/${registration._id}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete registration.");
        return;
      }

      toast.success(
        game.type === "Group"
          ? "Group deleted successfully."
          : "Registration deleted successfully.",
      );

      onDeleted(registration._id);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete group:", error);

      toast.error("Failed to delete group.");
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!deleting) {
      onOpenChange(open);
    }
  };

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={handleClose}>
        <Modal.Container size="sm">
          <Modal.Dialog className="p-0">
            <Modal.CloseTrigger>
              <div className="rounded-full bg-default" aria-label="Close">
                <FaXmark />
              </div>
            </Modal.CloseTrigger>

            <Modal.Header className="bg-red-600 text-white p-5">
              <Modal.Heading className="flex items-center gap-3">
                <TriangleAlert size={28} color="white" />
                <p className="text-xl font-bold text-white">
                  {game?.type === "Group"
                    ? `Delete ${(registration as GroupRegistration)?.groupName ?? "Group"}`
                    : "Delete Registration"}
                </p>
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body className="px-4">
              <div className="space-y-4">
                <div className="rounded-lg bg-danger-50 p-4">
                  <div className="flex items-center gap-3 text-danger">
                    <FaTrash />

                    <span className="font-semibold">
                      {game?.type === "Group"
                        ? "Delete Group"
                        : "Delete Registration"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-danger-700">
                    {game?.type === "Group" ? (
                      <>
                        Are you sure you want to delete{" "}
                        <strong>
                          {game?.type === "Group"
                            ? (registration as GroupRegistration)?.groupName
                            : (registration as IndividualRegistration)
                                ?.employeeName}
                        </strong>
                        ?
                      </>
                    ) : (
                      <>
                        Are you sure you want to remove this individual
                        registration?
                      </>
                    )}
                  </p>
                </div>

                {game?.type === "Group" ? (
                  <p className="text-sm text-default-500">
                    This group contains{" "}
                    <strong>
                      {(registration as GroupRegistration)?.participants.length}
                    </strong>{" "}
                    participant
                    {(registration as GroupRegistration)?.participants
                      .length !== 1
                      ? "s"
                      : ""}
                    . They will become available again for this game.
                  </p>
                ) : (
                  <p className="text-sm text-default-500">
                    <strong>
                      {(registration as IndividualRegistration)?.employeeName}
                    </strong>{" "}
                    will become available again for this game.
                  </p>
                )}
              </div>
            </Modal.Body>

            <Modal.Footer className="p-3">
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
                    {game?.type === "Group"
                      ? "Delete Group"
                      : "Delete Registration"}
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
