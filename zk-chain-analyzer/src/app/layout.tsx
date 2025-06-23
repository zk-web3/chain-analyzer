import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import DataNoticeModal from "@/components/DataNoticeModal";

export const metadata: Metadata = {
  title: "zk Chain Analyzer",
  description: "Live analytics for L1 & L2 chains.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex bg-gray-950 text-gray-100 relative overflow-x-hidden">
        <div className="fixed inset-0 z-[-10] bg-gradient-to-br from-gray-950 via-gray-900 to-[#1a1833] opacity-70 pointer-events-none" />
        <DataNoticeModal />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
