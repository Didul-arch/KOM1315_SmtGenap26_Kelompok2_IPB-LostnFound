import React, { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import { Upload, CheckCircle, FileText, ShieldCheck, Loader2 } from "lucide-react";
import { categories, locations } from "../data/mockData";
import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useItems } from "../context/ItemsContext";
import { apiJson } from "../lib/api";
import { useNavigate } from "react-router-dom";

const Report = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { user, token } = useAuth();
  const { refreshItems } = useItems();

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState("");

  // Item form fields
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [locationDetail, setLocationDetail] = useState("");
  const [date, setDate] = useState("");
  const [reportType, setReportType] = useState("lost");

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setUploadError("");

    // Validasi field wajib
    if (
      !itemName ||
      !description ||
      !category ||
      !location ||
      !locationDetail ||
      !date
    ) {
      setUploadError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const path =
        reportType === "lost" ? "/items/report-lost" : "/items/report-found";
      const formData = new FormData();
      formData.append("title", itemName);
      formData.append("description", description || "No description provided.");
      formData.append(
        "location",
        location + (locationDetail ? ` - ${locationDetail}` : ""),
      );
      formData.append("category", category || "General");
      formData.append("date", date);
      if (file) {
        formData.append("image", file);
      }

      const res = await apiJson(path, {
        method: "POST",
        body: formData,
        token,
      });
      if (res.ok) {
        refreshItems();
        setSubmitted(true);
      } else {
        const errorMessage =
          res.data?.message || "Failed to submit report. Please try again.";
        setUploadError(errorMessage);
        console.error("Failed to post to backend DB:", res);
      }
    } catch (err) {
      setUploadError("An error occurred. Please try again.");
      console.error("Error reporting to backend DB:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setItemName("");
    setDescription("");
    setCategory("");
    setLocation("");
    setLocationDetail("");
    setDate("");
    setReportType("lost");
    setFile(null);
    setUploadError("");
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10 }}
          style={{
            background: "#E2F9EB",
            color: "#01B574",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <CheckCircle size={48} />
        </motion.div>
        <h2 style={{ marginBottom: "12px" }}>{t("successMsg")}</h2>
        <p style={{ marginBottom: "30px", textAlign: "center" }}>
          {t("successDesc")}
        </p>
        <button className="btn btn-primary" onClick={resetForm}>
          {t("createAnother")}
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Navbar title={t("report")} />
        <div
          className="glass"
          style={{
            background: "white",
            padding: "40px",
            maxWidth: "720px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: "12px" }}>{t("signIn")}</h2>
          <p style={{ marginBottom: "24px", color: "var(--text-secondary)" }}>
            {t("reportLoginRequired")}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/login")}
          >
            {t("signIn")}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar title={t("report")} />

      <div
        className="glass"
        style={{
          background: "white",
          padding: "40px",
          maxWidth: "1000px",
          margin: "0 auto",
          boxShadow: "0px 18px 40px rgba(112, 144, 176, 0.12)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px" }}>{t("tellUs")}</h2>
          <p>{t("reportDesc")}</p>
        </div>

        {uploadError && (
          <div
            style={{
              background: "#FEE5E5",
              border: "1px solid #EE5D50",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "24px",
              color: "#EE5D50",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {uploadError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "30px",
              marginBottom: "30px",
            }}
          >
            <div className="form-group">
              <label>
                {t("itemName")} <span style={{ color: "#EE5D50" }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={t("itemNamePlaceholder")}
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>
                {t("description")} <span style={{ color: "#EE5D50" }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={t("descriptionPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>
                {t("category")} <span style={{ color: "#EE5D50" }}>*</span>
              </label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">{t("selectCategory")}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                {t("location")} <span style={{ color: "#EE5D50" }}>*</span>
              </label>
              <select
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              >
                <option value="">{t("selectLocation")}</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                {t("locationDetail")}{" "}
                <span style={{ color: "#EE5D50" }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={t("locationDetailPlaceholder")}
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>
                {t("date")} <span style={{ color: "#EE5D50" }}>*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label>
                {t("type")} <span style={{ color: "#EE5D50" }}>*</span>
              </label>
              <select
                className="form-input"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                required
              >
                <option value="lost">{t("lostSomething")}</option>
                <option value="found">{t("foundSomething")}</option>
              </select>
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
                background: "#F4F7FE",
                borderRadius: "20px",
                padding: "24px",
                border: "1px solid #E0E5F2",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "10px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: "16px",
                  color: "var(--ipb-blue)",
                  fontWeight: 700,
                }}
              >
                Reporter Info
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                }}
              >
                {user?.name} · {user?.email}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                }}
              >
                Your account is attached automatically when you submit this
                report.
              </p>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "40px" }}>
            <label>{t("uploadTitle")}</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="image/*,.pdf,.doc,.docx"
            />
            <div
              onClick={triggerFileInput}
              style={{
                border: "2px dashed #E0E5F2",
                borderRadius: "20px",
                padding: "40px",
                textAlign: "center",
                background: file ? "#E2F9EB" : "#F4F7FE",
                cursor: "pointer",
                transition: "var(--transition)",
                borderStyle: file ? "solid" : "dashed",
                borderColor: file ? "#01B574" : "#E0E5F2",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <Upload
                  size={32}
                  color={file ? "#01B574" : "var(--text-secondary)"}
                />
                <FileText
                  size={32}
                  color={file ? "#01B574" : "var(--text-secondary)"}
                />
              </div>
              <p
                style={{
                  fontWeight: "600",
                  color: file ? "#01B574" : "var(--text-primary)",
                }}
              >
                {file ? file.name : t("uploadTitle")}
              </p>
              <p style={{ fontSize: "12px" }}>{t("uploadLimit")}</p>
            </div>
            {uploadError && (
              <p
                style={{
                  marginTop: "12px",
                  color: "#EE5D50",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {uploadError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "18px",
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
            {submitting ? "Submitting..." : t("submitReport")}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default Report;
