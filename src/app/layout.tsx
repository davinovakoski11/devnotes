import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "DevNotes · Seu segundo cérebro de dev",
  description:
    "Uma biblioteca pessoal de notas técnicas em Markdown. Organize aprendizados, encontre referências e mantenha suas ideias por perto.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
