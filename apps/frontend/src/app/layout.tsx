import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RuedAlerta",
  description: "Panel de eventos para bicicletas y motocicletas",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
