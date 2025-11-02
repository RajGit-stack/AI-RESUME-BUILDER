import React, { useState } from 'react';
import { RESUME_TEMPLATES } from './ResumeTemplateSelector';
import ResumeTemplateRenderer from './ResumeTemplateRenderer';

const TemplateSwitcher = ({ content, personalInfo, onTemplateChange }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(RESUME_TEMPLATES[0]);
  const [showSelector, setShowSelector] = useState(false);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowSelector(false);
    if (onTemplateChange) {
      onTemplateChange(template);
    }
  };

  if (!content) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>🎨</span> Template Preview
          </h3>
          <p className="text-sm text-gray-600">
            Switch between templates to preview your resume
          </p>
        </div>
        <button
          onClick={() => setShowSelector(!showSelector)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium self-start sm:self-auto"
        >
          {showSelector ? 'Hide' : 'Change Template'}
        </button>
      </div>

      {/* Template Selector */}
      {showSelector && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-3">Select Template:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {RESUME_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                  selectedTemplate?.id === template.id
                    ? 'border-purple-600 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{template.preview}</span>
                  <span className="font-semibold text-sm">{template.name}</span>
                </div>
                <p className="text-xs text-gray-600">{template.category}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Template Preview */}
      {selectedTemplate && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span className="text-sm font-medium text-gray-800">
              Current: {selectedTemplate.name}
            </span>
            <span className="text-xs text-gray-500">
              {selectedTemplate.description}
            </span>
          </div>

          {/* Resume Preview */}
          <div className="p-3 sm:p-4 bg-white h-[60vh] sm:h-[75vh] overflow-y-auto rounded-b-lg">
            <div className="w-full sm:w-[100%] md:w-[100%] lg:w-[100%] mx-auto">
              <ResumeTemplateRenderer
                content={content}
                template={selectedTemplate}
                personalInfo={personalInfo}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSwitcher;

