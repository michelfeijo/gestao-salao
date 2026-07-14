import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth, signOut } from "@/auth";
import { Sidebar } from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestão de Salão",
  description: "Sistema de gestão de salão",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/entrar" });
  }

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {session ? (
        <body className="h-full flex overflow-hidden">
          <Sidebar userEmail={session.user?.email} logoutAction={logout} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </body>
      ) : (
        <body className="min-h-full">{children}</body>
      )}
    </html>
  );
}
