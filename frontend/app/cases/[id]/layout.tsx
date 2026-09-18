export function generateStaticParams() {
  return [
    { id: '1' },
    { id: 'c1001-forensic-case-delhi' },
    { id: 'c1002-crypto-ransomware-mumbai' },
    { id: 'c1003-data-leak-bangalore' }
  ];
}

export default function CaseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
