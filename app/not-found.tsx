import Link from "next/link";

export const metadata = {
  title: "Page not found — NunyaLink Systems",
};

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-24 text-center"
    >
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">
        404
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
        We can&rsquo;t find that page.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-slate-600">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have
        moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-md bg-navy px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-navy-dark"
      >
        Back to homepage
      </Link>
    </main>
  );
}
