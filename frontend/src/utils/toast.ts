import toast from "react-hot-toast";

export const showToast = {
  success: (msg: string) =>
    toast.success(msg, {
      style: {
        background: "var(--bg-card)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        fontSize: "14px",
      },
      iconTheme: { primary: "#10B981", secondary: "#fff" },
      duration: 3000,
    }),
  error: (msg: string) =>
    toast.error(msg, {
      style: {
        background: "var(--bg-card)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        fontSize: "14px",
      },
      iconTheme: { primary: "#EF4444", secondary: "#fff" },
      duration: 4000,
    }),
  info: (msg: string) =>
    toast(msg, {
      icon: "ℹ️",
      style: {
        background: "var(--bg-card)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        fontSize: "14px",
      },
      duration: 3000,
    }),
  loading: (msg: string) =>
    toast.loading(msg, {
      style: {
        background: "var(--bg-card)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        fontSize: "14px",
      },
    }),
};

export default toast;
