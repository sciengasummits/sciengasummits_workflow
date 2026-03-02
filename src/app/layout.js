import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Conference Management System | LIUTEX SUMMIT 2026",
  description: "Conference Management Dashboard for LIUTEX VORTEX SUMMIT 2026, FOOD AGRI SUMMIT 2026 & FLUID MECHANICS SUMMIT 2026",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
