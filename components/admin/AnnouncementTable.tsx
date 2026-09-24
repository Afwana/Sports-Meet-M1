"use client";

import {
  Button,
  ButtonGroup,
  Card,
  Chip,
  Input,
  Pagination,
  Table,
} from "@heroui/react";
import { useMemo, useState } from "react";
import { FaPencil, FaTrash } from "react-icons/fa6";

import AnnouncementFormModal from "./AnnouncementFormModal";
import DeleteAnnouncementModal from "./DeleteAnnouncementModal";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getPageRange } from "@/lib/getPageRange";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  link: string;
  isActive: boolean;
  createdAt: string;
}

interface AnnouncementTableProps {
  initialAnnouncements: Announcement[];
}

const columns = [
  { id: "title", name: "TITLE" },
  { id: "link", name: "LINK" },
  { id: "status", name: "STATUS" },
  { id: "created", name: "CREATED" },
  { id: "actions", name: "ACTIONS" },
];

const ROWS_PER_PAGE = 10;

export default function AnnouncementTable({
  initialAnnouncements,
}: AnnouncementTableProps) {
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(initialAnnouncements);

  const [search, setSearch] = useState("");

  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);

  const [deletingAnnouncement, setDeletingAnnouncement] =
    useState<Announcement | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [page, setPage] = useState(1);

  const filteredAnnouncements = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return announcements;
    }

    return announcements.filter(
      (announcement) =>
        announcement.title.toLowerCase().includes(query) ||
        announcement.message.toLowerCase().includes(query) ||
        announcement.link.toLowerCase().includes(query),
    );
  }, [announcements, search]);

  const totalPages = Math.ceil(filteredAnnouncements.length / ROWS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredAnnouncements.slice(start, start + ROWS_PER_PAGE);
  }, [page, filteredAnnouncements]);

  const start = (page - 1) * ROWS_PER_PAGE + 1;

  const end = Math.min(page * ROWS_PER_PAGE, filteredAnnouncements.length);

  const pageRange = useMemo(
    () => getPageRange(page, totalPages),
    [page, totalPages],
  );

  const handleCreated = (announcement: Announcement) => {
    setAnnouncements((current) => [announcement, ...current]);
  };

  const handleUpdated = (announcement: Announcement) => {
    setAnnouncements((current) =>
      current.map((item) =>
        item._id === announcement._id ? announcement : item,
      ),
    );

    setEditingAnnouncement(null);
  };

  const handleDeleted = (id: string) => {
    setAnnouncements((current) => current.filter((item) => item._id !== id));

    setDeletingAnnouncement(null);
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <Card aria-label="card" className="w-full p-5 min-h-[calc(100vh-115px)]">
        <Card.Header>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-black">Announcements</h1>

            <p className="text-slate-500 text-sm">
              Create and manage announcements for employees and captains.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:justify-between">
            <Input
              aria-label="Search announcements"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:w-1/3 h-10"
              variant="secondary"
            />

            <ButtonGroup variant="primary" className="h-10">
              <Button
                isIconOnly
                aria-label="Show QR code"
                onPress={() => setIsAddOpen(true)}
              >
                <Plus size={18} />
              </Button>
              <Button onPress={() => setIsAddOpen(true)}>
                <ButtonGroup.Separator />
                Add Announcement
              </Button>
            </ButtonGroup>
          </div>
        </Card.Header>

        <Card.Content>
          {filteredAnnouncements.length === 0 ? (
            <div className="py-10 text-center text-slate-300">
              No announcements found.
            </div>
          ) : (
            <Table aria-label="Announcements">
              <Table.ScrollContainer>
                <Table.Content className="w-full">
                  <Table.Header columns={columns}>
                    {(column) => (
                      <Table.Column
                        key={column.id}
                        isRowHeader={column.id === "title"}
                      >
                        {column.name}
                      </Table.Column>
                    )}
                  </Table.Header>

                  <Table.Body items={paginatedItems}>
                    {(announcement) => (
                      <Table.Row key={announcement._id} id={announcement._id}>
                        <Table.Cell className="flex flex-col items-start justify-start">
                          <div className="max-w-md">
                            <p className="font-semibold">
                              {announcement.title}
                            </p>

                            <p className="mt-1 text-sm text-slate-700">
                              {announcement.message}
                            </p>
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          {announcement.link ? (
                            <Link
                              href={announcement.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="break-all text-blue-500 hover:underline"
                            >
                              {announcement.link}
                            </Link>
                          ) : (
                            <span className="text-default-400">—</span>
                          )}
                        </Table.Cell>

                        <Table.Cell>
                          {announcement.isActive ? (
                            <Chip color="success" variant="soft">
                              Active
                            </Chip>
                          ) : (
                            <Chip color="default" variant="soft">
                              Inactive
                            </Chip>
                          )}
                        </Table.Cell>

                        <Table.Cell>
                          <span className="text-sm text-slate-300">
                            {formatDate(
                              String(
                                (
                                  announcement as Announcement & {
                                    createdAt?: string;
                                  }
                                ).createdAt ?? "",
                              ),
                            )}
                          </span>
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onPress={() =>
                                setEditingAnnouncement(announcement)
                              }
                            >
                              <FaPencil />
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              variant="danger"
                              onPress={() =>
                                setDeletingAnnouncement(announcement)
                              }
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
              <Table.Footer className="flex flex-col items-center gap-3 p-3 md:flex-row md:justify-between">
                <Pagination size="sm">
                  <Pagination.Summary>
                    {start} to {end} of {filteredAnnouncements.length} results
                  </Pagination.Summary>
                  <Pagination.Content>
                    <Pagination.Item>
                      <Pagination.Previous
                        isDisabled={page === 1}
                        onPress={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        <Pagination.PreviousIcon />
                      </Pagination.Previous>
                    </Pagination.Item>
                    {pageRange.map((p, idx) =>
                      typeof p === "number" ? (
                        <Pagination.Item key={p}>
                          <Pagination.Link
                            isActive={p === page}
                            onPress={() => setPage(p)}
                          >
                            {p}
                          </Pagination.Link>
                        </Pagination.Item>
                      ) : (
                        <Pagination.Item key={`${p}-${idx}`}>
                          <span className="px-2 text-default-400 select-none">
                            …
                          </span>
                        </Pagination.Item>
                      ),
                    )}
                    <Pagination.Item>
                      <Pagination.Next
                        isDisabled={page === totalPages}
                        onPress={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                      >
                        <Pagination.NextIcon />
                      </Pagination.Next>
                    </Pagination.Item>
                  </Pagination.Content>
                </Pagination>
              </Table.Footer>
            </Table>
          )}
        </Card.Content>
      </Card>

      <AnnouncementFormModal
        key="add-announcement"
        isOpen={isAddOpen}
        onOpenChange={setIsAddOpen}
        announcement={null}
        onSaved={handleCreated}
      />

      <AnnouncementFormModal
        key={editingAnnouncement?._id ?? "edit-empty"}
        isOpen={editingAnnouncement !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingAnnouncement(null);
          }
        }}
        announcement={editingAnnouncement}
        onSaved={handleUpdated}
      />

      <DeleteAnnouncementModal
        isOpen={deletingAnnouncement !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingAnnouncement(null);
          }
        }}
        announcement={deletingAnnouncement}
        onDeleted={handleDeleted}
      />
    </>
  );
}
