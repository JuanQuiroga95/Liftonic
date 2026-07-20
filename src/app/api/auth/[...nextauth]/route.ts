import NextAuth, { NextAuthOptions } from "next-auth";
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
          const res = await query('SELECT * FROM users WHERE username = $1', [credentials.username]);
          const user = res.rows[0];

          if (user) {
            const isMatch = await bcrypt.compare(credentials.password, user.password_hash);
            if (isMatch) {
              return {
                id: user.id,
                name: user.name,
                email: user.username, // NextAuth expects email, we map username here for session
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
