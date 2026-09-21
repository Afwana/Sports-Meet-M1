"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Spinner } from "@heroui/react";
import { toast } from "sonner";

interface TeamRow {
  teamId: string;
  teamName: string;
  participants: number;
  points: number;
}

interface Props {
  gameId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MarathonResultModal({
  gameId,
  isOpen,
  onClose,
}: Props) {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      setLoading(true);

      const res = await fetch(`/api/admin/results/marathon/${gameId}`);
      const data = await res.json();

      setTeams(data.teams);
      setPublished(data.published);
      setLoading(false);
    })();
  }, [isOpen, gameId]);

  const publish = async () => {
    const res = await fetch(`/api/admin/results/marathon/${gameId}`, {
      method: "PUT",
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    toast.success("Participation points added.");

    setPublished(true);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.Header className="bg-blue-800 text-white">
              Marathon Participation Points
            </Modal.Header>

            <Modal.Body>
              {loading ? (
                <div className="flex justify-center py-10">
                  <Spinner />
                </div>
              ) : (
                <div className="space-y-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Team</th>
                        <th>Participants</th>
                        <th>Points</th>
                      </tr>
                    </thead>

                    <tbody>
                      {teams.map((team) => (
                        <tr key={team.teamId} className="border-b">
                          <td className="py-3">{team.teamName}</td>

                          <td className="text-center">{team.participants}</td>

                          <td className="text-center font-bold text-blue-700">
                            +{team.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="ghost" onPress={onClose}>
                Close
              </Button>

              <Button onPress={publish} isDisabled={published}>
                {published ? "Points Published" : "Award Participation Points"}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
