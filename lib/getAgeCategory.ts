export function getAgeCategory(
  dateOfBirth: string | Date | number | null | undefined,
) {
  if (!dateOfBirth) return "Unknown";

  const dob = new Date(dateOfBirth);

  if (Number.isNaN(dob.getTime())) {
    return "Unknown";
  }

  const cutoffDate = new Date("1989-01-01T00:00:00");

  return dob > cutoffDate ? "Junior" : "Senior";
}
