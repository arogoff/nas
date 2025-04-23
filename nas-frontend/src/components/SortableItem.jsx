import { useState, useCallback, useMemo, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreVertical, Check, Folder, FileText, Image } from "lucide-react";
import ContextMenu from "./ContextMenu";

const SelectionIndicator = memo(({ selected, isGrid }) => {
  if (!selected) return null;

  const style = isGrid
    ? {
        position: "absolute",
        top: "0.5rem",
        left: "0.5rem",
        width: "1.25rem",
        height: "1.25rem",
        backgroundColor: "#3b82f6",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        zIndex: 15,
      }
    : {
        width: "1.25rem",
        height: "1.25rem",
        backgroundColor: "#3b82f6",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        marginRight: "0.5rem",
      };

  return (
    <div style={style}>
      <Check size={14} />
    </div>
  );
});

const ItemIcon = memo(({ type }) => {
  const color =
    type === "folder" ? "#6366f1" : type === "image" ? "#ec4899" : "#10b981";

  const icon =
    type === "folder" ? (
      <Folder size={24} />
    ) : type === "image" ? (
      <Image size={24} />
    ) : (
      <FileText size={24} />
    );

  return <div style={{ color }}>{icon}</div>;
});

function SortableItem({
  item,
  onOpen,
  onSelect,
  onShiftSelect,
  selected,
  isDragging,
  selectionMode,
  isDropTarget,
  dragOverlay,
  currentPath,
  onMoveToParent,
  onMoveToLocation,
  allItems,
  setItems,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isDraggingThis,
  } = useSortable({
    id: item.id,
    data: { item },
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Memoize computed values
  const isListView = item.viewMode === "list";

  // Format file size - memoized
  const formattedSize = useMemo(() => {
    if (!item.size) return "—";

    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(item.size) / Math.log(1024));
    return `${(item.size / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }, [item.size]);

  // Format date - memoized
  const formattedDate = useMemo(() => {
    if (!item.dateModified) return "—";
    return new Date(item.dateModified).toLocaleDateString();
  }, [item.dateModified]);

  // Memoize style object to prevent recreations
  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      backgroundColor: isDropTarget
        ? "#dbeafe"
        : selected
        ? "#e0f2fe"
        : isHovered
        ? "#f9fafb"
        : "white",
      opacity: isDragging || isDraggingThis ? 0.5 : 1,
      border: isDropTarget
        ? "2px dashed #3b82f6"
        : selected
        ? "2px solid #3b82f6"
        : "1px solid #e5e7eb",
      zIndex: dragOverlay ? 999 : "auto",
      boxShadow: isDropTarget
        ? "0 0 5px rgba(59, 130, 246, 0.5)"
        : dragOverlay
        ? "0 5px 10px rgba(0,0,0,0.15)"
        : "none",
    }),
    [
      transform,
      transition,
      isDropTarget,
      selected,
      isHovered,
      isDragging,
      isDraggingThis,
      dragOverlay,
    ]
  );

  // Memoize event handlers
  const handleDotsClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setAnchorPoint({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  }, []);

  const handleItemClick = useCallback(
    (e) => {
      e.stopPropagation();

      // Handle shift+click for range selection
      if (e.shiftKey) {
        onShiftSelect(item.id);
        return;
      }

      // Handle ctrl/cmd+click for multi-selection
      if (selectionMode || e.ctrlKey || e.metaKey) {
        onSelect(item.id, true);
        return;
      }

      // Handle regular click
      onSelect(item.id, false);
    },
    [item.id, onSelect, onShiftSelect, selectionMode]
  );

  const handleDoubleClick = useCallback(
    (e) => {
      if (selectionMode) return;
      e.stopPropagation();
      onOpen(item);
    },
    [item, onOpen, selectionMode]
  );

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleCloseMenu = useCallback(() => setMenuOpen(false), []);

  // Grid view UI - Memoized
  const GridItem = useCallback(
    () => (
      <div
        style={{
          ...style,
          borderRadius: "0.5rem",
          padding: "0.75rem",
          height: "80px", // Reduced height
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          cursor: selectionMode
            ? "pointer"
            : item.type === "folder"
            ? "pointer"
            : "default",
        }}
      >
        <SelectionIndicator selected={selected} isGrid={true} />

        {/* Top action bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            position: "absolute",
            top: "0.5rem",
            right: "0.5rem",
            zIndex: 20,
          }}
        >
          <button
            onClick={handleDotsClick}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem",
              borderRadius: "0.25rem",
              backgroundColor: isHovered ? "#f3f4f6" : "transparent",
            }}
          >
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Main content - Horizontal layout with icon on left */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginTop: "0.25rem",
            paddingLeft: selected ? "1.5rem" : "0.25rem",
          }}
        >
          {/* Icon */}
          <div style={{ flexShrink: 0 }}>
            <ItemIcon type={item.type} />
          </div>

          {/* Name */}
          <div
            style={{
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              width: "calc(100% - 40px)",
              fontSize: "0.875rem",
            }}
          >
            {item.name}
          </div>
        </div>

        {/* File info (size and date) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#6b7280",
            fontSize: "0.75rem",
            marginTop: "0.5rem",
            paddingLeft: selected ? "1.5rem" : "0.25rem",
          }}
        >
          <div>{item.type !== "folder" ? formattedSize : "Folder"}</div>
          <div>{formattedDate}</div>
        </div>
      </div>
    ),
    [
      style,
      selected,
      item,
      isHovered,
      formattedSize,
      formattedDate,
      handleDotsClick,
    ]
  );

  // List view UI - Memoized
  const ListItem = useCallback(
    () => (
      <div
        style={{
          ...style,
          borderRadius: "0.5rem",
          padding: "0.5rem 0.75rem",
          position: "relative",
          display: "flex",
          alignItems: "center",
          cursor: selectionMode
            ? "pointer"
            : item.type === "folder"
            ? "pointer"
            : "default",
          height: "48px",
        }}
      >
        <SelectionIndicator selected={selected} isGrid={false} />

        {!selected && <div style={{ width: "1.75rem" }} />}

        {/* Icon */}
        <div style={{ marginRight: "0.75rem" }}>
          <ItemIcon type={item.type} />
        </div>

        {/* Name - flex grow to take available space */}
        <div
          style={{
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "0.875rem",
            flex: "1 1 auto",
          }}
        >
          {item.name}
        </div>

        {/* Size - fixed width column */}
        <div
          style={{
            width: "100px",
            fontSize: "0.875rem",
            color: "#6b7280",
            textAlign: "right",
          }}
        >
          {formattedSize}
        </div>

        {/* Modified date - fixed width column */}
        <div
          style={{
            width: "120px",
            fontSize: "0.875rem",
            color: "#6b7280",
            paddingRight: "1.5rem",
            textAlign: "right",
          }}
        >
          {formattedDate}
        </div>

        {/* Actions menu */}
        <button
          onClick={handleDotsClick}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.25rem",
            borderRadius: "0.25rem",
            position: "absolute",
            right: "0.5rem",
          }}
        >
          <MoreVertical size={18} style={{ color: "#6b7280" }} />
        </button>
      </div>
    ),
    [
      style,
      selected,
      item.name,
      item.type,
      formattedSize,
      formattedDate,
      selectionMode,
      handleDotsClick,
    ]
  );

  return (
    <div
      ref={setNodeRef}
      onClick={handleItemClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...attributes}
      style={{
        position: "relative",
      }}
    >
      {isListView ? <ListItem /> : <GridItem />}

      {menuOpen && (
        <ContextMenu
          x={anchorPoint.x}
          y={anchorPoint.y}
          onClose={handleCloseMenu}
          item={item}
          currentPath={currentPath || []}
          onMoveToParent={onMoveToParent}
          onMoveToLocation={onMoveToLocation}
          allItems={allItems}
          setItems={setItems}
        />
      )}

      {/* Drag handle overlay - invisible but captures drag events */}
      <div
        {...listeners}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          cursor: selected ? "grab" : "default",
          zIndex: 5,
          opacity: 0 /* Make it invisible but still functional */,
          pointerEvents: selected ? "auto" : "none", // Only enable drag when selected
        }}
      />
    </div>
  );
}

export default memo(SortableItem);
