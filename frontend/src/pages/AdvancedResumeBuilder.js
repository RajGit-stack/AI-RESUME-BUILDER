import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import ResumeTemplateSelector, { RESUME_TEMPLATES } from '../components/ResumeTemplateSelector';

// Available section types
const SECTION_TYPES = [
  { id: 'summary', label: 'Professional Summary', icon: '📝' },
  { id: 'experience', label: 'Work Experience', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'skills', label: 'Skills', icon: '🛠️' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'certifications', label: 'Certifications', icon: '🏆' },
  { id: 'achievements', label: 'Achievements/Awards', icon: '⭐' },
  { id: 'languages', label: 'Languages', icon: '🌐' }
];

const AdvancedResumeBuilder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatingSection, setGeneratingSection] = useState(null);
  const [previewModal, setPreviewModal] = useState(null); // { sectionId, generatedContent }
  const { token } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const [useOpenAI, setUseOpenAI] = useState(false);

  // Basic info (minimal input)
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: ''
  });

  // Selected template
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Dynamic sections
  const [sections, setSections] = useState([]);
  const [resumeTitle, setResumeTitle] = useState('');

  // Handle basic info changes
  const handleBasicInfoChange = (field, value) => {
    setBasicInfo({ ...basicInfo, [field]: value });
  };

  // Add a new section
  const addSection = (sectionType) => {
    const newSection = {
      id: Date.now().toString(),
      type: sectionType,
      content: '',
      isAIGenerated: false,
      userInput: ''
    };
    setSections([...sections, newSection]);
  };

  // Remove a section
  const removeSection = (sectionId) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  // Update section content
  const updateSectionContent = (sectionId, content) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, content } : s
    ));
  };

  // Update section user input
  const updateSectionInput = (sectionId, userInput) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, userInput } : s
    ));
  };

  // Generate section with AI
  const generateSectionWithAI = async (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    setGeneratingSection(sectionId);
    setError('');

    try {
      // Build context from existing data
      const context = {
        personal_info: basicInfo,
        summary: sections.find(s => s.type === 'summary')?.content || '',
        experience: sections.filter(s => s.type === 'experience').map(s => ({ description: s.content })),
        education: sections.filter(s => s.type === 'education').map(s => ({ description: s.content })),
        skills: sections.filter(s => s.type === 'skills').map(s => s.content.split(',').map(skill => skill.trim()))
      };

      const response = await axios.post(
        `${API_URL}/api/resumes/generate-section`,
        {
          section_type: section.type,
          context: context,
          user_input: section.userInput || undefined,
          use_openai: useOpenAI
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Show preview modal instead of directly updating
      setPreviewModal({
        sectionId: sectionId,
        generatedContent: response.data,
        sectionType: section.type
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate section');
      console.error('Error generating section:', err);
    } finally {
      setGeneratingSection(null);
    }
  };

  // Accept generated content
  const acceptGeneratedContent = () => {
    if (!previewModal) return;
    
    // Update section content and mark as AI generated
    setSections(prevSections => 
      prevSections.map(s => 
        s.id === previewModal.sectionId 
          ? { ...s, content: previewModal.generatedContent, isAIGenerated: true }
          : s
      )
    );
    setPreviewModal(null);
  };

  // Reject generated content
  const rejectGeneratedContent = () => {
    setPreviewModal(null);
  };

  // Edit generated content before accepting
  const editGeneratedContent = (editedContent) => {
    setPreviewModal({
      ...previewModal,
      generatedContent: editedContent
    });
  };

  // Generate complete resume
  const generateCompleteResume = async () => {
    if (!resumeTitle) {
      setError('Please enter a resume title');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Build resume data from sections
      const resumeData = {
        personal_info: basicInfo,
        summary: sections.find(s => s.type === 'summary')?.content || '',
        education: sections.filter(s => s.type === 'education').map(s => ({
          description: s.content
        })),
        experience: sections.filter(s => s.type === 'experience').map(s => ({
          description: s.content
        })),
        skills: sections.filter(s => s.type === 'skills').flatMap(s => 
          s.content.split(',').map(skill => skill.trim()).filter(skill => skill)
        ),
        certifications: sections.filter(s => s.type === 'certifications').map(s => ({
          description: s.content
        })),
        languages: sections.filter(s => s.type === 'languages').map(s => ({
          description: s.content
        }))
      };

      // Combine all sections into markdown
      let markdownContent = `# ${basicInfo.name || 'Resume'}\n\n`;
      if (basicInfo.email) markdownContent += `**Email:** ${basicInfo.email}\n`;
      if (basicInfo.phone) markdownContent += `**Phone:** ${basicInfo.phone}\n`;
      if (basicInfo.location) markdownContent += `**Location:** ${basicInfo.location}\n`;
      if (basicInfo.linkedin) markdownContent += `**LinkedIn:** ${basicInfo.linkedin}\n`;
      if (basicInfo.portfolio) markdownContent += `**Portfolio:** ${basicInfo.portfolio}\n\n`;

      // Add sections in order
      sections.forEach(section => {
        if (section.content) {
          const sectionLabels = {
            summary: '## Professional Summary',
            experience: '## Professional Experience',
            education: '## Education',
            skills: '## Technical Skills',
            projects: '## Projects',
            certifications: '## Certifications',
            achievements: '## Achievements & Awards',
            languages: '## Languages'
          };
          markdownContent += `\n${sectionLabels[section.type] || `## ${section.type}`}\n\n${section.content}\n\n`;
        }
      });

      // Store in localStorage for preview with selected template
      localStorage.setItem('currentResume', JSON.stringify({
        title: resumeTitle,
        content: markdownContent,
        template: selectedTemplate || { id: 'minimalist-clean', name: 'Minimalist Clean' },
        personal_info: basicInfo,
        sections: sections.map(s => ({
          type: s.type,
          content: s.content,
          isAIGenerated: s.isAIGenerated
        }))
      }));

      navigate('/preview');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate resume');
      console.error('Error generating resume:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      {/* Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  AI Generated Preview
                </h3>
                <button
                  onClick={() => setPreviewModal(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Review the AI-generated content. You can edit it before accepting.
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Markdown Preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-gray-700">Preview</h4>
                  <div className="prose max-w-none text-sm">
                    <ReactMarkdown>{previewModal.generatedContent}</ReactMarkdown>
                  </div>
                </div>
                
                {/* Editable Content */}
                <div>
                  <h4 className="font-semibold mb-3 text-gray-700">Edit Content</h4>
                  <textarea
                    value={previewModal.generatedContent}
                    onChange={(e) => editGeneratedContent(e.target.value)}
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 font-mono text-sm"
                    placeholder="Edit the generated content..."
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={rejectGeneratedContent}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={acceptGeneratedContent}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                ✓ Accept & Use
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI-Powered Resume Builder
          </h1>
          <p className="text-gray-600">
            Start with minimal input, add sections dynamically, and let AI enhance your resume
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={basicInfo.name}
                  onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={basicInfo.email}
                  onChange={(e) => handleBasicInfoChange('email', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={basicInfo.phone}
                  onChange={(e) => handleBasicInfoChange('phone', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={basicInfo.location}
                  onChange={(e) => handleBasicInfoChange('location', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                />
                <input
                  type="url"
                  placeholder="LinkedIn URL"
                  value={basicInfo.linkedin}
                  onChange={(e) => handleBasicInfoChange('linkedin', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                />
                <input
                  type="url"
                  placeholder="Portfolio URL"
                  value={basicInfo.portfolio}
                  onChange={(e) => handleBasicInfoChange('portfolio', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Resume Title & Template Selection */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume Title
              </label>
              <input
                type="text"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                placeholder="e.g., Software Engineer Resume"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 mb-4"
              />
              {selectedTemplate && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Template:</span> {selectedTemplate.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{selectedTemplate.description}</p>
                </div>
              )}
            </div>

            {/* Dynamic Sections */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Sections</h2>
                <div className="text-sm text-gray-500">
                  {sections.length} section{sections.length !== 1 ? 's' : ''} added
                </div>
              </div>

              {/* Add Section Dropdown */}
              <div className="mb-4">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addSection(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                >
                  <option value="">+ Add Section</option>
                  {SECTION_TYPES.filter(st => !sections.some(s => s.type === st.id)).map(st => (
                    <option key={st.id} value={st.id}>
                      {st.icon} {st.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section List */}
              <div className="space-y-4">
                {sections.map((section) => {
                  const sectionType = SECTION_TYPES.find(st => st.id === section.type);
                  return (
                    <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <span>{sectionType?.icon}</span>
                          {sectionType?.label}
                        </h3>
                        <button
                          onClick={() => removeSection(section.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* AI Generation Section */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🤖</span>
                            <span className="font-medium text-sm text-gray-700">AI Generation</span>
                          </div>
                          <textarea
                            value={section.userInput}
                            onChange={(e) => updateSectionInput(section.id, e.target.value)}
                            placeholder={`Tell AI what you want (e.g., "5 years of software development experience")`}
                            rows="2"
                            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-blue-500 text-sm mb-2"
                          />
                          <button
                            onClick={() => generateSectionWithAI(section.id)}
                            disabled={generatingSection === section.id || !basicInfo.name}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
                          >
                            {generatingSection === section.id ? (
                              <>
                                <span className="animate-spin">⏳</span>
                                Generating...
                              </>
                            ) : (
                              <>
                                <span>✨</span>
                                Generate with AI
                              </>
                            )}
                          </button>
                        </div>

                        {/* Manual Entry Section */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">
                              {section.content ? 'Edit Content' : 'Enter Content Manually'}
                            </label>
                            {section.isAIGenerated && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                ✓ AI Generated
                              </span>
                            )}
                          </div>
                          <textarea
                            value={section.content}
                            onChange={(e) => updateSectionContent(section.id, e.target.value)}
                            placeholder={section.content 
                              ? 'Edit your content here...' 
                              : `Or type ${sectionType?.label.toLowerCase()} content manually here...`}
                            rows={section.type === 'skills' ? 4 : 8}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 font-mono text-sm"
                          />
                          {section.content && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-xs font-medium text-gray-600 mb-2">Preview:</p>
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown>{section.content}</ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {sections.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No sections added yet. Use the dropdown above to add sections.</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Settings */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useOpenAI}
                  onChange={(e) => setUseOpenAI(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  Use OpenAI (default: Groq - Free)
                </span>
              </label>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateCompleteResume}
              disabled={loading || !resumeTitle || sections.length === 0}
              className="w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {loading ? 'Generating Resume...' : 'Generate Complete Resume'}
            </button>
          </div>

          {/* Right Panel - Template Selection */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <ResumeTemplateSelector
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedResumeBuilder;

