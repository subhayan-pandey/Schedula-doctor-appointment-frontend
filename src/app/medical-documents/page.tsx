import type {
  Metadata,
} from "next";

import MedicalDocumentVault from "@/features/medical-documents/components/MedicalDocumentVault";

export const metadata: Metadata = {
  title: "Medical Documents | Schedula",
};

export default function MedicalDocumentsPage() {
  return (
    <MedicalDocumentVault />
  );
}