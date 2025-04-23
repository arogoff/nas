import { useState, useRef, useEffect, useCallback, memo } from "react";
import {
  Search,
  SortAsc,
  Grid,
  List,
  FolderPlus,
  Upload,
  ChevronDown,
  Filter,
  X,
} from "lucide-react";

const Dropdown = memo(({ show, children, onClose }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 0.25rem)",
        left: 0,
        backgroundColor: "white",
        borderRadius: "0.375rem",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        zIndex: 50,
        minWidth: "180px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
      }}
    >
      {children}
    </div>
  );
});

function FilterBar({
  searchTerm,
  setSearchTerm,
  sortOption,
  setSortOption,
  viewMode,
  setViewMode,
  filters,
  setFilters,
  handleCreateFolder,
  handleFileUpload,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const dropdownRef = useRef(null);
  const filterMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Memoize the click handler to prevent unnecessary recreations
  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
    if (
      filterMenuRef.current &&
      !filterMenuRef.current.contains(event.target)
    ) {
      setShowFilterMenu(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // Memoize filter change handler
  const handleFilterChange = useCallback(
    (key, value) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setFilters]
  );

  const clearFilters = useCallback(() => {
    setFilters({
      type: "all",
      dateRange: "any",
    });
  }, [setFilters]);

  const hasActiveFilters =
    filters.type !== "all" || filters.dateRange !== "any";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
        padding: "0.75rem",
        backgroundColor: "#f9fafb",
        borderRadius: "0.5rem",
      }}
    >
      {/* Left Side: Search + Actions Dropdown + Filters */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
          flex: "1 1 auto",
        }}
      >
        {/* Actions Dropdown */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontWeight: 500,
              height: "40px",
            }}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            Actions
            <ChevronDown size={16} />
          </button>

          <Dropdown show={showDropdown}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1rem",
                width: "100%",
                textAlign: "left",
                borderBottom: "1px solid #e5e7eb",
                backgroundColor: "white",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
              onClick={() => {
                handleCreateFolder();
                setShowDropdown(false);
              }}
            >
              <FolderPlus size={16} style={{ color: "#3b82f6" }} />
              New Folder
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1rem",
                width: "100%",
                textAlign: "left",
                backgroundColor: "white",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
              onClick={() => {
                handleFileUpload();
                setShowDropdown(false);
              }}
            >
              <Upload size={16} style={{ color: "#10b981" }} />
              Upload Files
            </button>
          </Dropdown>
        </div>

        {/* Enhanced Search Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "white",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #e5e7eb",
            minWidth: "250px",
            flex: "1 1 auto",
            height: "40px",
          }}
        >
          <Search
            size={16}
            style={{ color: "#6b7280", marginRight: "0.5rem", flexShrink: 0 }}
          />
          <input
            ref={searchInputRef}
            placeholder="Search files and folders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              flex: 1,
              fontSize: "0.875rem",
              width: "100%",
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "0.25rem",
              }}
            >
              <X size={14} style={{ color: "#6b7280" }} />
            </button>
          )}
        </div>

        {/* Filter Button and Dropdown */}
        <div style={{ position: "relative" }} ref={filterMenuRef}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              backgroundColor: hasActiveFilters ? "#8b5cf6" : "white",
              color: hasActiveFilters ? "white" : "#374151",
              border: "1px solid",
              borderColor: hasActiveFilters ? "#8b5cf6" : "#e5e7eb",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontWeight: 500,
              height: "40px",
            }}
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Filter size={16} />
            {hasActiveFilters ? "Filters Applied" : "Filter"}
          </button>

          <Dropdown show={showFilterMenu}>
            <div style={{ padding: "1rem", width: "240px" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: "0.5rem",
                  }}
                >
                  File Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #e5e7eb",
                    fontSize: "0.875rem",
                    backgroundColor: "white",
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="folder">Folders Only</option>
                  <option value="file">Files Only</option>
                  <option value="document">Documents</option>
                  <option value="image">Images</option>
                </select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: "0.5rem",
                  }}
                >
                  Date Modified
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    handleFilterChange("dateRange", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #e5e7eb",
                    fontSize: "0.875rem",
                    backgroundColor: "white",
                  }}
                >
                  <option value="any">Any Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "1rem",
                }}
              >
                <button
                  onClick={clearFilters}
                  style={{
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.375rem",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  Reset
                </button>

                <button
                  onClick={() => setShowFilterMenu(false)}
                  style={{
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "0.375rem",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </Dropdown>
        </div>

        {/* Sort Dropdown */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "white",
            padding: "0 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #e5e7eb",
            height: "40px",
          }}
        >
          <SortAsc size={16} style={{ color: "#6b7280" }} />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              fontSize: "0.875rem",
              background: "transparent",
              height: "100%",
              cursor: "pointer",
              minWidth: "100px",
            }}
          >
            <option value="name">Name</option>
            <option value="modified">Date Modified</option>
            <option value="size">Size</option>
            <option value="type">Type</option>
          </select>
        </div>
      </div>

      {/* Right Side: View Mode */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "white",
          borderRadius: "0.5rem",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          height: "40px",
        }}
      >
        <button
          onClick={() => setViewMode("grid")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "100%",
            border: "none",
            background: viewMode === "grid" ? "#e0f2fe" : "transparent",
            cursor: "pointer",
          }}
          title="Grid View"
        >
          <Grid
            size={16}
            style={{ color: viewMode === "grid" ? "#3b82f6" : "#6b7280" }}
          />
        </button>
        <button
          onClick={() => setViewMode("list")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "100%",
            border: "none",
            background: viewMode === "list" ? "#e0f2fe" : "transparent",
            cursor: "pointer",
          }}
          title="List View"
        >
          <List
            size={16}
            style={{ color: viewMode === "list" ? "#3b82f6" : "#6b7280" }}
          />
        </button>
      </div>
    </div>
  );
}

export default memo(FilterBar);
