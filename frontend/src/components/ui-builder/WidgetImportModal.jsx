import { useState, useRef } from 'react';
import { FiX, FiUpload, FiCode } from 'react-icons/fi';
import './WidgetImportModal.css';

function WidgetImportModal({ isOpen, onClose, onImport }) {
  const [widgetName, setWidgetName] = useState('');
  const [widgetHtml, setWidgetHtml] = useState('');
  const [widgetCss, setWidgetCss] = useState('');
  const [widgetJs, setWidgetJs] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    files.forEach(file => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target.result;
        const extension = file.name.split('.').pop().toLowerCase();

        if (extension === 'html' || extension === 'htm') {
          setWidgetHtml(content);
          if (!widgetName) {
            setWidgetName(file.name.replace(/\.[^/.]+$/, ''));
          }
        } else if (extension === 'css') {
          setWidgetCss(content);
        } else if (extension === 'js') {
          setWidgetJs(content);
        }
      };

      reader.readAsText(file);
    });
  };

  const handleImport = () => {
    if (!widgetHtml.trim()) {
      alert('Please provide HTML content for the widget');
      return;
    }

    const widgetData = {
      id: `widget-${Date.now()}`,
      label: widgetName || 'Custom Widget',
      html: widgetHtml,
      css: widgetCss,
      js: widgetJs
    };

    onImport(widgetData);
    handleClose();
  };

  const handleClose = () => {
    setWidgetName('');
    setWidgetHtml('');
    setWidgetCss('');
    setWidgetJs('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container widget-import-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <FiUpload />
            <h2>Import Widget</h2>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Widget Name */}
          <div className="form-group">
            <label>Widget Name</label>
            <input
              type="text"
              value={widgetName}
              onChange={(e) => setWidgetName(e.target.value)}
              placeholder="Enter widget name"
              className="form-input"
            />
          </div>

          {/* File Upload Area */}
          <div
            className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <FiUpload className="upload-icon" />
            <p className="upload-text">Drag & drop HTML, CSS, or JS files here</p>
            <p className="upload-subtext">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".html,.htm,.css,.js"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </div>

          {/* HTML Input */}
          <div className="form-group">
            <label>
              <FiCode /> HTML
            </label>
            <textarea
              value={widgetHtml}
              onChange={(e) => setWidgetHtml(e.target.value)}
              placeholder="Paste your HTML code here..."
              className="form-textarea code-input"
              rows="8"
            />
          </div>

          {/* CSS Input */}
          <div className="form-group">
            <label>
              <FiCode /> CSS (Optional)
            </label>
            <textarea
              value={widgetCss}
              onChange={(e) => setWidgetCss(e.target.value)}
              placeholder="Paste your CSS code here..."
              className="form-textarea code-input"
              rows="6"
            />
          </div>

          {/* JS Input */}
          <div className="form-group">
            <label>
              <FiCode /> JavaScript (Optional)
            </label>
            <textarea
              value={widgetJs}
              onChange={(e) => setWidgetJs(e.target.value)}
              placeholder="Paste your JavaScript code here..."
              className="form-textarea code-input"
              rows="6"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleImport}>
            Import Widget
          </button>
        </div>
      </div>
    </div>
  );
}

export default WidgetImportModal;

