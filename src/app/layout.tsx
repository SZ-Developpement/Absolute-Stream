import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { PageBackground } from "@/components/layout/PageBackground";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Absolute Stream",
  description:
    "Plateforme communautaire de gestion et découverte de films et séries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${GeistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <NavBar />
          <PageBackground />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
