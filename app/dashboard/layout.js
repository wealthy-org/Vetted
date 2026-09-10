import DashboardShell from "./DashboardShell";

export const metadata = {
  title: "Dashboard — Vetted",
};

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
