import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ImprovementPreviewModal from './ImprovementPreviewModal';
import SectionPreviewModal from './SectionPreviewModal';

const ATSChecker = ({ resumeContent, resumeId, onSectionSuggestionClick, onContentUpdate, useOpenAI = false }) => {
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);
  const [atsData, setAtsData] = useState(null);
  const [error, setError] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewType, setPreviewType] = useState('all'); // 'all', 'issues', 'suggestions'
  const [showSectionPreview, setShowSectionPreview] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null); // {name, description}
  const { token } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const checkATS = async () => {
    setLoading(true);
    setError('');
    
    try {
      let response;
      if (resumeId) {
        // Check saved resume
        response = await axios.get(`${API_URL}/api/resumes/${resumeId}/check-ats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Check content directly
        response = await axios.post(
          `${API_URL}/api/resumes/check-ats`,
          { content: resumeContent },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      setAtsData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to check ATS compatibility');
      console.error('Error checking ATS:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowPreview = (type = 'all') => {
    setPreviewType(type);
    setShowPreviewModal(true);
  };

  const handleAcceptImprovements = (improvedContent) => {
    if (!improvedContent || !onContentUpdate) return;
    
    setImproving(true);
    
    // Update the content via callback
    onContentUpdate(improvedContent);
    
    // Re-check ATS score to show improvements
    setTimeout(() => {
      checkATS();
      setImproving(false);
    }, 500);
  };

  const handleSectionSuggestionClick = (sectionName, sectionDescription) => {
    setSelectedSection({ name: sectionName, description: sectionDescription });
    setShowSectionPreview(true);
  };

  const handleAcceptSection = (sectionContent) => {
    if (!sectionContent || !onContentUpdate || !resumeContent) return;
    
    const sectionName = selectedSection?.name;
    
    // Immediately remove the section from suggestions (optimistic update)
    if (atsData && atsData.section_suggestions && sectionName) {
      setAtsData(prevData => ({
        ...prevData,
        section_suggestions: prevData.section_suggestions.filter(
          s => s.section !== sectionName
        )
      }));
    }
    
    // Append the section content to existing resume
    const updatedContent = resumeContent + '\n' + sectionContent;
    onContentUpdate(updatedContent);
    
    // Re-check ATS score after a short delay with updated content
    setTimeout(() => {
      // Check ATS with the updated content to get fresh suggestions
      axios.post(
        `${API_URL}/api/resumes/check-ats`,
        { content: updatedContent },
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(response => {
        setAtsData(response.data);
      }).catch(err => {
        console.error('Error re-checking ATS:', err);
      });
    }, 800);
    
    setShowSectionPreview(false);
    setSelectedSection(null);
  };

  // Filter out sections that already exist in the resume
  const filterExistingSections = (suggestions) => {
    if (!suggestions || !resumeContent) return suggestions;
    
    const contentLower = resumeContent.toLowerCase();
    
    return suggestions.filter(suggestion => {
      const sectionName = suggestion.section.toLowerCase();
      const sectionKey = sectionName.split('/')[0].trim(); // Handle "Achievements/Awards"
      
      // Section name mappings for better detection
      const sectionMappings = {
        'projects': ['project', 'projects'],
        'certifications': ['certification', 'certificate', 'certifications'],
        'achievements': ['achievement', 'achievements', 'award', 'awards'],
        'achievements/awards': ['achievement', 'achievements', 'award', 'awards'],
        'languages': ['language', 'languages', 'linguistic'],
        'volunteer experience': ['volunteer', 'volunteering', 'volunteer experience'],
        'volunteer': ['volunteer', 'volunteering', 'volunteer experience']
      };
      
      // Get patterns for this section
      const patterns = sectionMappings[sectionKey] || sectionMappings[sectionName] || [sectionKey];
      
      // Check if section header already exists
      const headerPatterns = [
        `## ${sectionName}`,
        `## ${sectionKey}`,
        `### ${sectionName}`,
        `### ${sectionKey}`
      ];
      
      // Check for exact section headers
      const hasExactHeader = headerPatterns.some(header => 
        contentLower.includes(header.toLowerCase())
      );
      
      if (hasExactHeader) return false;
      
      // Check for section patterns in content
      const hasPattern = patterns.some(pattern => {
        // Check for section headers with this pattern
        const patternHeader1 = `## ${pattern}`;
        const patternHeader2 = `### ${pattern}`;
        return contentLower.includes(patternHeader1.toLowerCase()) || 
               contentLower.includes(patternHeader2.toLowerCase());
      });
      
      return !hasPattern;
    });
  };

  const applyImprovements = async () => {
    // This is now just an alias for showing preview
    handleShowPreview('all');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800 border-green-300';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span>🔍</span>
            ATS Compatibility Check
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Analyze your resume for Applicant Tracking System compatibility
          </p>
        </div>
        <button
          onClick={checkATS}
          disabled={loading || !resumeContent}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Checking...' : 'Check ATS Score'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {atsData && (
        <div className="space-y-6">
          {/* Score Display */}
          <div className="border-2 rounded-lg p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center justify-center gap-4">
              <div>
                <div className={`text-5xl font-bold ${getScoreColor(atsData.score)}`}>
                  {atsData.score}
                </div>
                <div className="text-sm text-gray-600 mt-1">ATS Score</div>
              </div>
              <div className="h-20 w-px bg-gray-300"></div>
              <div>
                <div className={`text-4xl font-bold px-4 py-2 rounded-lg border-2 ${getGradeColor(atsData.grade)}`}>
                  {atsData.grade}
                </div>
                <div className="text-sm text-gray-600 mt-1">Grade</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    atsData.score >= 80 ? 'bg-green-500' :
                    atsData.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${atsData.score}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Strengths */}
          {atsData.strengths && atsData.strengths.length > 0 && (
            <div>
              <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                <span>✓</span> Strengths
              </h4>
              <ul className="space-y-1">
                {atsData.strengths.map((strength, idx) => (
                  <li key={idx} className="text-sm text-gray-700 bg-green-50 p-2 rounded">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Issues */}
          {atsData.issues && atsData.issues.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-red-700 flex items-center gap-2">
                  <span>⚠️</span> Issues Found
                </h4>
                {onContentUpdate && (
                  <button
                    onClick={() => handleShowPreview('issues')}
                    disabled={improving}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-1"
                  >
                    <span>👁️</span>
                    Preview Fix
                  </button>
                )}
              </div>
              <ul className="space-y-1">
                {atsData.issues.map((issue, idx) => (
                  <li key={idx} className="text-sm text-gray-700 bg-red-50 p-2 rounded">
                    {issue}
                  </li>
                ))}
              </ul>
              {onContentUpdate && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>💡</strong> Click "Preview Fix" above to see what changes will be made to fix these issues before applying them.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Suggestions */}
          {atsData.suggestions && atsData.suggestions.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                  <span>💡</span> Improvement Suggestions
                </h4>
                {onContentUpdate && (
                  <button
                    onClick={() => handleShowPreview('suggestions')}
                    disabled={improving}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                  >
                    <span>👁️</span>
                    Preview Changes
                  </button>
                )}
              </div>
              <ul className="space-y-1">
                {atsData.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                    {suggestion}
                  </li>
                ))}
              </ul>
              {onContentUpdate && atsData.score < 80 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>💡 Tip:</strong> Click "Preview Changes" above to see what improvements will be made before applying them to your resume.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Fix Summary */}
          {atsData.issues && atsData.issues.length > 0 && onContentUpdate && (
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-800 mb-1 flex items-center gap-2">
                    <span>🚀</span>
                    Quick Fix Available
                  </h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    Found {atsData.issues.length} issue{atsData.issues.length > 1 ? 's' : ''}. Preview the fixes before applying them.
                  </p>
                  <p className="text-xs text-yellow-600">
                    💡 Click below to see exactly what will change
                  </p>
                </div>
                <button
                  onClick={() => handleShowPreview('issues')}
                  disabled={improving}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap flex items-center gap-2"
                >
                  <span>👁️</span>
                  Preview & Fix
                </button>
              </div>
            </div>
          )}

          {/* Section Suggestions */}
          {atsData.section_suggestions && filterExistingSections(atsData.section_suggestions).length > 0 && (
            <div>
              <h4 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                <span>➕</span> Recommended Sections to Add
              </h4>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                <p className="text-xs text-purple-800">
                  <strong>💡</strong> Click any section below to preview it before adding to your resume.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filterExistingSections(atsData.section_suggestions).map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="border border-purple-200 rounded-lg p-4 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
                    onClick={() => handleSectionSuggestionClick(suggestion.section, suggestion.description)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-purple-900 flex-1">
                        {suggestion.section}
                      </div>
                      <span className="text-purple-600 text-lg">👁️</span>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      {suggestion.description}
                    </div>
                    <div className="text-xs text-purple-700 italic mb-2">
                      💼 {suggestion.benefit}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSectionSuggestionClick(suggestion.section, suggestion.description);
                      }}
                      className="w-full text-xs px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium flex items-center justify-center gap-2"
                    >
                      <span>👁️</span>
                      Preview & Add Section
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{atsData.word_count}</div>
              <div className="text-xs text-gray-600">Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {atsData.has_email ? '✓' : '✗'}
              </div>
              <div className="text-xs text-gray-600">Email</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {atsData.has_phone ? '✓' : '✗'}
              </div>
              <div className="text-xs text-gray-600">Phone</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {atsData.found_keywords_count}
              </div>
              <div className="text-xs text-gray-600">Action Verbs</div>
            </div>
          </div>
        </div>
      )}

      {/* Improvement Preview Modal */}
      <ImprovementPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        currentContent={resumeContent}
        onAccept={handleAcceptImprovements}
        useOpenAI={useOpenAI}
        improvementType={previewType}
      />

      {/* Section Preview Modal */}
      <SectionPreviewModal
        isOpen={showSectionPreview}
        onClose={() => {
          setShowSectionPreview(false);
          setSelectedSection(null);
        }}
        sectionName={selectedSection?.name}
        sectionDescription={selectedSection?.description}
        currentContent={resumeContent}
        onAccept={handleAcceptSection}
        useOpenAI={useOpenAI}
      />
    </div>
  );
};

export default ATSChecker;

