import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import type { ToastLevels } from "~/types/notification.types";

export const showToast = (message: string, level?: ToastLevels) => {
  toast(message, { type: level, autoClose: 2000 });
};

export const handleError = (error: unknown, message: string) => {
  console.error(`[ERROR] -  ${message}\n`, error);
  showToast(message, "error");
};
