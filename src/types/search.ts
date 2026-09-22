import type { Booking } from "@/types/booking";
import type { Doctor } from "@/types/doctor";

export type GlobalSearchResultType =
  | "doctor"
  | "appointment"
  | "support";

export type GlobalSearchResult = {
  id: string;
  type: GlobalSearchResultType;
  title: string;
  description: string;
  href: string;
};

export type GlobalSearchData = {
  doctors: Doctor[];
  appointments: Booking[];
};

export type GlobalSearchState = {
  query: string;
  results: GlobalSearchResult[];
  isLoading: boolean;
  error: string | null;
};