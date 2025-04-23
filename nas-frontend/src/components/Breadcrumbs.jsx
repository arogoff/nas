import { useState, useRef, memo } from "react";
import { ChevronRight, Home } from "lucide-react";

const BreadcrumbItem = memo(function BreadcrumbItem({
  index,
  folder,
  isActive,
  isDragging,
  isHovered,
  onClick,
  onDragOver,
  onDragLeave,
  onDrop,
}) {
  const isHome = index === -1;

  return (
    <div className="flex items-center">
      {/* Only show separator after Home */}
      {index >= 0 && <ChevronRight size={14} className="mx-1 text-gray-400" />}

      <div
        className={`
          breadcrumb-item
          flex items-center px-2 py-1.5 rounded-md cursor-pointer transition-all duration-200
          ${isHovered && isDragging ? "bg-blue-100" : ""}
          ${isActive ? "bg-sky-100" : "bg-transparent"}
        `}
        data-index={index}
        id={isHome ? "breadcrumb-home" : `breadcrumb-${index}`}
        onClick={() => onClick(index)}
        onDragOver={(e) => onDragOver(e, index)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, index)}
      >
        {isHome && <Home size={16} className="mr-1" />}
        <span className={`${isActive ? "font-semibold" : "font-normal"}`}>
          {isHome ? "Home" : folder}
        </span>
      </div>
    </div>
  );
});

export default function Breadcrumbs({
  currentPath,
  handleBreadcrumbClick,
  isDragging,
  onBreadcrumbDrop,
  selectedItems = [],
  currentFolder = "/",
}) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [isOver, setIsOver] = useState(false);
  const containerRef = useRef(null);

  // Enhanced drag handling with more efficient event handling
  function handleDragOver(e, index) {
    e.preventDefault();
    e.stopPropagation();

    if (!isDragging) return;

    setHoverIndex(index);
    setIsOver(true);

    // Apply visual feedback
    e.currentTarget.style.transform = "scale(1.05)";
    e.currentTarget.style.boxShadow = "0 0 0 2px #3b82f6";

    // Ensure data-index is correctly set
    e.currentTarget.setAttribute("data-index", index);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();

    // Reset visual feedback
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "none";

    setHoverIndex(null);
    setIsOver(false);
  }

  function handleDrop(e, index) {
    e.preventDefault();
    e.stopPropagation();

    // Reset styles
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "none";

    // Call the parent handler with the specific index
    if (onBreadcrumbDrop) {
      onBreadcrumbDrop(index);
    }

    setHoverIndex(null);
    setIsOver(false);
  }

  // Determine container classes based on state
  const containerClasses = `
    breadcrumbs-container
    flex items-center text-sm p-3 rounded-lg overflow-x-auto
    ${
      isDragging
        ? "bg-sky-50 border-2 border-dashed"
        : "bg-gray-50 border border-solid"
    } 
    ${
      isDragging && isOver
        ? "border-blue-500"
        : isDragging
        ? "border-blue-300"
        : "border-gray-200"
    }
  `;

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      id="breadcrumb-container"
      data-droppable="true"
    >
      {/* Home breadcrumb */}
      <BreadcrumbItem
        index={-1}
        isActive={currentPath.length === 0}
        isDragging={isDragging}
        isHovered={hoverIndex === -1}
        onClick={handleBreadcrumbClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />

      {/* Path elements */}
      {currentPath.map((folder, index) => (
        <BreadcrumbItem
          key={index}
          index={index}
          folder={folder}
          isActive={index === currentPath.length - 1}
          isDragging={isDragging}
          isHovered={hoverIndex === index}
          onClick={handleBreadcrumbClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      ))}

      {/* Moving items indicator */}
      {isDragging && selectedItems.length > 0 && (
        <div className="ml-auto text-xs text-gray-600 bg-sky-100 px-2 py-1 rounded">
          Drop here to move {selectedItems.length} item
          {selectedItems.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
