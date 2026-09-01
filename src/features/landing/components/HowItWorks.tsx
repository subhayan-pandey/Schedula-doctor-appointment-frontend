const steps = [
  {
    title: "Search",
    description: "Find doctors by specialty, condition, or name in seconds.",
  },
  {
    title: "Compare & choose",
    description: "Check ratings, experience, fees, and availability side by side.",
  },
  {
    title: "Pick a slot",
    description: "See real open time slots and pick what works for you.",
  },
  {
    title: "Confirm",
    description: "Get instant confirmation — no calls, no waiting on hold.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
      <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
        How Schedula works
      </h2>
      <p className="mt-1 max-w-xl text-[var(--muted)]">
        Four simple steps from searching a doctor to walking into your visit
        prepared.
      </p>

      <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6"
          >
            <span className="grid size-9 place-items-center rounded-full bg-[var(--brand)] text-sm font-semibold text-white">
              {index + 1}
            </span>
            <p className="mt-4 font-semibold text-[var(--ink)]">{step.title}</p>
            <p className="mt-1.5 text-sm text-[var(--muted)]">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}