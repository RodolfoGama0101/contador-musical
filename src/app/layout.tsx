import type { Metadata, Viewport } from "next";
import "./globals.css";

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
  themeColor: "#033d60",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
