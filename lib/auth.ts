import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { adminAuth } from "./firebase-admin";
import prisma from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Firebase",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
        role: { label: "Role", type: "text" },
        referralCode: { label: "Referral Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.idToken) {
          console.warn("Auth: No ID Token in credentials.");
          return null;
        }

        try {
          if (!adminAuth) {
            console.error("Auth Error: Firebase Admin SDK not initialized. Missing environment variables?");
            return null;
          }

          // Verify Firebase token
          const decodedToken = await adminAuth.verifyIdToken(credentials.idToken as string);
          if (!decodedToken) {
            console.warn("Auth Error: Token verification failed (returned null).");
            return null;
          }

          const email = decodedToken.email;
          if (!email) {
            console.warn("Auth Error: Token verification passed but contains no email.");
            return null;
          }

          // Check if user exists in Prisma
          let user = await prisma.user.findUnique({
            where: { email },
            include: { subscription: true, credits: true },
          });

          // Create user if they don't exist
          if (!user) {
            const role = (credentials.role as any) || "FOUNDER";
            
            // Create user with initial credits and subscription
            user = await prisma.user.create({
              data: {
                email,
                name: decodedToken.name || email.split("@")[0],
                image: decodedToken.picture,
                role: role,
                isVerified: decodedToken.email_verified || false,
                credits: {
                  create: {
                    chatCredits: 5,
                    pitchCredits: 1,
                    pitchDeckCredits: 0,
                  },
                },
                subscription: {
                  create: {
                    plan: "FREE",
                    status: "ACTIVE",
                    currentPeriodStart: new Date(),
                  },
                },
                notifications: {
                  create: {
                    type: "WELCOME",
                    title: "Welcome to VKai!",
                    message: "We're excited to help you launch your startup vision. Start by validating an idea!",
                  },
                },
                transactions: {
                  createMany: {
                    data: [
                      { type: "GRANT", creditType: "CHAT", amount: 5, description: "Welcome bonus" },
                      { type: "GRANT", creditType: "PITCH", amount: 1, description: "Welcome bonus" },
                    ],
                  },
                },
              },
              include: { subscription: true, credits: true },
            });

            // Handle referrals
            if (credentials.referralCode) {
              const referrer = await prisma.user.findUnique({
                where: { referralCode: credentials.referralCode as string },
              });

              if (referrer) {
                await prisma.user.update({
                  where: { id: referrer.id },
                  data: { 
                    referralCount: { increment: 1 },
                    credits: {
                      update: {
                        chatCredits: { increment: 5 }
                      }
                    }
                  }
                });
                
                await prisma.user.update({
                  where: { id: user.id },
                  data: { referredBy: referrer.id }
                });
              }
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error("Auth Error:", error);
          return null;
        }
      },
    }),
  ],
});
