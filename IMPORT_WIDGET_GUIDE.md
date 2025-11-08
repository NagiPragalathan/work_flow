# Import Custom HTML/Widget Guide

Complete guide to importing custom HTML widgets into the GrapesJS Studio SDK Page Builder.

## Overview

Both the **frontend** and **no-code** implementations now include a powerful HTML import feature that allows you to:
- Import custom HTML widgets
- Add external code/components
- Create reusable custom blocks
- Integrate third-party widgets

## Features

### 🎯 Import Button
Located in the top toolbar, next to the Save button:
- **Icon:** Upload arrow
- **Label:** "Import HTML"
- **Location:** Top toolbar (canvasSidebarTop)

### 📝 Import Modal
Beautiful, user-friendly modal with:
- Large textarea for pasting HTML
- Syntax highlighting-ready (monospace font)
- Example buttons for quick testing
- Cancel and Import actions
- Responsive design

### ✨ Auto Features
When you import HTML:
- ✅ **Automatically added to Blocks** - Creates a custom block
- ✅ **Instantly added to Canvas** - Appears immediately
- ✅ **Categorized** - Goes into "Custom" category
- ✅ **Reusable** - Can be used multiple times
- ✅ **Success notification** - Visual feedback
- ✅ **Error handling** - Graceful failure messages

## How to Use

### Method 1: Basic Import

1. **Open the Import Modal**
   - Click the "Import HTML" button in the top toolbar
   - Or use keyboard shortcut (if implemented)

2. **Paste Your HTML**
   ```html
   <div class="my-custom-widget">
     <h2>My Widget</h2>
     <p>Custom content here</p>
   </div>
   ```

3. **Click "Import Widget"**
   - Widget appears on canvas
   - Block added to blocks panel
   - Success notification shows

### Method 2: Using Examples

The modal includes pre-built examples:

**Example 1: Simple Card**
```html
<div class="bg-blue-500 text-white p-8 rounded-lg text-center">
  <h2 class="text-3xl font-bold mb-4">Custom Widget</h2>
  <p class="text-lg">This is a custom imported widget</p>
</div>
```

**Example 2: Gradient Section**
```html
<section class="py-16 px-4 bg-gradient-to-r from-purple-500 to-pink-500">
  <div class="container mx-auto text-center text-white">
    <h1 class="text-5xl font-bold mb-4">Gradient Section</h1>
    <p class="text-xl">Beautiful gradient background</p>
  </div>
</section>
```

## Advanced Usage

### Import with CSS

```html
<div class="custom-card">
  <h3>Styled Card</h3>
  <p>With custom styles</p>
</div>

<style>
  .custom-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }
</style>
```

### Import with JavaScript

```html
<div id="counter-widget">
  <h2>Counter: <span id="count">0</span></h2>
  <button onclick="incrementCounter()">Increment</button>
</div>

<script>
  let count = 0;
  function incrementCounter() {
    count++;
    document.getElementById('count').textContent = count;
  }
</script>
```

### Import Third-Party Widgets

#### Chart.js Example
```html
<div>
  <canvas id="myChart" width="400" height="200"></canvas>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
  const ctx = document.getElementById('myChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2],
        backgroundColor: ['red', 'blue', 'yellow', 'green', 'purple']
      }]
    }
  });
</script>
```

#### Google Maps Example
```html
<div id="map" style="width: 100%; height: 400px;"></div>

<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
<script>
  function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 40.7128, lng: -74.0060 },
      zoom: 12
    });
  }
  initMap();
</script>
```

#### Lottie Animation Example
```html
<div id="lottie-animation" style="width: 400px; height: 400px;"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
<script>
  lottie.loadAnimation({
    container: document.getElementById('lottie-animation'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'https://assets9.lottiefiles.com/packages/lf20_uwWgICKCxj.json'
  });
</script>
```

## With Tailwind CSS

Since Tailwind is already loaded in the canvas, you can use Tailwind classes:

```html
<div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
  <div class="md:flex">
    <div class="md:flex-shrink-0">
      <img class="h-48 w-full object-cover md:w-48" src="https://picsum.photos/300/200" alt="Card image">
    </div>
    <div class="p-8">
      <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Case Study</div>
      <h3 class="block mt-1 text-lg leading-tight font-medium text-black">Finding customers for your new business</h3>
      <p class="mt-2 text-gray-500">Getting a new business off the ground is a lot of hard work.</p>
    </div>
  </div>
</div>
```

## Component Libraries

### Bootstrap Components
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

<div class="card" style="width: 18rem;">
  <img src="https://picsum.photos/300/200" class="card-img-top" alt="...">
  <div class="card-body">
    <h5 class="card-title">Card title</h5>
    <p class="card-text">Some quick example text to build on the card title.</p>
    <a href="#" class="btn btn-primary">Go somewhere</a>
  </div>
</div>
```

### Alpine.js Components
```html
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

<div x-data="{ open: false }">
  <button @click="open = !open" class="px-4 py-2 bg-blue-500 text-white rounded">
    Toggle
  </button>
  <div x-show="open" class="mt-4 p-4 bg-gray-100 rounded">
    Hidden content!
  </div>
