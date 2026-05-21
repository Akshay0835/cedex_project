import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SaaSlytics — AI Spend Auditor',
  description: "Audit your team's AI seats, detect redundancy between Cursor & Copilot, flag over-provisioning, and find immediate optimization paths.",
  metadataBase: new URL('https://saaslytics-auditor.vercel.app'),
  openGraph: {
    title: 'SaaSlytics — AI Spend Auditor',
    description: "Audit your team's AI seat spends, detect redundancy between Cursor & Copilot, flag over-provisioning, and optimize instantly.",
    type: 'website',
    locale: 'en_US',
    siteName: 'SaaSlytics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaaSlytics — AI Spend Auditor',
    description: "Audit your team's AI seat spends, detect redundancy between Cursor & Copilot, flag over-provisioning, and optimize instantly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full antialiased`}>
      <body className="bg-background text-foreground min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
