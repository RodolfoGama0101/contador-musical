import type { Metadata, Viewport } from "next";
import { Epilogue, Fraunces } from "next/font/google";
import { ServiceWorkerUpdater } from "@/components/service-worker-updater";
import "./globals.css";

const epilogue = Epilogue({
  subsets: ["latin"],
  variable: "--font-epilogue",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "Contador Musical",
  title: "Contador Musical",
  description: "Contagem local de músicos e organistas em ensaios musicais.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Contador Musical",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#606c38",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${epilogue.variable} ${fraunces.variable}`}>
      <body>
        <ServiceWorkerUpdater />
        {children}
      </body>
    </html>
  );
}
