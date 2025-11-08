# GrapesJS Studio SDK - Quick Reference

## Installation
```bash
npm install @grapesjs/studio-sdk @grapesjs/studio-sdk-plugins
```

## Basic Usage
```jsx
import StudioEditor from '@grapesjs/studio-sdk/react';
import '@grapesjs/studio-sdk/style';

<StudioEditor options={{
  project: { type: 'web', default: { pages: [...] } }
}} />
```

## Common Patterns

### Get Editor Instance
```javascript
plugins: [
  editor => {
    editor.onReady(() => {
      window.editor = editor; // Access globally
    });
  }
]
```

### Auto-Save
```javascript
editor.on('update', () => {
  const data = editor.getProjectData();
  localStorage.setItem('project', JSON.stringify(data));
});
```

### Add Custom Block
```javascript
blocks: {
  default: [
    {
      id: 'my-block',
      label: 'My Block',
      category: 'Custom',
      content: '<div>Content</div>'
    }
  ]
}
```

### Add Toolbar Button
```javascript
sidebarTop: {
  leftContainer: {
    buttons: ({ items }) => [
      ...items,
      {
        id: 'custom-btn',
        label: 'Custom',
        onClick: ({ editor }) => { /* action */ }
      }
    ]
  }
}
```

### Global Style
```javascript
globalStyles: {
  default: [
    {
      id: 'primaryColor',
      property: 'color',
      field: 'color',
      defaultValue: '#3b82f6',
      selector: ':root',
      label: 'Primary Color'
    }
  ]
}
```

### Template
```javascript
templates: {
  onLoad: async () => [
    {
      id: 'template-1',
      name: 'Template Name',
      data: { pages: [...] }
    }
  ]
}
```

## Common Editor Methods

```javascript
// Project
editor.getProjectData()
editor.setProjectData(data)

// Pages
editor.Pages.add({ name: 'Page', component: '<div></div>' })
editor.Pages.getAll()
editor.Pages.get('page-id')
editor.Pages.remove('page-id')
editor.Pages.select(page)

// Components
editor.getSelected()
editor.addComponents('<div>...</div>')
editor.DomComponents.getComponents()

// Styles
editor.getStyle()
editor.setStyle([...])
editor.StyleManager.setTarget(component)

// Blocks
editor.Blocks.add('id', { label: 'Block', content: '...' })
editor.Blocks.getAll()
editor.Blocks.remove('id')

// Commands
editor.Commands.run('command-id')
editor.Commands.stop('command-id')
editor.Commands.add('id', { run: (editor) => {} })

// Events
editor.on('update', callback)
editor.on('component:selected', callback)
editor.on('component:deselected', callback)
editor.on('component:add', callback)
editor.on('component:remove', callback)
editor.on('style:change', callback)
editor.on('block:drag:start', callback)
editor.on('block:drag:stop', callback)

// Device
editor.setDevice('Tablet')
editor.getDevice()

// Canvas
editor.Canvas.getFrameEl()
editor.Canvas.getDocument()
editor.Canvas.getWindow()

// Refresh
editor.refresh()
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+C` | Copy |
| `Ctrl+V` | Paste |
| `Delete` | Remove |
| `Ctrl+S` | Save (if implemented) |
| `Escape` | Deselect |

## Plugin Configuration

```javascript
import {
  dialogComponent,
  tableComponent,
  listPagesComponent,
  fsLightboxComponent
} from '@grapesjs/studio-sdk-plugins';

plugins: [
  dialogComponent.init({ block: { category: 'Extra' } }),
  tableComponent.init({ block: { category: 'Extra' } }),
  listPagesComponent.init({ block: { category: 'Extra' } }),
  fsLightboxComponent.init({ block: { category: 'Extra' } })
]
```

## Theme Colors

