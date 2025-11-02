import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ResumeTemplateRenderer from '../components/ResumeTemplateRenderer';
import ATSChecker from '../components/ATSChecker';
import TemplateSwitcher from '../components/TemplateSwitcher';
import ResumeCustomizer from '../components/ResumeCustomizer';

const ResumePreview = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const resumeData = JSON.parse(localStorage.getItem('currentResume') || '{}');
  const { title, content, template, personal_info, customization } = resumeData;
  const [currentCustomization, setCurrentCustomization] = React.useState(customization || {});

  const handleSave = async () => {
    if (!title) {
      alert('Please provide a resume title');
      return;
    }

    if (!token) {
      alert('Please login to save resume');
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/resumes/`,
        {
          title,
          content,
          template: resumeData.template || null,
          personal_info: resumeData.personal_info || null,
          customization: currentCustomization || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('Resume saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save resume:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/login');
      } else {
        alert('Failed to save resume: ' + (error.response?.data?.detail || 'Unknown error'));
      }
    }
  };

  const handleDownload = async (format) => {
    if (!title) {
      alert('Please provide a resume title');
      return;
    }

    if (!token) {
      alert('Please login to download resume');
      navigate('/login');
      return;
    }

    try {
      // First save the resume to get an ID (ensure template and customization are included)
      const saveResponse = await axios.post(
        `${API_URL}/api/resumes/`,
        {
          title,
          content,
          template: resumeData.template || { id: 'minimalist-clean', name: 'Minimalist Clean' },
          personal_info: resumeData.personal_info || null,
          customization: currentCustomization || {}
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const resumeId = saveResponse.data.id;

      // Then download
      const response = await axios.get(
        `${API_URL}/api/resumes/${resumeId}/download/${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download resume:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/login');
      } else {
        alert('Failed to download resume: ' + (error.response?.data?.detail || 'Unknown error'));
      }
    }
  };

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No resume to preview</p>
          <button
            onClick={() => navigate('/builder')}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Create Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Resume Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Resume Preview</h1>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                  >
                    Save to Dashboard
                  </button>
                  <button
                    onClick={() => handleDownload('pdf')}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => handleDownload('docx')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                  >
                    Download DOCX
                  </button>
                  <button
                    onClick={() => navigate('/builder')}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Template-based Resume Renderer */}
            {template ? (
              <ResumeTemplateRenderer 
                content={content} 
                template={template}
                personalInfo={personal_info}
                customization={currentCustomization}
              />
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md prose max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Right Panel - Customizer, ATS Checker, and Template Switcher */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Customize Template - Prominently displayed */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>⚙️</span>
                  Template Customization
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Customize colors, layout, and styling. Changes apply to preview and downloads.
                </p>
                <ResumeCustomizer
                  customization={currentCustomization}
                  onCustomizationChange={(newCustomization) => {
                    setCurrentCustomization(newCustomization);
                    const updatedResumeData = {
                      ...resumeData,
                      customization: newCustomization
                    };
                    localStorage.setItem('currentResume', JSON.stringify(updatedResumeData));
                    // Refresh to show updated styling
                    window.location.reload();
                  }}
                />
              </div>
              
              <ATSChecker 
                resumeContent={content}
                onContentUpdate={(updatedContent) => {
                  // Update content in localStorage
                  const updatedResumeData = {
                    ...resumeData,
                    content: updatedContent
                  };
                  localStorage.setItem('currentResume', JSON.stringify(updatedResumeData));
                  window.location.reload(); // Refresh to show updated content
                }}
              />
              
              <TemplateSwitcher
                content={content}
                personalInfo={personal_info}
                onTemplateChange={(newTemplate) => {
                  const updatedResumeData = {
                    ...resumeData,
                    template: newTemplate
                  };
                  localStorage.setItem('currentResume', JSON.stringify(updatedResumeData));
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;

