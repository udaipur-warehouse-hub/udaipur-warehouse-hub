import { EmployeeDetailClient } from "./employee-detail-client";
import { BackLink } from "@/components/back-link";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <BackLink href="/employees" label="All employees" />
      <EmployeeDetailClient employeeId={id} />
    </div>
  );
}
