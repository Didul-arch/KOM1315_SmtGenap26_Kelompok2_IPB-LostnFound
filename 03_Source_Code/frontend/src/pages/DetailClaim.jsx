import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import {
  Calendar,
  User,
  ArrowLeft,
  MessageCircle,
  Copy,
  Check,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { apiJson } from "../lib/api";
import { resolveAssetUrl } from "../lib/assetUrl";

const DetailClaim = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [item, setItem] = useState(null);
  const [claimer, setClaimer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Prepare auth token if available
    const authOpts = token ? { token } : {};

    apiJson(`/claims/${id}`, authOpts)
      .then((res) => {
        if (!mounted) return;

        // If 401 Unauthorized, redirect to login
        if (res.status === 401) {
          navigate("/login");
          return;
        }

        if (res.ok && res.data) {
          // Backend returns { data: claim }, where claim is a ClaimEntity
          const payload = res.data && res.data.data ? res.data.data : res.data;

          // Handle enum values if needed
          if (payload) {
            // Ensure status is lowercase string
            if (payload.status && typeof payload.status === "object") {
              payload.status = payload.status.value || payload.status;
            }
            // Ensure request_type is lowercase string
            if (
              payload.request_type &&
              typeof payload.request_type === "object"
            ) {
              payload.request_type =
                payload.request_type.value || payload.request_type;
            }
          }

          setClaim(payload);

          // Fetch item details
          if (payload && payload.item_id) {
            apiJson(`/items/${payload.item_id}`, authOpts)
              .then((itemRes) => {
                if (!mounted) return;
                if (itemRes.ok && itemRes.data) {
                  const itemPayload =
                    itemRes.data && itemRes.data.data
                      ? itemRes.data.data
                      : itemRes.data;
                  setItem(itemPayload);
                }
              })
              .catch(() => {});
          }

          // Fetch claimer info
          if (payload && payload.claimer_id) {
            apiJson(`/users/${payload.claimer_id}`, authOpts)
              .then((userRes) => {
                if (!mounted) return;
                if (userRes.ok && userRes.data) {
                  const userPayload =
                    userRes.data && userRes.data.data
                      ? userRes.data.data
                      : userRes.data;
                  setClaimer(userPayload);
                }
              })
              .catch(() => {});
          }
        } else {
          setClaim(null);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch claim detail", err);
        if (mounted) setClaim(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, token, navigate]);

  if (loading) return <div>{t("loading") || "Loading..."}</div>;
  if (!claim) return <div>{t("claimNotFound") || "Claim not found"}</div>;

  const proofImage = resolveAssetUrl(claim.proof_image);

  const displayDate = claim?.created_at
    ? new Date(claim.created_at).toLocaleString()
    : "-";

  const displayClaimer =
    claimer?.fullname || `User #${claim?.claimer_id || "-"}`;

  const handleCopy = () => {
    const contact =
      claimer?.contactInfo ||
      claimer?.phone ||
      claimer?.email ||
      "No contact info";
    navigator.clipboard.writeText(contact);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getContactLink = (info) => {
    if (!info) return "#";
    const lower = info.toLowerCase();

    if (lower.includes("wa:")) {
      const num = info.split(":")[1].trim().replace(/^0/, "62");
      return `https://wa.me/${num}`;
    }
    if (lower.includes("ig:")) {
      const handle = info.split(":")[1].trim().replace("@", "");
      return `https://instagram.com/${handle}`;
    }
    if (lower.includes("email:")) {
      const email = info.split(":")[1].trim();
      return `mailto:${email}`;
    }
    return "#";
  };

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "pending":
        return "badge-pending";
      case "approved":
        return "badge-approved";
      case "rejected":
        return "badge-rejected";
      default:
        return "";
    }
  };

  const getStatusBadgeColor = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "pending":
        return "#FF9800";
      case "approved":
        return "#4CAF50";
      case "rejected":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const handleMarkCollected = async () => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    setIsMarking(true);
    try {
      // Call API to mark as collected
      const res = await apiJson(`/claims/${id}/mark-collected`, {
        method: "PATCH",
        token,
      });

      if (res.ok) {
        // Update local state
        setClaim({ ...claim, status: "collected" });
        alert(t("markedAsCollected") || "Marked as collected!");
      } else {
        alert(t("error") || "Failed to mark as collected");
      }
    } catch (err) {
      console.error("Error marking claim as collected:", err);
      alert(t("error") || "An error occurred");
    } finally {
      setIsMarking(false);
    }
  };

  const isApproved = claim?.status?.toLowerCase() === "approved";
  const contact =
    claimer?.contactInfo || claimer?.phone || claimer?.email || "No contact";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar title={t("claimDetails") || "Claim Details"} />

      <Link
        to="/history"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--text-secondary)",
          marginBottom: "24px",
          width: "fit-content",
        }}
      >
        <ArrowLeft size={20} />
        {t("backToHistory") || "Back to history"}
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "40px",
        }}
      >
        {/* Left Column: Image & Proof Text */}
        <div>
          {proofImage ? (
            <div
              className="glass"
              style={{
                background: "white",
                borderRadius: "30px",
                overflow: "hidden",
                marginBottom: "30px",
                boxShadow: "0px 18px 40px rgba(112, 144, 176, 0.12)",
              }}
            >
              <img
                src={proofImage}
                alt="Proof"
                style={{ width: "100%", height: "500px", objectFit: "cover" }}
              />
            </div>
          ) : null}

          <div
            className="glass"
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "30px",
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>
              {t("proofText") || "Proof Text"}
            </h2>
            <p style={{ fontSize: "16px", color: "var(--text-primary)" }}>
              {claim.proof_text}
            </p>
          </div>
        </div>

        {/* Right Column: Info & Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          <div
            className="glass"
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "30px",
            }}
          >
            {/* Claim Status */}
            <div style={{ marginBottom: "24px" }}>
              <span
                className={`badge ${getStatusClass(claim.status)}`}
                style={{
                  marginBottom: "12px",
                  display: "inline-block",
                  background: getStatusBadgeColor(claim.status),
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                {claim.status}
              </span>
              <h1 style={{ fontSize: "32px" }}>
                {item?.title || "Claim for Item"}
              </h1>
            </div>

            {/* Claim Info */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                marginBottom: "30px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "12px",
                    background: "#F4F7FE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--ipb-blue)",
                  }}
                >
                  <Calendar size={20} />
                </div>
                <div>
                  <p style={{ fontSize: "12px" }}>
                    {t("dateSubmitted") || "Date Submitted"}
                  </p>
                  <p
                    style={{ fontWeight: "600", color: "var(--text-primary)" }}
                  >
                    {displayDate}
                  </p>
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "12px",
                    background: "#F4F7FE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--ipb-blue)",
                  }}
                >
                  <User size={20} />
                </div>
                <div>
                  <p style={{ fontSize: "12px" }}>
                    {t("claimer") || "Claimer"}
                  </p>
                  <p
                    style={{ fontWeight: "600", color: "var(--text-primary)" }}
                  >
                    {displayClaimer}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Person Section - Only show if approved */}
          {isApproved && (
            <div
              className="glass"
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "30px",
              }}
            >
              <h3 style={{ marginBottom: "20px" }}>
                {t("contactPerson") || "Contact Person"}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  marginBottom: "16px",
                }}
              >
                {t("contactPersonDesc") ||
                  "Reach out to the claimer to arrange the handover:"}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  padding: "16px",
                  background: "#F4F7FE",
                  borderRadius: "12px",
                  marginBottom: "16px",
                }}
              >
                <MessageCircle size={20} style={{ color: "var(--ipb-blue)" }} />
                <span style={{ flex: 1, fontSize: "14px" }}>{contact}</span>
              </div>
              <button
                onClick={handleCopy}
                className="btn btn-secondary"
                style={{
                  width: "100%",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    {t("copied") || "Copied!"}
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    {t("copyContact") || "Copy Contact Info"}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Mark as Collected Button - Only show if approved */}
          {isApproved && (
            <button
              onClick={handleMarkCollected}
              disabled={isMarking}
              className="btn btn-gold"
              style={{
                width: "100%",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: isMarking ? 0.7 : 1,
                cursor: isMarking ? "not-allowed" : "pointer",
              }}
            >
              <CheckCircle2 size={20} />
              {isMarking
                ? t("marking") || "Marking..."
                : t("markAsCollected") || "Mark as Collected"}
            </button>
          )}

          <div
            className="glass"
            style={{
              background: "#E1F0FE",
              padding: "24px",
              borderRadius: "24px",
              border: "1px solid #BEE3F8",
            }}
          >
            <h4 style={{ color: "var(--ipb-blue)", marginBottom: "8px" }}>
              {t("securityTipTitle") || "Security Tip"}
            </h4>
            <p style={{ fontSize: "14px", color: "var(--ipb-blue)" }}>
              {t("securityTipDesc") ||
                "For your safety, always meet in a public campus area when exchanging items."}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Modal - Can be used for more detailed view if needed */}
      {showContactModal && (
        <Modal onClose={() => setShowContactModal(false)}>
          <h2>{t("contactPersonTitle") || "Contact Person"}</h2>
          <p>{contact}</p>
          <button
            onClick={handleCopy}
            className="btn btn-primary"
            style={{ marginTop: "16px" }}
          >
            {copied ? t("copied") : t("copyContact")}
          </button>
        </Modal>
      )}
    </motion.div>
  );
};

export default DetailClaim;
