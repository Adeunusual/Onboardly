import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/ui/SessionWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      `http://localhost:${process.env.PORT ?? 3000}`,
  ),
  applicationName: "Onboardly",
  title: {
    default: "Onboardly",
    template: "%s · Onboardly",
  },
  description:
    "We help organizations welcome employees the right way from their first interaction. Our onboarding platform removes friction from paperwork, compliance, and setup. So teams can focus on people, not processes.",
  icons: {
    icon: "/assets/logos/Logoicon.png",
    shortcut: "/assets/logos/Logoicon.png",
    apple: "/assets/logos/Logoicon.png",
  },
  openGraph: {
    type: "website",
    title: "Onboardly",
    description:
      "We help organizations welcome employees the right way from their first interaction. Our onboarding platform removes friction from paperwork, compliance, and setup. So teams can focus on people, not processes.",
    siteName: "Onboardly",
    images: [
      {
        url: "/assets/logos/Logo.png",
        width: 512,
        height: 512,
        alt: "Onboardly",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Onboardly",
    description:
      "We help organizations welcome employees the right way from their first interaction. Our onboarding platform removes friction from paperwork, compliance, and setup. So teams can focus on people, not processes.",
    images: ["/assets/logos/Logo.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f172a",
  colorScheme: "light dark",
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
