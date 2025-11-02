import React, { useState } from 'react';

const RESUME_TEMPLATES = [
  { 
    id: 'professional-classic', 
    name: 'Professional Classic', 
    description: 'Traditional two-column layout perfect for corporate roles',
    category: 'Corporate',
    color: '#2563eb',
    layout: 'two-column',
    preview: '📄'
  },
  { 
    id: 'modern-executive', 
    name: 'Modern Executive', 
    description: 'Clean single-column design with strong typography',
    category: 'Executive',
    color: '#059669',
    layout: 'single-column',
    preview: '📋'
  },
  { 
    id: 'creative-professional', 
    name: 'Creative Professional', 
    description: 'Bold design with accent colors for creative industries',
    category: 'Creative',
    color: '#dc2626',
    layout: 'creative',
    preview: '🎨'
  },
  { 
    id: 'minimalist-clean', 
    name: 'Minimalist Clean', 
    description: 'Simple and focused - perfect for ATS scanning',
    category: 'Minimal',
    color: '#475569',
    layout: 'minimal',
    preview: '✨'
  },
  { 
    id: 'chronological-standard', 
    name: 'Chronological Standard', 
    description: 'Time-based layout highlighting career progression',
    category: 'Traditional',
    color: '#7c3aed',
    layout: 'chronological',
    preview: '📅'
  },
  { 
    id: 'functional-skill-based', 
    name: 'Functional Skill-Based', 
    description: 'Emphasizes skills and achievements over timeline',
    category: 'Functional',
    color: '#ea580c',
    layout: 'functional',
    preview: '💼'
  },
  { 
    id: 'hybrid-balanced', 
    name: 'Hybrid Balanced', 
    description: 'Combines chronological and functional approaches',
    category: 'Hybrid',
    color: '#0891b2',
    layout: 'hybrid',
    preview: '⚖️'
  },
  { 
    id: 'tech-focused', 
    name: 'Tech Focused', 
    description: 'Optimized for technical roles and developers',
    category: 'Technical',
    color: '#0d9488',
    layout: 'tech',
    preview: '💻'
  },
  { 
    id: 'academic-research', 
    name: 'Academic Research', 
    description: 'Ideal for researchers, academics, and PhD candidates',
    category: 'Academic',
    color: '#be185d',
    layout: 'academic',
    preview: '🎓'
  },
  { 
    id: 'executive-cv', 
    name: 'Executive CV', 
    description: 'Premium layout for senior executives and C-suite',
    category: 'Executive',
    color: '#92400e',
    layout: 'executive',
    preview: '👔'
  }
];

const ResumeTemplateSelector = ({ selectedTemplate, onSelectTemplate }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedTemplates = showAll ? RESUME_TEMPLATES : RESUME_TEMPLATES.slice(0, 6);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Choose Resume Template</h2>
        {!showAll && RESUME_TEMPLATES.length > 6 && (
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
          >
            View All ({RESUME_TEMPLATES.length})
          </button>
        )}
      </div>
      
      <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
        {displayedTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
              selectedTemplate?.id === template.id
                ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{template.preview}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-gray-900 text-sm">{template.name}</h3>
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full text-white flex-shrink-0"
                    style={{ backgroundColor: template.color }}
                  >
                    {template.category}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{template.description}</p>
              </div>
            </div>
            {selectedTemplate?.id === template.id && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                  <span>✓</span> Selected
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
      
      {showAll && RESUME_TEMPLATES.length > 6 && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700 w-full font-medium"
        >
          Show Less
        </button>
      )}
      
      {selectedTemplate && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-700 leading-relaxed">
            <span className="font-semibold">Selected:</span> {selectedTemplate.name}
          </p>
          <p className="text-xs text-gray-600 mt-1">{selectedTemplate.description}</p>
        </div>
      )}
    </div>
  );
};

export default ResumeTemplateSelector;
export { RESUME_TEMPLATES };

