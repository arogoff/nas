import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import DashboardPage from "./DashboardPage";
import { File, Folder, Image } from "lucide-react";

export default function DashboardWrapper() {
  // Lift up state that needs to be shared
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [lastSelectedId, setLastSelectedId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);

  // Enhanced drag state for manual tracking
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [breadcrumbHovered, setBreadcrumbHovered] = useState(false);

  // Calculate current folder path - memoized to prevent unnecessary recalculations
  const currentFolder = useMemo(
    () => (currentPath.length === 0 ? "/" : "/" + currentPath.join("/")),
    [currentPath]
  );

  // Load initial data - moved from DashboardPage
  useEffect(() => {
    // Expanded dummy data to test filtering
    setItems([
      {
        id: "1",
        name: "Photos",
        type: "folder",
        parent: "/",
        dateModified: new Date("2025-04-15"),
      },
      {
        id: "2",
        name: "Work",
        type: "folder",
        parent: "/",
        dateModified: new Date("2025-04-10"),
      },
      {
        id: "3",
        name: "Resume.pdf",
        type: "file",
        parent: "/",
        dateModified: new Date("2025-04-20"),
        fileType: "pdf",
        size: 1024 * 1024 * 2, // 2MB
      },
      {
        id: "4",
        name: "Project.docx",
        type: "file",
        parent: "/",
        dateModified: new Date("2025-04-18"),
        fileType: "docx",
        size: 1024 * 1024 * 3.5, // 3.5MB
      },
      {
        id: "5",
        name: "Presentation.pptx",
        type: "file",
        parent: "/",
        dateModified: new Date("2025-03-25"),
        fileType: "pptx",
        size: 1024 * 1024 * 8.2, // 8.2MB
      },
      {
        id: "6",
        name: "Budget.xlsx",
        type: "file",
        parent: "/",
        dateModified: new Date("2025-04-01"),
        fileType: "xlsx",
        size: 1024 * 1024 * 1.1, // 1.1MB
      },
      {
        id: "7",
        name: "Logo.png",
        type: "image",
        parent: "/",
        dateModified: new Date("2025-04-05"),
        fileType: "png",
        size: 1024 * 512, // 512KB
      },
      {
        id: "8",
        name: "Notes",
        type: "folder",
        parent: "/",
        dateModified: new Date("2025-03-20"),
      },
    ]);
  }, []);

  // Global mouse move handler for manual breadcrumb detection
  useEffect(() => {
    if (!isDragging) return;

    function handleGlobalMouseMove(e) {
      // Update last position
      setLastPosition({ x: e.clientX, y: e.clientY });

      // Check for elements under cursor (for breadcrumb detection)
      const elementsUnderCursor = document.elementsFromPoint(
        e.clientX,
        e.clientY
      );
      const isBreadcrumbUnder = elementsUnderCursor.some(
        (el) =>
          el.classList?.contains("breadcrumb-item") ||
          el.id === "breadcrumb-container" ||
          el.id?.startsWith("breadcrumb-")
      );

      setBreadcrumbHovered(isBreadcrumbUnder);
    }

    // Add global listeners
    window.addEventListener("mousemove", handleGlobalMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isDragging]);

  // Enhanced sensors configuration for better drag detection - memoized to prevent recreation
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    })
  );

  // Memoized function to find item by id
  const findItemById = useCallback(
    (id) => items.find((item) => item.id === id),
    [items]
  );

  // Breadcrumb drop handler - memoized to prevent recreation on every render
  const handleBreadcrumbDropWrapper = useCallback(
    (index) => {
      if (selectedIds.length === 0) {
        console.log("No items selected for move");
        return;
      }

      // Determine target folder path based on breadcrumb index
      // Fixed: Use proper path construction for the specific breadcrumb level
      let targetFolder;
      if (index === -1) {
        // Home (root) folder
        targetFolder = "/";
      } else {
        // Specific path in breadcrumb up to the clicked index
        targetFolder = "/" + currentPath.slice(0, index + 1).join("/");
      }

      // Don't move if target is current folder
      if (targetFolder === currentFolder) {
        console.log(
          "Target folder is the same as current folder, no move needed"
        );
        return;
      }

      console.log(`Moving items to: ${targetFolder}`);

      const itemsToMove = selectedIds;
      if (itemsToMove.length > 0) {
        const itemNames = itemsToMove
          .map((id) => {
            const item = findItemById(id);
            return item?.name || "";
          })
          .join(", ");

        const targetName = index === -1 ? "Home" : currentPath[index];

        if (
          window.confirm(
            `Move ${
              itemsToMove.length > 1
                ? `${itemsToMove.length} items`
                : `"${itemNames}"`
            } to ${targetName}?`
          )
        ) {
          // Perform the actual move operation
          setItems((prev) =>
            prev.map((item) =>
              itemsToMove.includes(item.id)
                ? { ...item, parent: targetFolder }
                : item
            )
          );

          // Clear selection after moving
          setSelectedIds([]);
          setLastSelectedId(null);
        }
      }
    },
    [selectedIds, currentPath, currentFolder, findItemById]
  );

  // Drag handlers - memoized to prevent recreation on every render
  const handleDragStart = useCallback(
    (event) => {
      const itemId = event.active.id;
      console.log("Drag started with ID:", itemId);

      // Select the item being dragged if not already selected
      if (!selectedIds.includes(itemId)) {
        setSelectedIds([itemId]);
        setLastSelectedId(itemId);
      }

      // Set drag state
      setIsDragging(true);
      setDraggedId(itemId);
      setActiveId(itemId); // Store the active drag ID

      // Find the dragged item to display in overlay
      const dragged = findItemById(itemId);
      setDraggedItem(dragged);

      // Store initial position
      setLastPosition({ x: event.clientX || 0, y: event.clientY || 0 });

      // Set up global document event listeners
      document.body.style.cursor = "grabbing";
    },
    [selectedIds, findItemById]
  );

  const handleDragOver = useCallback(
    (event) => {
      const { over } = event;

      // Only set drop target if it's a folder and not part of the dragged items
      if (over) {
        // Special handling for breadcrumbs
        if (String(over.id).includes("breadcrumb")) {
          console.log("Hovering over breadcrumb:", over.id);
          return;
        }

        const overItem = findItemById(over.id);
        if (
          overItem &&
          overItem.type === "folder" &&
          !selectedIds.includes(over.id)
        ) {
          setDropTargetId(over.id);
        } else {
          setDropTargetId(null);
        }
      } else {
        setDropTargetId(null);
      }
    },
    [findItemById, selectedIds]
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { over, active } = event;

      // Reset document styles
      document.body.style.cursor = "";

      // Reset drag states
      setIsDragging(false);
      setActiveId(null);
      setDraggedId(null);
      setDraggedItem(null);
      setDropTargetId(null);

      // Check if we were over a breadcrumb element during release
      if (breadcrumbHovered) {
        // Find which breadcrumb we're over
        const elementsAtPoint = document.elementsFromPoint(
          lastPosition.x,
          lastPosition.y
        );

        // Look for breadcrumb elements in the elements under cursor
        for (const element of elementsAtPoint) {
          if (
            element.classList?.contains("breadcrumb-item") ||
            element.hasAttribute("data-index")
          ) {
            // Find the index - check for data-index attribute
            const dataIndex = element.getAttribute("data-index");
            const index = dataIndex !== null ? parseInt(dataIndex, 10) : null;

            // Home breadcrumb special case
            if (element.id === "breadcrumb-home" || index === -1) {
              handleBreadcrumbDropWrapper(-1);
              return;
            }

            // Normal path breadcrumb - fixed: use the exact index specified
            if (!isNaN(index)) {
              handleBreadcrumbDropWrapper(index);
              return;
            }
          }
        }

        // If we couldn't find a specific breadcrumb but were in the container,
        // default to home breadcrumb
        if (elementsAtPoint.some((el) => el.id === "breadcrumb-container")) {
          handleBreadcrumbDropWrapper(-1);
          return;
        }
      }

      // No drop target
      if (!over) {
        return;
      }

      // Process the drop based on the target
      const overId = String(over.id);

      // Check if we're dropping on a breadcrumb element
      if (overId === "breadcrumb-container" || overId === "breadcrumb-home") {
        handleBreadcrumbDropWrapper(-1);
        return;
      }

      // Check for specific breadcrumb index
      const breadcrumbMatch = overId.match(/^breadcrumb-(\d+)$/);
      if (breadcrumbMatch) {
        const index = parseInt(breadcrumbMatch[1], 10);
        handleBreadcrumbDropWrapper(index);
        return;
      }

      // Handle drops on folders in the content area
      const targetFolder = findItemById(over.id);
      if (targetFolder && targetFolder.type === "folder") {
        // Get path to target folder
        const targetPath =
          targetFolder.parent === "/"
            ? `/${targetFolder.name}`
            : `${targetFolder.parent}/${targetFolder.name}`;

        // Get items to move (selected items)
        const itemsToMove = selectedIds;

        if (itemsToMove.length > 0) {
          const itemNames = itemsToMove
            .map((id) => findItemById(id)?.name || "")
            .join(", ");

          if (
            window.confirm(
              `Move ${
                itemsToMove.length > 1
                  ? `${itemsToMove.length} items`
                  : `"${itemNames}"`
              } into "${targetFolder.name}" folder?`
            )
          ) {
            setItems((prev) =>
              prev.map((item) =>
                itemsToMove.includes(item.id)
                  ? { ...item, parent: targetPath }
                  : item
              )
            );
            // Clear selection after moving
            setSelectedIds([]);
            setLastSelectedId(null);
          }
        }
      }
    },
    [
      breadcrumbHovered,
      lastPosition,
      handleBreadcrumbDropWrapper,
      findItemById,
      selectedIds,
    ]
  );

  const handleDragCancel = useCallback(() => {
    // Reset document styles
    document.body.style.cursor = "";

    // Reset drag state
    setIsDragging(false);
    setDraggedId(null);
    setDraggedItem(null);
    setDropTargetId(null);
    setBreadcrumbHovered(false);
  }, []);

  // Memoize the overlay content to prevent recreation on every render
  const dragOverlayContent = useMemo(() => {
    if (!isDragging || !draggedItem) return null;

    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "0.5rem",
          padding: "0.75rem",
          boxShadow:
            "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: "2px solid #3b82f6",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          opacity: 0.9,
          pointerEvents: "none",
          width: "180px",
          cursor: "grabbing",
        }}
      >
        {/* Icon */}
        <div
          style={{
            color:
              selectedIds.length > 1
                ? "#3b82f6"
                : draggedItem.type === "folder"
                ? "#6366f1"
                : draggedItem.type === "image"
                ? "#ec4899"
                : "#10b981",
          }}
        >
          {selectedIds.length > 1 ? (
            <File size={20} />
          ) : draggedItem.type === "folder" ? (
            <Folder size={20} />
          ) : draggedItem.type === "image" ? (
            <Image size={20} />
          ) : (
            <File size={20} />
          )}
        </div>

        {/* Name */}
        <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>
          {selectedIds.length > 1
            ? `${selectedIds.length} items`
            : draggedItem.name}
        </div>
      </div>
    );
  }, [isDragging, draggedItem, selectedIds]);

  const dashboardPageProps = useMemo(
    () => ({
      items,
      setItems,
      selectedIds,
      setSelectedIds,
      lastSelectedId,
      setLastSelectedId,
      isDragging,
      draggedId,
      draggedItem,
      dropTargetId,
      activeId,
      currentPath,
      setCurrentPath,
      currentFolder,
      handleBreadcrumbDropWrapper,
    }),
    [
      items,
      selectedIds,
      lastSelectedId,
      isDragging,
      draggedId,
      draggedItem,
      dropTargetId,
      activeId,
      currentPath,
      currentFolder,
      handleBreadcrumbDropWrapper,
    ]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <DashboardPage {...dashboardPageProps} />

      {/* Drag Overlay - Shows what's being dragged */}
      <DragOverlay adjustScale={true}>{dragOverlayContent}</DragOverlay>
    </DndContext>
  );
}
