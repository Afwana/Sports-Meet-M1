import IndividualRegistration from "@/models/IndividualRegistration";

/** Max photos each employee may upload (override with PHOTO_MAX_PER_EMPLOYEE). */
export const MAX_PHOTOS_PER_EMPLOYEE = Number(
  process.env.PHOTO_MAX_PER_EMPLOYEE || 3,
);

/** Biggest single file the storage token will accept (untouched camera originals). */
export const MAX_ORIGINAL_BYTES = 100 * 1024 * 1024;

export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

/** True when the employee registered for the Photography game. */
export async function isPhotographyParticipant(employeeId: string) {
  const registration = await IndividualRegistration.findOne({
    employee: employeeId,
    "games.gameName": { $regex: /photography/i },
  })
    .select("_id")
    .lean();

  return Boolean(registration);
}

/** All of an employee's files must live under their own folder. */
export function employeePrefix(employeeId: string) {
  return `photos/${employeeId}/`;
}

interface PhotoLike {
  _id: unknown;
  teamId: unknown;
  title?: string;
  caption?: string;
  employeeCode: string;
  employeeName: string;
  department?: string;
  phoneNumber?: string;
  teamName?: string;
  size?: number;
  createdAt?: Date | string;
}

export function serializePhoto(photo: PhotoLike) {
  return {
    _id: String(photo._id),
    title: photo.title ?? "",
    caption: photo.caption ?? "",
    employeeCode: photo.employeeCode,
    employeeName: photo.employeeName,
    department: photo.department ?? "",
    phoneNumber: photo.phoneNumber ?? "",
    teamId: String(photo.teamId),
    teamName: photo.teamName ?? "",
    size: photo.size ?? 0,
    createdAt: photo.createdAt,
  };
}
