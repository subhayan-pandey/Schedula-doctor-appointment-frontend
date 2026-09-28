import { store } from "@/store";
import { replaceCollection, setSingleton, type SharedCollectionName } from "@/store/slices/sharedDataSlice";

export function getSharedCollection<T>(name: SharedCollectionName): T[] {
  return store.getState().sharedData.collections[name] as T[];
}
export function replaceSharedCollection<T>(name: SharedCollectionName, value: T[]): void {
  store.dispatch(replaceCollection({ name, value }));
}
export function updateSharedCollection<T>(name: SharedCollectionName, update: (items: T[]) => T[]): T[] {
  const next = update(getSharedCollection<T>(name));
  replaceSharedCollection(name, next);
  return next;
}
export function getSharedSingleton<T>(name: "doctorAccount" | "doctorPassword"): T | null {
  return store.getState().sharedData.singletons[name] as T | null;
}
export function setSharedSingleton(name: "doctorAccount" | "doctorPassword", value: unknown): void {
  store.dispatch(setSingleton({ name, value }));
}
export function emitLegacyViewEvent(name: string): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(name));
}
