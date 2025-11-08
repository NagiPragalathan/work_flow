import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '../../theme';
import PageBuilderToolbar from './PageBuilderToolbar';
import WidgetImportModal from './WidgetImportModal';
import CodeExportModal from './CodeExportModal';
import ProjectManager from './ProjectManager';
import './PageBuilder.css';

// Lazy load grapesjs to handle missing dependency
let grapesjs = null;
let grapesjsLoaded = false;

const loadGrapesJS = async () => {
  if (grapesjsLoaded) return grapesjs;
  try {
    const grapesjsModule = await import('grapesjs');
    await import('grapesjs/dist/css/grapes.min.css');
    grapesjs = grapesjsModule.default;
    grapesjsLoaded = true;
    return grapesjs;
  } catch (error) {
    console.warn('GrapesJS not available:', error);
    return null;
  }
};

function PageBuilder() {
  const { theme } = useTheme();
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [activeDevice, setActiveDevice] = useState('Desktop');
  const [showWidgetImport, setShowWidgetImport] = useState(false);
  const [showCodeExport, setShowCodeExport] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activePanel, setActivePanel] = useState('blocks'); // blocks, layers, styles
  const [activePropTab, setActivePropTab] = useState('properties'); // properties, styles-props
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize GrapesJS
  useEffect(() => {
    if (editorRef.current) return;
    
    let timer = null;
    let cleanupTimer = null;
    
    // Helper function to initialize GrapesJS commands
    const setupGrapesJSCommands = (grapes) => {
      grapes.Commands.add('set-device-desktop', {
        run: editor => {
          editor.setDevice('Desktop');
          setActiveDevice('Desktop');
        }
      });
      
      grapes.Commands.add('set-device-tablet', {
        run: editor => {
          editor.setDevice('Tablet');
          setActiveDevice('Tablet');
        }
      });
      
      grapes.Commands.add('set-device-mobile', {
        run: editor => {
          editor.setDevice('Mobile');
          setActiveDevice('Mobile');
        }
      });
      
      grapes.Commands.add('show-blocks', {
        run: () => setActivePanel('blocks')
      });
      
      grapes.Commands.add('show-layers', {
        run: () => setActivePanel('layers')
      });
      
      // Track changes
      grapes.on('change', () => {
        setHasChanges(true);
      });
      
      editorRef.current = grapes;
      setEditor(grapes);
    };
    
    // Load grapesjs dynamically and initialize
    loadGrapesJS().then((grapesjsLib) => {
      if (!grapesjsLib) {
        console.warn('GrapesJS is not available. Page Builder will not function.');
        return;
      }
      
      // Small delay to ensure DOM is ready
      timer = setTimeout(async () => {
        try {
          // Dynamically import getGrapesConfig
          const { getGrapesConfig } = await import('./grapesConfig');
          
          // Ensure all containers exist in DOM before initialization
          const traitsContainer = document.getElementById('traits-container');
          const stylesContainer = document.getElementById('styles-container');
          const selectorsContainer = document.getElementById('selectors-container');
          const stylesSectorsContainer = document.getElementById('styles-sectors-container');
          
          if (!traitsContainer || !stylesContainer || !selectorsContainer || !stylesSectorsContainer) {
            console.error('GrapesJS containers not found, retrying...');
            cleanupTimer = setTimeout(() => {
              const config = getGrapesConfig(theme);
              const grapes = grapesjsLib.init(config);
              setupGrapesJSCommands(grapes);
            }, 200);
            return;
          }
          
          const config = getGrapesConfig(theme);
          const grapes = grapesjsLib.init(config);
          setupGrapesJSCommands(grapes);
          
          // Load project from localStorage if exists
          const savedProject = localStorage.getItem('gjsProject');
          if (savedProject) {
            try {
              const project = JSON.parse(savedProject);
              if (project.projectName) {
                setProjectName(project.projectName);
              }
            } catch (error) {
              console.error('Error loading project:', error);
            }
          }
        } catch (error) {
          console.error('Error initializing GrapesJS:', error);
        }
      }, 100);
    });
    
    return () => {
      // Cleanup on unmount
      if (timer) clearTimeout(timer);
      if (cleanupTimer) clearTimeout(cleanupTimer);
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [theme]);

  // Update theme
  useEffect(() => {
    if (editor) {
      const editorEl = document.querySelector('#gjs-editor');
      if (editorEl) {
        editorEl.setAttribute('data-theme', theme);
      }
    }
  }, [theme, editor]);

  // Handle save
  const handleSave = useCallback(() => {
    if (editor) {
      const html = editor.getHtml();
      const css = editor.getCss();
      const components = editor.getComponents();
      const styles = editor.getStyle();
      
      const project = {
        projectName,
        html,
        css,
        components: components.toJSON(),
        styles: styles.toJSON(),
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem('gjsProject', JSON.stringify(project));
      localStorage.setItem(`gjsProject_${projectName}`, JSON.stringify(project));
      setHasChanges(false);
      
      // Show toast notification
      const toast = document.createElement('div');
      toast.className = 'toast-notification success';
      toast.textContent = '✅ Project saved successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  }, [editor, projectName]);

  // Handle device change
  const handleDeviceChange = useCallback((device) => {
    if (editor) {
      editor.setDevice(device);
      setActiveDevice(device);
    }
  }, [editor]);

  // Handle preview toggle
  const handlePreviewToggle = useCallback(() => {
    if (editor) {
      const commands = editor.Commands;
      if (isPreviewMode) {
        commands.stop('preview');
      } else {
        commands.run('preview');
      }
      setIsPreviewMode(!isPreviewMode);
    }
  }, [editor, isPreviewMode]);

  // Handle fullscreen
  const handleFullscreen = useCallback(() => {
    if (editor) {
      editor.Commands.run('fullscreen');
    }
  }, [editor]);

  // Handle undo/redo
  const handleUndo = useCallback(() => {
    if (editor) {
      editor.Commands.run('undo');
    }
  }, [editor]);

  const handleRedo = useCallback(() => {
    if (editor) {
      editor.Commands.run('redo');
    }
  }, [editor]);

  // Handle clear canvas
  const handleClear = useCallback(() => {
    if (editor) {
      const message = '⚠️ WARNING: This will delete ALL elements from the canvas!\n\nThis action cannot be undone.\n\nAre you sure you want to clear the entire canvas?';
      if (confirm(message)) {
        editor.DomComponents.clear();
        editor.CssComposer.clear();
        setHasChanges(true);
        
        // Show success notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification success';
        toast.textContent = '🗑️ Canvas cleared successfully!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      }
    }
  }, [editor]);

  // Handle export
  const handleExport = useCallback(() => {
    setShowCodeExport(true);
  }, []);

  // Handle widget import
  const handleImportWidget = useCallback((widgetData) => {
    if (editor) {
      // Add imported widget as a custom block
      editor.BlockManager.add(widgetData.id || `custom-${Date.now()}`, {
        label: widgetData.label || 'Custom Widget',
        category: 'Custom',
        content: widgetData.html,
        attributes: { class: 'custom-widget' }
      });
      
      setShowWidgetImport(false);
      
      // Show success notification
      const toast = document.createElement('div');
      toast.className = 'toast-notification success';
      toast.textContent = '✅ Widget imported successfully!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  }, [editor]);

  // Handle project load
  const handleLoadProject = useCallback((project) => {
    if (editor && project) {
      editor.setComponents(project.components);
      editor.setStyle(project.styles);
      setProjectName(project.projectName || 'Untitled Project');
      setHasChanges(false);
      setShowProjectManager(false);
    }
  }, [editor]);

  return (
    <div className={`page-builder ${theme}`} data-theme={theme}>
      {/* Toolbar */}
      <PageBuilderToolbar
        projectName={projectName}
        onProjectNameChange={setProjectName}
        activeDevice={activeDevice}
        onDeviceChange={handleDeviceChange}
        onSave={handleSave}
        onExport={handleExport}
        onImportWidget={() => setShowWidgetImport(true)}
        onPreview={handlePreviewToggle}
        onFullscreen={handleFullscreen}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onProjectManager={() => setShowProjectManager(true)}
        hasChanges={hasChanges}
        isPreviewMode={isPreviewMode}
      />

      {/* Main Editor Layout */}
      <div className="page-builder-layout">
        {/* Left Panel - Blocks/Layers/Styles */}
        <div className="left-panel">
          <div className="panel-tabs">
            <button
              className={`panel-tab ${activePanel === 'blocks' ? 'active' : ''}`}
              onClick={() => setActivePanel('blocks')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
              <span>Blocks</span>
            </button>
            <button
              className={`panel-tab ${activePanel === 'layers' ? 'active' : ''}`}
              onClick={() => setActivePanel('layers')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span>Layers</span>
            </button>
          </div>
          
          <div className="panel-content">
            <div id="blocks-container" style={{ display: activePanel === 'blocks' ? 'block' : 'none' }} />
            <div id="layers-container" style={{ display: activePanel === 'layers' ? 'block' : 'none' }} />
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="center-panel">
          <div id="gjs-editor" />
        </div>

        {/* Right Panel - Properties */}
        <div className="right-panel">
          <div className="panel-header">
            <h3>Properties</h3>
          </div>
          <div className="properties-tabs">
            <button
              className={`prop-tab ${activePropTab === 'properties' ? 'active' : ''}`}
              onClick={() => setActivePropTab('properties')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 9h6M9 15h6"/>
              </svg>
              <span>Component</span>
            </button>
            <button
              className={`prop-tab ${activePropTab === 'styles-props' ? 'active' : ''}`}
              onClick={() => setActivePropTab('styles-props')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <span>Styles</span>
            </button>
          </div>
          <div className="properties-content">
            <div 
              id="traits-container" 
              className={activePropTab === 'properties' ? 'prop-tab-content active' : 'prop-tab-content'}
            />
            <div 
              id="styles-container" 
              className={activePropTab === 'styles-props' ? 'prop-tab-content active' : 'prop-tab-content'}
            >
              {/* Selector Manager - for selecting which element/class to style */}
              <div className="selectors-wrapper">
                <div className="selectors-header">
                  <h4>Select Element</h4>
                  <span className="selectors-hint">Choose which element or class to style</span>
                </div>
                <div id="selectors-container" />
              </div>
              {/* Style Manager - CSS properties will be appended here by GrapesJS */}
              <div id="styles-sectors-container" />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showWidgetImport && (
        <WidgetImportModal
          isOpen={showWidgetImport}
          onClose={() => setShowWidgetImport(false)}
          onImport={handleImportWidget}
        />
      )}

      {showCodeExport && (
        <CodeExportModal
          isOpen={showCodeExport}
          onClose={() => setShowCodeExport(false)}
          editor={editor}
        />
      )}

      {showProjectManager && (
        <ProjectManager
          isOpen={showProjectManager}
          onClose={() => setShowProjectManager(false)}
          onLoadProject={handleLoadProject}
          currentProject={{ projectName, hasChanges }}
        />
      )}

      {/* Hidden panel containers */}
      <div style={{ display: 'none' }}>
        <div className="panel__switcher" />
      </div>
    </div>
  );
}

export default PageBuilder;

