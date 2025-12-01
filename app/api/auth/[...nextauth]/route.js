import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    //Connexion via Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      httpOptions: {
        timeout: 30000,
      },
      authorization: {
        params: {
           // forcer le consentement
          prompt: "consent",
           // permet refresh token
          access_type: "offline",
          scope: "openid email profile",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          username: profile.name,
          provider: "GOOGLE",
          providerId: profile.sub,
        };
      },
    }),

    //Connexion via email + mot de passe
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        if (!email || !password) {
          throw new Error("Email et mot de passe requis");
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          throw new Error("Identifiants invalides");
        }

        if (!user.isConfirmed) {
          throw new Error(
            "Veuillez confirmer votre email avant de vous connecter"
          );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Mot de passe incorrect");
        }

        return user;
      },
    }),
  ],

  //Callbacks pour gérer la session et le token
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                username: profile.name,
                provider: "GOOGLE",
                providerId: account.providerAccountId,
                isConfirmed: true,
                role: "USER",
              },
            });
          }
        } catch (err) {
          console.error("Erreur Google SignIn:", err);
          return false;
        }
      }
      return true;
    },

    // Redirection après connexion
    async redirect() {
      return "/";
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
        token.provider = user.provider;
        token.isConfirmed = user.isConfirmed;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.provider = token.provider;
        session.user.isConfirmed = token.isConfirmed;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",

  events: {
    async signIn(message) {
      console.log("Sign in event:", message);
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
