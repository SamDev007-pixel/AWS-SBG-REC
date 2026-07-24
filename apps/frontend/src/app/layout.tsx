import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/modules/cloud-enthusiasts/shared/components/Providers";
import { AuthWrapper } from "@/components/AuthWrapper";
import { Toaster } from "sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export const metadata: Metadata = {
  title: "AWS SBG REC Event Registration",
  description: "Register for AWS Cloud Practitioner bootcamps, serverless workshops, and container orchestration bootcamps.",
  icons: {
    icon: '/sbg_logo.svg',
    apple: '/sbg_logo.svg',
  },
};

function LayoutSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="flex items-center justify-center">
        <img
          src="/sbg-logo-latest.png"
          alt="AWS SBG REC Logo"
          className="w-28 h-28 object-contain"
        />
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${plusJakartaSans.variable}`}>
      <body className="min-h-full flex flex-col cloud-mesh-bg antialiased">
        <Providers>
          <AuthWrapper>
            <Suspense fallback={<LayoutSpinner />}>
              {children}
            </Suspense>
            <Toaster position="top-center" richColors />
          </AuthWrapper>
        </Providers>
      </body>
    </html>
  );
}
