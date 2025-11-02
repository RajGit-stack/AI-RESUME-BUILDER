import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import ResumeTemplateSelector, { RESUME_TEMPLATES } from '../components/ResumeTemplateSelector';
import ATSChecker from '../components/ATSChecker';
import ResumeTemplateRenderer from '../components/ResumeTemplateRenderer';
import TemplateSwitcher from '../components/TemplateSwitcher';

const ResumeUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [parsedContent, setParsedContent] = useState('');
  const [filename, setFilename] = useState('');
  const [title, setTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(fileExtension)) {
      setError('Please upload a PDF or DOCX file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_URL}/api/resumes/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setParsedContent(response.data.content);
      setFilename(response.data.filename);
      setTitle(file.name.replace(/\.(pdf|docx)$/i, ''));
      setSuccess('Resume uploaded and parsed successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload and parse resume');
      console.error('Error uploading resume:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please provide a resume title');
      return;
    }

    if (!parsedContent.trim()) {
      setError('No content to save');
      return;
    }

    if (!token) {
      setError('Please login to save resume');
      navigate('/login');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await axios.post(
        `${API_URL}/api/resumes/`,
        {
          title: title,
          content: parsedContent
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Resume saved successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save resume');
      console.error('Error saving resume:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!parsedContent.trim()) {
      setError('No content to preview');
      return;
    }
    setShowPreview(true);
  };

  const handleDownload = async (format) => {
    if (!title.trim()) {
      setError('Please provide a resume title');
      return;
    }

    if (!token) {
      setError('Please login to download resume');
      navigate('/login');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // First save the resume to get an ID
      const saveResponse = await axios.post(
        `${API_URL}/api/resumes/`,
        {
          title: title,
          content: parsedContent
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
      window.URL.revokeObjectURL(url);

      // Ask user if they want to keep the saved resume or delete it
      const keepSaved = window.confirm('Resume downloaded successfully! Do you want to keep it saved in your dashboard?');
      
      if (!keepSaved) {
        // Clean up - remove the temporary saved resume
        await axios.delete(`${API_URL}/api/resumes/${resumeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Keep it saved, navigate to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to download resume');
      console.error('Error downloading resume:', err);
    } finally {
      setSaving(false);
    }
  };

  if (showPreview && parsedContent) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">Resume Preview</h1>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setShowPreview(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
                    >
                      Back to Edit
                    </button>
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
                  </div>
                </div>
              </div>

              {/* Template-based Resume Renderer */}
              {selectedTemplate ? (
                <ResumeTemplateRenderer
                  content={parsedContent}
                  template={selectedTemplate}
                />
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-md prose max-w-none">
                  <ReactMarkdown>{parsedContent}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Right Panel - ATS Checker */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <ATSChecker resumeContent={parsedContent} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload & Edit Resume</h1>
          <p className="text-gray-600">
            Upload your existing resume (PDF or DOCX) to edit, change template, and download
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            {!parsedContent && (
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                  <div className="mb-6">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Upload Your Resume
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Upload a PDF or DOCX file (max 10MB)
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <span className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
                      {uploading ? 'Uploading...' : 'Choose File'}
                    </span>
                  </label>
                  {uploading && (
                    <div className="mt-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Editor */}
            {parsedContent && (
              <>
                {/* Resume Title */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., My Resume"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Content Editor */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Resume Content (Editable)
                    </label>
                    <button
                      onClick={() => setParsedContent('')}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear & Upload New
                    </button>
                  </div>
                  <textarea
                    value={parsedContent}
                    onChange={(e) => setParsedContent(e.target.value)}
                    rows="25"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                    placeholder="Your resume content will appear here..."
                  />

                  {/* Preview */}
                  {parsedContent && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Preview:</h4>
                      <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-96 overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{parsedContent}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={handlePreview}
                      className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium"
                    >
                      Preview with Template
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !title.trim()}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {saving ? 'Saving...' : 'Save to Dashboard'}
                    </button>
                    <button
                      onClick={() => handleDownload('pdf')}
                      disabled={!title.trim()}
                      className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={() => handleDownload('docx')}
                      disabled={!title.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Download DOCX
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-1 space-y-6">
            {parsedContent && (
              <>
                {/* Template Selection */}
                <ResumeTemplateSelector
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={setSelectedTemplate}
                />

                {/* ATS Checker */}
                <ATSChecker 
                  resumeContent={parsedContent}
                  onContentUpdate={setParsedContent}
                />

                {/* Template Switcher */}
                <TemplateSwitcher
                  content={parsedContent}
                  onTemplateChange={(template) => {
                    setSelectedTemplate(template);
                  }}
                />
              </>
            )}

            {!parsedContent && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Instructions</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">1.</span>
                    <span>Upload your PDF or DOCX resume file</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">2.</span>
                    <span>Edit the parsed content if needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">3.</span>
                    <span>Select a template for styling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">4.</span>
                    <span>Check ATS compatibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">5.</span>
                    <span>Save or download your updated resume</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;

