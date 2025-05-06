export const confirmationModalStyles = {
  simpleOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  simpleModal: {
    backgroundColor: "white",
    borderRadius: "4px",
    padding: "12px",
    width: "300px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
  simpleMessage: {
    margin: "0 0 12px 0",
    fontSize: "16px",
    textAlign: "center",
  },
  simpleButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
  },
  simpleCancelButton: {
    padding: "6px 12px",
    backgroundColor: "#f5f5f5",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
  },
  simpleConfirmButton: {
    padding: "6px 12px",
    backgroundColor: "#dc3545",
    border: "none",
    borderRadius: "4px",
    color: "white",
    cursor: "pointer",
  },
};

export default confirmationModalStyles;
