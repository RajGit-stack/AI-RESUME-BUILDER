from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Resume Schemas
class ResumeData(BaseModel):
    """Input data for resume generation"""
    personal_info: dict
    summary: Optional[str] = None
    education: List[dict]
    experience: List[dict]
    skills: List[str]
    certifications: Optional[List[dict]] = None
    languages: Optional[List[dict]] = None

class ResumeGenerate(BaseModel):
    resume_data: ResumeData
    use_openai: bool = False

class ResumeCustomization(BaseModel):
    """Schema for resume customization options"""
    two_column: bool = False
    bold_sections: bool = False
    font_size: Optional[str] = None  # 'small', 'medium', 'large'
    header_color: Optional[str] = None  # Hex color code
    accent_color: Optional[str] = None  # Hex color code
    spacing: Optional[str] = None  # 'compact', 'normal', 'loose'
    custom_css: Optional[str] = None  # Custom CSS for advanced users

class ResumeCreate(BaseModel):
    title: str
    content: str
    template: Optional[dict] = None
    personal_info: Optional[dict] = None
    customization: Optional[ResumeCustomization] = None

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    template: Optional[dict] = None
    personal_info: Optional[dict] = None
    customization: Optional[ResumeCustomization] = None

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    template: Optional[dict] = None
    personal_info: Optional[dict] = None
    customization: Optional[dict] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

class SectionGenerate(BaseModel):
    """Schema for generating individual resume sections"""
    section_type: str  # e.g., "education", "experience", "skills", "projects", "certifications"
    context: dict  # Existing resume data for context
    user_input: Optional[str] = None  # Optional user input/requirements
    use_openai: bool = False

class ResumeLayout(BaseModel):
    """Schema for resume layout selection"""
    layout_name: str  # e.g., "modern", "classic", "creative"

class ATSCheckRequest(BaseModel):
    """Schema for ATS check request"""
    content: str

class SectionSuggestion(BaseModel):
    """Schema for section suggestion"""
    section: str
    description: str
    benefit: str

class ATSResponse(BaseModel):
    """Schema for ATS check response"""
    score: int
    grade: str
    issues: List[str]
    suggestions: List[str]
    strengths: List[str]
    missing_sections: List[str]
    section_suggestions: List[SectionSuggestion]
    word_count: int
    has_email: bool
    has_phone: bool
    found_keywords_count: int
    has_numbers: bool

class ResumeUploadResponse(BaseModel):
    """Schema for resume upload response"""
    content: str
    filename: str
    message: str

class ResumeImproveRequest(BaseModel):
    """Schema for resume improvement request"""
    content: str
    use_openai: bool = False

