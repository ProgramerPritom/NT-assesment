import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "NexusWMS — AI-Governed Autonomous Warehouse",
  description: "Enterprise warehouse & inventory platform with human-in-the-loop autonomous AI governance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
