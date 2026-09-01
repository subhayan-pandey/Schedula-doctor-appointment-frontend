import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CTASection() {
  return (
    <section className="bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl bg-[var(--brand)] p-8 text-white sm:p-10">
            <h3 className="text-xl font-semibold sm:text-2xl">
              Ready to book your next visit?
            </h3>
            <p className="mt-2 max-w-md text-sm text-white/90 sm:text-base">
              Create a free account and book your first appointment in under
              a minute.
            </p>
            <Link href="/signup" className="mt-6 inline-block">
              <Button
                variant="outline"
                size="lg"
                className="border-white bg-white text-[var(--brand-deep)] hover:bg-white/90"
              >
                Create free account
              </Button>
            </Link>
          </div>

          <div className="rounded-2xl border border-[var(--urgent)]/25 bg-[var(--urgent-soft)] p-8 sm:p-10">
            <h3 className="text-xl font-semibold text-[var(--urgent-deep)] sm:text-2xl">
              Are you a doctor?
            </h3>
            <p className="mt-2 max-w-md text-sm text-[var(--ink)]/80 sm:text-base">
              Join Schedula to manage your availability and appointments in
              one place, without phone-based scheduling.
            </p>
            <Link href="/doctor/register" className="mt-6 inline-block">
              <Button
                size="lg"
                className="bg-[var(--urgent)] hover:bg-[var(--urgent-deep)]"
              >
                Register as a doctor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}