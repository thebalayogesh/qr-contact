// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { db } from "@/db/drizzle"; // your drizzle client
import  { users }  from "@/db/schema";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const provider = account?.provider ?? "google";
        const providerAccountId = account?.providerAccountId ?? profile?.sub ?? null;
        const email = user?.email ?? null;
        if (!email || !providerAccountId) return false;

        // find existing user by providerAccountId
        const existing = await db
          .select()
          .from(users)
          .where(users.providerAccountId.eq(providerAccountId))
          .limit(1);

        if (!existing.length) {
          await db.insert(users).values({
            email,
            name: user.name ?? null,
            image: user.image ?? null,
            provider,
            providerAccountId,
            metadata: {},
          });
        } else {
          // update optional fields
          await db
            .update(users)
            .set({
              name: user.name ?? existing[0].name,
              image: user.image ?? existing[0].image,
            })
            .where(users.id.eq(existing[0].id));
        }

        return true;
      } catch (e) {
        console.error("NextAuth signIn error:", e);
        return false;
      }
    },

    async jwt({ token, user, account, profile }) {
      // keep providerAccountId in token for session callback
      if (account && profile) {
        token.providerAccountId = account.providerAccountId ?? profile.sub;
      }
      return token;
    },

    async session({ session, token }) {
      try {
        const providerAccountId = (token as any).providerAccountId;
        if (providerAccountId) {
          const found = await db
            .select()
            .from(users)
            .where(users.providerAccountId.eq(providerAccountId))
            .limit(1);
          if (found.length) {
            const u = found[0];
            session.user = {
              ...session.user,
              id: u.id,
              provider: u.provider,
              providerAccountId: u.providerAccountId,
            } as any;
          }
        }
      } catch (e) {
        // ignore
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
