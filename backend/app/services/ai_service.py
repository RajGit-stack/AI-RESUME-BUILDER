from groq import Groq
import openai
from typing import Optional
from app.config import settings
from app.schemas import ResumeData

def create_resume_prompt(resume_data: ResumeData) -> str:
    """Create a prompt for AI resume generation"""
    
    # Extract personal information
    personal_info = resume_data.personal_info
    name = personal_info.get('name', '')
    email = personal_info.get('email', '')
    phone = personal_info.get('phone', '')
    location = personal_info.get('location', '')
    linkedin = personal_info.get('linkedin', '')
    portfolio = personal_info.get('portfolio', '')
    
    # Build education section
    education_text = ""
    if resume_data.education:
        valid_education = []
        for edu in resume_data.education:
            degree = edu.get('degree', '').strip()
            institution = edu.get('institution', '').strip()
            if degree or institution:  # Only include if at least one field is filled
                valid_education.append(edu)
        
        if valid_education:
            education_text = "\n## Education\n\n"
            for edu in valid_education:
                degree = edu.get('degree', '').strip()
                institution = edu.get('institution', '').strip()
                year = edu.get('year', '').strip()
                gpa = edu.get('gpa', '').strip()
                edu_text = f"- **{degree}**, {institution}"
                if year:
                    edu_text += f" ({year})"
                if gpa:
                    edu_text += f" - GPA: {gpa}"
                edu_text += "\n"
                education_text += edu_text
    
    # Build experience section
    experience_text = ""
    if resume_data.experience:
        valid_experience = []
        for exp in resume_data.experience:
            title = exp.get('title', '').strip()
            company = exp.get('company', '').strip()
            if title or company:  # Only include if at least one field is filled
                valid_experience.append(exp)
        
        if valid_experience:
            experience_text = "\n## Professional Experience\n\n"
            for exp in valid_experience:
                title = exp.get('title', '').strip()
                company = exp.get('company', '').strip()
                start_date = exp.get('start_date', '').strip()
                end_date = exp.get('end_date', 'Current').strip()
                description = exp.get('description', '').strip()
                experiences_text = f"- **{title}** at {company}"
                if start_date or end_date:
                    experiences_text += f" ({start_date} - {end_date})"
                experiences_text += "\n"
                if description:
                    experiences_text += f"  {description}\n"
                experiences_text += "\n"
                experience_text += experiences_text
    
    # Build skills section
    skills_text = ""
    if resume_data.skills:
        skills_text = "\n## Technical Skills\n\n"
        skills_text += "- " + ", ".join(resume_data.skills) + "\n"
    
    # Build summary
    summary_text = ""
    if resume_data.summary:
        summary_text = f"\n## Professional Summary\n\n{resume_data.summary}\n"
    
    prompt = f"""You are an expert resume writer specializing in creating ATS-friendly, professional resumes. Generate a well-formatted resume in Markdown format based on the following information:

**Personal Information:**
- Name: {name}
- Email: {email}
- Phone: {phone}
- Location: {location}
{f'- LinkedIn: {linkedin}' if linkedin else ''}
{f'- Portfolio: {portfolio}' if portfolio else ''}

{summary_text if summary_text else ''}

{education_text if education_text else ''}

{experience_text if experience_text else ''}

{skills_text if skills_text else ''}

**Instructions:**
1. Create a professional, ATS-friendly resume
2. Use clear section headers (## for main sections, ### for subsections)
3. Use bullet points (-) for lists
4. Bold important items like job titles, company names, degrees
5. Keep formatting consistent and professional
6. Add a header with the personal information at the top
7. Ensure proper spacing between sections
8. Make the resume compelling while maintaining factual accuracy

Generate the resume now:"""

    return prompt

async def generate_resume_with_ai(resume_data: ResumeData, use_openai: bool = False) -> str:
    """Generate resume using AI (Groq or OpenAI)"""
    prompt = create_resume_prompt(resume_data)
    
    try:
        if use_openai and settings.OPENAI_API_KEY:
            # Use OpenAI
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert resume writer specializing in ATS-friendly, professional resumes."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            resume_content = response.choices[0].message.content
        
        elif settings.GROQ_API_KEY:
            # Use Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert resume writer specializing in ATS-friendly, professional resumes."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            resume_content = response.choices[0].message.content
        
        else:
            raise Exception("No AI API key configured. Please set either GROQ_API_KEY or OPENAI_API_KEY in .env")
        
        return resume_content
    
    except Exception as e:
        raise Exception(f"Error generating resume with AI: {str(e)}")

