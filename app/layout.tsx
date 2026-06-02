import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Práctica de Exámenes MPF",
  description:
    "Plataforma de práctica de exámenes para aspirantes al Ministerio Público Fiscal.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            Exámenes MPF
          </Link>
          <nav className="nav">
            <Link href="/">Inicio</Link>
            <Link href="/login">Ingresar</Link>
            <Link href="/pago">Pago</Link>
            <Link href="/examen">Examen</Link>
            <Link href="/resultado">Resultado</Link>
          </nav>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          Proyecto educativo · Esqueleto inicial — sin auth ni pagos integrados todavía.
        </footer>
      </body>
    </html>
  );
}
