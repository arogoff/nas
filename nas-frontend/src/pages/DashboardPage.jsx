import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "../components/SortableItem";
import FilterBar from "../components/FilterBar";
import Breadcrumbs from "../components/Breadcrumbs";
import {
  Check,
  Trash2,
  Copy,
  Download,
  Share2,
  CheckSquare,
} from "lucide-react";

const styles = {
  container: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    height: "100%",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    flexGrow: 1,
  },
  selectionBar: {
    padding: "0.75rem",
    backgroundColor: "#e0f2fe",
    borderRadius: "0.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedCount: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  actionsContainer: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  actionButton: {
    display: "flex",
    alignItems: "center",
    padding: "0.375rem",
    backgroundColor: "white",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    cursor: "pointer",
  },
  deleteButton: {
    display: "flex",
    alignItems: "center",
    padding: "0.375rem",
    backgroundColor: "white",
    color: "#ef4444",
    border: "1px solid #fca5a5",
    borderRadius: "0.375rem",
    cursor: "pointer",
  },
  divider: {
    width: "1px",
    height: "24px",
    backgroundColor: "#bfdbfe",
  },
  textButton: {
    padding: "0.375rem 0.5rem",
    backgroundColor: "white",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  instructionBar: {
    padding: "0.75rem",
    backgroundColor: "#f3f4f6",
    borderRadius: "0.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    color: "#4b5563",
  },
  emptyState: {
    padding: "1rem",
    backgroundColor: "#f3f4f6",
    borderRadius: "0.5rem",
    textAlign: "center",
    color: "#6b7280",
  },
  itemsContainer: (viewMode) => ({
    display: viewMode === "grid" ? "grid" : "flex",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "0.75rem",
    gridAutoRows: "min-content",
    flexDirection: viewMode === "list" ? "column" : "unset",
    minHeight: "300px",
    padding: "0.5rem",
    backgroundColor: "#f9fafb",
    borderRadius: "0.5rem",
    flexGrow: 1,
    position: "relative",
  }),
  selectionModeButton: (selectionMode) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 0.75rem",
    backgroundColor: selectionMode ? "#3b82f6" : "#e0f2fe",
    color: selectionMode ? "white" : "#1d4ed8",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
  }),
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "1rem",
  },
};

