import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Upload, X, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { apiJson } from "../lib/api";
import { resolveAssetUrl } from "../lib/assetUrl";

const Claim = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, token } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [proofText, setProofText] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    apiJson(`/items/${id}`)
      .then((res) => {
        if (!mounted) return;
        if (res.ok && res.data) {
          const payload = res.data && res.data.data ? res.data.data : res.data;
          setItem(payload);
        } else {
          setItem(null);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch item for claim page", error);
        if (mounted) setItem(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const itemImage = resolveAssetUrl(item?.image);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!proofText.trim()) {
      setFormError("Please describe why you believe this item belongs to you.");
      return;
    }

    if (!proofImage) {
      setFormError("Please upload a proof image before submitting the claim.");
      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("proof_text", proofText.trim());
      formData.append("item_id", String(item.id));
      formData.append("proof_image", proofImage);

      const res = await apiJson("/claims/", {
        method: "POST",
        body: formData,
        token,
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setFormError(res.data?.detail || "Failed to submit claim.");
      }
    } catch (error) {
      console.error("Claim submit failed:", error);
      setFormError("Failed to submit claim. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const clearFile = () => {
    setProofImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ padding: '40px' }}
      >
        <Navbar title={t("claimTitle")} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                background: 'white',
                borderRadius: '28px',
                padding: '28px',
                boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
              }}
            >
              <div style={{ width: '40%', height: 24, borderRadius: 8, background: 'linear-gradient(90deg, #e8ecf1 25%, #f3f6f9 37%, #e8ecf1 63%)', backgroundSize: '800px 100%', animation: 'um-shimmer 1.6s ease-in-out infinite', marginBottom: 16 }} />
              <div style={{ width: '100%', height: 200, borderRadius: 18, background: 'linear-gradient(90deg, #e8ecf1 25%, #f3f6f9 37%, #e8ecf1 63%)', backgroundSize: '800px 100%', animation: 'um-shimmer 1.6s ease-in-out infinite', marginBottom: 16 }} />
              <div style={{ width: '80%', height: 14, borderRadius: 8, background: 'linear-gradient(90deg, #e8ecf1 25%, #f3f6f9 37%, #e8ecf1 63%)', backgroundSize: '800px 100%', animation: 'um-shimmer 1.6s ease-in-out infinite', marginBottom: 10 }} />
              <div style={{ width: '60%', height: 14, borderRadius: 8, background: 'linear-gradient(90deg, #e8ecf1 25%, #f3f6f9 37%, #e8ecf1 63%)', backgroundSize: '800px 100%', animation: 'um-shimmer 1.6s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
        <style>{`@keyframes um-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }`}</style>
      </motion.div>
    );
  }

  if (!item) {
    return <div style={{ padding: "40px" }}>Item not found</div>;
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Navbar title={t("claimTitle")} />
        <div
          className="glass"
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            background: "white",
            padding: "40px",
            borderRadius: "28px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "50%",
              margin: "0 auto 20px",
              background: "#E2F9EB",
              color: "#01B574",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle size={42} />
          </div>
          <h2 style={{ marginBottom: "12px" }}>{t("claimSuccess")}</h2>
          <p style={{ marginBottom: "28px", color: "var(--text-secondary)" }}>
            {t("claimSuccessDesc")}
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link className="btn btn-primary" to={`/detail/${item.id}`}>
              Back to item
            </Link>
            <button
              className="btn"
              onClick={() => navigate("/browse")}
              style={{ background: "#F4F7FE", color: "var(--text-secondary)" }}
            >
              Continue browsing
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Navbar title={t("claimTitle")} />

      <Link
        to={`/detail/${item.id}`}
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
        Back to item
      </Link>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}
      >
        <div
          className="glass"
          style={{
            background: "white",
            padding: "28px",
            borderRadius: "28px",
            boxShadow: "0px 18px 40px rgba(112, 144, 176, 0.12)",
          }}
        >
          <h2 style={{ marginBottom: "16px" }}>
            {(item.report_type || item.type) === "lost"
              ? "Found Item"
              : "Claim Item"}
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            {(item.report_type || item.type) === "lost"
              ? "Explain where and when you found this item, and provide specific details that prove your discovery."
              : t("claimFormIntro")}
          </p>

          <div
            style={{
              border: "1px solid #E0E5F2",
              borderRadius: "18px",
              overflow: "hidden",
              marginBottom: "24px",
            }}
          >
            <img
              src={itemImage}
              alt={item.title}
              style={{
                width: "100%",
                height: "260px",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div style={{ padding: "18px" }}>
              <p
                style={{
                  margin: "0 0 8px 0",
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                }}
              >
                {item.category} · {item.location}
              </p>
              <h3 style={{ margin: 0 }}>{item.title}</h3>
              <p
                style={{ margin: "10px 0 0 0", color: "var(--text-secondary)" }}
              >
                {item.description}
              </p>
            </div>
          </div>

          <div
            style={{
              background: "#F4F7FE",
              padding: "18px",
              borderRadius: "18px",
              color: "var(--text-secondary)",
              fontSize: "14px",
            }}
          >
            Request will be sent to the owner/finder as a verification request.
            Prepare specific details and relevant proof.
          </div>
        </div>

        <div
          className="glass"
          style={{
            background: "white",
            padding: "28px",
            borderRadius: "28px",
            boxShadow: "0px 18px 40px rgba(112, 144, 176, 0.12)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 600,
                }}
              >
                {(item.report_type || item.type) === "lost"
                  ? "Where did you find this item?"
                  : "Why is this item yours?"}
                <span style={{ color: "#EE5D50" }}>*</span>
              </label>
              <textarea
                className="form-input"
                placeholder={
                  (item.report_type || item.type) === "lost"
                    ? "Describe the exact location, time of discovery, and unique characteristics you noticed..."
                    : t("proofPlaceholder")
                }
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                required
                style={{ minHeight: "160px", paddingTop: "12px" }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "22px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 600,
                }}
              >
                {t("proofImageLabel")}{" "}
                <span style={{ color: "#EE5D50" }}>*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="form-input"
                onChange={(e) => {
                  const file =
                    e.target.files && e.target.files[0]
                      ? e.target.files[0]
                      : null;
                  setProofImage(file);
                }}
                required
              />
              <p
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                }}
              >
                {proofImage ? proofImage.name : t("proofImageHint")}
              </p>
              {proofImage && (
                <button
                  type="button"
                  className="btn"
                  onClick={clearFile}
                  style={{
                    marginTop: "10px",
                    background: "#F4F7FE",
                    color: "var(--text-secondary)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <X size={16} />
                  Remove image
                </button>
              )}
            </div>

            {formError && (
              <p
                style={{
                  marginBottom: "18px",
                  color: "#EE5D50",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {formError}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "16px",
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {submitting && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  style={{ display: "inline-flex" }}
                >
                  <Loader2 size={18} />
                </motion.div>
              )}
              {submitting ? "Submitting..." : t("submitClaim")}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Claim;
