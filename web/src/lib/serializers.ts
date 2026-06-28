/**
 * Serialization helpers that convert Prisma records into the snake_case
 * shapes the existing React frontend expects (ported from DRF serializers).
 */
import type {
  User,
  Workflow,
  WorkflowExecution,
  Credential,
  ExportedWorkflow,
  UIBuilderProject,
} from "@prisma/client";

export function serializeUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email ?? "",
    first_name: user.firstName ?? "",
    last_name: user.lastName ?? "",
    date_joined: user.createdAt,
  };
}

export function serializeWorkflow(w: Workflow) {
  return {
    id: w.id,
    name: w.name,
    description: w.description,
    nodes: w.nodes,
    edges: w.edges,
    created_at: w.createdAt,
    updated_at: w.updatedAt,
    is_active: w.isActive,
  };
}

export function serializeExecution(e: WorkflowExecution) {
  return {
    id: e.id,
    workflow: e.workflowId,
    status: e.status,
    started_at: e.startedAt,
    finished_at: e.finishedAt,
    execution_order: e.executionOrder,
    node_states: e.nodeStates,
    errors: e.errors,
    trigger_data: e.triggerData,
  };
}

export function serializeCredential(c: Credential) {
  return {
    id: c.id,
    name: c.name,
    credential_type: c.credentialType,
    data: c.data,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

export function serializeExportedWorkflow(x: ExportedWorkflow) {
  return {
    id: x.id,
    user: x.userId,
    name: x.name,
    description: x.description,
    version: x.version,
    export_type: x.exportType,
    nodes: x.nodes,
    edges: x.edges,
    tags: x.tags,
    category: x.category,
    author: x.author,
    is_public: x.isPublic,
    is_featured: x.isFeatured,
    created_at: x.createdAt,
    updated_at: x.updatedAt,
    exported_at: x.exportedAt,
    download_count: x.downloadCount,
    import_count: x.importCount,
  };
}

export function serializeUIProject(p: UIBuilderProject) {
  return {
    id: p.id,
    project_name: p.projectName,
    description: p.description,
    components: p.components,
    styles: p.styles,
    assets: p.assets,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    is_active: p.isActive,
  };
}

/** DRF-style paginated list response */
export function paginated<T>(results: T[]) {
  return {
    count: results.length,
    next: null,
    previous: null,
    results,
  };
}
