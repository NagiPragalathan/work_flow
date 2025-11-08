import { useState, useCallback } from "react";
import { ChatInterface } from "./components/ChatInterface";
import { FileTree } from "./components/FileTree";
import { CodeViewer } from "./components/CodeViewer";
import { PreviewPane } from "./components/PreviewPane";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { useWebSocket } from "./hooks/useWebSocket";
import { api } from "./services/api";
import { StageType } from "./types";
import type {
  Message,
  GeneratedFile,
  FileNode,
  ProjectPlan,
} from "./types";

function App() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState<StageType | null>(null);
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [buildError, setBuildError] = useState<string | undefined>();
  const [isBuilding, setIsBuilding] = useState(false);

  const handleWebSocketMessage = useCallback((message: any) => {
    console.log("WebSocket message:", message);

    setCurrentStage(message.stage);

    // Add message to chat
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: message.content,
        stage: message.stage,
        data: message.data,
      },
    ]);

    // Handle different stages
    switch (message.stage) {
      case StageType.IDEA:
        if (message.data) {
          // Idea generated
        }
        break;

      case StageType.PLANNING:
        if (message.data && message.data.file_structure) {
          setFileStructure(message.data.file_structure);
        }
        break;

      case StageType.CODING:
        if (message.data && message.data.file) {
          const file: GeneratedFile = message.data.file;
          setGeneratedFiles((prev) => {
            const existing = prev.find((f) => f.path === file.path);
            if (existing) {
              return prev.map((f) => (f.path === file.path ? file : f));
            }
            return [...prev, file];
          });
        }
        break;

      case StageType.BUILDING:
        setIsBuilding(true);
        setBuildError(undefined);
        break;

      case StageType.COMPLETE:
        setIsGenerating(false);
        setIsBuilding(false);
        if (message.data && message.data.preview_url) {
          setPreviewUrl(message.data.preview_url);
        }
        break;

      case StageType.ERROR:
        setIsGenerating(false);
        setIsBuilding(false);
        if (message.data && message.data.error) {
          setBuildError(message.data.error);
        }
        break;
    }
  }, []);

  const { connect, sendMessage, isConnected } = useWebSocket({
    projectId: projectId || "",
    onMessage: handleWebSocketMessage,
    onError: (error) => {
      console.error("WebSocket error:", error);
      setIsGenerating(false);
    },
    onClose: () => {
      console.log("WebSocket closed");
    },
  });

  const handleSendMessage = async (message: string) => {
    try {
      // Add user message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: message,
        },
      ]);

      setIsGenerating(true);

      // Create project
      const response = await api.createProject(message);
      setProjectId(response.project_id);

      // Connect WebSocket and send prompt
      // We need to wait a bit for the project to be created
      setTimeout(() => {
        // Create a new WebSocket connection for this project
        const wsUrl = api.getWebSocketUrl(response.project_id);
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          ws.send(JSON.stringify({ prompt: message }));
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsGenerating(false);
        };

        ws.onclose = () => {
          console.log("WebSocket closed");
        };
      }, 500);
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsGenerating(false);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to create project. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    }
  };

  const handleFileSelect = (file: FileNode) => {
    if (file.type === "file") {
      const generatedFile = generatedFiles.find((f) => f.path === file.path);
      if (generatedFile) {
        setSelectedFile(generatedFile);
      }
    }
  };

  const handleRegenerate = () => {
    // Reset state for regeneration
    setMessages([]);
    setIsGenerating(false);
    setCurrentStage(null);
    setFileStructure([]);
    setGeneratedFiles([]);
    setSelectedFile(null);
    setPreviewUrl(null);
    setBuildError(undefined);
    setProjectId(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold text-white">AI Code Editor</h1>
      </header>

      {/* Progress Indicator */}
      {currentStage && <ProgressIndicator currentStage={currentStage} />}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Chat + File Tree */}
        <div className="w-1/3 flex flex-col border-r border-gray-800">
          {/* Chat Interface */}
          <div className="flex-1 min-h-0">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
              onRegenerate={handleRegenerate}
            />
          </div>

          {/* File Tree */}
          {fileStructure.length > 0 && (
            <div className="h-1/3 border-t border-gray-800">
              <FileTree
                files={fileStructure}
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile?.path}
              />
            </div>
          )}
        </div>

        {/* Right Panel: Code Viewer + Preview */}
        <div className="flex-1 flex flex-col">
          {/* Code Viewer */}
          <div className="flex-1 border-b border-gray-800 min-h-0">
            <CodeViewer file={selectedFile} />
          </div>

          {/* Preview */}
          <div className="flex-1 min-h-0">
            <PreviewPane
              previewUrl={previewUrl}
              isBuilding={isBuilding}
              error={buildError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
