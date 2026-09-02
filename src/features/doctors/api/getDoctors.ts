import type { Doctor } from "@/types/doctor";

type DoctorsResponse = {
  data: Doctor[];
  meta: { total: number };
};

export async function getDoctors(): Promise<Doctor[]> {
  const response = await fetch("/api/doctors");
  if (!response.ok) {
    throw new Error("Failed to load doctors");
  }
  const body = (await response.json()) as DoctorsResponse;
  return body.data;
}