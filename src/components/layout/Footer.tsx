import Link from "next/link";

const columns = [
  {
    title: "Patients",
    links: [
      {
        href: "/doctors",
        label: "Find a doctor",
      },
      {
        href: "/signup",
        label: "Create account",
      },
      {
        href: "/login",
        label: "Log in",
      },
    ],
  },
  {
    title: "Doctors",
    links: [
      {
        href: "/doctor/register",
        label: "Join as a doctor",
      },
      {
        href: "/doctor/login",
        label: "Doctor log in",
      },
    ],
  },
  {
    title: "Company",
    links: [
      {
        href: "/#how-it-works",
        label: "How it works",
      },
      {
        href: "/#specialties",
        label: "Specialties",
      },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-[var(--line)] bg-[var(--surface)] sm:mt-14">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-soft)]"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-[var(--brand)] text-lg font-bold text-white">
                S
              </span>

              <span className="text-lg font-semibold tracking-tight text-[var(--ink)]">
                Schedula
              </span>
            </Link>

            <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">
              Find trusted doctors and book appointments in a few taps, with clear availability and simple scheduling.
            </p>
          </div>

          {columns.map(
            (column) => (
              <div
                key={column.title}
              >
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {column.title}
                </p>

                <ul className="mt-3 space-y-2.5">
                  {column.links.map(
                    (link) => (
                      <li
                        key={
                          link.href
                        }
                      >
                        <Link
                          href={
                            link.href
                          }
                          className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-soft)]"
                        >
                          {
                            link.label
                          }
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ),
          )}
        </div>

        <div className="mt-9 flex flex-col gap-2 border-t border-[var(--line)] pt-5 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Schedula. All rights reserved.
          </p>

          <p>
            This is a frontend demo project — no real appointments are booked.
          </p>
        </div>
      </div>
    </footer>
  );
}