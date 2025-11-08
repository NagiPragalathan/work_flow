export enum ProjectType {
  REACT_VITE = "react-vite",
  NEXTJS = "nextjs",
  HTML_CSS = "html-css"
}

export enum StageType {
  IDEA = "idea",
  PLANNING = "planning",
  CODING = "coding",
  BUILDING = "building",
  COMPLETE = "complete",
  ERROR = "error"
}

export interface ProjectSpec {
  tech_stack: ProjectType;
  features: string[];
  ui_requirements: string;
  data_flow: string;
  description: string;
}

export interface FileNode {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: FileNode[];
}

export interface ProjectPlan {
  file_structure: FileNode[];
  todos: string[];
  dependencies: Record<string, string>;
  project_type: ProjectType;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface WebSocketMessage {
  stage: StageType;
  content: string;
  data?: any;
}

export interface ProjectStatus {
  project_id: string;
  stage: StageType;
  spec?: ProjectSpec;
  plan?: ProjectPlan;
  files: GeneratedFile[];
  preview_url?: string;
  error?: string;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  stage?: StageType;
  data?: any;
}
