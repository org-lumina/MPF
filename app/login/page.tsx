import { auth, signIn, signOut } from "@/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string }>;
}) {
  const { motivo } = await searchParams;
  const session = await auth();
  const user = session?.user;

  return (
    <section className="panel">
      <h1>Ingresar con Google</h1>

      {motivo === "login" && !user && (
        <p style={{ color: "#b35900", fontWeight: 600 }}>
          Necesitás iniciar sesión para acceder a esa sección.
        </p>
      )}

      {user ? (
        <>
          <p>
            Sesión iniciada como <strong>{user.name ?? "(sin nombre)"}</strong>
            {user.email ? ` — ${user.email}` : ""}.
          </p>
          <p className="placeholder-note">
            Ya podés ir al <a href="/examen">motor de examen</a>.
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="cta">
              Cerrar sesión
            </button>
          </form>
        </>
      ) : (
        <>
          <p>Iniciá sesión con tu cuenta de Google para acceder a los exámenes.</p>
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/examen" });
            }}
          >
            <button type="submit" className="cta">
              Iniciar sesión con Google
            </button>
          </form>
        </>
      )}
    </section>
  );
}
