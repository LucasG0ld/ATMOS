import Link from "next/link";

export function Wordmark() {
  return (
    <Link
      aria-label="ATMOS — Home"
      className="w-fit text-sm font-medium tracking-[0.28em]"
      href="/"
    >
      ATMOS
    </Link>
  );
}