async def generate_section_with_ai(
    section_type: str,
    context: dict,
    user_input: Optional[str] = None,
    use_openai: bool = False
) -> str:
    """Generate a specific resume section using AI"""
    
    # Define section-specific prompts
    section_prompts = {
        "summary": """Generate a compelling professional summary (2-3 sentences) based on the provided context. Make it ATS-friendly and highlight key strengths and experience.""",
        "education": """Generate a professional education section entry in Markdown format. Include degree, institution, year, and GPA if relevant. Format: **Degree**, Institution (Year) - GPA: X.X""",
        "experience": """Generate a professional experience section entry in Markdown format. Include job title, company, dates, and 3-5 bullet points of achievements. Format: **Job Title** at Company (Start Date - End Date) followed by bullet points.""",
        "skills": """Generate a relevant skills section in Markdown format. Organize skills into categories if appropriate. Format as a list with categories.""",
        "projects": """Generate a professional projects section entry in Markdown format. Include project name, technologies used, and 2-3 bullet points describing the project and achievements.""",
        "certifications": """Generate a certifications section entry in Markdown format. Include certification name, issuing organization, and date.""",
        "achievements": """Generate an achievements/awards section in Markdown format. Include award name, organization, and date if relevant.""",
        "languages": """Generate a languages section in Markdown format. List languages with proficiency levels."""
    }
    
    # Get base prompt for section type
    base_prompt = section_prompts.get(section_type.lower(), 
        f"Generate a professional {section_type} section in Markdown format.")
    
    # Build context from existing resume data
    context_text = ""
    if context.get('personal_info'):
        personal = context['personal_info']
        context_text += f"Name: {personal.get('name', '')}, "
        context_text += f"Email: {personal.get('email', '')}, "
        context_text += f"Location: {personal.get('location', '')}\n"
    
    if context.get('summary'):
        context_text += f"Existing Summary: {context['summary']}\n"
    
    if context.get('experience'):
        context_text += f"Experience: {len(context.get('experience', []))} entries\n"
    
    if context.get('education'):
        context_text += f"Education: {len(context.get('education', []))} entries\n"
    
    # Build final prompt
    prompt = f"""{base_prompt}

**Context about the person:**
{context_text}

{f'**User Requirements:** {user_input}' if user_input else '**User Requirements:** Generate based on the context provided.'}

**Instructions:**
1. Generate professional, ATS-friendly content
2. Use Markdown formatting
3. Be specific and relevant
4. Maintain consistency with the provided context

Generate the {section_type} section now:"""
    
    try:
        if use_openai and settings.OPENAI_API_KEY:
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": f"You are an expert resume writer specializing in {section_type} sections. Generate professional, ATS-friendly content."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            return response.choices[0].message.content
        
        elif settings.GROQ_API_KEY:
            client = Groq(api_key=settings.GROQ_API_KEY)
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": f"You are an expert resume writer specializing in {section_type} sections. Generate professional, ATS-friendly content."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            return response.choices[0].message.content
        
        else:
            raise Exception("No AI API key configured. Please set either GROQ_API_KEY or OPENAI_API_KEY in .env")
    
    except Exception as e:
        raise Exception(f"Error generating {section_type} section with AI: {str(e)}")

async def improve_resume_for_ats(
    current_content: str,
    ats_issues: list,
    ats_suggestions: list,
    use_openai: bool = False
) -> str:
    """Improve resume content based on ATS issues and suggestions"""
    
    issues_text = "\n".join([f"- {issue}" for issue in ats_issues])
    suggestions_text = "\n".join([f"- {suggestion}" for suggestion in ats_suggestions])
    
    prompt = f"""You are an expert resume writer specializing in ATS optimization. Improve the following resume to address ATS compatibility issues while maintaining all the original information and facts.

**Current Resume Content:**
{current_content}

**ATS Issues Found:**
{issues_text}

**Improvement Suggestions:**
{suggestions_text}

**Your Task:**
1. Fix all ATS issues mentioned above
2. Apply all improvement suggestions
3. Add quantifiable metrics where appropriate (use numbers, percentages, timeframes)
4. Ensure proper use of action verbs
5. Add missing contact information if needed
6. Improve section headers and structure
7. Maintain all original information - do not remove or fabricate facts
8. Keep the same markdown formatting style
9. Only make improvements that address the ATS issues - don't change content unnecessarily

**Important:** Return ONLY the improved resume content in Markdown format. Do not include explanations or comments."""
    
    try:
        if use_openai and settings.OPENAI_API_KEY:
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert ATS resume optimizer. Improve resumes to maximize ATS compatibility while preserving all original information."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=3000
            )
            return response.choices[0].message.content
        
        elif settings.GROQ_API_KEY:
            client = Groq(api_key=settings.GROQ_API_KEY)
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert ATS resume optimizer. Improve resumes to maximize ATS compatibility while preserving all original information."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=3000
            )
            return response.choices[0].message.content
        
        else:
            raise Exception("No AI API key configured. Please set either GROQ_API_KEY or OPENAI_API_KEY in .env")
    
    except Exception as e:
        raise Exception(f"Error improving resume with AI: {str(e)}")

