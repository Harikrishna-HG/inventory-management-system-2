import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Sidebar } from "@/components/sidebar";
import { QueryProvider } from "@/lib/query-client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inventory - Computer & Electronics Business Management",
  description: "Professional inventory management system for computer and electronics businesses in Nepal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 overflow-auto lg:ml-0">
                  <div className="pt-16 lg:pt-0">
                    {children}
                  </div>
                </main>
              </div>
            </ProtectedRoute>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
