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
      await handleAuthSuccess(result.user);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
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
        toast.success("Account created! Please check your email to verify.", { duration: 5000 });
      } catch (verifyErr) {
        console.error("Failed to send verification email:", verifyErr);
        toast.error("Account created, but failed to send verification email.");
      }

      await handleAuthSuccess(result.user, role);
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
