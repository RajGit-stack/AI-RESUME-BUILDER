"""
ATS (Applicant Tracking System) checking service
Analyzes resumes for ATS compatibility and provides scoring and suggestions
"""
import re
from typing import Dict, List, Any


def check_ats_compatibility(resume_content: str) -> Dict[str, Any]:
    """
    Analyze resume content for ATS compatibility
    Returns score, feedback, and suggestions
    """
    content_lower = resume_content.lower()
    issues = []
    suggestions = []
    score = 100
    missing_sections = []
    strengths = []
    
    # Check for required sections
    sections_to_check = {
        'contact': ['email', 'phone', 'address', 'location'],
        'summary': ['summary', 'objective', 'profile'],
        'experience': ['experience', 'work', 'employment', 'career'],
        'education': ['education', 'degree', 'university', 'college'],
        'skills': ['skills', 'technical', 'competencies']
    }
    
    found_sections = {}
    for section, keywords in sections_to_check.items():
        found = any(keyword in content_lower for keyword in keywords)
        found_sections[section] = found
        if not found:
            missing_sections.append(section)
            score -= 10
    
    # Check for contact information
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    
    has_email = bool(re.search(email_pattern, resume_content))
    has_phone = bool(re.search(phone_pattern, resume_content))
    
    if not has_email:
        issues.append("Missing email address")
        score -= 5
        suggestions.append("Add your professional email address")
    
    if not has_phone:
        issues.append("Missing phone number")
        score -= 5
        suggestions.append("Add your contact phone number")
    
    # Check for professional keywords
    professional_keywords = [
        'achievement', 'accomplish', 'lead', 'manage', 'develop', 'implement',
        'improve', 'increase', 'decrease', 'create', 'design', 'analyze'
    ]
    
    found_keywords = [kw for kw in professional_keywords if kw in content_lower]
    keyword_score = len(found_keywords)
    
    if keyword_score < 5:
        issues.append(f"Limited use of action verbs ({keyword_score} found)")
        score -= 5
        suggestions.append("Use more action verbs (e.g., 'managed', 'developed', 'achieved')")
    else:
        strengths.append(f"Strong use of action verbs ({keyword_score} found)")
    
    # Check for quantifiable achievements
    numbers_pattern = r'\d+[%$]?|\b\d+\s*(years?|months?|%)'
    has_numbers = bool(re.search(numbers_pattern, resume_content))
    
    if not has_numbers:
        issues.append("Missing quantifiable achievements")
        score -= 10
        suggestions.append("Add specific numbers, percentages, or metrics to your achievements")
    else:
        strengths.append("Includes quantifiable achievements")
    
    # Check for skills section
    if not found_sections.get('skills'):
        issues.append("Missing dedicated skills section")
        score -= 10
        suggestions.append("Add a skills section with relevant technical and soft skills")
    
    # Check for experience dates
    date_pattern = r'\b(19|20)\d{2}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}'
    has_dates = bool(re.search(date_pattern, content_lower))
    
    if not has_dates:
        issues.append("Missing dates for experience/education")
        score -= 5
        suggestions.append("Include dates for your work experience and education")
    else:
        strengths.append("Includes employment/education dates")
    
    # Check for section headers
    header_pattern = r'^#+\s+\w+|^##+\s+\w+'
    headers = re.findall(header_pattern, resume_content, re.MULTILINE)
    
    if len(headers) < 4:
        issues.append("Insufficient section headers")
        score -= 5
        suggestions.append("Use clear section headers (##) for better organization")
    else:
        strengths.append(f"Good structure with {len(headers)} sections")
    
    # Check content length
    word_count = len(resume_content.split())
    if word_count < 200:
        issues.append("Resume too short (less than 200 words)")
        score -= 10
        suggestions.append("Expand your resume with more detail (aim for 400-800 words)")
    elif word_count > 1200:
        issues.append("Resume too long (over 1200 words)")
        score -= 5
        suggestions.append("Consider condensing your resume to 1-2 pages")
    else:
        strengths.append(f"Appropriate length ({word_count} words)")
    
    # Check for ATS-friendly formatting
    # Avoid special characters that might break parsing
    problematic_chars = ['❌', '✅', '→', '←', '•', '○']
    has_problematic_chars = any(char in resume_content for char in problematic_chars)
    
    if has_problematic_chars:
        issues.append("Contains special characters that may confuse ATS")
        score -= 5
        suggestions.append("Use standard characters and bullet points (• or -)")
    
    # Ensure score doesn't go below 0
    score = max(0, score)
    
    # Calculate grade
    if score >= 90:
        grade = "A+"
    elif score >= 80:
        grade = "A"
    elif score >= 70:
        grade = "B"
    elif score >= 60:
        grade = "C"
    elif score >= 50:
        grade = "D"
    else:
        grade = "F"
    
    # Generate section suggestions for missing sections
    section_suggestions = []
    if 'projects' not in content_lower and 'project' not in content_lower:
        section_suggestions.append({
            'section': 'Projects',
            'description': 'Showcase your work through project examples',
            'benefit': 'Demonstrates practical skills and experience'
        })
    
    if 'certification' not in content_lower and 'certificate' not in content_lower and 'certifications' not in content_lower:
        section_suggestions.append({
            'section': 'Certifications',
            'description': 'Highlight professional certifications',
            'benefit': 'Shows commitment to professional development'
        })
    
    if 'achievement' not in content_lower and 'award' not in content_lower and 'achievements' not in content_lower:
        section_suggestions.append({
            'section': 'Achievements/Awards',
            'description': 'List notable achievements and awards',
            'benefit': 'Differentiates you from other candidates'
        })
    
    if 'language' not in content_lower and 'languages' not in content_lower:
        section_suggestions.append({
            'section': 'Languages',
            'description': 'List languages you speak',
            'benefit': 'Important for international or multilingual roles'
        })
    
    if 'volunteer' not in content_lower and 'volunteering' not in content_lower:
        section_suggestions.append({
            'section': 'Volunteer Experience',
            'description': 'Include volunteer work or community involvement',
            'benefit': 'Shows well-rounded personality and leadership'
        })
    
    return {
        'score': score,
        'grade': grade,
        'issues': issues,
        'suggestions': suggestions,
        'strengths': strengths,
        'missing_sections': missing_sections,
        'section_suggestions': section_suggestions,
        'word_count': word_count,
        'has_email': has_email,
        'has_phone': has_phone,
        'found_keywords_count': keyword_score,
        'has_numbers': has_numbers
    }

