import { useState } from "react";
import type { FileNode } from "../types";

interface FileTreeProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  selectedFile?: string;
}

const FileTreeNode: React.FC<{
  node: FileNode;
  onSelect: (file: FileNode) => void;
  selectedPath?: string;
  depth: number;
}> = ({ node, onSelect, selectedPath, depth }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = selectedPath === node.path;

  const getIcon = () => {
    if (node.type === "directory") {
      return isExpanded ? "📂" : "📁";
    }
    
    const ext = node.name.split(".").pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      js: "📜",
      jsx: "⚛️",
      ts: "📘",
      tsx: "⚛️",
      json: "📋",
      html: "🌐",
      css: "🎨",
      md: "📝",
    };
    
    return iconMap[ext || ""] || "📄";
  };

  const handleClick = () => {
    if (node.type === "directory") {
      setIsExpanded(!isExpanded);
    } else {
      onSelect(node);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-800 rounded transition-colors ${
          isSelected ? "bg-gray-800" : ""
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <span className="text-sm">{getIcon()}</span>
        <span className="text-sm text-gray-300 truncate">{node.name}</span>
      </div>
      {node.type === "directory" && isExpanded && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileTreeNode
              key={index}
              node={child}
              onSelect={onSelect}
              selectedPath={selectedPath}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  onFileSelect,
  selectedFile,
}) => {
  return (
    <div className="bg-gray-900 border-r border-gray-800 overflow-y-auto">
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-300">Files</h3>
      </div>
      <div className="p-2">
        {files.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No files yet
          </div>
        ) : (
          files.map((file, index) => (
            <FileTreeNode
              key={index}
              node={file}
              onSelect={onFileSelect}
              selectedPath={selectedFile}
              depth={0}
            />
          ))
        )}
      </div>
    </div>
  );
};

