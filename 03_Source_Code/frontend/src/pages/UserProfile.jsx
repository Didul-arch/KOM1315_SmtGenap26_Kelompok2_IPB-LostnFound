import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  ShieldCheck,
  BadgeInfo,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import { apiJson } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { resolveAssetUrl, isPreviewableImage as isPreviewableDocument } from "../lib/assetUrl";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "civitas", label: "Civitas" },
  { value: "umum", label: "User" },
];

const getDocumentFileName = (value) => {
  if (!value) {
    return "-";
  }

  const normalizedValue = value.split("?")[0].split("#")[0].replace(/\\/g, "/");
  const lastSegment = normalizedValue.split("/").filter(Boolean).pop();

  return decodeURIComponent(lastSegment || normalizedValue || value);
};

const getApiBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const getDocumentUrl = (value) => resolveAssetUrl(value);

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    fullname: "",
    phone_number: "",
    identity_number: "",
    role: "umum",
    is_active: true,
  });
  const [identityDocumentFile, setIdentityDocumentFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = user?.role === "Admin";
  const isSelfRoute = id === "me" || String(user?.id) === String(id);
  const canEditAll = isAdmin && !isSelfRoute;

  useEffect(() => {
    if (!token) return;

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const targetUrl = isSelfRoute ? "/users/me" : `/admin/users/${id}`;

        if (!isAdmin && !isSelfRoute) {
          setError("Kamu hanya bisa membuka halaman profil milikmu sendiri.");
          setProfile(null);
          return;
        }

        const response = await apiJson(targetUrl, { token });
        if (!response.ok || !response.data) {
          setError("Gagal memuat data user.");
          setProfile(null);
          return;
        }

        const data = response.data;
        setProfile(data);
        setForm({
          fullname: data.fullname || "",
          phone_number: data.phone_number || "",
          identity_number: data.identity_number || "",
          role: data.role || "umum",
          is_active: Boolean(data.is_active),
        });
        setIdentityDocumentFile(null);
      } catch (err) {
        console.error("Failed to load user profile:", err);
        setError("Gagal memuat data user.");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, isAdmin, isSelfRoute, token]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event) => {
    setIdentityDocumentFile(event.target.files?.[0] || null);
  };

  const getDocumentName = () => {
    if (identityDocumentFile) {
      return identityDocumentFile.name;
    }

    if (!profile?.identity_document) {
      return "-";
    }

    return getDocumentFileName(profile.identity_document);
  };

  const getDocumentPreviewSource = () => {
    return getDocumentUrl(profile?.identity_document || "");
  };

  const hasIdentityDocument = Boolean(
    identityDocumentFile || profile?.identity_document,
  );
  const needsIdentityHint =
    form.role === "civitas" &&
    !form.identity_number.trim() &&
    !hasIdentityDocument;

  const getErrorMessage = (responseData, fallback) => {
    if (typeof responseData === "string") {
      return responseData;
    }

    if (responseData?.detail) {
      if (typeof responseData.detail === "string") {
        return responseData.detail;
      }

      if (Array.isArray(responseData.detail)) {
        return responseData.detail
          .map((item) => item?.msg || item?.message || JSON.stringify(item))
          .join(", ");
      }
    }

    return fallback;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!form.fullname.trim()) {
        setError("Full name wajib diisi.");
        return;
      }

      if (needsIdentityHint) {
        setError("Isi identity number atau upload dokumen identitas.");
        return;
      }

      const isSelfUpdate = isSelfRoute;
      const payload = new FormData();
      payload.append("fullname", form.fullname || "");
      payload.append("phone_number", form.phone_number || "");
      payload.append("identity_number", form.identity_number || "");

      if (!isSelfUpdate) {
        payload.append("role", form.role);
        payload.append("is_active", form.is_active ? "true" : "false");
      }

      if (identityDocumentFile) {
        payload.append("identity_document_file", identityDocumentFile);
      } else if (profile?.identity_document) {
        payload.append("identity_document", profile.identity_document);
      }

      const endpoint = isSelfUpdate ? "/users/me" : `/users/${id}`;
      const response = await apiJson(endpoint, {
        method: "PATCH",
        token,
        body: payload,
      });

      if (!response.ok || !response.data) {
        setError(getErrorMessage(response.data, "Gagal menyimpan perubahan."));
        return;
      }

      setProfile(response.data);
      setSuccess("Perubahan berhasil disimpan.");

      if (!isSelfUpdate) {
        setForm((prev) => ({
          ...prev,
          role: response.data.role || prev.role,
          is_active: Boolean(response.data.is_active),
        }));
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", color: "#6b7280" }}>
        Loading profile...
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div style={{ padding: "40px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: "20px",
            background: "transparent",
            border: "none",
            color: "#0f172a",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "700",
          }}
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div
          style={{
            padding: "24px",
            background: "white",
            borderRadius: "18px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <p style={{ margin: 0, color: "#b91c1c", fontWeight: "700" }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ padding: "40px" }}
    >
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        <button
          onClick={() => navigate(isAdmin && !isSelfRoute ? "/users" : -1)}
          style={{
            marginBottom: "20px",
            background: "transparent",
            border: "none",
            color: "#0f172a",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "700",
          }}
        >
          <ArrowLeft size={18} />
          {isAdmin && !isSelfRoute ? "Back to User Management" : "Back"}
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "28px",
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "16px",
                    background: "#e0f2fe",
                    color: "#0369a1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User size={22} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: "28px", color: "#111827" }}>
                    {isSelfRoute ? "My Profile" : "User Profile"}
                  </h1>
                  <p style={{ margin: "4px 0 0", color: "#6b7280" }}>
                    Edit identity data here. Admin can also manage role and
                    active status.
                  </p>
                </div>
              </div>
            </div>

            {error ? (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "#fef2f2",
                  color: "#b91c1c",
                  fontWeight: "600",
                }}
              >
                {error}
              </div>
            ) : null}

            {success ? (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "#ecfdf5",
                  color: "#047857",
                  fontWeight: "600",
                }}
              >
                {success}
              </div>
            ) : null}

            <div style={{ display: "grid", gap: "18px" }}>
              <label style={{ display: "grid", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#374151",
                  }}
                >
                  Full Name
                </span>
                <input
                  value={form.fullname}
                  onChange={(event) =>
                    handleChange("fullname", event.target.value)
                  }
                  placeholder="Nama lengkap"
                  style={{
                    width: "100%",
                    border: "1px solid #dbe4ee",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    fontSize: "15px",
                    outline: "none",
                    background: "#fbfdff",
                  }}
                />
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  Full name harus diisi.
                </span>
              </label>

              <label style={{ display: "grid", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#374151",
                  }}
                >
                  Phone Number
                </span>
                <input
                  value={form.phone_number}
                  onChange={(event) =>
                    handleChange("phone_number", event.target.value)
                  }
                  placeholder="Nomor WhatsApp / Telepon"
                  style={{
                    width: "100%",
                    border: "1px solid #dbe4ee",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    fontSize: "15px",
                    outline: "none",
                    background: "#fbfdff",
                  }}
                />
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  Contoh: 0812xxxxxxxx atau +628xxxxxxxxxx
                </span>
              </label>

              <label style={{ display: "grid", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#374151",
                  }}
                >
                  Identity Number
                </span>
                <input
                  value={form.identity_number}
                  onChange={(event) =>
                    handleChange("identity_number", event.target.value)
                  }
                  placeholder="NIM / NIP / nomor identitas"
                  style={{
                    width: "100%",
                    border: "1px solid #dbe4ee",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    fontSize: "15px",
                    outline: "none",
                    background: "#fbfdff",
                  }}
                />
                {needsIdentityHint ? (
                  <span style={{ fontSize: "12px", color: "#b45309" }}>
                    Kalau role civitas, isi identity number atau upload dokumen.
                  </span>
                ) : (
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>
                    Opsional, tapi wajib ada salah satu untuk civitas.
                  </span>
                )}
              </label>

              <label style={{ display: "grid", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#374151",
                  }}
                >
                  Identity Document
                </span>
                {profile?.identity_document &&
                  isPreviewableDocument(profile.identity_document) ? (
                  <div
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "16px",
                      overflow: "hidden",
                      background: "#f8fafc",
                    }}
                  >
                    <img
                      src={getDocumentPreviewSource()}
                      alt="Identity document preview"
                      style={{
                        display: "block",
                        width: "100%",
                        maxHeight: "240px",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        padding: "10px 14px",
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      Current preview: {getDocumentName()}
                    </div>
                  </div>
                ) : null}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    background: "#fbfdff",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#111827",
                      }}
                    >
                      {identityDocumentFile
                        ? identityDocumentFile.name
                        : "Choose document"}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginTop: "4px",
                      }}
                    >
                      Current file: {getDocumentName()}
                    </div>
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#0f172a",
                      fontWeight: "700",
                    }}
                  >
                    <Upload size={16} />
                    Upload
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </label>
                {needsIdentityHint ? (
                  <span style={{ fontSize: "12px", color: "#b45309" }}>
                    Upload dokumen kalau identity number belum ada.
                  </span>
                ) : null}
              </label>

              {canEditAll ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <label style={{ display: "grid", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#374151",
                      }}
                    >
                      Role
                    </span>
                    <select
                      value={form.role}
                      onChange={(event) =>
                        handleChange("role", event.target.value)
                      }
                      style={{
                        width: "100%",
                        border: "1px solid #dbe4ee",
                        borderRadius: "14px",
                        padding: "14px 16px",
                        fontSize: "15px",
                        outline: "none",
                        background: "#fbfdff",
                      }}
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={{ display: "grid", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#374151",
                      }}
                    >
                      Active Status
                    </span>
                    <select
                      value={form.is_active ? "active" : "suspended"}
                      onChange={(event) =>
                        handleChange(
                          "is_active",
                          event.target.value === "active",
                        )
                      }
                      style={{
                        width: "100%",
                        border: "1px solid #dbe4ee",
                        borderRadius: "14px",
                        padding: "14px 16px",
                        fontSize: "15px",
                        outline: "none",
                        background: "#fbfdff",
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </label>
                </div>
              ) : null}
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: "#0f172a",
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  padding: "14px 18px",
                  minWidth: "160px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontWeight: "700",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>

          <aside style={{ display: "grid", gap: "16px" }}>
            <div
              style={{
                background: "white",
                borderRadius: "24px",
                padding: "22px",
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <BadgeInfo size={20} color="#0f172a" />
                <h3 style={{ margin: 0, color: "#111827" }}>Profile Summary</h3>
              </div>
              <div style={{ display: "grid", gap: "12px" }}>
                <Row
                  label="Email"
                  value={profile?.email || "-"}
                  icon={<Mail size={16} />}
                />
                <Row
                  label="Phone"
                  value={profile?.phone_number || "-"}
                  icon={<User size={16} />}
                />
                <Row
                  label="Role"
                  value={profile?.role || "-"}
                  icon={<ShieldCheck size={16} />}
                />
                <Row
                  label="Status"
                  value={profile?.is_active ? "Active" : "Suspended"}
                  icon={<BadgeInfo size={16} />}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
};

const Row = ({ label, value, icon }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      gap: "12px",
      padding: "12px 14px",
      borderRadius: "14px",
      background: "#f8fafc",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#6b7280",
        fontSize: "14px",
        fontWeight: "600",
      }}
    >
      {icon}
      {label}
    </div>
    <div
      style={{
        color: "#111827",
        fontSize: "14px",
        fontWeight: "700",
        textAlign: "right",
      }}
    >
      {value}
    </div>
  </div>
);

export default UserProfile;