export default function DashboardPage({
  items,
  setItems,
  selectedIds,
  setSelectedIds,
  lastSelectedId,
  setLastSelectedId,
  isDragging,
  dropTargetId,
  currentPath,
  setCurrentPath,
  currentFolder,
  handleBreadcrumbDropWrapper,
}) {
  // Local state variables
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [selectionMode, setSelectionMode] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    dateRange: "any",
  });

  const actionMenuRef = useRef(null);
  const containerRef = useRef(null);

  // Memoized filtered items to prevent recalculation on every render
  const filteredItems = useMemo(() => {
    let visibleItems = items.filter((item) => item.parent === currentFolder);

    // Type filtering
    if (filters.type !== "all") {
      if (filters.type === "folder") {
        visibleItems = visibleItems.filter((item) => item.type === "folder");
      } else if (filters.type === "file") {
        visibleItems = visibleItems.filter((item) => item.type === "file");
      } else if (filters.type === "document") {
        visibleItems = visibleItems.filter(
          (item) =>
            item.fileType === "pdf" ||
            item.fileType === "docx" ||
            item.fileType === "txt"
        );
      } else if (filters.type === "image") {
        visibleItems = visibleItems.filter(
          (item) =>
            item.fileType === "png" ||
            item.fileType === "jpg" ||
            item.fileType === "jpeg" ||
            item.fileType === "gif"
        );
      }
    }

    // Date filtering
    if (filters.dateRange !== "any") {
      const today = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      const oneWeek = 7 * oneDay;
      const oneMonth = 30 * oneDay;

      visibleItems = visibleItems.filter((item) => {
        const itemDate = item.dateModified;
        if (filters.dateRange === "today") {
          return today - itemDate < oneDay;
        } else if (filters.dateRange === "week") {
          return today - itemDate < oneWeek;
        } else if (filters.dateRange === "month") {
          return today - itemDate < oneMonth;
        }
        return true;
      });
    }

    // Search term filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      visibleItems = visibleItems.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.fileType?.toLowerCase().includes(term)
      );
    }

    // Sort by selected option
    return [...visibleItems].sort((a, b) => {
      // Always put folders first
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;

      // Then sort by selected option
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortOption === "modified") {
        return b.dateModified - a.dateModified;
      }
      return 0;
    });
  }, [items, currentFolder, filters, searchTerm, sortOption]);

  // ===== Memoized Event Handlers =====

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setLastSelectedId(null);
  }, [setSelectedIds, setLastSelectedId]);

  const handleSelect = useCallback(
    (itemId, multiSelect) => {
      if (selectionMode || multiSelect) {
        // Toggle selection for Ctrl/Cmd clicks
        setSelectedIds((prev) =>
          prev.includes(itemId)
            ? prev.filter((id) => id !== itemId)
            : [...prev, itemId]
        );
        setLastSelectedId(itemId);
      } else {
        // Normal click - select only this item
        setSelectedIds([itemId]);
        setLastSelectedId(itemId);
      }
    },
    [selectionMode, setSelectedIds, setLastSelectedId]
  );

  const handleShiftSelect = useCallback(
    (itemId) => {
      if (lastSelectedId) {
        const allItemIds = filteredItems.map((item) => item.id);
        const startIdx = allItemIds.indexOf(lastSelectedId);
        const endIdx = allItemIds.indexOf(itemId);

        if (startIdx > -1 && endIdx > -1) {
          const start = Math.min(startIdx, endIdx);
          const end = Math.max(startIdx, endIdx);

          const rangeIds = allItemIds.slice(start, end + 1);
          setSelectedIds(rangeIds);
        }
      } else {
        setSelectedIds([itemId]);
        setLastSelectedId(itemId);
      }
    },
    [lastSelectedId, filteredItems, setSelectedIds, setLastSelectedId]
  );

  const handleDoubleClick = useCallback(
    (item) => {
      if (item.type === "folder") {
        setCurrentPath((prev) => [...prev, item.name]);
        clearSelection();
        setSelectionMode(false);
      } else {
        alert(`Opening file: ${item.name}`);
      }
    },
    [setCurrentPath, clearSelection, setSelectionMode]
  );

  const handleBreadcrumbClick = useCallback(
    (index) => {
      setCurrentPath((prev) => prev.slice(0, index + 1));
      clearSelection();
      setSelectionMode(false);
    },
    [setCurrentPath, clearSelection, setSelectionMode]
  );

  const handleMoveItems = useCallback(
    (targetFolder, itemsToMove, confirmMsg) => {
      if (window.confirm(confirmMsg)) {
        setItems((prev) =>
          prev.map((i) =>
            itemsToMove.includes(i.id) ? { ...i, parent: targetFolder } : i
          )
        );
        clearSelection();
      }
    },
    [setItems, clearSelection]
  );

  const handleMoveToParent = useCallback(
    (item) => {
      if (currentPath.length === 0) return; // Already at root

      // Calculate the parent path
      let parentPath = "/";
      if (currentPath.length > 1) {
        parentPath =
          "/" + currentPath.slice(0, currentPath.length - 1).join("/");
      }

      // Handle single item or multiple items
      const itemsToMove = selectedIds.includes(item.id)
        ? selectedIds
        : [item.id];

      if (itemsToMove.length > 0) {
        const confirmMsg =
          itemsToMove.length > 1
            ? `Move ${itemsToMove.length} items to parent folder?`
            : `Move "${item.name}" to parent folder?`;

        handleMoveItems(parentPath, itemsToMove, confirmMsg);
      }
    },
    [currentPath, selectedIds, handleMoveItems]
  );

  const handleMoveToLocation = useCallback(
    (item, locationIndex) => {
      // Determine target folder path
      let targetFolder = "/";
      if (locationIndex >= 0) {
        // If moving to a specific folder in the path
        targetFolder = "/" + currentPath.slice(0, locationIndex + 1).join("/");
      }

      // Don't move if target is current folder
      if (targetFolder === currentFolder) return;

      // Handle single item or multiple items
      const itemsToMove = selectedIds.includes(item.id)
        ? selectedIds
        : [item.id];

      if (itemsToMove.length > 0) {
        const targetName =
          locationIndex === -1 ? "Home" : currentPath[locationIndex];

        const confirmMsg =
          itemsToMove.length > 1
            ? `Move ${itemsToMove.length} items to ${targetName}?`
            : `Move "${item.name}" to ${targetName}?`;

        handleMoveItems(targetFolder, itemsToMove, confirmMsg);
      }
    },
    [currentPath, currentFolder, selectedIds, handleMoveItems]
  );

  const handleBulkAction = useCallback(
    (action) => {
      if (selectedIds.length === 0) return;

      const selectedNames = selectedIds
        .map((id) => items.find((item) => item.id === id)?.name || "")
        .join(", ");

      switch (action) {
        case "delete":
          if (
            window.confirm(
              `Delete ${
                selectedIds.length > 1 ? "selected items" : `"${selectedNames}"`
              }?`
            )
          ) {
            setItems((prev) =>
              prev.filter((item) => !selectedIds.includes(item.id))
            );
            clearSelection();
          }
          break;
        case "copy":
          alert(`Copied ${selectedIds.length} item(s) to clipboard`);
          break;
        case "download":
          alert(`Downloading ${selectedIds.length} item(s)`);
          break;
        case "share":
          alert(`Sharing ${selectedIds.length} item(s)`);
          break;
        default:
          break;
      }
    },
    [selectedIds, items, setItems, clearSelection]
  );

  const selectAll = useCallback(() => {
    const allIds = filteredItems.map((item) => item.id);
    setSelectedIds(allIds);
  }, [filteredItems, setSelectedIds]);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => {
      if (prev) {
        // If turning off selection mode, clear selections
        clearSelection();
      }
      return !prev;
    });
  }, [clearSelection]);

  const handleCreateFolder = useCallback(() => {
    const folderName = prompt("New folder name:");
    if (!folderName) return;

    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: folderName,
        type: "folder",
        parent: currentFolder,
        dateModified: new Date(),
      },
    ]);
    setShowCreateMenu(false);
  }, [currentFolder, setItems]);

  const handleFileUpload = useCallback(() => {
    // Create a file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;

    // Handle file selection
    fileInput.onchange = (e) => {
      const files = e.target.files;
      if (!files.length) return;

      // Add each selected file to our items state
      const newItems = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.name.match(/\.(jpg|jpeg|png|gif|bmp)$/i) ? "image" : "file",
        fileType: file.name.split(".").pop(),
        parent: currentFolder,
        size: file.size,
        dateModified: new Date(),
      }));

      setItems((prev) => [...prev, ...newItems]);
    };

    // Trigger the file dialog
    fileInput.click();
    setShowCreateMenu(false);
  }, [currentFolder, setItems]);

  // ===== Effects =====

  // Click handler for deselect when clicking empty space
  useEffect(() => {
    if (selectedIds.length === 0) return;

    function handleBackgroundClick(event) {
      if (
        (event.target === containerRef.current ||
          event.target.parentElement === containerRef.current) &&
        !event.target.closest(".sortable-item")
      ) {
        clearSelection();
      }
    }

    document.addEventListener("mousedown", handleBackgroundClick);
    return () => {
      document.removeEventListener("mousedown", handleBackgroundClick);
    };
  }, [selectedIds.length, clearSelection]);

  // Click outside handler for action menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target)
      ) {
        setShowCreateMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Enhanced Breadcrumb Drop Target Registration
  useEffect(() => {
    if (!isDragging) return;

    // Function to find all breadcrumb elements and register them
    const setupDropTargets = () => {
      // Register the container
      const breadcrumbContainer = document.querySelector(
        ".breadcrumbs-container"
      );
      if (breadcrumbContainer) {
        breadcrumbContainer.setAttribute("data-droppable", "true");
        breadcrumbContainer.id = "breadcrumb-container";
      }

      // Register each breadcrumb
      const breadcrumbItems = document.querySelectorAll(".breadcrumb-item");
      breadcrumbItems.forEach((item) => {
        const index = item.getAttribute("data-index");
        item.setAttribute("data-droppable", "true");

        if (index === "-1") {
          item.id = "breadcrumb-home";
        } else {
          item.id = `breadcrumb-${index}`;
        }
      });
    };

    // Run immediately and after a short delay to ensure DOM is ready
    setupDropTargets();
    const timer = setTimeout(setupDropTargets, 100);

    return () => clearTimeout(timer);
  }, [isDragging, currentPath]);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Enhanced Filter Bar with New Create Dropdown */}
        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOption={sortOption}
          setSortOption={setSortOption}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filters={filters}
          setFilters={setFilters}
          handleCreateFolder={handleCreateFolder}
          handleFileUpload={handleFileUpload}
          actionMenuRef={actionMenuRef}
        />

        {/* Breadcrumbs */}
        <Breadcrumbs
          currentPath={currentPath}
          handleBreadcrumbClick={handleBreadcrumbClick}
          isDragging={isDragging}
          onBreadcrumbDrop={handleBreadcrumbDropWrapper}
          selectedItems={selectedIds.map((id) =>
            items.find((item) => item.id === id)
          )}
          currentFolder={currentFolder}
        />

        {/* Selected Items Bar */}
        <div style={{ position: "relative" }}>
          {selectedIds.length > 0 && (
            <div style={styles.selectionBar}>
              {/* Left - Selected Count */}
              <div style={styles.selectedCount}>
                <Check size={16} color="#3b82f6" />
                <span>
                  <strong>{selectedIds.length}</strong> item
                  {selectedIds.length !== 1 ? "s" : ""} selected
                </span>
              </div>

              {/* Right - Actions on Selected */}
              <div style={styles.actionsContainer}>
                {/* Primary Actions */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    style={styles.actionButton}
                    onClick={() => handleBulkAction("copy")}
                    title="Copy"
                  >
                    <Copy size={16} />
                  </button>

                  <button
                    style={styles.actionButton}
                    onClick={() => handleBulkAction("download")}
                    title="Download"
                  >
                    <Download size={16} />
                  </button>

                  <button
                    style={styles.actionButton}
                    onClick={() => handleBulkAction("share")}
                    title="Share"
                  >
                    <Share2 size={16} />
                  </button>

                  <button
                    style={styles.deleteButton}
                    onClick={() => handleBulkAction("delete")}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Divider */}
                <div style={styles.divider} />

                {/* Selection Actions */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {selectionMode && (
                    <button style={styles.textButton} onClick={selectAll}>
                      Select All
                    </button>
                  )}

                  <button style={styles.textButton} onClick={clearSelection}>
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selection Mode Instruction */}
        {selectionMode && selectedIds.length === 0 && (
          <div style={styles.instructionBar}>
            <CheckSquare size={16} />
            Click on items to select them, use Shift+click for range selection,
            or use the "Select All" button
          </div>
        )}

        {/* Status Bar - When No Items Found */}
        {filteredItems.length === 0 && (
          <div style={styles.emptyState}>
            {searchTerm || filters.type !== "all" || filters.dateRange !== "any"
              ? "No items match your search or filters"
              : "This folder is empty"}
          </div>
        )}

        {/* File Items with Enhanced DnD */}
        <SortableContext
          items={filteredItems.map((i) => i.id)}
          strategy={
            viewMode === "grid"
              ? rectSortingStrategy
              : verticalListSortingStrategy
          }
        >
          <div
            ref={containerRef}
            style={styles.itemsContainer(viewMode)}
            onClick={(e) => {
              if (e.target === containerRef.current) {
                clearSelection();
              }
            }}
          >
            {filteredItems.map((item) => (
              <div className="sortable-item" key={item.id}>
                <SortableItem
                  item={{ ...item, viewMode }}
                  onOpen={handleDoubleClick}
                  onSelect={handleSelect}
                  onShiftSelect={handleShiftSelect}
                  selected={selectedIds.includes(item.id)}
                  isDragging={isDragging && selectedIds.includes(item.id)}
                  selectionMode={selectionMode}
                  isDropTarget={item.id === dropTargetId}
                  dragOverlay={false}
                  currentPath={currentPath}
                  onMoveToParent={handleMoveToParent}
                  onMoveToLocation={handleMoveToLocation}
                  allItems={items}
                  setItems={setItems}
                />
              </div>
            ))}
          </div>
        </SortableContext>

        {/* Toggle Selection Mode Button */}
        <div style={styles.buttonContainer}>
          <button
            style={styles.selectionModeButton(selectionMode)}
            onClick={toggleSelectionMode}
          >
            <CheckSquare size={16} />
            {selectionMode ? "Exit Selection Mode" : "Enter Selection Mode"}
          </button>
        </div>
      </div>
    </div>
  );
}
