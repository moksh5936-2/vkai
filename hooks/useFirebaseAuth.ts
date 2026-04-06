"use client";

import { useState } from "react";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { 
  auth, 
  googleProvider, 
  githubProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function useFirebaseAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuthSuccess = async (user: any, role?: string) => {
    const idToken = await user.getIdToken();
    const result = await nextAuthSignIn("credentials", {
      idToken,
      role: role || "FOUNDER",
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      toast.error("Authentication failed!");
    } else {
      toast.success("Welcome back!");
      router.push("/dashboard");
    }
  };

  const signInWithGoogle = async (role?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleAuthSuccess(result.user, role);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGithub = async (role?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      await handleAuthSuccess(result.user, role);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      
      // Enforce email verification for email access
      if (!result.user.emailVerified) {
        throw new Error("Please verify your email address before logging in. Check your inbox for the verification link.");
      }
      
      await handleAuthSuccess(result.user);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, role: string) => {
    setLoading(true);
    setError(null);
    try {
      // Create the user in Firebase
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      
      // Send the verification email immediately
      try {
        const { sendEmailVerification } = await import("@/lib/firebase");
        await sendEmailVerification(result.user);
        toast.success("Account created successfully! Please check your email to verify your account.", { duration: 8000 });
      } catch (verifyErr) {
        console.error("Failed to send verification email:", verifyErr);
        toast.error("Account created, but failed to send verification email. Please try logging in to trigger a new link.");
      }

      // Create user in Prisma with the requested role
      await handleAuthSuccess(result.user, role);
      
      // Immediately sign out to enforce verification before actual use
      const { signOut: nextSignOut } = await import("next-auth/react");
      await auth.signOut();
      await nextSignOut({ redirect: false });

      // Redirect to login
      router.push("/login?verify=true");
      
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    signInWithGoogle,
    signInWithGithub,
    signInWithEmail,
    signUpWithEmail,
  };
}
