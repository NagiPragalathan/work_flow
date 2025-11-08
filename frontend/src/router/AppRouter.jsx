import { useState, useEffect } from 'react';
import { FiGrid, FiLayout } from 'react-icons/fi';
import WorkflowBuilder from '../components/workflow/WorkflowBuilder';
import PageBuilder from '../components/ui-builder/PageBuilder';
import './AppRouter.css';

function AppRouter() {
  const [activeTab, setActiveTab] = useState(() => {
    // Load active tab from localStorage
    return localStorage.getItem('activeBuilderTab') || 'workflow';
  });

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('activeBuilderTab', activeTab);
  }, [activeTab]);

  return (
    <div className="app-router">
      {/* Modern Tab Navigation */}
      <div className="tab-navigation">
        <div className="tab-container">
          <button
            className={`tab-btn ${activeTab === 'workflow' ? 'active' : ''}`}
            onClick={() => setActiveTab('workflow')}
          >
            <FiGrid className="tab-icon" />
            <span className="tab-label">Workflow Builder</span>
            <div className="tab-indicator" />
          </button>
          <button
            className={`tab-btn ${activeTab === 'page-builder' ? 'active' : ''}`}
            onClick={() => setActiveTab('page-builder')}
          >
            <FiLayout className="tab-icon" />
            <span className="tab-label">Page Builder</span>
            <div className="tab-indicator" />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'workflow' && <WorkflowBuilder />}
        {activeTab === 'page-builder' && <PageBuilder />}
      </div>
    </div>
  );
}

export default AppRouter;

