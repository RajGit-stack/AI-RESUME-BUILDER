import React, { useState, useRef } from 'react';
import axios from 'axios';

const ResumeCustomizer = ({ customization, onCustomizationChange }) => {
  const fileInputRef = useRef(null);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [localCustomization, setLocalCustomization] = useState(customization || {
    two_column: false,
    bold_sections: false,
    font_size: 'medium',
    header_color: '',
    accent_color: '',
    spacing: 'normal',
    custom_css: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const handleChange = (key, value) => {
    const updated = { ...localCustomization, [key]: value };
    setLocalCustomization(updated);
    if (onCustomizationChange) {
      onCustomizationChange(updated);
    }
  };

  const handleTemplateUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.css')) {
      alert('Please upload a CSS file (.css)');
      return;
    }

    setUploadingTemplate(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const cssContent = e.target.result;
        const updated = { 
          ...localCustomization, 
          custom_css: (localCustomization.custom_css || '') + '\n' + cssContent 
        };
        setLocalCustomization(updated);
        if (onCustomizationChange) {
          onCustomizationChange(updated);
        }
        setUploadingTemplate(false);
        alert('Custom CSS template uploaded successfully!');
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error uploading template:', error);
      alert('Failed to upload template');
      setUploadingTemplate(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
        <span>🎨</span>
        Customize Template
      </h3>
      
      {/* Upload Custom Template */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Custom CSS Template
        </label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleTemplateUpload}
          accept=".css"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingTemplate}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {uploadingTemplate ? 'Uploading...' : '📤 Upload CSS Template'}
        </button>
        <p className="text-xs text-gray-600 mt-2">
          Upload a CSS file to apply custom styling to your resume
        </p>
      </div>
      
      <div className="space-y-4">
        {/* Two Column Layout */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Two Column Layout</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localCustomization.two_column}
              onChange={(e) => handleChange('two_column', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Bold Sections */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Bold Section Headers</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localCustomization.bold_sections}
              onChange={(e) => handleChange('bold_sections', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
          <select
            value={localCustomization.font_size}
            onChange={(e) => handleChange('font_size', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        {/* Spacing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Spacing</label>
          <select
            value={localCustomization.spacing}
            onChange={(e) => handleChange('spacing', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="loose">Loose</option>
          </select>
        </div>

        {/* Header Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Header Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={localCustomization.header_color || '#1e293b'}
              onChange={(e) => handleChange('header_color', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={localCustomization.header_color || ''}
              onChange={(e) => handleChange('header_color', e.target.value)}
              placeholder="#1e293b"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={localCustomization.accent_color || '#475569'}
              onChange={(e) => handleChange('accent_color', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={localCustomization.accent_color || ''}
              onChange={(e) => handleChange('accent_color', e.target.value)}
              placeholder="#475569"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Custom CSS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom CSS (Advanced)
          </label>
          <textarea
            value={localCustomization.custom_css || ''}
            onChange={(e) => handleChange('custom_css', e.target.value)}
            placeholder="Add custom CSS here..."
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Add custom CSS to further customize your resume
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumeCustomizer;

