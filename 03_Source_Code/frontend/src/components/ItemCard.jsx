import React from "react";
import { MapPin, Calendar, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAssetFileName,
  isPreviewableImage,
  resolveAssetUrl,
} from "../lib/assetUrl";

const ItemCard = ({ item }) => {
  if (!item) return null;
  const imageUrl = resolveAssetUrl(item.image);
  const imageName = getAssetFileName(item.image);
  const canPreviewImage = isPreviewableImage(item.image);

  const getStatusLabel = (reportType) => {
    if (!reportType) return "Unknown";
    const normalized = reportType.toLowerCase();
    if (normalized === "lost") {
      return "LOST";
    }
    if (normalized === "found") {
      return "FOUND";
    }
    return reportType.toUpperCase();
  };

  // Handle both type as string and as enum object
  const getReportType = () => {
    if (!item.type) return null;

    // If it's already a string, return it
    if (typeof item.type === "string") {
      return item.type;
    }

    // If it's an object with value property (enum), get the value
    if (typeof item.type === "object" && item.type.value) {
      return item.type.value;
    }

    return null;
  };

  const reportType = getReportType();

  const getStatusClass = (report_type) => {
    if (!report_type) return "";
    switch (report_type.toLowerCase()) {
      case "lost":
        return "badge-lost";
      case "found":
        return "badge-found";
      case "not returned":
        return "badge-not-returned";
      case "returned":
        return "badge-returned";
      default:
        return "";
    }
  };

  return (
    <div
      className="glass card-shadow"
      style={{
        background: "white",
        overflow: "hidden",
        transition: "var(--transition)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {imageUrl && (
        <div
          style={{ position: "relative", height: "180px", overflow: "hidden" }}
        >
          {canPreviewImage ? (
            <img
              src={imageUrl}
              alt={item.title || "Item"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "6px",
                textDecoration: "none",
                background: "#F8FAFC",
                color: "var(--text-primary)",
                padding: "16px",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "13px" }}>
                Preview unavailable
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                }}
              >
                {imageName || "Open file"}
              </span>
            </a>
          )}
          <div style={{ position: "absolute", top: "12px", left: "12px" }}>
            <span className={`badge ${getStatusClass(reportType)}`}>
              {getStatusLabel(reportType)}
            </span>
          </div>
        </div>
      )}

      <div
        style={{
          padding: "20px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!imageUrl && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <span className={`badge ${getStatusClass(reportType)}`}>
              {getStatusLabel(reportType)}
            </span>
            <h3 style={{ margin: 0 }}>{item.title || "Untitled Item"}</h3>
          </div>
        )}
        {imageUrl && (
          <h3 style={{ marginBottom: "12px" }}>
            {item.title || "Untitled Item"}
          </h3>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "8px",
          }}
        >
          <Tag size={14} color="var(--ipb-blue)" />
          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "var(--ipb-blue)",
              textTransform: "uppercase",
            }}
          >
            {item.category || "General"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MapPin size={16} color="var(--text-secondary)" />
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              {item.location || "IPB Campus"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={16} color="var(--text-secondary)" />
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              {item.date || "Just now"}
            </span>
          </div>
        </div>

        <Link
          to={`/detail/${item.id}`}
          className="btn btn-primary"
          style={{ marginTop: "auto", width: "100%" }}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ItemCard;
