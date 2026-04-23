import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mymuscle.app"),
  title: {
    default: "MyMuscle | Visual Fitness Tracking",
    template: "%s | MyMuscle",
  },
  description:
    "Track workouts, visualize training load across an interactive body map, and make smarter recovery decisions with MyMuscle.",
  applicationName: "MyMuscle",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "fitness app",
    "workout tracker",
    "muscle recovery",
    "training load",
    "body visualization",
    "gym app",
    "strength training",
  ],
  openGraph: {
    title: "MyMuscle",
    description:
      "Track your muscle growth like never before with visual load and recovery insights.",
    url: "https://mymuscle.app",
    siteName: "MyMuscle",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyMuscle",
    description: "Track your muscle growth like never before.",
  },
  category: "fitness",
  creator: "MyMuscle",
  publisher: "MyMuscle",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-[var(--color-bg)] font-sans text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
