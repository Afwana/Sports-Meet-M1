"use client";

import { Employee } from "@/types/employee";
import { Button, ButtonGroup, Modal, Spinner } from "@heroui/react";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  employee: Employee | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export default function DeleteEmployeeModal({
  employee,
  onClose,
  onDeleted,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!employee) return null;

  const handleDelete = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/employees/${employee._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete employee.");
        return;
      }

      onDeleted(employee._id);
      onClose();

      toast.success(`${employee.employeeName} deleted successfully.`);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={!!employee} onOpenChange={onClose}>
      <Modal.Backdrop>
        <Modal.Container size="md">
          <Modal.Dialog className="p-0">
            <Modal.Header className="bg-red-600 text-white p-5">
              <div className="flex items-center gap-3">
                <TriangleAlert size={28} />
                <h2 className="text-xl font-bold">Delete Employee</h2>
              </div>
            </Modal.Header>

            <Modal.Body className="p-6">
              <div className="space-y-3">
                <p className="text-lg font-semibold">{employee.employeeName}</p>

                <p className="text-default-500">
                  Are you sure you want to delete this employee?
                </p>

                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                  This action cannot be undone.
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer className="p-4">
              <Button variant="ghost" onPress={onClose} isDisabled={loading}>
                Cancel
              </Button>

              <ButtonGroup>
                <Button variant="danger" onPress={handleDelete}>
                  Delete
                </Button>
                {loading && (
                  <Button isIconOnly aria-label="More options" variant="danger">
                    <ButtonGroup.Separator />
                    <Spinner size="md" className="text-white" />
                  </Button>
                )}
              </ButtonGroup>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
