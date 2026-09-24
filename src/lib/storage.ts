import type { User } from "@/types/user";

const SESSION_KEY =
  "schedula:session";

const PATIENT_ACCOUNTS_KEY =
  "schedula:patient-accounts";

const LEGACY_PATIENT_ACCOUNT_KEY =
  "schedula:patient-account";

export type PatientAccount = {
  id: string;
  name: string;
  emailOrMobile: string;
  password: string;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emitSessionUpdated(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(
    new Event(
      "schedula:session-updated",
    ),
  );
}

function normalizeIdentifier(
  identifier: string,
): string {
  return identifier
    .trim()
    .toLowerCase();
}

function readPatientAccounts(): PatientAccount[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        PATIENT_ACCOUNTS_KEY,
      );

    if (raw) {
      const parsed =
        JSON.parse(
          raw,
        ) as unknown;

      if (Array.isArray(parsed)) {
        return parsed.filter(
          (
            item,
          ): item is PatientAccount =>
            Boolean(
              item &&
                typeof item ===
                  "object" &&
                typeof (
                  item as PatientAccount
                ).id ===
                  "string" &&
                typeof (
                  item as PatientAccount
                ).name ===
                  "string" &&
                typeof (
                  item as PatientAccount
                ).emailOrMobile ===
                  "string" &&
                typeof (
                  item as PatientAccount
                ).password ===
                  "string",
            ),
        );
      }
    }

    const legacyRaw =
      window.localStorage.getItem(
        LEGACY_PATIENT_ACCOUNT_KEY,
      );

    if (!legacyRaw) {
      return [];
    }

    const legacy =
      JSON.parse(
        legacyRaw,
      ) as unknown;

    if (
      !legacy ||
      typeof legacy !==
        "object"
    ) {
      return [];
    }

    const account =
      legacy as Partial<PatientAccount>;

    if (
      typeof account.id !==
        "string" ||
      typeof account.name !==
        "string" ||
      typeof account.emailOrMobile !==
        "string" ||
      typeof account.password !==
        "string"
    ) {
      return [];
    }

    const migrated: PatientAccount[] =
      [
        {
          id: account.id,
          name: account.name,
          emailOrMobile:
            account.emailOrMobile,
          password:
            account.password,
        },
      ];

    window.localStorage.setItem(
      PATIENT_ACCOUNTS_KEY,
      JSON.stringify(
        migrated,
      ),
    );

    return migrated;
  } catch {
    return [];
  }
}

function writePatientAccounts(
  accounts: PatientAccount[],
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    PATIENT_ACCOUNTS_KEY,
    JSON.stringify(accounts),
  );
}

export function getSession(): User | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw =
      window.localStorage.getItem(
        SESSION_KEY,
      );

    return raw
      ? (JSON.parse(
          raw,
        ) as User)
      : null;
  } catch {
    return null;
  }
}

export function setSession(
  user: User,
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(user),
  );

  emitSessionUpdated();
}

export function clearSession(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(
    SESSION_KEY,
  );

  emitSessionUpdated();
}

export function getPatientAccount(
  identifier?: string,
): PatientAccount | null {
  const accounts =
    readPatientAccounts();

  if (!identifier) {
    return (
      accounts[0] ?? null
    );
  }

  const normalizedIdentifier =
    normalizeIdentifier(
      identifier,
    );

  return (
    accounts.find(
      (account) =>
        normalizeIdentifier(
          account.emailOrMobile,
        ) ===
        normalizedIdentifier,
    ) ?? null
  );
}

export function savePatientAccount(
  account: PatientAccount,
): void {
  if (!isBrowser()) {
    return;
  }

  const accounts =
    readPatientAccounts();

  const normalizedIdentifier =
    normalizeIdentifier(
      account.emailOrMobile,
    );

  const existingIndex =
    accounts.findIndex(
      (existing) =>
        normalizeIdentifier(
          existing.emailOrMobile,
        ) ===
        normalizedIdentifier,
    );

  if (existingIndex >= 0) {
    accounts[existingIndex] =
      account;
  } else {
    accounts.push(account);
  }

  writePatientAccounts(
    accounts,
  );
}