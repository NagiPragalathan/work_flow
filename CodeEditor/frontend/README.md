# Frontend - AI Code Editor

React + Vite + TypeScript frontend with real-time WebSocket updates.

## Structure

```
frontend/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles (Tailwind)
│   ├── components/          # React components
│   │   ├── ChatInterface.tsx      # User input & conversation
│   │   ├── FileTree.tsx           # File browser
│   │   ├── CodeViewer.tsx         # Code display
│   │   ├── PreviewPane.tsx        # Live preview iframe
│   │   └── ProgressIndicator.tsx  # Stage progress
│   ├── hooks/
│   │   └── useWebSocket.ts        # WebSocket hook
│   ├── services/
│   │   └── api.ts                 # API client
│   └── types/
│       └── index.ts               # TypeScript interfaces
├── public/                  # Static assets
├── index.html              # HTML entry point
└── package.json            # Dependencies
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

App runs on `http://localhost:5173`

## Components

### App.tsx
Main application component that orchestrates all other components.
- Manages global state
- Handles WebSocket messages
- Coordinates agent stages

### ChatInterface
- User prompt input
- Message history display
- Regenerate functionality
- Real-time AI responses

### FileTree
- Hierarchical file browser
- File/folder icons
- Click to view file
- Collapsible directories

### CodeViewer
- Syntax-highlighted code display
- Read-only mode
- File header with path and language
- Uses react-syntax-highlighter

### PreviewPane
- Iframe for live preview
- Refresh functionality
- Loading states
- Error display
- Open in new tab option

### ProgressIndicator
- Visual pipeline display
- Stage highlighting
- Completion status
- Error indication

## Hooks

### useWebSocket
Custom hook for WebSocket management:
- Auto-connect/reconnect
- Message handling
- Connection status
- Send message helper

## Services

### API Service (`api.ts`)
REST API client with methods:
- `createProject()` - Start new generation
- `getProject()` - Get project status
- `getProjectFiles()` - List files
- `getProjectPreview()` - Get preview URL
- `regenerateProject()` - Start regeneration
- `getWebSocketUrl()` - Get WS URL for project

## State Management

Uses React hooks for state:
- `useState` for component state
- `useCallback` for memoized functions
- `useEffect` for side effects
- No external state library needed

## Styling

- **TailwindCSS** for utility-first styling
- **Dark theme** by default
- **Responsive** design
- **Custom scrollbar** styling
- **Smooth transitions**

## WebSocket Flow

1. User submits prompt
2. Frontend creates project via REST API
3. WebSocket connection established
4. Frontend sends prompt over WebSocket
5. Backend streams stage updates
6. Frontend updates UI in real-time
7. Files displayed as generated
8. Preview shown when build completes

## Building for Production

```bash
npm run build
```

Builds to `dist/` directory. Serve with any static file server.

## Development

### Hot Module Replacement
Vite provides instant HMR - changes appear immediately without full reload.

### TypeScript
Full TypeScript support with type checking:
```bash
npm run type-check
```

### Linting (if configured)
```bash
npm run lint
```

## Customization

### Change Theme
Edit `src/index.css` for colors and styles.

### Modify Layout
Edit component proportions in `App.tsx`:
- Left panel width: `w-1/3`
- File tree height: `h-1/3`
- Split ratios: `flex-1`

### Add Features
Create new components in `src/components/` and import in `App.tsx`.

## Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.js or run:
npm run dev -- --port 3000
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
```

### WebSocket Connection Failed
- Verify backend is running on port 8000
- Check CORS configuration
- Ensure no firewall blocking

### Styling Issues
```bash
# Rebuild Tailwind
npm run dev
```

## Browser Support

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Code splitting with Vite
- Lazy loading for syntax highlighter
- Memoized callbacks
- Efficient re-renders
- WebSocket for real-time updates (vs polling)

## Accessibility

- Semantic HTML
- Keyboard navigation support
- ARIA labels where needed
- Color contrast compliance
- Focus indicators
