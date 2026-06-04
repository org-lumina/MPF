import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simulacro de evaluaciones — MPF",
  description:
    "Simuladores de exámenes para preparar pruebas reales. Hoy: Ingreso Democrático Ministerio Público Fiscal.",
};

const BrandBadge = () => (
  <span className="brand-badge" aria-hidden>
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M5 4h11l3 3v13H5z" fill="#fff" stroke="#1C1B33" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 12l2.4 2.4L16 9" stroke="#00B6BD" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,700&display=swap"
        />
        <div className="collage-fondo" aria-hidden>
          {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={n} className={`col col-${n}`} src={`/caricaturas/c${((n - 1) % 8) + 1}.webp`} alt="" />
          ))}
        </div>

        <header className="site-nav">
          <div className="nav-in">
            <Link className="brand" href="/">
              <BrandBadge />
              <span className="brand-name">
                Simulacro<br />de evaluaciones
                <span>Simuladores de examen</span>
              </span>
            </Link>
            <nav className="nav-links">
              <Link href="/#simuladores">Simuladores</Link>
              <Link href="/#como">Cómo funciona</Link>
              <Link href="/login">Ingresar</Link>
              <Link href="/examen" className="btn btn-sm">
                Empezar práctica
              </Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="wrap">
            <div className="foot-brand">
              <BrandBadge />
              <span className="brand-name">Simulacro de evaluaciones</span>
            </div>
            <p className="foot-note">
              Simuladores para preparar pruebas reales. Estudiá con onda, llegá
              tranqui al examen.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
