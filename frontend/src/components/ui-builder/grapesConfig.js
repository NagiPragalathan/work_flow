// GrapesJS Configuration

import { allBlocks } from './blocks';

export const getGrapesConfig = (theme) => {
  const isDark = theme === 'dark';
  
  return {
    // Container selector
    container: '#gjs-editor',
    
    // Size of the editor
    height: 'calc(100vh - 120px)',
    width: 'auto',
    
    // Disable storage manager initially (we'll handle it manually)
    storageManager: {
      type: 'local',
      autosave: true,
      autoload: true,
      stepsBeforeSave: 1,
      options: {
        local: {
          key: 'gjsProject'
        }
      }
    },
    
    // Canvas settings
    canvas: {
      styles: [
        // Add Tailwind CSS CDN (will be conditionally loaded)
        // External styles will be injected dynamically via widget import
      ],
      scripts: [
        // External scripts will be injected dynamically via widget import
      ]
    },
    
    // Panels configuration
    panels: {
      defaults: [
        {
          id: 'panel-switcher',
          el: '.panel__switcher',
          buttons: [
            {
              id: 'show-blocks',
              active: true,
              label: 'Blocks',
              command: 'show-blocks',
              togglable: false
            },
            {
              id: 'show-layers',
              active: false,
              label: 'Layers',
              command: 'show-layers',
              togglable: false
            },
            {
              id: 'show-style',
              active: false,
              label: 'Styles',
              command: 'show-styles',
              togglable: false
            }
          ]
        }
      ]
    },
    
    // Device Manager
    deviceManager: {
      devices: [
        {
          name: 'Desktop',
          width: ''
        },
        {
          name: 'Tablet',
          width: '768px',
          widthMedia: '992px'
        },
        {
          name: 'Mobile',
          width: '375px',
          widthMedia: '480px'
        }
      ]
    },
    
    // Block Manager
    blockManager: {
      appendTo: '#blocks-container',
      blocks: allBlocks
    },
    
    // Layer Manager
    layerManager: {
      appendTo: '#layers-container',
      showWrapper: true
    },
    
    // Trait Manager (Component Properties)
    traitManager: {
      appendTo: '#traits-container',
      labelContainer: 'Component Settings'
    },
    
    // Selector Manager (moved to right panel styles tab)
    selectorManager: {
      appendTo: '#selectors-container',
      componentFirst: true
    },
    
    // Style Manager (CSS Styles - in right panel)
    styleManager: {
      appendTo: '#styles-sectors-container',
      sectors: [
        {
          name: 'General',
          open: true,
          buildProps: ['display', 'position', 'top', 'right', 'left', 'bottom']
        },
        {
          name: 'Dimension',
          open: false,
          buildProps: ['width', 'height', 'max-width', 'min-width', 'max-height', 'min-height', 'padding', 'margin'],
          properties: [
            {
              type: 'number',
              property: 'width',
              units: ['px', '%', 'vw', 'em', 'rem', 'auto'],
              defaults: 'auto',
              min: 0
            },
            {
              type: 'number',
              property: 'height',
              units: ['px', '%', 'vh', 'em', 'rem', 'auto'],
              defaults: 'auto',
              min: 0
            }
          ]
        },
        {
          name: 'Typography',
          open: false,
          buildProps: [
            'font-family',
            'font-size',
            'font-weight',
            'letter-spacing',
            'color',
            'line-height',
            'text-align',
            'text-decoration',
            'text-shadow'
          ],
          properties: [
            {
              property: 'font-family',
              type: 'select',
              options: [
                { value: 'Arial, sans-serif', name: 'Arial' },
                { value: 'Helvetica, sans-serif', name: 'Helvetica' },
                { value: 'Georgia, serif', name: 'Georgia' },
                { value: 'Times New Roman, serif', name: 'Times New Roman' },
                { value: 'Courier New, monospace', name: 'Courier New' },
                { value: 'system-ui, -apple-system, sans-serif', name: 'System UI' }
              ]
            },
            {
              property: 'font-size',
              type: 'number',
              units: ['px', 'em', 'rem', '%'],
              defaults: '16px',
              min: 0
            },
            {
              property: 'font-weight',
              type: 'select',
              options: [
                { value: '100', name: 'Thin' },
                { value: '300', name: 'Light' },
                { value: '400', name: 'Normal' },
                { value: '500', name: 'Medium' },
                { value: '600', name: 'Semi-bold' },
                { value: '700', name: 'Bold' },
                { value: '900', name: 'Black' }
              ],
              defaults: '400'
            }
          ]
        },
        {
          name: 'Decorations',
          open: false,
          buildProps: [
            'background-color',
            'background',
            'border-radius',
            'border',
            'box-shadow',
            'background-image'
          ]
        },
        {
          name: 'Flex',
          open: false,
          buildProps: [
            'flex-direction',
            'flex-wrap',
            'justify-content',
            'align-items',
            'align-content',
            'order',
            'flex-basis',
            'flex-grow',
            'flex-shrink',
            'align-self',
            'gap'
          ]
        },
        {
          name: 'Extra',
          open: false,
          buildProps: ['transition', 'perspective', 'transform', 'cursor', 'opacity', 'z-index']
        }
      ]
    },
    
    // Commands
    commands: {
      defaults: [
        {
          id: 'clear-all',
          run(editor) {
            if (confirm('Are you sure you want to clear the canvas?')) {
              editor.DomComponents.clear();
              editor.CssComposer.clear();
            }
          }
        }
      ]
    },
    
    // Plugins
    plugins: [],
    pluginsOpts: {}
  };
};

export default getGrapesConfig;

