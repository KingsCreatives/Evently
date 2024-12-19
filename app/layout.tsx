import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import {
  ClerkProvider,
 
} from "@clerk/nextjs";
import "./globals.css";


const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Event Hive",
  description:
    "An innovative platform to connect, collaborate, and create meaningful experiences. Organize events, meet like-minded individuals, and build communities effortlessly",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={poppins.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}


