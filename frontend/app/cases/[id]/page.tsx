import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [
    { id: "1" },
    { id: "c1001-forensic-case-delhi" },
    { id: "c2002-forensic-case-mumbai" },
    { id: "c1002-crypto-ransomware-mumbai" },
    { id: "c1003-data-leak-bangalore" },
  ];
}

export default function CaseRootPage({ params }: { params: { id: string } }) {
  redirect(`/cases/${params.id}/sanitize/`);
}