</div>
```

### React Components (via CDN)
```html
<div id="react-root"></div>

<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script>
  const { createElement } = React;
  const { createRoot } = ReactDOM;
  
  function MyComponent() {
    return createElement('div', { className: 'p-4 bg-blue-100 rounded' },
      createElement('h2', null, 'React Component'),
      createElement('p', null, 'This is a React component!')
    );
  }
  
  const root = createRoot(document.getElementById('react-root'));
  root.render(createElement(MyComponent));
</script>
```

## Best Practices

### 1. Use Semantic HTML
```html
<!-- ✅ Good -->
<article class="blog-post">
  <header>
    <h2>Post Title</h2>
  </header>
  <section>
    <p>Content here...</p>
  </section>
</article>

<!-- ❌ Avoid -->
<div class="blog-post">
  <div>
    <div>Post Title</div>
  </div>
</div>
```

### 2. Include Responsive Design
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

### 3. Add Accessibility
```html
<button 
  aria-label="Close dialog"
  role="button"
  tabindex="0"
  class="close-btn"
>
  <span aria-hidden="true">&times;</span>
</button>
```

### 4. Use Data Attributes for Functionality
```html
<div 
  data-widget="counter"
  data-initial-value="0"
  data-max-value="100"
>
  <span data-count>0</span>
  <button data-action="increment">+</button>
</div>
```

### 5. Namespace Your Classes
```html
<!-- Avoid conflicts with existing styles -->
<div class="mywidget-container">
  <h2 class="mywidget-title">Widget Title</h2>
  <div class="mywidget-content">Content</div>
</div>
```

## Troubleshooting

### Widget Not Appearing
**Problem:** HTML imports but doesn't show on canvas
**Solution:**
- Check for JavaScript errors in console
- Ensure HTML is valid
- Check if external resources are loading
- Verify no conflicting styles

### Styles Not Applied
**Problem:** Widget appears but looks different
**Solution:**
- Ensure CSS is included in the HTML
- Check Tailwind classes are correct
- Verify external stylesheets are loading
- Check for CSS conflicts

### Scripts Not Running
**Problem:** JavaScript functionality not working
**Solution:**
- Check browser console for errors
- Ensure external scripts are loading
- Verify script syntax is correct
- Check for scope issues

### Block Not Reusable
**Problem:** Can't find imported widget in blocks
**Solution:**
- Ensure import completed successfully
- Check "Custom" category in blocks panel
- Refresh the editor if needed
- Re-import if necessary

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Import Modal | (Implement if needed) |
| Close Modal | `Escape` |
| Submit Import | `Ctrl+Enter` (in textarea) |

## API Usage

### Programmatic Import

```javascript
// Get editor instance
const editor = window.editor; // or from plugin

// Add custom block programmatically
editor.Blocks.add('my-widget', {
  label: 'My Widget',
  category: 'Custom',
  content: `
    <div class="my-widget">
      <h2>Widget Title</h2>
      <p>Widget content</p>
    </div>
  `
});

// Add to canvas
editor.addComponents(`
  <div class="my-widget">
    <h2>Widget Title</h2>
    <p>Widget content</p>
  </div>
`);
```

### Batch Import

```javascript
const widgets = [
  { id: 'widget1', label: 'Widget 1', content: '<div>...</div>' },
  { id: 'widget2', label: 'Widget 2', content: '<div>...</div>' },
  { id: 'widget3', label: 'Widget 3', content: '<div>...</div>' }
];

widgets.forEach(widget => {
  editor.Blocks.add(widget.id, {
    label: widget.label,
    category: 'Imported',
    content: widget.content
  });
});
```

## Security Considerations

### ⚠️ Important Notes

1. **Sanitize Input** - In production, sanitize HTML before importing
2. **Validate Scripts** - Be cautious with external scripts
3. **Content Security Policy** - Consider CSP headers
4. **XSS Protection** - Validate user-provided HTML
5. **Trusted Sources Only** - Only import from trusted sources

### Example Sanitization
```javascript
import DOMPurify from 'dompurify';

const sanitizedHtml = DOMPurify.sanitize(importHtml, {
  ALLOWED_TAGS: ['div', 'span', 'h1', 'h2', 'h3', 'p', 'img', 'a'],
  ALLOWED_ATTR: ['class', 'href', 'src', 'alt']
});
```

## Resources

- [HTML Best Practices](https://github.com/hail2u/html-best-practices)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [CodePen](https://codepen.io/) - Test widgets before importing

## Examples Repository

Check out our examples at:
```
/examples
├── widgets/
│   ├── cards.html
│   ├── forms.html
│   ├── navigation.html
│   └── charts.html
├── components/
│   ├── modals.html
│   ├── tooltips.html
│   └── dropdowns.html
└── integrations/
    ├── google-maps.html
    ├── youtube.html
    └── social-media.html
```

---

**Happy Importing! 🚀**

Need help? Check the [main documentation](./README.md) or [setup guide](./SETUP_GUIDE.md).

