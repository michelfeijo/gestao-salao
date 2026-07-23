import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

declare module "next-auth" {
  interface Session {
    user: {
      idSalao: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/entrar",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // TODO: substituir por validação da tabela `usuarios` (com senha com hash)
        if (
          email === process.env.AUTH_USER_EMAIL &&
          password === process.env.AUTH_USER_PASSWORD
        ) {
          // Bootstrap: enquanto não há tabela de usuários em uso, todo login
          // cai no único salão existente. Quando o cadastro de usuários for
          // implementado, o idSalao passa a vir do registro do usuário.
          const salao = await prisma.salao.findFirst();
          if (!salao) return null;

          return { id: "1", name: "Admin", email, idSalao: salao.id };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.idSalao = (user as { idSalao: string }).idSalao;
      }
      return token;
    },
    async session({ session, token }) {
      const idSalao = (token as { idSalao?: string }).idSalao;
      if (idSalao) {
        session.user.idSalao = idSalao;
      }
      return session;
    },
  },
});
