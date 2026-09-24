"use client";

import { Button, Card, Spinner, Table } from "@heroui/react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import type { PointConfiguration } from "./PointConfigurationFormModal";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import PointConfigurationFormModal from "./PointConfigurationFormModal";
import DeletePointConfigurationModal from "./DeletePointConfigurationModal";

const columns = [
  {
    key: "slno",
    label: "SL.NO",
  },
  {
    key: "name",
    label: "NAME",
  },
  {
    key: "type",
    label: "TYPE",
  },
  {
    key: "positions",
    label: "POSITIONS",
  },
  {
    key: "status",
    label: "STATUS",
  },
  {
    key: "actions",
    label: "ACTIONS",
  },
];

export default function PointConfigurationTable() {
  const [configurations, setConfigurations] = useState<PointConfiguration[]>(
    [],
  );

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingConfiguration, setEditingConfiguration] =
    useState<PointConfiguration | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [deletingConfiguration, setDeletingConfiguration] =
    useState<PointConfiguration | null>(null);

  const loadConfigurations = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/point-configurations");

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to load point configurations.");
        return;
      }

      setConfigurations(data.configurations ?? []);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load point configurations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadConfigurations();
  }, []);

  const handleAdd = () => {
    setEditingConfiguration(null);
    setModalOpen(true);
  };

  const handleEdit = (configuration: PointConfiguration) => {
    setEditingConfiguration(configuration);

    setModalOpen(true);
  };

  const handleDelete = (configuration: PointConfiguration) => {
    setDeletingConfiguration(configuration);

    setDeleteModalOpen(true);
  };
  return (
    <>
      <Card className="w-full">
        <Card.Header>
          <div className="flex flex-col md:flex-row w-full md:items-center justify-between gap-4">
            <div>
              <Card.Title className="text-black">
                Point Configuration
              </Card.Title>

              <Card.Description>
                Configure points awarded for competition positions.
              </Card.Description>
            </div>

            <Button onPress={handleAdd}>
              <Plus size={16} />
              Add Configuration
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <Table aria-label="Point configurations">
              <Table.ScrollContainer>
                <Table.Content aria-label="label">
                  <Table.Header columns={columns}>
                    {(column) => (
                      <Table.Column
                        key={column.key}
                        isRowHeader={column.key === "slno"}
                      >
                        {column.label}
                      </Table.Column>
                    )}
                  </Table.Header>

                  <Table.Body items={configurations}>
                    {(configuration) => {
                      const index = configurations.findIndex(
                        (item) => item._id === configuration._id,
                      );

                      return (
                        <Table.Row
                          key={configuration._id}
                          id={configuration._id}
                        >
                          <Table.Cell className="text-black">
                            {index + 1}
                          </Table.Cell>

                          <Table.Cell className="text-black">
                            <span className="font-medium">
                              {configuration.name}
                            </span>
                          </Table.Cell>

                          <Table.Cell className="text-black">
                            {configuration.type ?? "-"}
                          </Table.Cell>

                          <Table.Cell className="text-black">
                            <div className="flex flex-wrap gap-1">
                              {configuration.positions.map((item) => (
                                <span
                                  key={`${configuration._id}-${item.position}`}
                                  className="rounded-md bg-default-100 px-2 py-1 text-xs"
                                >
                                  {item.position}
                                  {" = "}
                                  {item.points}
                                </span>
                              ))}
                            </div>
                          </Table.Cell>

                          <Table.Cell className="text-black">
                            <span
                              className={
                                configuration.isActive
                                  ? "rounded-full bg-success/10 px-2.5 py-1 text-xs text-success"
                                  : "rounded-full bg-default-100 px-2.5 py-1 text-xs text-slate-300"
                              }
                            >
                              {configuration.isActive ? "Active" : "Inactive"}
                            </span>
                          </Table.Cell>

                          <Table.Cell>
                            <div className="flex items-center gap-1">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="outline"
                                onPress={() => handleEdit(configuration)}
                                aria-label="Edit configuration"
                              >
                                <Pencil size={16} color="black" />
                              </Button>

                              <Button
                                isIconOnly
                                size="sm"
                                variant="danger"
                                onPress={() => handleDelete(configuration)}
                                aria-label="Delete configuration"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      );
                    }}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          )}
        </Card.Content>
      </Card>
      <PointConfigurationFormModal
        key={editingConfiguration?._id ?? "new-configuration"}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingConfiguration(null);
        }}
        configuration={editingConfiguration}
        onSaved={loadConfigurations}
      />

      <DeletePointConfigurationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingConfiguration(null);
        }}
        configuration={deletingConfiguration}
        onDeleted={loadConfigurations}
      />
    </>
  );
}
