const steps = [
  {
    number: "01",
    title: "Search",
    description:
      "Find doctors by specialty, condition, or name in seconds.",
  },
  {
    number: "02",
    title: "Compare & choose",
    description:
      "Check ratings, experience, fees, and availability side by side.",
  },
  {
    number: "03",
    title: "Pick a slot",
    description:
      "See open time slots and choose what works for you.",
  },
  {
    number: "04",
    title: "Confirm",
    description:
      "Get instant confirmation without waiting on a call.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-14"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
          Simple by design
        </p>

        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
          How Schedula works
        </h2>

        <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
          Four simple steps from finding a doctor to confirming your visit.
        </p>
      </div>

      <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(
          (step, index) => (
            <li
              key={step.number}
              className="relative rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 transition-all duration-200 hover:border-[var(--brand)]/40 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-[0.12em] text-[var(--brand-deep)]">
                  {step.number}
                </span>

                {index <
                  steps.length - 1 && (
                  <span
                    className="hidden text-[var(--line)] lg:block"
                    aria-hidden="true"
                  >
                    →
                  </span>
                )}
              </div>

              <h3 className="mt-5 text-base font-semibold text-[var(--ink)]">
                {step.title}
              </h3>

              <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                {step.description}
              </p>
            </li>
          ),
        )}
      </ol>
    </section>
  );
}