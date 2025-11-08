import { useState } from "react";

interface PreviewPaneProps {
  previewUrl: string | null;
  isBuilding: boolean;
  error?: string;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  previewUrl,
  isBuilding,
  error,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-red-400">
        <div className="text-center max-w-lg p-6">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold mb-2">Build Error</h3>
          <p className="text-sm text-gray-400 whitespace-pre-wrap">{error}</p>
        </div>
      </div>
    );
  }

  if (isBuilding) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p>Building your project...</p>
        </div>
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">👁️</div>
          <p>Preview will appear here once your project is built</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Preview header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Preview</span>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Open in new tab ↗
          </a>
        </div>
        <button
          onClick={handleRefresh}
          className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 bg-white">
        <iframe
          key={isRefreshing ? Date.now() : previewUrl}
          src={previewUrl}
          className="w-full h-full border-0"
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        />
      </div>
    </div>
  );
};

