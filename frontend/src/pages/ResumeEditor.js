import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import ATSChecker from '../components/ATSChecker';
import TemplateSwitcher from '../components/TemplateSwitcher';

// Available section types for adding new sections
const SECTION_TYPES = [
  { id: 'summary', label: 'Professional Summary', icon: '📝' },
  { id: 'experience', label: 'Work Experience', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'skills', label: 'Skills', icon: '🛠️' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'certifications', label: 'Certifications', icon: '🏆' },
  { id: 'achievements', label: 'Achievements/Awards', icon: '⭐' },
  { id: 'languages', label: 'Languages', icon: '🌐' },
  { id: 'volunteer', label: 'Volunteer Experience', icon: '🤝' }
];

const ResumeEditor = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [generatingSection, setGeneratingSection] = useState(null);
  const [previewModal, setPreviewModal] = useState(null);
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const fetchResume = useCallback(async () => {
    if (!id || !token) return;
    
    try {
      setFetching(true);
      const response = await axios.get(`${API_URL}/api/resumes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle(response.data.title);
      setContent(response.data.content || '');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load resume');
      console.error('Error fetching resume:', err);
    } finally {
      setFetching(false);
    }
  }, [id, token, API_URL]);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  // Parse markdown to extract basic info
  const extractBasicInfo = () => {
    const lines = content.split('\n');
    const info = {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      portfolio: ''
    };
    
    for (const line of lines) {
      if (line.match(/^#+\s+/)) {
        info.name = line.replace(/^#+\s+/, '').trim();
      }
      if (line.includes('**Email:**') || line.includes('email:')) {
        const emailMatch = line.match(/[\w\.-]+@[\w\.-]+\.\w+/);
        if (emailMatch) info.email = emailMatch[0];
      }
      if (line.includes('**Phone:**') || line.includes('phone:')) {
        const phoneMatch = line.match(/[\d\+\-\(\)\s]+/);
        if (phoneMatch) info.phone = phoneMatch[0].trim();
      }
      if (line.includes('**Location:**') || line.includes('location:')) {
        const locMatch = line.match(/:\s*(.+)/);
        if (locMatch) info.location = locMatch[1].trim();
      }
      if (line.includes('**LinkedIn:**') || line.includes('linkedin:')) {
        const linkedinMatch = line.match(/https?:\/\/[^\s]+/);
        if (linkedinMatch) info.linkedin = linkedinMatch[0];
      }
      if (line.includes('**Portfolio:**') || line.includes('portfolio:')) {
        const portfolioMatch = line.match(/https?:\/\/[^\s]+/);
        if (portfolioMatch) info.portfolio = portfolioMatch[0];
      }
    }
    
    return info;
  };

  // Generate section with AI
  const generateSectionWithAI = async (sectionType, userInput = '') => {
    setGeneratingSection(sectionType);
    setError('');

    try {
      const basicInfo = extractBasicInfo();
      
      // Build context from existing content
      const context = {
        personal_info: basicInfo,
        existing_content: content
      };

      const response = await axios.post(
        `${API_URL}/api/resumes/generate-section`,
        {
          section_type: sectionType,
          context: context,
          user_input: userInput,
          use_openai: useOpenAI
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Show preview modal
      setPreviewModal({
        sectionType: sectionType,
        generatedContent: response.data
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
    
    const sectionType = previewModal.sectionType;
    const generatedContent = previewModal.generatedContent;
    
    // Add as new section to content
    const sectionHeader = `\n## ${SECTION_TYPES.find(s => s.id === sectionType)?.label || sectionType}\n\n`;
    const newContent = content + sectionHeader + generatedContent + '\n\n';
    
    setContent(newContent);
    setPreviewModal(null);
  };

  // Add section manually
  const addSectionManually = (sectionType) => {
    const sectionHeader = `\n## ${SECTION_TYPES.find(s => s.id === sectionType)?.label || sectionType}\n\n`;
    const placeholder = `Add your ${SECTION_TYPES.find(s => s.id === sectionType)?.label.toLowerCase()} content here...\n\n`;
    setContent(content + sectionHeader + placeholder);
    setShowAddSection(false);
  };

  // Handle section suggestion from ATS checker
  const handleSectionSuggestion = (sectionName) => {
    const sectionType = SECTION_TYPES.find(
      s => s.label.toLowerCase().includes(sectionName.toLowerCase()) || 
           s.id === sectionName.toLowerCase()
    );
    if (sectionType) {
      addSectionManually(sectionType.id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.put(
        `${API_URL}/api/resumes/${id}`,
        {
          title: title,
          content: content
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Navigate back to dashboard after successful update
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update resume');
      console.error('Error updating resume:', err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Resume</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Resume Title */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Software Engineer Resume"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Add New Section */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Section</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddSection(!showAddSection)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                  >
                    {showAddSection ? 'Cancel' : '+ Add Section'}
                  </button>
                </div>

                {showAddSection && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-3">
                      Choose a section to add to your resume:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {SECTION_TYPES.map((section) => (
                        <div key={section.id} className="space-y-2">
                          <button
                            type="button"
                            onClick={() => addSectionManually(section.id)}
                            className="w-full text-left p-3 border border-gray-300 rounded-md hover:bg-white hover:border-blue-500 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span>{section.icon}</span>
                              <span className="text-sm font-medium">{section.label}</span>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => generateSectionWithAI(section.id)}
                            disabled={generatingSection === section.id}
                            className="w-full px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 disabled:opacity-50"
                          >
                            {generatingSection === section.id ? 'Generating...' : '🤖 AI Generate'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Resume Content (Markdown) */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Content (Markdown)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="25"
                  placeholder="Enter your resume content in Markdown format..."
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Edit your resume content in Markdown format. Use headers (##), lists (-), and formatting as needed.
                </p>
                
                {/* Preview */}
                {content && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Preview:</h4>
                    <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-96 overflow-y-auto">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Right Panel - ATS Checker & Template Switcher */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <ATSChecker
                resumeContent={content}
                resumeId={id}
                onSectionSuggestionClick={handleSectionSuggestion}
                onContentUpdate={setContent}
                useOpenAI={useOpenAI}
              />
              
              <TemplateSwitcher
                content={content}
                onTemplateChange={(template) => {
                  // Template change is just for preview in this component
                  console.log('Template selected:', template);
                }}
              />
              
              {/* AI Settings */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={useOpenAI}
                    onChange={(e) => setUseOpenAI(e.target.checked)}
                    className="rounded"
                  />
                  <span>Use OpenAI (instead of Groq)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal for AI Generated Content */}
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
                    onChange={(e) => setPreviewModal({
                      ...previewModal,
                      generatedContent: e.target.value
                    })}
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 font-mono text-sm"
                    placeholder="Edit the generated content..."
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setPreviewModal(null)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={acceptGeneratedContent}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                ✓ Accept & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeEditor;
