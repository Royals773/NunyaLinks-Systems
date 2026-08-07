import Reveal from "./Reveal";

const INDUSTRIES = [
  "Recruitment & staffing agencies",
  "Care & healthcare providers",
  "Retail, wholesale & e-commerce",
  "Fashion, bespoke & creative businesses",
  "Beauty, wellness & service providers",
  "Catering & event businesses",
  "Professional & business services",
  "Training & education providers",
  "Multi-location & remotely managed businesses",
];

export default function WhoWeWorkWith() {
  return (
    <section
      aria-labelledby="who-we-work-with-heading"
      className="bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <h2
            id="who-we-work-with-heading"
            className="text-3xl font-bold tracking-tight text-navy sm:text-4xl"
          >
            Who We Work With
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            We work with SMEs across a range of people-driven industries,
            including:
          </p>

          <ul className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
            {INDUSTRIES.map((industry) => (
              <li
                key={industry}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-navy"
              >
                {industry}
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-10 max-w-2xl text-base italic text-slate-500">
            Our roots are in operations ourselves — so we understand
            people-driven, compliance-heavy businesses from the inside.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
