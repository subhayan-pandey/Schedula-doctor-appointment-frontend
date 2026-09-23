"use client";

import Image from "next/image";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import {
  deleteMedicalDocument,
  getMedicalDocumentsByPatientId,
  getMedicalDocumentUpdatedEvent,
  saveMedicalDocument,
} from "@/lib/medical-document-store";

import {
  getSession,
} from "@/lib/storage";

import type {
  MedicalDocument,
  MedicalDocumentCategory,
} from "@/types/medical-document";

type CategoryFilter =
  | "all"
  | MedicalDocumentCategory;

const MAX_FILE_SIZE =
  4 * 1024 * 1024;

const CATEGORY_OPTIONS: {
  value: MedicalDocumentCategory;
  label: string;
}[] = [
  {
    value: "prescription",
    label: "Prescription",
  },
  {
    value: "lab-report",
    label: "Lab report",
  },
  {
    value: "scan",
    label: "Scan",
  },
  {
    value: "medical-record",
    label: "Medical record",
  },
  {
    value: "other",
    label: "Other",
  },
];

function formatFileSize(
  bytes: number,
): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

function formatDate(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

function getCategoryLabel(
  category: MedicalDocumentCategory,
): string {
  return (
    CATEGORY_OPTIONS.find(
      (option) =>
        option.value ===
        category,
    )?.label ?? "Other"
  );
}

function getDocumentIcon(
  document: MedicalDocument,
) {
  if (
    document.category ===
    "prescription"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="size-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 3.75h6.25L18 8.5v11.75H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 3.75V9h5"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.5 13h6.5M8.5 16h5"
        />
      </svg>
    );
  }

  if (
    document.category ===
    "lab-report"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="size-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 3.5v5.25L5.5 15a4 4 0 0 0 3.65 5.5h5.7A4 4 0 0 0 18.5 15L15 8.75V3.5"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.5 3.5h7M7.75 14h8.5"
        />
      </svg>
    );
  }

  if (
    document.category ===
    "scan"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="size-5"
        aria-hidden="true"
      >
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="2"
        />
        <circle
          cx="9"
          cy="9"
          r="1.25"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m5.5 17 4.25-4.25 3 3 2-2L18.5 17"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="size-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3.75h6.25L18 8.5v11.75H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 3.75V9h5"
      />
    </svg>
  );
}

function readFileAsDataUrl(
  file: File,
): Promise<string> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const reader =
        new FileReader();

      reader.onload = () => {
        if (
          typeof reader.result !==
          "string"
        ) {
          reject(
            new Error(
              "Unable to read the selected file.",
            ),
          );

          return;
        }

        resolve(
          reader.result,
        );
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Unable to read the selected file.",
          ),
        );
      };

      reader.readAsDataURL(
        file,
      );
    },
  );
}

