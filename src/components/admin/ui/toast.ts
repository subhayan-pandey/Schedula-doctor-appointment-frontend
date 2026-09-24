import { toast } from "react-toastify";

const TOAST_OPTIONS = {
  position: "top-right" as const,
};

export const adminToast = {
  success(message: string): void {
    toast.success(message, TOAST_OPTIONS);
  },

  error(message: string): void {
    toast.error(message, TOAST_OPTIONS);
  },

  info(message: string): void {
    toast.info(message, TOAST_OPTIONS);
  },

  warning(message: string): void {
    toast.warning(message, TOAST_OPTIONS);
  },
};
