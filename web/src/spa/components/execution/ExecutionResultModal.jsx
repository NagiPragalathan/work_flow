import { useState } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle, FiClock, FiCode, FiChevronDown, FiChevronRight, FiCopy, FiZap, FiHash, FiActivity } from 'react-icons/fi';
import './ExecutionResultModal.css';

// Pretty-print a value: parse JSON strings, stringify objects.
const pretty = (v) => {
  if (v == null) return '';
  if (typeof v === 'string') {
    const t = v.trim();
    if ((t.startsWith('{') || t.startsWith('[')) ) {
      try { return JSON.stringify(JSON.parse(t), null, 2); } catch { /* not json */ }
    }
    return v;
  }
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
};

// Turn a value into flat key/value rows when it is (or wraps) a plain object.
const toRows = (value) => {
  let obj = value;
  if (typeof value === 'string') {
    try { obj = JSON.parse(value); } catch { return null; }
  }
  if (obj && typeof obj === 'object' && obj.main && typeof obj.main === 'object') obj = obj.main;
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
  const rows = Object.entries(obj).filter(([, v]) => typeof v !== 'object');
  return rows.length ? rows : null;
};

const CopyBtn = ({ text }) => {
  const [done, setDone] = useState(false);
  return (
    <button
      className="erm-copy"
      title="Copy"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
    >
      {done ? <FiCheckCircle /> : <FiCopy />} {done ? 'Copied' : 'Copy'}
    </button>
  );
};

const ExecutionResultModal = ({ isOpen, onClose, result, nodes = [] }) => {
  const [expandedNodes, setExpandedNodes] = useState({});

  if (!isOpen || !result) return null;

  const { execution, execution_id } = result;
  const nodeMeta = {};
  for (const n of nodes) nodeMeta[n.id] = { label: n.data?.label || n.id, type: n.data?.type || n.type };

  const toggleNode = (nodeId) =>
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));

  const formatDuration = (duration) => {
    if (!duration) return '0ms';
    const durationMs = duration < 100 ? duration * 1000 : duration;
    if (durationMs < 1000) return `${Math.round(durationMs)}ms`;
    if (durationMs < 60000) return `${(durationMs / 1000).toFixed(1)}s`;
    return `${Math.round(durationMs / 1000)}s`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <FiCheckCircle className="status-icon success" />;
      case 'error': return <FiAlertCircle className="status-icon error" />;
      case 'running': return <FiClock className="status-icon running" />;
      default: return <FiClock className="status-icon" />;
    }
  };
  const getStatusClass = (status) =>
    status === 'completed' ? 'success' : status === 'error' ? 'error' : status === 'running' ? 'running' : '';

  const errorCount = Object.keys(execution?.errors || {}).length;
  const nodeCount = execution?.execution_order?.length || Object.keys(execution?.node_states || {}).length;
  const chatRows = execution?.chat_response ? toRows(execution.chat_response) : null;

  return (
    <div className="execution-result-overlay" onClick={onClose}>
      <div className="execution-result-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`execution-result-header ${getStatusClass(execution?.status)}`}>
          <div className="execution-result-title">
            <div className="erm-status-ring">{getStatusIcon(execution?.status)}</div>
            <div>
              <h2>Execution Result</h2>
              <span className="execution-id">ID: {execution_id?.slice(0, 8)}…</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="execution-result-content">
          {/* Summary metrics */}
          <div className="erm-metrics">
            <div className={`erm-metric ${getStatusClass(execution?.status)}`}>
              <FiActivity className="erm-metric-icon" />
              <span className="erm-metric-label">Status</span>
              <span className="erm-metric-value">{execution?.status || 'Unknown'}</span>
            </div>
            <div className="erm-metric">
              <FiClock className="erm-metric-icon" />
              <span className="erm-metric-label">Duration</span>
              <span className="erm-metric-value">{execution?.duration ? formatDuration(execution.duration) : 'N/A'}</span>
            </div>
            <div className="erm-metric">
              <FiHash className="erm-metric-icon" />
              <span className="erm-metric-label">Nodes</span>
              <span className="erm-metric-value">{nodeCount}</span>
            </div>
            <div className={`erm-metric ${errorCount ? 'error' : ''}`}>
              <FiAlertCircle className="erm-metric-icon" />
              <span className="erm-metric-label">Errors</span>
              <span className="erm-metric-value">{errorCount}</span>
            </div>
          </div>

          {/* Result / Chat Response */}
          {execution?.chat_response && (
            <div className="result-section chat-response-section">
              <div className="erm-section-head">
                <h3><FiZap /> Result</h3>
                <CopyBtn text={typeof execution.chat_response === 'string' ? execution.chat_response : pretty(execution.chat_response)} />
              </div>
              {chatRows ? (
                <div className="erm-kv">
                  {chatRows.map(([k, v]) => (
                    <div className="erm-kv-row" key={k}>
                      <span className="erm-kv-key">{k}</span>
                      <span className="erm-kv-val">{String(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="chat-response-box">{pretty(execution.chat_response)}</pre>
              )}
            </div>
          )}

          {/* Node Execution Details */}
          {execution?.node_states && Object.keys(execution.node_states).length > 0 && (
            <div className="result-section">
              <h3>Node Execution Details</h3>
              <div className="node-states-list">
                {Object.entries(execution.node_states).map(([nodeId, nodeState]) => {
                  const meta = nodeMeta[nodeId] || { label: nodeId, type: '' };
                  const open = expandedNodes[nodeId];
                  return (
                    <div key={nodeId} className={`node-state-item ${open ? 'open' : ''}`}>
                      <div className="node-state-header" onClick={() => toggleNode(nodeId)}>
                        <div className="node-state-info">
                          {open ? <FiChevronDown /> : <FiChevronRight />}
                          {getStatusIcon(nodeState.status)}
                          <span className="node-name">{meta.label}</span>
                          {meta.type && <span className="node-type-chip">{meta.type}</span>}
                        </div>
                        <span className={`node-status ${getStatusClass(nodeState.status)}`}>
                          {nodeState.status}
                        </span>
                      </div>

                      {open && (
                        <div className="node-state-details">
                          {nodeState.error && (
                            <div className="node-error">
                              <FiAlertCircle />
                              <span>{nodeState.error}</span>
                            </div>
                          )}
                          {nodeState.output != null && (
                            <div className="node-output">
                              <div className="output-label">
                                <span><FiCode /> Output</span>
                                <CopyBtn text={pretty(nodeState.output)} />
                              </div>
                              <pre className="output-content">{pretty(nodeState.output)}</pre>
                            </div>
                          )}
                          {nodeState.timestamp && (
                            <div className="node-timestamp">
                              <FiClock />
                              <span>{new Date(nodeState.timestamp).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Errors */}
          {execution?.errors && errorCount > 0 && (
            <div className="result-section errors-section">
              <h3>Errors</h3>
              <div className="errors-list">
                {Object.entries(execution.errors).map(([nodeId, error]) => (
                  <div key={nodeId} className="error-item">
                    <FiAlertCircle />
                    <div>
                      <strong>{nodeMeta[nodeId]?.label || `Node ${nodeId}`}:</strong>
                      <p>{error}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="execution-result-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExecutionResultModal;
