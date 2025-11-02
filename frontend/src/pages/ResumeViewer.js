import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ResumeTemplateRenderer from '../components/ResumeTemplateRenderer';
import ATSChecker from '../components/ATSChecker';
import TemplateSwitcher from '../components/TemplateSwitcher';

const ResumeViewer = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [template, setTemplate] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const fetchResume = useCallback(async () => {
    if (!id || !token) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/resumes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle(response.data.title);
      setContent(response.data.content || '');
      // Try to get template info from resume metadata if available
      // For now, use default template
      setTemplate({ id: 'minimalist-clean', name: 'Minimalist Clean' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load resume');
      console.error('Error fetching resume:', err);
    } finally {
      setLoading(false);
    }
  }, [id, token, API_URL]);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  const handleDownload = async (format) => {
    if (!id || !token) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/resumes/${id}/download/${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title || 'resume'}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download resume:', err);
      alert('Failed to download resume');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No resume content to display</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Resume Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{title || 'Resume'}</h1>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => navigate(`/edit/${id}`)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                  >
                    Edit
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
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>

            {/* Template-based Resume Renderer */}
            {template ? (
              <ResumeTemplateRenderer 
                content={content} 
                template={template}
              />
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md prose max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Right Panel - ATS Checker & Template Switcher */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <ATSChecker 
                resumeContent={content} 
                resumeId={id}
                onContentUpdate={(updatedContent) => {
                  setContent(updatedContent);
                  // Optionally auto-save or prompt user to save
                }}
              />
              
              <TemplateSwitcher
                content={content}
                onTemplateChange={(newTemplate) => {
                  setTemplate(newTemplate);
                }}
              />
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h4 className="font-semibold text-gray-700 mb-3">Quick Actions</h4>
                <button
                  onClick={() => navigate(`/edit/${id}`)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mb-2 text-sm font-medium"
                >
                  Edit Resume
                </button>
                <p className="text-xs text-gray-600 mt-2">
                  Switch templates above to preview different styles with the same content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeViewer;

