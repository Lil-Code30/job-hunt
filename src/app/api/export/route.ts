import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { jobs } = await req.json();

  const headers = [
    "Title",
    "Company",
    "Location",
    "Remote",
    "Status",
    "Source",
    "Tags",
    "Salary Min",
    "Salary Max",
    "Currency",
    "URL",
    "Applied At",
    "Created At",
  ];

  function escapeCSV(val: unknown): string {
    const str = val == null ? "" : String(val);
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  }

  const rows = jobs.map((job: any) =>
    [
      job.title,
      job.company,
      job.location ?? "",
      job.remote ? "Yes" : "No",
      job.status,
      job.source,
      (job.tags ?? []).join("; "),
      job.salary?.min ?? "",
      job.salary?.max ?? "",
      job.salary?.currency ?? "",
      job.url ?? "",
      job.appliedAt?.seconds
        ? new Date(job.appliedAt.seconds * 1000).toLocaleDateString("en-CA")
        : "",
      job.createdAt?.seconds
        ? new Date(job.createdAt.seconds * 1000).toLocaleDateString("en-CA")
        : "",
    ]
      .map(escapeCSV)
      .join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="job-hunt-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
