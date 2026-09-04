import Link from "next/link";

const columns = [
  {
    title: "Patients",
    links: [
      { href: "/doctors", label: "Find a doctor" },
      { href: "/signup", label: "Create account" },
      { href: "/login", label: "Log in" },
    ],
  },
  {
    title: "Doctors",
    links: [
      { href: "/doctor/register", label: "Join as a doctor" },
      { href: "/doctor/login", label: "Doctor log in" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#specialties", label: "Specialties" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-[var(--brand)] text-lg font-bold text-white">
                S
              </span>
              <span className="text-lg font-semibold tracking-tight">Schedula</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-[var(--muted)]">
              Find trusted doctors and book appointments in a few taps, with
              clear availability and no waiting-room guesswork.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold text-[var(--ink)]">{column.title}</p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--muted)] hover:text-[var(--brand)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--line)] pt-6 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-contnet">
          <p>© {new Date().getFullYear()} Schedula. All rights reserved.</p>
          
        </div>
      </div>
    </footer>
  );
}