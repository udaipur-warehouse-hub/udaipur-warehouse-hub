import { EmployeeListClient } from "./employee-list-client";
import { BackLink } from "@/components/back-link";

export default function EmployeesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <BackLink />
      <EmployeeListClient />
    </div>
  );
}
