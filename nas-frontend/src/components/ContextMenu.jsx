import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Copy,
  Trash,
  Edit,
  Download,
  Info,
  Share,
  ArrowUpRight,
  Home,
  Folder,
} from "lucide-react";

const MenuItem = ({ icon, label, action, color, onClick, onMouseEnter }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-4 w-full p-3 text-left border-none bg-transparent cursor-pointer rounded hover:bg-gray-100 ${
      color === "danger" ? "text-red-500" : ""
    }`}
    onMouseEnter={onMouseEnter}
  >
    <div className="w-4 flex justify-center">{icon}</div>
    {label}
  </button>
);

export default function ContextMenu({
  x,
  y,
  onClose,
  item,
  currentPath,
  onMoveToLocation,
  allItems,
  setItems,
}) {
  const menuRef = useRef(null);
  const subMenuRef = useRef(null);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [subMenuPosition, setSubMenuPosition] = useState({ x: 0, y: 0 });

  // Calculate current folder path (memoized)
  const currentFolder = useMemo(
    () => (currentPath.length === 0 ? "/" : "/" + currentPath.join("/")),
    [currentPath]
  );

  // Generate menu and submenu options (memoized)
  const { menuItems, breadcrumbPaths, folderOptions, validDestinations } =
    useMemo(() => {
      // Menu items
      const menuItems = [
        { label: "Open", icon: <Info size={16} />, action: "open" },
        { label: "Rename", icon: <Edit size={16} />, action: "rename" },
        { label: "Copy", icon: <Copy size={16} />, action: "copy" },
        { label: "Download", icon: <Download size={16} />, action: "download" },
        { label: "Share", icon: <Share size={16} />, action: "share" },
        {
          label: "Move to location",
          icon: <ArrowUpRight size={16} />,
          action: "showLocations",
        },
        {
          label: "Delete",
          icon: <Trash size={16} />,
          action: "delete",
          color: "danger",
        },
      ];

      // Breadcrumb path options
      const breadcrumbPaths = [
        { type: "breadcrumb", index: -1, name: "Home", path: "/" },
        ...currentPath.map((folder, idx) => {
          const path = "/" + currentPath.slice(0, idx + 1).join("/");
          return { type: "breadcrumb", index: idx, name: folder, path };
        }),
      ];

      // Folder options
      const folderOptions = allItems
        ? allItems
            .filter(
              (folderItem) =>
                folderItem.type === "folder" &&
                folderItem.parent === currentFolder &&
                folderItem.id !== item.id
            )
            .map((folder) => ({
              type: "folder",
              name: folder.name,
              path:
                currentFolder === "/"
                  ? `/${folder.name}`
                  : `${currentFolder}/${folder.name}`,
              id: folder.id,
            }))
        : [];

      // Valid destinations
      const validDestinations = [
        ...breadcrumbPaths.filter((loc) => loc.path !== currentFolder),
        ...folderOptions,
      ];

      return { menuItems, breadcrumbPaths, folderOptions, validDestinations };
    }, [currentPath, currentFolder, allItems, item]);

  // Position main menu (adjust for viewport bounds)
  useEffect(() => {
    if (!menuRef.current) return;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate adjusted positions
    const adjustedX = Math.min(x, Math.max(0, viewportWidth - menuRect.width));
    const adjustedY = Math.min(
      y,
      Math.max(0, viewportHeight - menuRect.height)
    );

    menuRef.current.style.left = `${adjustedX}px`;
    menuRef.current.style.top = `${adjustedY}px`;
  }, [x, y]);

  // Position submenu (adjust for viewport bounds)
  useEffect(() => {
    if (!showSubMenu || !subMenuRef.current || !menuRef.current) return;

    const subMenuRect = subMenuRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = subMenuPosition.x;
    let adjustedY = subMenuPosition.y;

    // Right edge check
    if (subMenuPosition.x + subMenuRect.width > viewportWidth) {
      // Try positioning to the left of the main menu
      adjustedX = menuRect.left - subMenuRect.width - 5;

      // If still off-screen, position below the trigger
      if (adjustedX < 0) {
        adjustedX = Math.max(0, subMenuPosition.x - subMenuRect.width);
        adjustedY = subMenuPosition.y + 30;
      }
    }

    // Bottom edge check
    if (subMenuPosition.y + subMenuRect.height > viewportHeight) {
      adjustedY = Math.max(10, viewportHeight - subMenuRect.height - 10);
    }

    subMenuRef.current.style.left = `${adjustedX}px`;
    subMenuRef.current.style.top = `${adjustedY}px`;
  }, [showSubMenu, subMenuPosition]);

  // Handle click outside to close menus
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        (!subMenuRef.current || !subMenuRef.current.contains(event.target))
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Action handler with useCallback to prevent recreating on every render
  const handleAction = useCallback(
    (action, event) => {
      switch (action) {
        case "open":
          alert(`Opening ${item.name}`);
          break;
        case "rename":
          const newName = prompt("Enter new name:", item.name);
          if (newName) alert(`Renamed to ${newName}`);
          break;
        case "delete":
          if (confirm(`Are you sure you want to delete ${item.name}?`)) {
            alert(`Deleted ${item.name}`);
          }
          break;
        case "copy":
          alert(`Copied ${item.name} to clipboard`);
          break;
        case "download":
          alert(`Downloading ${item.name}`);
          break;
        case "info":
          alert(`Info for ${item.name}`);
          break;
        case "share":
          alert(`Sharing ${item.name}`);
          break;
        case "showLocations":
          if (event) {
            const rect = event.currentTarget.getBoundingClientRect();
            setSubMenuPosition({
              x: rect.right,
              y: rect.top,
            });
            setShowSubMenu(true);
            return; // Keep menu open
          }
          break;
        default:
          break;
      }

      // Close for all actions except showLocations
      if (action !== "showLocations") {
        onClose();
      }
    },
    [item, onClose]
  );

  // Location selection handler
  const handleLocationSelect = useCallback(
    (destination) => {
      if (onMoveToLocation) {
        if (destination.type === "breadcrumb") {
          onMoveToLocation(item, destination.index);
        } else if (destination.type === "folder") {
          if (confirm(`Move "${item.name}" to folder "${destination.name}"?`)) {
            setItems((prev) =>
              prev.map((i) =>
                i.id === item.id ? { ...i, parent: destination.path } : i
              )
            );
          }
        }
      }
      onClose();
    },
    [item, onMoveToLocation, setItems, onClose]
  );

  return (
    <>
      {/* Main Context Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 w-60 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
      >
        <div className="p-2">
          <div className="font-bold p-2 border-b border-gray-200">
            {item.name}
          </div>
          <div>
            {menuItems.map((menuItem) => (
              <MenuItem
                key={menuItem.action}
                icon={menuItem.icon}
                label={menuItem.label}
                action={menuItem.action}
                color={menuItem.color}
                onClick={(e) => handleAction(menuItem.action, e)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Locations Submenu */}
      {showSubMenu && (
        <div
          ref={subMenuRef}
          className="fixed z-50 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="p-2">
            <div className="font-bold p-2 border-b border-gray-200">
              Choose Location
            </div>

            {validDestinations.length === 0 ? (
              <div className="p-3 text-gray-500 text-sm text-center">
                No other locations available
              </div>
            ) : (
              <div>
                {/* Parent folders section */}
                {breadcrumbPaths.filter((loc) => loc.path !== currentFolder)
                  .length > 0 && (
                  <div className="px-3 py-2 text-gray-500 text-xs font-bold border-b border-gray-100">
                    Parent Folders
                  </div>
                )}

                {breadcrumbPaths
                  .filter((loc) => loc.path !== currentFolder)
                  .map((location) => (
                    <button
                      key={location.path}
                      onClick={() => handleLocationSelect(location)}
                      className="flex items-center gap-2 w-full p-3 text-left border-none hover:bg-gray-100 rounded cursor-pointer"
                      style={{
                        paddingLeft:
                          location.index === -1
                            ? "0.75rem"
                            : `${1.25 + location.index * 0.5}rem`,
                      }}
                      title={location.path}
                    >
                      {location.index === -1 ? <Home size={16} /> : null}
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {location.name}
                      </span>
                    </button>
                  ))}

                {/* Child folders section */}
                {folderOptions.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-gray-500 text-xs font-bold border-t border-b border-gray-100">
                      Folders
                    </div>

                    {folderOptions.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => handleLocationSelect(folder)}
                        className="flex items-center gap-2 w-full p-3 text-left border-none hover:bg-gray-100 rounded cursor-pointer"
                        title={folder.path}
                      >
                        <Folder size={16} className="text-indigo-500" />
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                          {folder.name}
                        </span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
