export function getAgeCategory(
  dateOfBirth: string | Date | number | null | undefined,
) {
  if (!dateOfBirth) return "Unknown";

  const dob = new Date(dateOfBirth);

  if (Number.isNaN(dob.getTime())) {
    return "Unknown";
  }

  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age < 30 ? "Junior" : "Senior";
}
