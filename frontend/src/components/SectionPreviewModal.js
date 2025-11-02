import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const SectionPreviewModal = ({ 
  isOpen, 
  onClose, 
  sectionName, 
  sectionDescription,
  currentContent,
  onAccept,
  useOpenAI = false
}) => {
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState('');
  const { token } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (isOpen && sectionName && currentContent) {
      generateSection();
    } else {
      setGeneratedContent('');
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sectionName]);

  const generateSection = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Map section names to section types
      const sectionTypeMap = {
        'Projects': 'projects',
        'Certifications': 'certifications',
        'Achievements/Awards': 'achievements',
        'Languages': 'languages',
        'Volunteer Experience': 'volunteer'
      };

      const sectionType = sectionTypeMap[sectionName] || sectionName.toLowerCase().replace(/\s+/g, '_');

      // Extract basic info from current content
      const lines = currentContent.split('\n');
      const basicInfo = {
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        portfolio: ''
      };
      
      for (const line of lines) {
        if (line.match(/^#+\s+/)) {
          basicInfo.name = line.replace(/^#+\s+/, '').trim();
        }
        if (line.includes('**Email:**') || line.includes('email:')) {
          const emailMatch = line.match(/[\w\.-]+@[\w\.-]+\.\w+/);
          if (emailMatch) basicInfo.email = emailMatch[0];
        }
        if (line.includes('**Phone:**') || line.includes('phone:')) {
          const phoneMatch = line.match(/[\d\+\-\(\)\s]+/);
          if (phoneMatch) basicInfo.phone = phoneMatch[0].trim();
        }
        if (line.includes('**Location:**') || line.includes('location:')) {
          const locMatch = line.match(/:\s*(.+)/);
          if (locMatch) basicInfo.location = locMatch[1].trim();
        }
      }

      // Build context from existing resume
      const context = {
        personal_info: basicInfo,
        existing_content: currentContent
      };

      const response = await axios.post(
        `${API_URL}/api/resumes/generate-section`,
        {
          section_type: sectionType,
          context: context,
          user_input: `Generate a ${sectionName} section that would improve ATS compatibility. ${sectionDescription || ''}`,
          use_openai: useOpenAI
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setGeneratedContent(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate section');
      console.error('Error generating section:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (generatedContent && onAccept) {
      // Format the section for adding to resume
      const sectionHeader = `\n## ${sectionName}\n\n`;
      const formattedContent = sectionHeader + generatedContent + '\n\n';
      onAccept(formattedContent);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Preview Section: {sectionName}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {sectionDescription || 'Review the generated section before adding it to your resume'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating {sectionName} section...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!loading && !error && generatedContent && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-purple-800">
                  <strong>📝 Preview:</strong> This is how the {sectionName} section will appear in your resume.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Markdown Preview */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                    <span>👁️</span>
                    Visual Preview
                  </h4>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{generatedContent}</ReactMarkdown>
                  </div>
                </div>
                
                {/* Editable Content */}
                <div>
                  <h4 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                    <span>✏️</span>
                    Edit Before Adding (Optional)
                  </h4>
                  <textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 font-mono text-sm"
                    placeholder="You can edit the generated content before adding..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Make any changes you want before adding this section to your resume.
                  </p>
                </div>
              </div>

              {/* How it will appear in resume */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">How it will appear:</h4>
                <div className="bg-white p-3 rounded border border-blue-300">
                  <div className="prose prose-sm max-w-none">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">{sectionName}</h2>
                    <ReactMarkdown>{generatedContent}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {!loading && generatedContent && (
              <span>
                Ready to add <strong>{sectionName}</strong> section to your resume
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              disabled={loading || !generatedContent}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Generating...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Add to Resume
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionPreviewModal;


