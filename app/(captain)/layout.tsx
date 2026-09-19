import AppHeader from "@/components/layout/AppHeader";
import { getCurrentEmployee } from "@/lib/getCurrentEmployee";

export default async function CaptainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const captain = await getCurrentEmployee();
  return (
    <>
      <AppHeader
        role="captain"
        user={{
          role: "captain",
          employeeName: captain.employeeName,
          employeeCode: captain.employeeCode,
          team: captain.team,
          isCaptain: captain.isCaptain,
        }}
      />

      <main>{children}</main>
    </>
  );
}
