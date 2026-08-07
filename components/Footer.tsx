export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-dark py-10 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left lg:px-8">
        <div>
          <p className="text-base font-bold text-white">
            NunyaLink <span className="text-accent">Systems</span>
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Automate the busywork. Run the business.
          </p>
        </div>
        <nav aria-label="Footer" className="flex gap-6 text-sm">
          <a href="#what-we-do" className="hover:text-white">
            What We Do
          </a>
          <a href="#how-it-works" className="hover:text-white">
            How It Works
          </a>
          <a href="#packages" className="hover:text-white">
            Packages
          </a>
          <a href="#contact" className="hover:text-white">
            Contact
          </a>
        </nav>
      </div>
      <p className="mt-8 text-center text-xs text-slate-400">
        &copy; {year} NunyaLink Systems. All rights reserved.
      </p>
    </footer>
  );
}
