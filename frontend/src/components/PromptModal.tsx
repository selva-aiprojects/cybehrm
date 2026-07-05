import React, { useState, useEffect, useRef } from "react";

interface PromptModalProps {
  message: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  title?: string;
  placeholder?: string;
}

const PromptModal: React.FC<PromptModalProps> = ({
  message,
  defaultValue = "",
  onConfirm,
  onCancel,
  title = "Input Required",
  placeholder = "",
}) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ margin: 0 }}>{title}</h3>
          <span
            style={{
              cursor: "pointer",
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--text-muted)",
              lineHeight: 1,
            }}
            onClick={onCancel}
          >
            ×
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          <label
            className="form-label"
            style={{ marginBottom: "8px", display: "block" }}
          >
            {message}
          </label>
          <input
            ref={inputRef}
            type="text"
            className="form-control"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            style={{ marginBottom: "20px" }}
          />
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              style={{ padding: "8px 20px", fontSize: "13px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: "8px 20px", fontSize: "13px" }}
            >
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromptModal;
