import Link from "next/link";

import { Wordmark } from "@/components/shared/wordmark";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col justify-between px-6 py-8 sm:px-10 sm:py-10">
      <Wordmark />

      <div className="max-w-xl pb-[12vh]">
        <p className="text-sm tracking-[0.18em] text-[var(--atmos-muted)] uppercase">
          404
        </p>
        <h1 className="mt-4 text-4xl leading-tight font-normal sm:text-6xl">
          This atmosphere does not exist.
        </h1>
        <Link
          className="mt-8 inline-block underline underline-offset-4"
          href="/"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
