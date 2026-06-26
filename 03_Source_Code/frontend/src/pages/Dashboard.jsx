import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import ItemCard from "../components/ItemCard";
import {
  Search,
  AlertCircle,
  CheckCircle,
  Package,
  ShieldCheck,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useItems } from "../context/ItemsContext";
import { apiJson } from "../lib/api";
import { resolveAssetUrl } from "../lib/assetUrl";
import ClaimReviewModal from "../components/ClaimReviewModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const { items } = useItems();
  const [claims, setClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState(["pending"]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedClaimer, setSelectedClaimer] = useState(null);
  const [loadingClaimer, setLoadingClaimer] = useState(false);

  const isAdmin = user?.role === "Admin";

  const userName = user?.name
    ? user.name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "User";

  const itemById = useMemo(() => {
    return new Map(items.map((item) => [item.id, item]));
  }, [items]);

  const recentItems = items.slice(0, 3);
  const userReports = user
    ? items.filter((item) => item.reporterId === user.id)
    : [];

  const pendingClaims = claims.filter((claim) => claim.status === "pending");
  const approvedClaims = claims.filter((claim) => claim.status === "approved");
  const rejectedClaims = claims.filter((claim) => claim.status === "rejected");

  const filteredClaims = claims.filter((claim) =>
    selectedStatuses.includes(claim.status),
  );

  const fetchClaims = async () => {
    if (!token) return;
    setClaimsLoading(true);
    try {
      const res = await apiJson("/claims/?limit=100", { token });
      if (res.ok && res.data?.data) {
        setClaims(res.data.data);
      } else {
        setClaims([]);
      }
    } catch (error) {
      console.error("Failed to fetch claims:", error);
      setClaims([]);
    } finally {
      setClaimsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchClaims();
    }
  }, [isAdmin, token]);

  const reviewClaim = async (claimId, status) => {
    if (!token) return;
    setReviewingId(claimId);
    try {
      const res = await apiJson(`/claims/${claimId}/review`, {
        method: "PATCH",
        body: { status },
        token,
      });
      if (res.ok) {
        if (selectedClaim?.id === claimId) {
          setSelectedClaim(null);
          setSelectedClaimer(null);
        }
        await fetchClaims();
      } else {
        console.error("Failed to review claim:", res);
      }
    } catch (error) {
      console.error("Failed to review claim:", error);
    } finally {
      setReviewingId(null);
    }
  };

  const openClaimReviewModal = async (claim) => {
    setSelectedClaim(claim);
    setSelectedClaimer(null);
    setLoadingClaimer(true);

    try {
      const res = await apiJson(`/admin/users/${claim.claimer_id}`, { token });
      if (res.ok && res.data) {
        setSelectedClaimer(res.data);
      } else {
        console.error("Failed to fetch claimer info:", res);
      }
    } catch (error) {
      console.error("Failed to fetch claimer info:", error);
    } finally {
      setLoadingClaimer(false);
    }
  };

  const getClaimImageUrl = (proofImage) => {
    return resolveAssetUrl(proofImage);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar title={isAdmin ? "Admin Dashboard" : t("dashboard")} />

      {!user ? (
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
            {t("Login Required")}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/login")}
          >
            {t("signIn")}
          </button>
        </div>
      ) : isAdmin ? (
        <>
          <div
            className="glass card-shadow"
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "30px",
              display: "flex",
              alignItems: "center",
              gap: "30px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "24px",
                background: "var(--ipb-gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ipb-blue)",
              }}
            >
              <AlertCircle size={40} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
                {t("welcomeBack")}, {userName}! 👋
              </h1>
              <p>{pendingClaims.length} pending claims require your review.</p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
              marginBottom: "40px",
            }}
          >
            <StatCard
              label="Total Reports"
              value={items.length.toString()}
              icon={<Package size={24} />}
            />
            <StatCard
              label="Pending Claims"
              value={pendingClaims.length.toString()}
              icon={<ShieldCheck size={24} />}
              color="#0075FF"
            />
            <StatCard
              label="Approved Claims"
              value={approvedClaims.length.toString()}
              icon={<CheckCircle size={24} />}
              color="#01B574"
            />
            <StatCard
              label="Rejected Claims"
              value={rejectedClaims.length.toString()}
              icon={<XCircle size={24} />}
              color="#EE5D50"
            />
          </div>

          <div
            className="glass card-shadow"
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "24px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ margin: 0 }}>Claims Queue</h2>

              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    style={{
                      background: "#F4F7FE",
                      border: "1px solid #E0E5F2",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                    }}
                  >
                    Status{" "}
                    {selectedStatuses.length > 0 &&
                      `(${selectedStatuses.length})`}
                    <ChevronDown size={16} />
                  </button>

                  {statusDropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        marginTop: "8px",
                        background: "white",
                        border: "1px solid #E0E5F2",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        zIndex: 100,
                        minWidth: "200px",
                      }}
                    >
                      {["pending", "approved", "rejected"].map((status) => (
                        <label
                          key={status}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "12px 16px",
                            cursor: "pointer",
                            borderBottom: "1px solid #F4F7FE",
                            fontSize: "14px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedStatuses.includes(status)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStatuses([
                                  ...selectedStatuses,
                                  status,
                                ]);
                              } else {
                                setSelectedStatuses(
                                  selectedStatuses.filter((s) => s !== status),
                                );
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          />
                          <span style={{ textTransform: "capitalize" }}>
                            {status}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="btn"
                  onClick={fetchClaims}
                  disabled={claimsLoading}
                >
                  {claimsLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            {claimsLoading ? (
              <p style={{ color: "var(--text-secondary)" }}>
                Loading claims...
              </p>
            ) : filteredClaims.length === 0 ? (
              <p style={{ color: "var(--text-secondary)" }}>No claims found.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "16px",
                  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                }}
              >
                {filteredClaims.map((claim) => {
                  const relatedItem = itemById.get(claim.item_id);
                  const imageUrl = getClaimImageUrl(claim.proof_image);
                  return (
                    <div
                      key={claim.id}
                      style={{
                        border: "1px solid #E0E5F2",
                        borderRadius: "18px",
                        padding: "18px",
                        background: "#FDFEFF",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "450px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "16px",
                          marginBottom: "12px",
                        }}
                      >
                        <div>
                          <h3 style={{ margin: 0, marginBottom: "6px" }}>
                            {relatedItem?.title || `Item #${claim.item_id}`}
                          </h3>
                          <p
                            style={{
                              margin: 0,
                              color: "var(--text-secondary)",
                              fontSize: "13px",
                            }}
                          >
                            Claim by user #{claim.claimer_id} · Status:{" "}
                            {claim.status}
                          </p>
                        </div>
                        <span
                          className="badge"
                          style={{
                            alignSelf: "start",
                            backgroundColor:
                              claim.status === "rejected"
                                ? "#EE5D50"
                                : claim.status === "pending"
                                  ? "#FDB022"
                                  : "#01B574",
                            color: "white",
                          }}
                        >
                          {claim.status.toUpperCase()}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: "0 0 12px 0",
                          color: "var(--text-primary)",
                          flex: "0 0 auto",
                        }}
                      >
                        {claim.proof_text}
                      </p>

                      {imageUrl && (
                        <a
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "block",
                            marginBottom: "12px",
                            flex: "1 1 auto",
                            minHeight: "200px",
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt="claim proof"
                            style={{
                              width: "100%",
                              height: "200px",
                              borderRadius: "14px",
                              border: "1px solid #E0E5F2",
                              objectFit: "cover",
                            }}
                          />
                        </a>
                      )}

                      {claim.status === "pending" && (
                        <div style={{ marginTop: "16px" }}>
                          <button
                            className="btn btn-primary"
                            style={{ width: "100%", justifyContent: "center" }}
                            onClick={() => openClaimReviewModal(claim)}
                          >
                            Review Detail
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div
            className="glass card-shadow"
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "30px",
              display: "flex",
              alignItems: "center",
              gap: "30px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "24px",
                background: "var(--ipb-blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <CheckCircle size={40} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
                {t("Welcome")}, {userName}! 👋
              </h1>
              <p>
                {t("activeReportsMsg", { count: userReports.length, notif: 0 })}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
              marginBottom: "40px",
            }}
          >
            <StatCard
              label={t("yourReports")}
              value={userReports.length.toString()}
              icon={<Package size={24} />}
            />
            <StatCard
              label={t("foundItems")}
              value={userReports
                .filter((item) => item.type === "found")
                .length.toString()}
              icon={<Search size={24} />}
              color="#EE5D50"
            />
            <StatCard
              label={t("Claimed Item")}
              value={approvedClaims.length.toString()}
              icon={<CheckCircle size={24} />}
              color="#01B574"
            />
            <StatCard
              label={t("Pending Verification")}
              value={pendingClaims.length.toString()}
              icon={<AlertCircle size={24} />}
              color="#EE5D50"
            />
          </div>
        </>
      )}

      <div style={{ marginBottom: "40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2>Recently Reported</h2>
          <button
            style={{
              background: "transparent",
              border: "none",
              color: "var(--ipb-blue)",
              fontWeight: "700",
              cursor: "pointer",
            }}
            onClick={() => navigate("/browse")}
          >
            See all
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      <ClaimReviewModal
        claim={selectedClaim}
        item={selectedClaim ? itemById.get(selectedClaim.item_id) : null}
        claimer={selectedClaimer}
        loadingClaimer={loadingClaimer}
        onClose={() => setSelectedClaim(null)}
        onReview={reviewClaim}
        reviewingId={reviewingId}
      />
    </motion.div>
  );
};

export default Dashboard;
