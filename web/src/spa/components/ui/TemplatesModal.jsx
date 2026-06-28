import React, { useState, useMemo } from 'react';
import { FiX, FiSearch, FiArrowRight } from 'react-icons/fi';
import { workflowTemplates } from '../../templates';

const TemplatesModal = ({ isOpen, onClose, onUse }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return workflowTemplates;
    return workflowTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q)
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="tpl-overlay" onClick={onClose}>
      <div className="tpl-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tpl-header">
          <div>
            <h2>Workflow Templates</h2>
            <p>Start from a ready-made Web3 workflow — click to load it onto the canvas.</p>
          </div>
          <button className="tpl-close" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        <div className="tpl-search">
          <FiSearch />
          <input
            autoFocus
            placeholder="Search templates…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="tpl-grid">
          {filtered.map((t, i) => (
            <button
              key={i}
              className="tpl-card"
              onClick={() => {
                onUse(t);
                onClose();
              }}
            >
              <div className="tpl-card-top">
                <span className="tpl-icon">{t.icon || '⚡'}</span>
                <span className="tpl-badge">{t.category || 'Workflow'}</span>
              </div>
              <div className="tpl-name">{t.name}</div>
              <div className="tpl-desc">{t.description}</div>
              <div className="tpl-meta">
                <span>{t.nodes.length} nodes</span>
                <span className="tpl-use">
                  Use <FiArrowRight />
                </span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div className="tpl-empty">No templates match “{query}”.</div>}
        </div>
      </div>

      <style>{`
        .tpl-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .tpl-modal {
          width: min(960px, 96vw); max-height: 88vh; overflow: hidden;
          background: #ffffff; border-radius: 18px;
          box-shadow: 0 24px 60px rgba(2, 6, 23, 0.35);
          display: flex; flex-direction: column;
          border: 1px solid rgba(148, 163, 184, 0.18);
        }
        .tpl-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 22px 24px 14px;
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #0ea5e9 100%);
          color: #fff;
        }
        .tpl-header h2 { margin: 0; font-size: 20px; font-weight: 700; }
        .tpl-header p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }
        .tpl-close {
          background: rgba(255,255,255,0.18); border: none; color: #fff;
          width: 34px; height: 34px; border-radius: 10px; cursor: pointer;
          display: grid; place-items: center; font-size: 18px; transition: background .15s;
        }
        .tpl-close:hover { background: rgba(255,255,255,0.32); }
        .tpl-search {
          display: flex; align-items: center; gap: 10px;
          margin: 16px 24px 4px; padding: 10px 14px;
          border: 1px solid #e2e8f0; border-radius: 12px; color: #64748b;
          background: #f8fafc;
        }
        .tpl-search input { border: none; outline: none; flex: 1; font-size: 14px; background: transparent; color: #0f172a; }
        .tpl-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 14px; padding: 18px 24px 26px; overflow-y: auto;
        }
        .tpl-card {
          text-align: left; cursor: pointer;
          background: #fff; border: 1px solid #e8edf3; border-radius: 14px;
          padding: 16px; display: flex; flex-direction: column; gap: 8px;
          transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
        }
        .tpl-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(99, 102, 241, 0.18);
          border-color: #c7d2fe;
        }
        .tpl-card-top { display: flex; align-items: center; justify-content: space-between; }
        .tpl-icon { font-size: 24px; }
        .tpl-badge {
          font-size: 11px; font-weight: 600; color: #6366f1;
          background: #eef2ff; padding: 3px 9px; border-radius: 999px;
        }
        .tpl-name { font-weight: 700; font-size: 15px; color: #0f172a; }
        .tpl-desc { font-size: 12.5px; color: #64748b; line-height: 1.45; min-height: 36px; }
        .tpl-meta {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 4px; font-size: 12px; color: #94a3b8;
        }
        .tpl-use { display: inline-flex; align-items: center; gap: 4px; color: #6366f1; font-weight: 600; }
        .tpl-empty { grid-column: 1 / -1; text-align: center; color: #94a3b8; padding: 30px; }
      `}</style>
    </div>
  );
};

export default TemplatesModal;