export default function MedicalDocumentVault() {
  const session =
    getSession();

  const patientId =
    session?.role ===
    "patient"
      ? session.id
      : null;

  const [
    documents,
    setDocuments,
  ] = useState<
    MedicalDocument[]
  >(() =>
    patientId
      ? getMedicalDocumentsByPatientId(
          patientId,
        )
      : [],
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState<CategoryFilter>(
    "all",
  );

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<MedicalDocumentCategory>(
    "medical-record",
  );

  const [
    uploadName,
    setUploadName,
  ] = useState("");

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(
    null,
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    success,
    setSuccess,
  ] = useState<string | null>(
    null,
  );

  const [
    viewingDocument,
    setViewingDocument,
  ] = useState<
    MedicalDocument | null
  >(null);

  const loadDocuments =
    useCallback(() => {
      if (!patientId) {
        setDocuments([]);
        return;
      }

      setDocuments(
        getMedicalDocumentsByPatientId(
          patientId,
        ),
      );
    }, [patientId]);

  useEffect(() => {
    if (!patientId) {
      return;
    }

    const refresh =
      () => {
        loadDocuments();
      };

    const eventName =
      getMedicalDocumentUpdatedEvent();

    window.addEventListener(
      eventName,
      refresh,
    );

    window.addEventListener(
      "storage",
      refresh,
    );

    return () => {
      window.removeEventListener(
        eventName,
        refresh,
      );

      window.removeEventListener(
        "storage",
        refresh,
      );
    };
  }, [
    patientId,
    loadDocuments,
  ]);

  const filteredDocuments =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return documents.filter(
        (document) => {
          if (
            category !==
              "all" &&
            document.category !==
              category
          ) {
            return false;
          }

          if (
            normalizedSearch
          ) {
            const searchable =
              [
                document.name,
                document.fileName,
                document.category,
                document.fileType,
              ]
                .join(" ")
                .toLowerCase();

            if (
              !searchable.includes(
                normalizedSearch,
              )
            ) {
              return false;
            }
          }

          return true;
        },
      );
    }, [
      documents,
      category,
      search,
    ]);

  const handleFileChange =
    (
      event: ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        event.target.files?.[0] ??
        null;

      setSelectedFile(
        file,
      );
      setError(null);
      setSuccess(null);

      if (!file) {
        return;
      }

      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        setError(
          "The selected file is too large. Please choose a file smaller than 4 MB.",
        );

        setSelectedFile(
          null,
        );

        event.target.value =
          "";

        return;
      }

      if (
        !file.type.startsWith(
          "image/",
        ) &&
        file.type !==
          "application/pdf" &&
        !file.type.startsWith(
          "text/",
        )
      ) {
        setError(
          "Please select a PDF, image, or text document.",
        );

        setSelectedFile(
          null,
        );

        event.target.value =
          "";
      }
    };

  const handleUpload =
    async () => {
      setError(null);
      setSuccess(null);

      if (!patientId) {
        setError(
          "Please log in with a patient account before uploading a document.",
        );

        return;
      }

      if (!selectedFile) {
        setError(
          "Please select a document to upload.",
        );

        return;
      }

      if (
        selectedFile.size >
        MAX_FILE_SIZE
      ) {
        setError(
          "The selected file is too large. Please choose a file smaller than 4 MB.",
        );

        return;
      }

      const trimmedName =
        uploadName.trim();

      if (!trimmedName) {
        setError(
          "Please enter a name for the document.",
        );

        return;
      }

      setIsUploading(
        true,
      );

      try {
        const dataUrl =
          await readFileAsDataUrl(
            selectedFile,
          );

        saveMedicalDocument({
          id: `document-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`,

          patientId,

          name: trimmedName,

          category:
            selectedCategory,

          fileName:
            selectedFile.name,

          fileType:
            selectedFile.type ||
            "application/octet-stream",

          fileSize:
            selectedFile.size,

          dataUrl,

          createdAt:
            new Date().toISOString(),

          updatedAt:
            new Date().toISOString(),
        });

        setUploadName(
          "",
        );

        setSelectedFile(
          null,
        );

        setSuccess(
          "Medical document uploaded successfully.",
        );

        const input =
          document.getElementById(
            "medical-document-file",
          ) as HTMLInputElement | null;

        if (input) {
          input.value =
            "";
        }

        loadDocuments();
      } catch {
        setError(
          "The document could not be saved. Please try again.",
        );
      } finally {
        setIsUploading(
          false,
        );
      }
    };

  const handleDelete =
    (
      documentToDelete: MedicalDocument,
    ) => {
      const confirmed =
        window.confirm(
          `Delete "${documentToDelete.name}"? This action cannot be undone.`,
        );

      if (!confirmed) {
        return;
      }

      deleteMedicalDocument(
        documentToDelete.id,
      );

      if (
        viewingDocument?.id ===
        documentToDelete.id
      ) {
        setViewingDocument(
          null,
        );
      }

      loadDocuments();

      setSuccess(
        "Medical document deleted.",
      );

      setError(null);
    };

  if (!patientId) {
    return (
      <main className="min-h-[60vh] bg-[var(--canvas)]">
        <div className="mx-auto max-w-lg px-4 py-16 sm:px-8">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-10 text-center">
            <div className="mx-auto grid size-11 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand-deep)]">
              D
            </div>

            <h1 className="mt-4 text-xl font-semibold text-[var(--ink)]">
              Patient account required
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Please log in with a patient
              account to manage your medical
              documents.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[60vh] bg-[var(--canvas)]">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-10">
        <header className="flex flex-col gap-5 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-deep)]">
              Medical records
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
              Medical Document Vault
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Keep prescriptions, reports, scans and
              other medical documents organized in one
              place.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
            <p className="text-xs font-medium text-[var(--muted)]">
              Documents
            </p>

            <p className="mt-0.5 text-xl font-semibold text-[var(--ink)]">
              {documents.length}
            </p>
          </div>
        </header>

        {error && (
          <div
            className="mt-5 rounded-xl border border-[var(--urgent)]/20 bg-[var(--urgent-soft)] px-4 py-3 text-sm font-medium text-[var(--urgent-deep)]"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="mt-5 rounded-xl border border-[var(--success)]/20 bg-[var(--success-soft)] px-4 py-3 text-sm font-medium text-[var(--success)]"
            role="status"
          >
            {success}
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-[var(--ink)]">
              Add medical document
            </h2>

            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
              PDF, image and text files up to 4 MB are
              supported.
            </p>
          </div>

          <div className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_1fr_auto] lg:items-end">
            <label className="block">
              <span className="text-sm font-medium text-[var(--ink)]">
                Document name
              </span>

              <input
                type="text"
                value={uploadName}
                onChange={(event) =>
                  setUploadName(
                    event.target.value,
                  )
                }
                placeholder="e.g. Blood test report"
                className="mt-1.5 h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[var(--ink)]">
                Category
              </span>

              <select
                value={
                  selectedCategory
                }
                onChange={(event) =>
                  setSelectedCategory(
                    event.target
                      .value as MedicalDocumentCategory,
                  )
                }
                className="mt-1.5 h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
              >
                {CATEGORY_OPTIONS.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[var(--ink)]">
                File
              </span>

              <input
                id="medical-document-file"
                type="file"
                accept="application/pdf,image/*,text/*"
                onChange={
                  handleFileChange
                }
                className="mt-1.5 block h-10 w-full cursor-pointer rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--muted)] file:mr-3 file:h-full file:border-0 file:bg-[var(--brand-soft)] file:px-3 file:text-xs file:font-medium file:text-[var(--brand-deep)]"
              />

              {selectedFile && (
                <p className="mt-1.5 truncate text-xs text-[var(--muted)]">
                  {selectedFile.name}{" "}
                  ·{" "}
                  {formatFileSize(
                    selectedFile.size,
                  )}
                </p>
              )}
            </label>

            <Button
              onClick={
                handleUpload
              }
              disabled={
                isUploading
              }
              className="w-full lg:w-auto"
            >
              {isUploading
                ? "Uploading..."
                : "Upload document"}
            </Button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[var(--ink)]">
                  Your documents
                </h2>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Search and filter your saved medical
                  documents.
                </p>
              </div>

              <label className="block w-full lg:max-w-xs">
                <span className="sr-only">
                  Search medical documents
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search documents"
                  className="h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
                />
              </label>
            </div>

            <div className="mt-4 flex gap-1 overflow-x-auto rounded-lg bg-[var(--canvas)] p-1">
              <button
                type="button"
                onClick={() =>
                  setCategory(
                    "all",
                  )
                }
                className={`shrink-0 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  category ===
                  "all"
                    ? "bg-[var(--surface)] text-[var(--brand-deep)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                All
              </button>

              {CATEGORY_OPTIONS.map(
                (option) => (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    onClick={() =>
                      setCategory(
                        option.value,
                      )
                    }
                    className={`shrink-0 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                      category ===
                      option.value
                        ? "bg-[var(--surface)] text-[var(--brand-deep)] shadow-sm"
                        : "text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {
                      option.label
                    }
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {filteredDocuments.length ===
            0 ? (
              <EmptyState
                title={
                  documents.length ===
                  0
                    ? "No medical documents yet"
                    : "No matching documents"
                }
                description={
                  documents.length ===
                  0
                    ? "Upload your prescriptions, reports, scans or other medical records to keep them organized."
                    : "Try changing the search term or category filter."
                }
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {filteredDocuments.map(
                  (document) => (
                    <article
                      key={
                        document.id
                      }
                      className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--brand)]/40"
                    >
                      <div className="flex items-start gap-3">
                        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand-deep)]">
                          {getDocumentIcon(
                            document,
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold text-[var(--ink)]">
                                {
                                  document.name
                                }
                              </h3>

                              <p className="mt-1 truncate text-xs text-[var(--muted)]">
                                {
                                  document.fileName
                                }
                              </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-[var(--brand-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--brand-deep)]">
                              {
                                getCategoryLabel(
                                  document.category,
                                )
                              }
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                            <span>
                              {
                                formatFileSize(
                                  document.fileSize,
                                )
                              }
                            </span>

                            <span>
                              Added{" "}
                              {
                                formatDate(
                                  document.createdAt,
                                )
                              }
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                setViewingDocument(
                                  document,
                                )
                              }
                            >
                              View
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleDelete(
                                  document,
                                )
                              }
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {viewingDocument && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={
            viewingDocument.name
          }
          onClick={() =>
            setViewingDocument(
              null,
            )
          }
        >
          <div
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--ink)]">
                  {
                    viewingDocument.name
                  }
                </p>

                <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                  {
                    viewingDocument.fileName
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setViewingDocument(
                    null,
                  )
                }
                className="grid size-9 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
                aria-label="Close document viewer"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    d="M6 6l12 12M18 6 6 18"
                  />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto bg-[var(--canvas)] p-4 sm:p-6">
              {viewingDocument.fileType ===
                "application/pdf" ? (
                <iframe
                  src={
                    viewingDocument.dataUrl
                  }
                  title={
                    viewingDocument.name
                  }
                  className="h-[70vh] min-h-[420px] w-full rounded-lg border border-[var(--line)] bg-white"
                />
              ) : viewingDocument.fileType.startsWith(
                  "image/",
                ) ? (
                <div className="flex min-h-[420px] items-center justify-center">
                  <Image
                    src={
                      viewingDocument.dataUrl
                    }
                    alt={
                      viewingDocument.name
                    }
                    width={1200}
                    height={900}
                    unoptimized
                    className="max-h-[70vh] max-w-full rounded-lg object-contain"
                  />
                </div>
              ) : (
                <div className="flex min-h-[420px] items-center justify-center">
                  <div className="max-w-md rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 text-center">
                    <div className="mx-auto grid size-11 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)]">
                      {getDocumentIcon(
                        viewingDocument,
                      )}
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-[var(--ink)]">
                      {
                        viewingDocument.fileName
                      }
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      This document type is stored
                      successfully but does not have
                      an inline preview.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}