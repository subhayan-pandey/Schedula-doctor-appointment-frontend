import type {
  MedicalDocument,
} from "@/types/medical-document";

const STORAGE_KEY =
  "schedula:medical-documents";

const DOCUMENT_UPDATED_EVENT =
  "schedula:medical-documents-updated";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizeDocument(
  document: MedicalDocument,
): MedicalDocument {
  return {
    id:
      document.id ||
      `document-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    patientId:
      document.patientId ?? "",

    appointmentId:
      document.appointmentId ||
      undefined,

    name:
      document.name?.trim() ||
      document.fileName ||
      "Medical document",

    category:
      document.category ||
      "other",

    fileName:
      document.fileName ||
      "document",

    fileType:
      document.fileType ||
      "application/octet-stream",

    fileSize:
      Number.isFinite(document.fileSize) &&
      document.fileSize >= 0
        ? document.fileSize
        : 0,

    dataUrl:
      document.dataUrl || "",

    createdAt:
      document.createdAt ||
      new Date().toISOString(),

    updatedAt:
      document.updatedAt ||
      document.createdAt ||
      new Date().toISOString(),
  };
}

function readDocuments(): MedicalDocument[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw) as MedicalDocument[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (document) =>
          document &&
          typeof document === "object",
      )
      .map(normalizeDocument);
  } catch {
    return [];
  }
}

function writeDocuments(
  documents: MedicalDocument[],
): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(documents),
  );

  window.dispatchEvent(
    new Event(
      DOCUMENT_UPDATED_EVENT,
    ),
  );
}

export function getAllMedicalDocuments(): MedicalDocument[] {
  return readDocuments();
}

export function getMedicalDocumentById(
  documentId: string,
): MedicalDocument | undefined {
  return readDocuments().find(
    (document) =>
      document.id === documentId,
  );
}

export function getMedicalDocumentsByPatientId(
  patientId: string,
): MedicalDocument[] {
  return readDocuments()
    .filter(
      (document) =>
        document.patientId === patientId,
    )
    .sort(
      (first, second) =>
        new Date(second.updatedAt).getTime() -
        new Date(first.updatedAt).getTime(),
    );
}

export function getMedicalDocumentsByAppointmentId(
  appointmentId: string,
): MedicalDocument[] {
  return readDocuments()
    .filter(
      (document) =>
        document.appointmentId ===
        appointmentId,
    )
    .sort(
      (first, second) =>
        new Date(second.updatedAt).getTime() -
        new Date(first.updatedAt).getTime(),
    );
}

export function saveMedicalDocument(
  document: MedicalDocument,
): MedicalDocument {
  const documents =
    readDocuments();

  const normalized =
    normalizeDocument({
      ...document,
      updatedAt:
        new Date().toISOString(),
    });

  const existingIndex =
    documents.findIndex(
      (item) =>
        item.id === normalized.id,
    );

  const updated =
    existingIndex >= 0
      ? documents.map(
          (item, index) =>
            index === existingIndex
              ? normalized
              : item,
        )
      : [
          ...documents,
          normalized,
        ];

  writeDocuments(updated);

  return normalized;
}

export function deleteMedicalDocument(
  documentId: string,
): MedicalDocument[] {
  const updated =
    readDocuments().filter(
      (document) =>
        document.id !== documentId,
    );

  writeDocuments(updated);

  return updated;
}

export function clearMedicalDocumentsForPatient(
  patientId: string,
): MedicalDocument[] {
  const updated =
    readDocuments().filter(
      (document) =>
        document.patientId !== patientId,
    );

  writeDocuments(updated);

  return updated;
}

export function getMedicalDocumentUpdatedEvent(): string {
  return DOCUMENT_UPDATED_EVENT;
}