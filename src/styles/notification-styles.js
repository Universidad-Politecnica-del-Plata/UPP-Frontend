export const notificationStyles = {
  banner: (show, type) => ({
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "80%",
    maxWidth: "600px",
    padding: "12px 16px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: 1000,
    opacity: show ? 1 : 0,
    transition: "opacity 0.3s ease",
    pointerEvents: show ? "all" : "none",
    backgroundColor: type === "success" ? "#10B981" : "#EF4444",
    color: "white",
  }),
  content: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  icon: {
    flexShrink: 0,
  },
  message: {
    fontSize: "14px",
    fontWeight: 500,
  },
  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
  },
};

export default notificationStyles;
