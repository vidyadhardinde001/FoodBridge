import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { twMerge } from "tailwind-merge";

// Configure Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FoodBridge",
  description: ".",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="relative">
      <head>
        {/* Standard Meta Tags */}
        <link rel="icon" href="/assets/logo1.ico" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{String(metadata.title)}</title>
        <meta name="description" content={String(metadata.description)} />
        <meta
          name="keywords"
          content="Siddhivinayak Engineers, control panel manufacturing, PLC programming, HMI development, SCADA software, industrial automation, automation solutions"
        />
        <meta name="robots" content="index, follow" />
        <meta name="application-name" content="Siddhivinayak Engineers" />

        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={String(metadata.title)} />
        <meta
          property="og:description"
          content={String(metadata.description)}
        />
        <meta property="og:image" content="/assets/og-image.jpg" />
        <meta
          property="og:url"
          content="https://siddhivinayakengineers.co.in/"
        />
        <meta property="og:site_name" content="Siddhivinayak Engineers" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={String(metadata.title)} />
        <meta
          name="twitter:description"
          content={String(metadata.description)}
        />
        <meta name="twitter:image" content="/assets/twitter-image.jpg" />

        {/* Additional link and script tags */}
        <link rel="canonical" href="https://siddhivinayakengineers.co.in/" />

        {/* Schema.org JSON-LD Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Siddhivinayak Engineers",
              description:
                "Top-tier control panel manufacturing, PLC, HMI, and SCADA software development services.",
              url: "https://siddhivinayakengineers.co.in/",
              address: {
                "@type": "PostalAddress",
                streetAddress: "123 Main St", // Replace with your actual address
                addressLocality: "Miraj", // Replace with your city
                addressRegion: "Arjunwad", // Replace with your region
                postalCode: "416120", // Replace with your postal code
                addressCountry: "India", // Replace with your country
              },
              telephone: "+91 7057272626", // Replace with your actual phone number
              logo: "https://siddhivinayakengineers.co.in/_next/image?url=https%3A%2F%2Fdrive.google.com%2Fuc%3Fexport%3Dview%26id%3D1C1FtKzzHlobf9kQRS1XjFoPWx1SKTSS8&w=384&q=75", // Replace with your logo URL
              image:
                "https://siddhivinayakengineers.co.in/_next/image?url=https%3A%2F%2Fdrive.google.com%2Fuc%3Fexport%3Dview%26id%3D1C1FtKzzHlobf9kQRS1XjFoPWx1SKTSS8&w=384&q=75",
            }),
          }}
        />
      </head>
      <body
        className={twMerge(montserrat.className, "antialiased bg-[#EAEEFE]")}
      >
        {children}
      </body>
    </html>
  );
}
