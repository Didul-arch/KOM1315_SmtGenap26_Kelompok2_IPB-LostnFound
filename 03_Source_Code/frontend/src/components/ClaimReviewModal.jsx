import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, User, FileText, Package } from "lucide-react";
import { resolveAssetUrl, isPreviewableImage } from "../lib/assetUrl";
import { apiJson } from "../lib/api";

const ClaimReviewModal = ({
  claim,
  item,
  claimer,
  loadingClaimer,
  onClose,
  onReview,
  reviewingId,
}) => {
  if (!claim) return null;

  const claimImageUrl = resolveAssetUrl(claim.proof_image);
  const identityImageUrl = claimer ? resolveAssetUrl(claimer.identity_document) : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          style={{
            background: "white",
            borderRadius: "24px",
            width: "100%",
            maxWidth: "900px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: "24px 32px",
              borderBottom: "1px solid #E2E8F0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              background: "white",
              zIndex: 10,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "24px", color: "#0F172A" }}>
                Review Claim Details
              </h2>
              <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: "14px" }}>
                Review the proof and claimer's identity before making a decision.
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748B",
                borderRadius: "50%",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <X size={24} />
            </button>
          </div>

          <div style={{ padding: "32px", display: "grid", gap: "32px" }}>
            {/* Split layout: Left (Claim & Item) / Right (Claimer) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "32px",
                alignItems: "start",
              }}
            >
              {/* Left Column: Claim Proof & Item */}
              <div style={{ display: "grid", gap: "24px" }}>
                <div>
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "18px",
                      color: "#1E293B",
                      marginBottom: "16px",
                    }}
                  >
                    <Package size={20} color="#3B82F6" />
                    Claimed Item
                  </h3>
                  <div
                    style={{
                      background: "#F8FAFC",
                      padding: "16px",
                      borderRadius: "16px",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <h4 style={{ margin: "0 0 8px 0", color: "#0F172A" }}>
                      {item?.title || `Item #${claim.item_id}`}
                    </h4>
                    <p style={{ margin: 0, color: "#64748B", fontSize: "14px" }}>
                      {item?.description || "No description available."}
                    </p>
                  </div>
                </div>

                <div>
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "18px",
                      color: "#1E293B",
                      marginBottom: "16px",
                    }}
                  >
                    <FileText size={20} color="#3B82F6" />
                    Claim Proof
                  </h3>
                  <div
                    style={{
                      background: "#F8FAFC",
                      padding: "16px",
                      borderRadius: "16px",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 16px 0",
                        color: "#334155",
                        lineHeight: "1.6",
                      }}
                    >
                      {claim.proof_text}
                    </p>
                    {claimImageUrl && (
                      <a href={claimImageUrl} target="_blank" rel="noreferrer">
                        <img
                          src={claimImageUrl}
                          alt="Claim Proof"
                          style={{
                            width: "100%",
                            borderRadius: "12px",
                            border: "1px solid #CBD5E1",
                            display: "block",
                          }}
                        />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Claimer Identity */}
              <div>
                <h3
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "18px",
                    color: "#1E293B",
                    marginBottom: "16px",
                  }}
                >
                  <User size={20} color="#10B981" />
                  Claimer Identity
                </h3>
                <div
                  style={{
                    background: "#F8FAFC",
                    padding: "20px",
                    borderRadius: "16px",
                    border: "1px solid #E2E8F0",
                    minHeight: "200px",
                  }}
                >
                  {loadingClaimer ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        color: "#64748B",
                      }}
                    >
                      Loading claimer details...
                    </div>
                  ) : claimer ? (
                    <div style={{ display: "grid", gap: "16px" }}>
                      <div>
                        <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Full Name</span>
                        <div style={{ fontSize: "16px", color: "#0F172A", fontWeight: 500 }}>{claimer.fullname}</div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Identity Number</span>
                          <div style={{ fontSize: "16px", color: "#0F172A", fontWeight: 500 }}>{claimer.identity_number || "-"}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Role</span>
                          <div style={{ fontSize: "16px", color: "#0F172A", fontWeight: 500, textTransform: "capitalize" }}>{claimer.role || "-"}</div>
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>Identity Document</span>
                        {identityImageUrl && isPreviewableImage(claimer.identity_document) ? (
                          <a href={identityImageUrl} target="_blank" rel="noreferrer">
                            <img
                              src={identityImageUrl}
                              alt="Identity Document"
                              style={{
                                width: "100%",
                                borderRadius: "12px",
                                border: "1px solid #CBD5E1",
                                display: "block",
                                maxHeight: "300px",
                                objectFit: "cover",
                              }}
                            />
                          </a>
                        ) : identityImageUrl ? (
                          <a
                            href={identityImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "inline-block",
                              padding: "10px 16px",
                              background: "#E2E8F0",
                              color: "#0F172A",
                              borderRadius: "8px",
                              textDecoration: "none",
                              fontSize: "14px",
                              fontWeight: 500,
                            }}
                          >
                            Download Document
                          </a>
                        ) : (
                          <div style={{ fontSize: "14px", color: "#64748B", fontStyle: "italic" }}>
                            No identity document uploaded.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: "#EF4444", fontSize: "14px" }}>
                      Failed to load claimer details.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          {claim.status === "pending" && (
            <div
              style={{
                padding: "24px 32px",
                borderTop: "1px solid #E2E8F0",
                background: "#F8FAFC",
                display: "flex",
                justifyContent: "flex-end",
                gap: "16px",
                borderBottomLeftRadius: "24px",
                borderBottomRightRadius: "24px",
              }}
            >
              <button
                style={{
                  background: "white",
                  border: "1px solid #CBD5E1",
                  color: "#0F172A",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
                disabled={reviewingId === claim.id}
                onClick={() => {
                  if (window.confirm("Are you sure you want to reject this claim?")) {
                    onReview(claim.id, "rejected");
                  }
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FEE2E2", e.currentTarget.style.borderColor = "#FCA5A5", e.currentTarget.style.color = "#DC2626")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white", e.currentTarget.style.borderColor = "#CBD5E1", e.currentTarget.style.color = "#0F172A")}
              >
                <XCircle size={18} />
                Reject Claim
              </button>
              <button
                style={{
                  background: "#01B574",
                  border: "none",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 6px -1px rgba(1, 181, 116, 0.2)",
                  transition: "all 0.2s",
                  opacity: reviewingId === claim.id ? 0.7 : 1,
                }}
                disabled={reviewingId === claim.id}
                onClick={() => {
                  if (window.confirm("Are you sure you want to approve this claim?")) {
                    onReview(claim.id, "approved");
                  }
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <CheckCircle size={18} />
                {reviewingId === claim.id ? "Approving..." : "Approve Claim"}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ClaimReviewModal;
