import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const ResumeBuilder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const [formData, setFormData] = useState({
    personal_info: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      portfolio: ''
    },
    summary: '',
    education: [
      {
        degree: '',
        institution: '',
        year: '',
        gpa: ''
      }
    ],
    experience: [
      {
        title: '',
        company: '',
        start_date: '',
        end_date: '',
        description: ''
      }
    ],
    skills: [],
    use_openai: false
  });

  const [newSkill, setNewSkill] = useState('');
  const [resumeTitle, setResumeTitle] = useState('');

  const handlePersonalInfoChange = (field, value) => {
    setFormData({
      ...formData,
      personal_info: {
        ...formData.personal_info,
        [field]: value
      }
    });
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index][field] = value;
    setFormData({ ...formData, education: updatedEducation });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { degree: '', institution: '', year: '', gpa: '' }
      ]
    });
  };

  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      setFormData({
        ...formData,
        education: formData.education.filter((_, i) => i !== index)
      });
    }
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index][field] = value;
    setFormData({ ...formData, experience: updatedExperience });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { title: '', company: '', start_date: '', end_date: '', description: '' }
      ]
    });
  };

  const removeExperience = (index) => {
    if (formData.experience.length > 1) {
      setFormData({
        ...formData,
        experience: formData.experience.filter((_, i) => i !== index)
      });
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/resumes/generate`,
        {
          resume_data: formData,
          use_openai: formData.use_openai
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const generatedResume = response.data;

      // Store in localStorage for preview page
      localStorage.setItem('currentResume', JSON.stringify({
        title: resumeTitle || 'My Resume',
        content: generatedResume
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Create Your Resume
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Resume Title */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume Title
            </label>
            <input
              type="text"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              placeholder="e.g., Software Engineer Resume"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
            />
          </div>

          {/* Personal Information */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={formData.personal_info.name}
                onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
              />
              <input
                type="email"
                placeholder="Email *"
                value={formData.personal_info.email}
                onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.personal_info.phone}
                onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.personal_info.location}
                onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
              />
              <input
                type="url"
                placeholder="LinkedIn"
                value={formData.personal_info.linkedin}
                onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
              />
              <input
                type="url"
                placeholder="Portfolio"
                value={formData.personal_info.portfolio}
                onChange={(e) => handlePersonalInfoChange('portfolio', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Summary (optional)
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows="4"
              placeholder="Brief summary of your professional background..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
            />
          </div>

          {/* Education */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Education</h2>
              <button
                type="button"
                onClick={addEducation}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                + Add Education
              </button>
            </div>
            {formData.education.map((edu, index) => (
              <div key={index} className="mb-4 pb-4 border-b">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Institution"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={edu.year}
                    onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="GPA (optional)"
                    value={edu.gpa}
                    onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  />
                </div>
                {formData.education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="mt-2 text-red-600 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Experience */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Experience</h2>
              <button
                type="button"
                onClick={addExperience}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                + Add Experience
              </button>
            </div>
            {formData.experience.map((exp, index) => (
              <div key={index} className="mb-4 pb-4 border-b">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={exp.title}
                    onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Start Date"
                    value={exp.start_date}
                    onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="End Date (or Current)"
                    value={exp.end_date}
                    onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                  />
                </div>
                <textarea
                  placeholder="Job Description"
                  value={exp.description}
                  onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                  rows="2"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
                />
                {formData.experience.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="mt-2 text-red-600 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Skills</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={addSkill}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* AI Model Selection */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.use_openai}
                onChange={(e) => setFormData({ ...formData, use_openai: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Use OpenAI (default: Groq)
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Generating Resume...' : 'Generate Resume with AI'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResumeBuilder;

