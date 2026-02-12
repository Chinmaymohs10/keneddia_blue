// src/utils/toastUtils.js
import { toast } from "react-toastify";

export const showSuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
  });
};

export const showError = (message) => {
  setTimeout(() => {
    toast.error(message, {
      position: "top-right",
      autoClose: 3000,
  })}, 100); // small delay so main content renders first
};


export const showWarning = (message) => {
  toast.warn(message, {
    position: "top-right",
    autoClose: 3000,
  });
};

export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
  });
};
