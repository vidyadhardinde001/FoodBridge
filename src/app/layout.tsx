import type { Metadata } from "next";
import { Poppins } from "next/font/google"; // Import Poppins font
import "./globals.css";
import { twMerge } from "tailwind-merge";
import { setupConfirmationChecks } from '@/lib/cron'; 

// Configure Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Add required font weights
});

export const metadata: Metadata = {
  title: "FoodBridge",
  description: ".",
  icons: {
    icon: "/foodbridge.ico", // Single .ico file reference
  },
};

if (typeof window === 'undefined') {
  setupConfirmationChecks();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="relative">
      <head>
        <link rel="icon" href="/assets/logo1.ico" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{String(metadata.title)}</title>
        <meta name="description" content={String(metadata.description)} />
      </head>
      <body
        className={twMerge(poppins.className, "antialiased bg-[#EAEEFE]")}
      >
        {children}
      </body>
    </html>
  );
}
