import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Auth.js v5. Lee automáticamente de las variables de entorno:
//   AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET (provider Google) y AUTH_SECRET.
// Sin base de datos todavía: la sesión se maneja por JWT.
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
});
