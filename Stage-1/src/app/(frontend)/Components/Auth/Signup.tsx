"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";

import { registerPayloadUser } from "@/app/(frontend)/Components/server/actions";
import { ROUTES } from "@/app/(frontend)/utils/constants";

import { Label } from "../ui/label";
import { Input } from "../ui/input";

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Signup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "seeker" as "provider" | "seeker", // default role
  });

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!data.firstName || !data.lastName || !data.email || !data.password || !data.role) {
      toast.error("All fields are required");
      return;
    }

    setIsLoading(true);
    try {
      const user = await registerPayloadUser(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.role
      );

      if (user) {
        toast.success("Account created successfully!");
        router.push(ROUTES.LOGIN);
      }
    } catch (error) {
      toast.error((error as Error).message ?? "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <ToastContainer className="z-[999999]" />

      <section className="mx-auto mt-20 w-full max-w-md px-4">
        <motion.div
          variants={{
            hidden: { opacity: 0, y: -20 },
            visible: { opacity: 1, y: 0 },
          }}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6 }}
          className="shadow-input rounded-none bg-white p-6 dark:bg-black md:rounded-2xl md:p-8"
        >
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 text-center">
            Create an Account
          </h2>

          <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-300">
            Fill in the details below to create your account
          </p>

          <form className="my-8" onSubmit={handleSignup}>
            {/* First + Last Name */}
            <div className="flex flex-col gap-4 md:flex-row md:gap-4">
              <LabelInputContainer>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  type="text"
                  value={data.firstName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  type="text"
                  value={data.lastName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </LabelInputContainer>
            </div>

            {/* Email */}
            <LabelInputContainer className="mt-4">
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

            {/* Password */}
            <LabelInputContainer className="mt-4">
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

            {/* Role */}
            <LabelInputContainer className="mt-4">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                value={data.role}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 dark:bg-black dark:text-white"
              >
                <option value="seeker">Seeker (I want to book services)</option>
                <option value="provider">Provider (I want to offer services)</option>
              </select>
            </LabelInputContainer>

            {/* Keep Signed In */}
            <div className="flex items-center justify-between mt-6 mb-6">
              <div className="flex items-center space-x-2">
                <input
                  id="keep-signed-in"
                  type="checkbox"
                  disabled={isLoading}
                />
                <Label htmlFor="keep-signed-in">Keep me signed in</Label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className={cn(
                "group/btn relative block h-10 w-full rounded-md bg-gradient-to-br",
                "from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset",
                "0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900",
                "dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset",
                "0px_-1px_0px_0px_#27272a_inset]"
              )}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account →"}
              <BottomGradient />
            </button>

            {/* Login Link */}
            <p className="mt-8 text-center text-sm text-neutral-700 dark:text-neutral-300">
              Already have an account?{" "}
              <Link href={ROUTES.LOGIN} className="hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </motion.div>
      </section>
    </>
  );
}

/* ---------------------------- COMPONENT HELPERS ---------------------------- */

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>;
