import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const ImprovementPreviewModal = ({ 
  isOpen, 
  onClose, 
  currentContent, 
  onAccept, 
  useOpenAI = false,
  improvementType = 'all' // 'all', 'issues', 'suggestions'
}) => {
  const [loading, setLoading] = useState(false);
  const [improvedContent, setImprovedContent] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('comparison'); // 'comparison', 'before', 'after'
  const { token } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (isOpen && currentContent) {
      fetchImprovedContent();
    } else {
      setImprovedContent('');
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchImprovedContent = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${API_URL}/api/resumes/improve`,
        {
          content: currentContent,
          use_openai: useOpenAI
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setImprovedContent(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate preview');
      console.error('Error fetching improved content:', err);
    } finally {
      setLoading(false);
    }
  };

  const getChanges = () => {
    if (!improvedContent || !currentContent) return { added: [], removed: [] };
    
    const currentLines = currentContent.split('\n');
    const improvedLines = improvedContent.split('\n');
    const changes = [];
    
    // Simple diff algorithm - compare line by line
    const maxLen = Math.max(currentLines.length, improvedLines.length);
    
    for (let i = 0; i < maxLen; i++) {
      const currentLine = currentLines[i] || '';
      const improvedLine = improvedLines[i] || '';
      
      if (currentLine !== improvedLine) {
        if (currentLine && !improvedLine) {
          changes.push({ type: 'removed', line: currentLine, index: i });
        } else if (!currentLine && improvedLine) {
          changes.push({ type: 'added', line: improvedLine, index: i });
        } else {
          changes.push({ 
            type: 'modified', 
            before: currentLine, 
            after: improvedLine, 
            index: i 
          });
        }
      }
    }
    
    return changes;
  };

  const handleAccept = () => {
    if (improvedContent && onAccept) {
      onAccept(improvedContent);
    }
    onClose();
  };

  if (!isOpen) return null;

  const changes = getChanges();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Preview Improvements
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Review the changes that will be made to your resume before applying them
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

        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex space-x-1 px-6">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'comparison'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Comparison View
            </button>
            <button
              onClick={() => setActiveTab('before')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'before'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Before
            </button>
            <button
              onClick={() => setActiveTab('after')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'after'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              After
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing and improving your resume...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!loading && !error && improvedContent && (
            <>
              {activeTab === 'comparison' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>📊 Summary:</strong> {changes.length} change{changes.length !== 1 ? 's' : ''} detected
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before Column */}
                    <div className="border border-gray-300 rounded-lg">
                      <div className="bg-red-50 border-b border-gray-300 px-4 py-2">
                        <h4 className="font-semibold text-red-800 text-sm">Before (Current)</h4>
                      </div>
                      <div className="p-4 bg-gray-50 max-h-96 overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{currentContent}</ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    {/* After Column */}
                    <div className="border border-gray-300 rounded-lg">
                      <div className="bg-green-50 border-b border-gray-300 px-4 py-2">
                        <h4 className="font-semibold text-green-800 text-sm">After (Improved)</h4>
                      </div>
                      <div className="p-4 bg-gray-50 max-h-96 overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{improvedContent}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Changes */}
                  {changes.length > 0 && (
                    <div className="mt-6 border border-gray-200 rounded-lg">
                      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
                        <h4 className="font-semibold text-gray-800 text-sm">Detailed Changes</h4>
                      </div>
                      <div className="p-4 max-h-64 overflow-y-auto">
                        <div className="space-y-2">
                          {changes.slice(0, 20).map((change, idx) => (
                            <div key={idx} className="text-xs font-mono">
                              {change.type === 'added' && (
                                <div className="bg-green-50 border-l-4 border-green-500 p-2">
                                  <span className="text-green-700">+ {change.line}</span>
                                </div>
                              )}
                              {change.type === 'removed' && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-2">
                                  <span className="text-red-700">- {change.line}</span>
                                </div>
                              )}
                              {change.type === 'modified' && (
                                <div className="space-y-1">
                                  <div className="bg-red-50 border-l-4 border-red-500 p-2">
                                    <span className="text-red-700">- {change.before}</span>
                                  </div>
                                  <div className="bg-green-50 border-l-4 border-green-500 p-2">
                                    <span className="text-green-700">+ {change.after}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          {changes.length > 20 && (
                            <p className="text-xs text-gray-500 mt-2">
                              ... and {changes.length - 20} more changes
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'before' && (
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Current Resume</h4>
                  <div className="prose max-w-none">
                    <ReactMarkdown>{currentContent}</ReactMarkdown>
                  </div>
                </div>
              )}

              {activeTab === 'after' && (
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Improved Resume</h4>
                  <div className="prose max-w-none">
                    <ReactMarkdown>{improvedContent}</ReactMarkdown>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {!loading && improvedContent && (
              <span>
                Ready to apply {changes.length} improvement{changes.length !== 1 ? 's' : ''}
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
              disabled={loading || !improvedContent}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Accept & Apply Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovementPreviewModal;

