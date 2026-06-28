import { useState, useEffect, useCallback } from 'react';
import {
  FiGrid, FiPlus, FiPlay, FiTrash2, FiClock, FiLayout, FiZap,
  FiLogOut, FiSun, FiMoon, FiActivity, FiArrowRight,
} from 'react-icons/fi';
import { useNavigation } from '../router/AppRouter';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme.jsx';
import apiService from '../services/api';
import { workflowTemplates } from '../templates';
import { web3SiteTemplates } from '../components/ui-builder/web3SiteTemplates';
import './Dashboard.css';

const CRON_PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Hourly', value: '0 * * * *' },
  { label: 'Daily at 09:00', value: '0 9 * * *' },
  { label: 'Weekly (Mon 09:00)', value: '0 9 * * 1' },
];

function ScheduleRow({ wf, onSaved }) {
  const [cron, setCron] = useState(wf.schedule || '');
  const [enabled, setEnabled] = useState(!!wf.schedule_enabled);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await apiService.updateWorkflow(wf.id, { schedule: cron, schedule_enabled: enabled });
      setSaved(true);
      onSaved && onSaved();
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      alert('Failed to save schedule: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="schedule-row">
      <FiClock className="sched-icon" />
      <select
        className="sched-preset"
        value={CRON_PRESETS.some((p) => p.value === cron) ? cron : ''}
        onChange={(e) => setCron(e.target.value)}
      >
        <option value="">Custom…</option>
        {CRON_PRESETS.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>
      <input
        className="sched-cron"
        placeholder="* * * * *"
        value={cron}
        onChange={(e) => setCron(e.target.value)}
      />
      <label className="sched-toggle" title="Enable schedule">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        <span>{enabled ? 'On' : 'Off'}</span>
      </label>
      <button className="sched-save" onClick={save} disabled={saving}>
        {saving ? '…' : saved ? '✓ Saved' : 'Save'}
      </button>
    </div>
  );
}

export default function Dashboard() {
  const { navigateToBuilder } = useNavigation();
  const { user, signout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState('workflows');
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getWorkflows();
      setWorkflows(res.results || res || []);
    } catch {
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWorkflows(); }, [loadWorkflows]);

  const openWorkflow = (wf) => {
    if (wf) localStorage.setItem('openWorkflowId', wf.id);
    else localStorage.removeItem('openWorkflowId');
    localStorage.removeItem('pendingWorkflowTemplate');
    navigateToBuilder('workflow');
  };

  const useWorkflowTemplate = (tpl) => {
    localStorage.setItem('pendingWorkflowTemplate', JSON.stringify(tpl));
    localStorage.removeItem('openWorkflowId');
    navigateToBuilder('workflow');
  };

  const useSiteTemplate = (tpl) => {
    localStorage.setItem('pendingSiteTemplate', JSON.stringify({ name: tpl.name, html: tpl.html }));
    navigateToBuilder('page-builder');
  };

  const deleteWorkflow = async (wf) => {
    if (!confirm(`Delete "${wf.name}"?`)) return;
    try {
      await apiService.deleteWorkflow(wf.id);
      loadWorkflows();
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  };

  return (
    <div className="dash" data-theme={theme}>
      {/* Top bar */}
      <header className="dash-header">
        <div className="dash-brand">
          <span className="dash-logo">⚡</span>
          <div>
            <div className="dash-title">AgentFlow <span>Web3</span></div>
            <div className="dash-sub">n8n for Web3 · workflows + site builder</div>
          </div>
        </div>
        <div className="dash-actions">
          <button className="dash-icon-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
          <div className="dash-user">{user?.username || 'User'}</div>
          <button className="dash-icon-btn" onClick={signout} title="Sign out"><FiLogOut /></button>
        </div>
      </header>

      {/* Tabs */}
      <div className="dash-tabs">
        <button className={`dash-tab ${tab === 'workflows' ? 'active' : ''}`} onClick={() => setTab('workflows')}>
          <FiGrid /> Workflows
        </button>
        <button className={`dash-tab ${tab === 'dapps' ? 'active' : ''}`} onClick={() => setTab('dapps')}>
          <FiZap /> dApps
        </button>
      </div>

      <main className="dash-main">
        {tab === 'workflows' && (
          <section>
            <div className="dash-section-head">
              <div>
                <h2>Your Workflows</h2>
                <p>Build automations and schedule them with cron timing.</p>
              </div>
              <button className="dash-primary" onClick={() => openWorkflow(null)}>
                <FiPlus /> New Workflow
              </button>
            </div>

            {loading ? (
              <div className="dash-empty">Loading…</div>
            ) : workflows.length === 0 ? (
              <div className="dash-empty">
                <FiActivity size={40} />
                <p>No workflows yet. Create one or start from a dApp template.</p>
                <button className="dash-primary" onClick={() => openWorkflow(null)}><FiPlus /> New Workflow</button>
              </div>
            ) : (
              <div className="wf-grid">
                {workflows.map((wf) => (
                  <div className="wf-card" key={wf.id}>
                    <div className="wf-card-top">
                      <div className="wf-name">{wf.name}</div>
                      {wf.schedule_enabled && <span className="wf-badge"><FiClock size={11} /> scheduled</span>}
                    </div>
                    <div className="wf-meta">
                      {(wf.nodes?.length ?? 0)} nodes · updated {new Date(wf.updated_at).toLocaleDateString()}
                    </div>
                    <ScheduleRow wf={wf} onSaved={loadWorkflows} />
                    <div className="wf-card-actions">
                      <button className="wf-open" onClick={() => openWorkflow(wf)}><FiPlay size={13} /> Open</button>
                      <button className="wf-del" onClick={() => deleteWorkflow(wf)} title="Delete"><FiTrash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'dapps' && (
          <section>
            <div className="dash-section-head">
              <div>
                <h2>dApp Templates</h2>
                <p>Prebuilt Web3 workflows and websites — click to open in the builder.</p>
              </div>
            </div>

            <h3 className="dash-group">⚙️ Workflow Templates</h3>
            <div className="tpl-grid2">
              {workflowTemplates.map((t, i) => (
                <button className="tpl-card2" key={i} onClick={() => useWorkflowTemplate(t)}>
                  <div className="tpl-card2-top"><span className="tpl-emoji">{t.icon || '⚡'}</span><span className="tpl-tag">{t.category || 'Workflow'}</span></div>
                  <div className="tpl-card2-name">{t.name}</div>
                  <div className="tpl-card2-desc">{t.description}</div>
                  <div className="tpl-card2-foot">{t.nodes.length} nodes <FiArrowRight /></div>
                </button>
              ))}
            </div>

            <h3 className="dash-group"><FiLayout style={{ verticalAlign: '-2px' }} /> Website Templates</h3>
            <div className="tpl-grid2">
              {web3SiteTemplates.map((t, i) => (
                <button className="tpl-card2" key={i} onClick={() => useSiteTemplate(t)}>
                  <div className="tpl-card2-top"><span className="tpl-emoji">🌐</span><span className="tpl-tag">Website</span></div>
                  <div className="tpl-card2-name">{t.name}</div>
                  <div className="tpl-card2-desc">{t.description}</div>
                  <div className="tpl-card2-foot">Open in Page Builder <FiArrowRight /></div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
