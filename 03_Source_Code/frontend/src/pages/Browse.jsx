import React, { useState } from "react";
import Navbar from "../components/Navbar";
import ItemCard from "../components/ItemCard";
import { items, categories, locations } from "../data/mockData";
import { Filter, Search } from "lucide-react";
import { motion } from "framer-motion";

import { useSearch } from "../context/SearchContext";
import { useItems } from "../context/ItemsContext";

const Browse = () => {
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const { searchQuery, setSearchQuery } = useSearch();
  const { items: allItems, loading } = useItems();

  const filteredItems = allItems.filter((item) => {
    const matchesType = filter === "all" || item.type === filter;
    const matchesCategory = category === "all" || item.category === category;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const isNotReturned = item.status?.toLowerCase() === "not returned";
    return matchesType && matchesCategory && matchesSearch && isNotReturned;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar title="Browse Items" />

      {/* Filters Header */}
      <div
        className="glass"
        style={{
          padding: "24px",
          background: "white",
          marginBottom: "30px",
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => setFilter("all")}
            className={`btn ${filter === "all" ? "btn-primary" : ""}`}
            style={{
              padding: "10px 20px",
              background: filter !== "all" ? "#F4F7FE" : "",
              color: filter !== "all" ? "var(--text-secondary)" : "",
            }}
          >
            All Items
          </button>
          <button
            onClick={() => setFilter("lost")}
            className={`btn ${filter === "lost" ? "btn-primary" : ""}`}
            style={{
              padding: "10px 20px",
              background: filter !== "lost" ? "#F4F7FE" : "",
              color: filter !== "lost" ? "var(--text-secondary)" : "",
            }}
          >
            Lost
          </button>
          <button
            onClick={() => setFilter("found")}
            className={`btn ${filter === "found" ? "btn-primary" : ""}`}
            style={{
              padding: "10px 20px",
              background: filter !== "found" ? "#F4F7FE" : "",
              color: filter !== "found" ? "var(--text-secondary)" : "",
            }}
          >
            Found
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flex: 1,
            minWidth: "300px",
            justifyContent: "flex-end",
          }}
        >
          <select
            className="form-input"
            style={{ width: "auto", minWidth: "180px" }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#F4F7FE",
              padding: "0 16px",
              borderRadius: "16px",
              flex: 1,
              maxWidth: "300px",
            }}
          >
            <Search size={18} color="var(--text-secondary)" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                width: "100%",
                height: "45px",
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length > 0 ? (
        <div
          style={{
            columnCount:
              window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3,
            columnGap: "24px",
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{ breakInside: "avoid", marginBottom: "24px" }}
            >
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <div style={{ marginBottom: "20px", color: "var(--text-secondary)" }}>
            <Search size={64} style={{ opacity: 0.3 }} />
          </div>
          <h3>No items found</h3>
          <p>Try adjusting your filters or search keywords.</p>
        </div>
      )}
    </motion.div>
  );
};

export default Browse;
