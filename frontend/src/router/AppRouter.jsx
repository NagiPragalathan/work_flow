import { useState, useEffect, createContext, useContext } from 'react';
import WorkflowBuilder from '../components/workflow/WorkflowBuilder';
import PageBuilder from '../components/ui-builder/PageBuilder';

// Create navigation context
export const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

function AppRouter() {
  const [activeTab, setActiveTab] = useState(() => {
    // Load active tab from localStorage
    return localStorage.getItem('activeBuilderTab') || 'workflow';
  });

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('activeBuilderTab', activeTab);
  }, [activeTab]);

  const navigateToBuilder = (builder) => {
    setActiveTab(builder);
  };

  return (
    <NavigationContext.Provider value={{ activeTab, navigateToBuilder }}>
      <div className="app-router">
        {activeTab === 'workflow' && <WorkflowBuilder />}
        {activeTab === 'page-builder' && <PageBuilder />}
      </div>
    </NavigationContext.Provider>
  );
}

export default AppRouter;