```javascript
customTheme: {
  default: {
    colors: {
      global: {
        background1: '#f4f4f4',  // Highest emphasis
        background2: '#fdfdfd',  // Medium emphasis
        background3: '#ffffff',  // Lowest emphasis
        backgroundHover: '#f4f4f4',
        text: '#181818',
        border: '#d2d2d2',
        focus: 'hsl(252 95% 85% / 80%)',
        placeholder: '#a3a3a3'
      },
      primary: {
        background1: 'hsl(258 90% 66%)',
        background2: 'hsl(250 95% 92%)',
        background3: 'hsl(250 100% 97%)',
        backgroundHover: 'hsl(263 69% 42%)',
        text: '#ffffff'
      }
    }
  }
}
```

## Layout Components

- `sidebarLeft` - Left sidebar
- `sidebarRight` - Right sidebar  
- `canvasSidebarTop` - Canvas with top toolbar
- `canvas` - Canvas only
- `panelBlocks` - Blocks panel
- `panelLayers` - Layers panel
- `panelStyles` - Styles panel
- `panelProperties` - Properties panel
- `panelSelectors` - Selectors panel
- `panelTemplates` - Templates panel
- `panelGlobalStyles` - Global styles panel
- `tabs` - Tab container
- `row` - Horizontal layout
- `column` - Vertical layout

## Asset Storage

### Self-Hosted
```javascript
assets: {
  storageType: 'self',
  onUpload: async ({ files }) => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const uploaded = await response.json();
    return uploaded.map(file => ({
      id: file.id,
      src: file.url,
      name: file.name,
      mimeType: file.type,
      size: file.size
    }));
  }
}
```

### Cloud Storage
```javascript
assets: {
  storageType: 'cloud',
  apiKey: 'your-api-key'
},
identity: {
  id: 'unique-user-id'
},
project: {
  id: 'unique-project-id'
}
```

## Debugging

### Enable Debug Mode
```javascript
plugins: [
  editor => {
    // Log all events
    editor.on('all', (eventName, ...args) => {
      console.log('Event:', eventName, args);
    });
    
    // Make editor globally available
    window.editor = editor;
  }
]
```

### Common Issues

**Editor not rendering:**
```jsx
// ✅ Set explicit dimensions
<div style={{ width: '100vw', height: '100vh' }}>
  <StudioEditor options={{...}} />
</div>
```

**Styles not applying:**
```html
<!-- Add Tailwind to page head -->
<script src="https://cdn.tailwindcss.com"></script>
```

**Blocks not appearing:**
```javascript
// Check block configuration
blocks: {
  default: [
    {
      id: 'unique-id',  // Must be unique
      label: 'Block',   // Must have label
      content: '...'    // Must have content
    }
  ]
}
```

## Useful Code Snippets

### Export HTML
```javascript
const page = editor.Pages.getSelected();
const component = page.getMainComponent();
const html = `
<!DOCTYPE html>
<html>
<head>
  <style>${editor.getCss()}</style>
</head>
<body>
  ${component.toHTML()}
</body>
</html>
`;
```

### Load Project
```javascript
const loadProject = (projectData) => {
  editor.loadProjectData(projectData);
};
```

### Clear Canvas
```javascript
const clearCanvas = () => {
  editor.DomComponents.clear();
  editor.CssComposer.clear();
};
```

### Duplicate Component
```javascript
const duplicateSelected = () => {
  const selected = editor.getSelected();
  if (selected) {
    const parent = selected.parent();
    const clone = selected.clone();
    parent.append(clone);
  }
};
```

## Resources

- 📚 [Full Documentation](./src/components/ui-builder/README.md)
- 🚀 [Setup Guide](./src/components/ui-builder/SETUP_GUIDE.md)
- 🔄 [Migration Guide](./MIGRATION_GUIDE.md)
- 🌐 [Official Docs](https://grapesjs.com/docs/studio-sdk/)
- 💬 [Community](https://github.com/GrapesJS/grapesjs/discussions)

---

**Last Updated:** November 2024

