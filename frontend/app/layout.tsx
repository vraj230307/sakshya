import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export const metadata = {
  title: "Sakshya | Integrated Digital Forensics & Sanitization Platform",
  description: "Legally compliant digital forensics and media sanitization workspace under BSA 2023 Sec 63(4) and NIST SP 800-88 Rev. 1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-obsidian-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
