export type UserRole = "patient" | "doctor";

export type User = {
  id: string;
  name: string;
  emailOrMobile: string;
  role: UserRole;
};