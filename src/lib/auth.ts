import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { query } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text", placeholder: "Ej. JuanQuiroga" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Tolerate stray spaces and mobile auto-capitalization; prefer an exact match if one exists
          const username = credentials.username.trim();
          const res = await query(
            'SELECT * FROM users WHERE LOWER(TRIM(username)) = LOWER($1) ORDER BY (username = $1) DESC LIMIT 1',
            [username]
          );
          const user = res.rows[0];

          if (user) {
            const trimmedPassword = credentials.password.trim();
            const isMatch =
              (await bcrypt.compare(credentials.password, user.password_hash)) ||
              (trimmedPassword !== credentials.password && (await bcrypt.compare(trimmedPassword, user.password_hash)));
            if (isMatch) {
              return {
                id: user.id,
                name: user.name,
                email: user.username,
                role: user.role
              };
            }
          }
          return null;
        } catch (error) {
          console.error("Error in authorize:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "liftonic-super-secret-key-change-in-prod",
};
