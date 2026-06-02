import { auth, signIn, signOut } from "@/auth";

export default async function LoginPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <section>
      <h1>Ingresar con Google</h1>

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
          <p className="placeholder-note">
            Requiere configurar AUTH_GOOGLE_ID y AUTH_GOOGLE_SECRET en
            <code> .env.local</code>.
          </p>
        </>
      )}
    </section>
  );
}
