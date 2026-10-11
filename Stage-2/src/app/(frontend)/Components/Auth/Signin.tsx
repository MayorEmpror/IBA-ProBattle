"use client";
import { motion } from "motion/react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { ArrowBigRight } from "lucide-react";

import {
  fetchJWT,
  loginPayloadUser,
  resetUserPassword,
} from "@/app/(frontend)/Components/server/actions";
import { ROUTES } from "@/app/(frontend)/utils/constants";
import { cn } from "@/utilities/ui";

import { Label } from "../ui/label";
import { Input } from "../ui/input";


export default function Signin() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({ email: "", password: "" });
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);

  useEffect(() => {
    (async () => {
      const userData = await fetchJWT();
      if (userData?.value) {
        router.push(ROUTES.SERVICES);
      }
    })();
  }, [router]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await loginPayloadUser(data.email, data.password);
      if (user.success) {
        router.push(ROUTES.SERVICES);
      } else if (user.error) {
        toast.error(user.error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgotPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!data.email) {
        toast.error("Please enter your email address.");
        setIsLoading(false);
        return;
      }
      const result = await resetUserPassword(data.email);
      if (result === 0) {
        toast.success("Password reset email sent.");
        setIsForgotPasswordMode(false);
        setData({ email: data.email, password: "" });
      } else {
        toast.error("Email not found or error sending reset email.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <ToastContainer className="z-[999999]" />

      <div className="min-h-[calc(100vh-5rem)] bg-neutral-50   text-neutral-900 dark:text-neutral-100 py-12 flex flex-col items-center justify-center">
        <section className="w-full max-w-md px-4">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6 }}
            className="shadow-input rounded-none bg-white p-4 dark:bg-black md:rounded-2xl md:p-8"
          >
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 text-center">
            {isForgotPasswordMode ? "Reset Password" : "Login to Your Account"}
          </h2>

          <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-300">
            {isForgotPasswordMode
              ? "Enter your email to receive a reset link"
              : "Enter your account credentials to continue"}
          </p>

          <form
            className="my-8"
            onSubmit={
              isForgotPasswordMode ? handleForgotPasswordSubmit : handleLogin
            }
          >
            {/* Email */}
            <LabelInputContainer className="mb-4">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                placeholder="example@email.com"
                type="email"
                value={data.email}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </LabelInputContainer>

            {/* Password (hide in forgot mode) */}
            {!isForgotPasswordMode && (
              <LabelInputContainer className="mb-4">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                  value={data.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </LabelInputContainer>
            )}

            {/* Forgot Password Switch */}
            <div className="flex items-center justify-between mb-6">
              {!isForgotPasswordMode && (
                <div className="flex items-center space-x-2">
                  <input
                    id="keep-signed-in"
                    type="checkbox"
                    disabled={isLoading}
                  />
                  <Label htmlFor="keep-signed-in">Keep me signed in</Label>
                </div>
              )}

              <button
                type="button"
                className="text-sm hover:underline disabled:opacity-50"
                disabled={isLoading}
                onClick={() => {
                  setIsForgotPasswordMode((p) => !p);
                  setData((prev) => ({ ...prev, password: "" }));
                }}
              >
                {isForgotPasswordMode ? "Back to Login" : "Forgot Password?"}
              </button>
            </div>

            {/* Submit Button */}
            <button
              className={cn(
                "group/btn relative flex h-10 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-br",
                "from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset",
                "0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900",
                "dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset",
                "0px_-1px_0px_0px_#27272a_inset]"
              )}
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? isForgotPasswordMode
                  ? "Sending..."
                  : "Logging in..."
                : isForgotPasswordMode
                ? (
                    <>
                      Send Reset Email
                      <ArrowBigRight className="h-4 w-4" />
                    </>
                  )
                : (
                    <>
                      Log In
                      <ArrowBigRight className="h-4 w-4" />
                    </>
                  )}
              <BottomGradient />
            </button>

            {/* Signup Link */}
            {!isForgotPasswordMode && (
              <p className="mt-8 text-center text-sm text-neutral-700 dark:text-neutral-300">
                Don’t have an account?{" "}
                <Link href={ROUTES.SIGNUP} className="hover:underline">
                  Sign Up
                </Link>
              </p>
            )}
          </form>
          </motion.div>
        </section>
      </div>
    </>
  );
}

/* ---------------------------- COMPONENT HELPERS ---------------------------- */

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
