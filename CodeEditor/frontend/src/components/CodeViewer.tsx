import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { GeneratedFile } from "../types";

interface CodeViewerProps {
  file: GeneratedFile | null;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ file }) => {
  if (!file) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📝</div>
          <p>Select a file to view its contents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* File header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm font-mono">{file.path}</span>
        </div>
        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
          {file.language}
        </span>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language={file.language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.875rem",
          }}
          showLineNumbers
          wrapLines
        >
          {file.content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

