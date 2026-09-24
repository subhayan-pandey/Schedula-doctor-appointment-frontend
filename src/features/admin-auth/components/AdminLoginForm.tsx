"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

import { adminToast } from "@/components/admin/ui/toast";

import { useAdminAuth } from "@/context/AdminAuthContext";

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function AdminLoginForm() { 
  const router = useRouter();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setFormError("");

    const nextErrors: FieldErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const result = await login(email, password);

    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error);
      adminToast.error(result.error);
      return;
    }

    adminToast.success("Welcome back.");
    router.push("/admin");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      noValidate
    >
      <TextField
        id="admin-email"
        label="Email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
      />

      <TextField
        id="admin-password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />

      {formError && (
        <p
          className="text-sm font-medium text-[var(--urgent-deep)]"
          role="alert"
        >
          {formError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-xs leading-5 text-[var(--muted)]">
        Demo credentials — admin@schedula.com / Admin@123
      </p>
    </form>
  );
}
