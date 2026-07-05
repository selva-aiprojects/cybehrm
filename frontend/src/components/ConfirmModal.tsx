import React from "react";

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  title?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Yes, Continue",
  cancelLabel = "Cancel",
  title = "Confirm Action",
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1200,
        backdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <div
        className="glass-card animated"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "28px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 16px 0" }}>{title}</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.6, margin: "0 0 24px 0" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            style={{ padding: "8px 20px", fontSize: "13px" }}
          >
            {cancelLabel}
          </button>
          <button
            className="btn btn-primary"
            onClick={onConfirm}
            style={{ padding: "8px 20px", fontSize: "13px" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
