"use client";

import { useActionState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { signInWithPassword } from "./actions";

type SignInActionState = { error: string } | null;

export default function LoginForm({
  nextPath,
  callbackError,
}: {
  nextPath: string;
  callbackError?: string;
}) {
  const [signInState, signInAction, signInPending] = useActionState<
    SignInActionState,
    FormData
  >(async (_prev, formData) => {
    const result = await signInWithPassword(formData);
    return result ?? null;
  }, null);

  const authError = callbackError ?? signInState?.error;

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <Card className="p-8">
        <h1 className="font-display text-2xl font-bold text-orendt-black mb-1">
          Anmelden
        </h1>
        <p className="font-body text-sm text-gray-600 mb-6">
          logi-OS — Zugang mit Supabase Auth
        </p>

        {authError && (
          <p
            className="mb-4 font-body text-sm text-status-occupied"
            role="alert"
          >
            {authError}
          </p>
        )}

        <form action={signInAction} className="space-y-4">
          <input type="hidden" name="next" value={nextPath} />
          <Input
            id="email"
            name="email"
            type="email"
            label="E-Mail"
            autoComplete="email"
            required
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Passwort"
            autoComplete="current-password"
            required
          />
          <Button type="submit" className="w-full" disabled={signInPending}>
            {signInPending ? "Wird angemeldet…" : "Anmelden"}
          </Button>
        </form>

        <p className="mt-6 font-body text-xs text-gray-500 text-center leading-relaxed">
          Konten werden zentral angelegt — eine Selbstregistrierung ist nicht
          möglich. Bei Fragen wende dich an deine Administration.
        </p>

        <p className="mt-4 font-body text-xs text-gray-500 text-center">
          <Link href="/" className="text-orendt-black hover:underline">
            Zurück zum Dashboard
          </Link>
        </p>
      </Card>
    </div>
  );
}
