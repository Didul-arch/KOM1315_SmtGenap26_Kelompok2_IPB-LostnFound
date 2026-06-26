import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Clock, CheckCircle, ChevronRight, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { apiJson } from "../lib/api";

const History = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { language } = useLanguage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const getActivityLabel = (activity) => {
    const kind = activity.kind || "report";
    const requestType = activity.request_type || "";
    const reportType = activity.report_type || activity.type || "";

    if (kind === "request") {
      if (requestType === "claim") {
        return language === "en" ? "Claim Request" : "Permintaan Klaim";
      }

      if (requestType === "found") {
        return language === "en"
          ? "Found Item Request"
          : "Permintaan Barang Temuan";
      }

      return language === "en" ? "Request" : "Permintaan";
    }

    if (reportType === "lost") {
      return language === "en" ? "Reported Lost" : "Dilaporkan Hilang";
    }

    if (reportType === "found") {
      return language === "en" ? "Reported Found" : "Dilaporkan Ditemukan";
    }

    return language === "en" ? "Reported Item" : "Laporan Barang";
  };

  const getActivityStatus = (activity) => {
    const requestStatus = (activity.request_status || "").toLowerCase();
    const itemStatus = (activity.item_status || "").toLowerCase();
    const kind = activity.kind || "report";

    if (kind === "request") {
      if (requestStatus === "approved" && itemStatus === "returned") {
        return language === "en" ? "Returned" : "Sudah Diambil";
      }

      if (requestStatus === "approved") {
        return language === "en" ? "Approved" : "Disetujui";
      }

      if (requestStatus === "rejected") {
        return language === "en" ? "Rejected" : "Ditolak";
      }

      if (requestStatus === "pending") {
        return language === "en" ? "Pending" : "Menunggu";
      }

      return activity.request_status || (language === "en" ? "Active" : "Aktif");
    }

    if (itemStatus === "returned") {
      return language === "en" ? "Completed" : "Selesai";
    }

    return language === "en" ? "Active" : "Aktif";
  };

  const getActivityDate = (activity) => {
    const rawDate = activity.created_at || activity.date;
    if (!rawDate) return "-";

    const parsedDate = new Date(rawDate);
    if (Number.isNaN(parsedDate.getTime())) return rawDate;

    return parsedDate.toLocaleDateString(
      language === "en" ? "en-US" : "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  const getDetailPath = (activity) => {
    if (activity.kind === "request") {
      return `/detail-claim/${activity.claim_id || activity.id}`;
    }

    return `/detail/${activity.item_id || activity.id}`;
  };

  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      setLoading(true);

      try {
        if (user && token) {
          const response = await apiJson("/history/me", { token });
          const payload = response.ok ? response.data?.data || [] : [];

          if (!mounted) return;

          setHistory(Array.isArray(payload) ? payload : []);
          return;
        }

        if (!mounted) return;

        setHistory([]);
      } catch (error) {
        console.error("Failed to load history:", error);

        if (!mounted) return;

        if (user) {
          setHistory([]);
        } else {
          setHistory([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      mounted = false;
    };
  }, [user, token]);

  const titleText =
    language === "en" ? "My Activity History" : "Riwayat Aktivitas Saya";
  const headerText =
    language === "en" ? "Recent Activity" : "Aktivitas Terbaru";
  const descText =
    language === "en"
      ? "Track your reported items and claims."
      : "Pantau barang yang Anda laporkan dan klaim Anda.";
  const colItem = language === "en" ? "ITEM" : "BARANG";
  const colType = language === "en" ? "TYPE" : "JENIS";
  const colDate = language === "en" ? "DATE" : "TANGGAL";
  const colStatus = language === "en" ? "STATUS" : "STATUS";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar title={titleText} />

      <div
        className="glass"
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "30px",
          boxShadow: "0px 18px 40px rgba(112, 144, 176, 0.12)",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <h2>{headerText}</h2>
          <p>{descText}</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "var(--text-secondary)" }}>
              {language === "en" ? "Loading history..." : "Memuat riwayat..."}
            </p>
          </div>
        ) : history.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #E0E5F2",
                  }}
                >
                  <th
                    style={{
                      padding: "16px 20px",
                      color: "var(--text-secondary)",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    {colItem}
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      color: "var(--text-secondary)",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    {colType}
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      color: "var(--text-secondary)",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    {colDate}
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      color: "var(--text-secondary)",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    {colStatus}
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      color: "var(--text-secondary)",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  ></th>
                </tr>
              </thead>
              <tbody>
                {history.map((activity, index) => (
                  <tr
                    key={activity.id || index}
                    style={{
                      borderBottom:
                        index !== history.length - 1
                          ? "1px solid #F4F7FE"
                          : "none",
                    }}
                  >
                    <td style={{ padding: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontWeight: "700",
                              color: "var(--text-primary)",
                            }}
                          >
                            {activity.title}
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {activity.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "20px" }}>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color:
                            (activity.kind || "report") === "request"
                              ? "#0075FF"
                              : activity.report_type === "lost" ||
                                activity.type === "lost"
                                ? "#EE5D50"
                                : "#01B574",
                        }}
                      >
                        {getActivityLabel(activity)}
                      </span>
                    </td>
                    <td style={{ padding: "20px" }}>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "var(--text-primary)",
                          fontWeight: "600",
                        }}
                      >
                        {getActivityDate(activity)}
                      </p>
                    </td>
                    <td style={{ padding: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {[
                          "Completed",
                          "Selesai",
                          "Returned",
                          "Sudah Diambil",
                        ].includes(getActivityStatus(activity)) ? (
                          <CheckCircle size={18} color="#01B574" />
                        ) : (
                          <Clock size={18} color="var(--ipb-gold)" />
                        )}
                        <span style={{ fontWeight: "600", fontSize: "14px" }}>
                          {getActivityStatus(activity)}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "20px", textAlign: "left" }}>
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--text-primary)",
                        }}
                        onClick={() => navigate(getDetailPath(activity))}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <HelpCircle
              size={48}
              color="var(--text-secondary)"
              style={{ opacity: 0.5, marginBottom: "16px" }}
            />
            <h4 style={{ color: "var(--text-primary)", marginBottom: "8px" }}>
              {language === "en"
                ? "No activity history found"
                : "Tidak ada riwayat aktivitas"}
            </h4>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              {language === "en"
                ? "Start reporting lost or found items to populate your history!"
                : "Mulai laporkan barang hilang atau temuan untuk mengisi riwayat Anda!"}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default History;
