from fastapi import APIRouter, Depends, HTTPException, status, Response, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import app.models as models
import app.schemas as schemas
from app.database import get_db
from app.auth import get_current_user
from app.services.ai_service import generate_resume_with_ai, generate_section_with_ai, improve_resume_for_ats
from app.services.export_service import generate_pdf, generate_docx
from app.services.ats_service import check_ats_compatibility
from app.services.resume_parser import parse_resume_file
import tempfile
import os

router = APIRouter()

@router.post("/generate", response_model=str)
async def generate_resume(
    request: schemas.ResumeGenerate,
    current_user: models.User = Depends(get_current_user)
):
    """Generate a resume using AI"""
    try:
        resume_content = await generate_resume_with_ai(
            request.resume_data, 
            use_openai=request.use_openai
        )
        return resume_content
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate resume: {str(e)}"
        )

@router.post("/generate-section", response_model=str)
async def generate_section(
    request: schemas.SectionGenerate,
    current_user: models.User = Depends(get_current_user)
):
    """Generate a specific resume section using AI"""
    try:
        section_content = await generate_section_with_ai(
            section_type=request.section_type,
            context=request.context,
            user_input=request.user_input,
            use_openai=request.use_openai
        )
        return section_content
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate section: {str(e)}"
        )

@router.post("/upload", response_model=schemas.ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    """Upload and parse a resume file (PDF or DOCX)"""
    # Check file type
    filename = file.filename or ""
    file_extension = os.path.splitext(filename)[1]
    
    if file_extension.lower() not in ['.pdf', '.docx']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF or DOCX file."
        )
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Parse the file
        markdown_content = parse_resume_file(file_content, file_extension)
        
        if not markdown_content or len(markdown_content.strip()) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract meaningful content from the file. Please ensure the file is a valid resume."
            )
        
        return schemas.ResumeUploadResponse(
            content=markdown_content,
            filename=filename,
            message="Resume uploaded and parsed successfully"
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse resume file: {str(e)}"
        )

@router.post("/", response_model=schemas.ResumeResponse, status_code=status.HTTP_201_CREATED)
def create_resume(
    resume_data: schemas.ResumeCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a resume to database"""
    # Convert None or empty dict to None for JSON fields
    template = resume_data.template if resume_data.template else None
    personal_info = resume_data.personal_info if resume_data.personal_info else None
    customization = resume_data.customization.dict() if resume_data.customization else None
    
    new_resume = models.Resume(
        user_id=current_user.id,
        title=resume_data.title,
        content=resume_data.content,
        template=template,
        personal_info=personal_info,
        customization=customization
    )
    
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    
    return new_resume

@router.get("/", response_model=List[schemas.ResumeResponse])
def get_resumes(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all resumes for current user"""
    resumes = db.query(models.Resume).filter(
        models.Resume.user_id == current_user.id
    ).order_by(models.Resume.created_at.desc()).all()
    
    return resumes

@router.get("/{resume_id}", response_model=schemas.ResumeResponse)
def get_resume(
    resume_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific resume"""
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id,
        models.Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    return resume

@router.put("/{resume_id}", response_model=schemas.ResumeResponse)
def update_resume(
    resume_id: int,
    resume_data: schemas.ResumeUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a resume"""
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id,
        models.Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    if resume_data.title is not None:
        resume.title = resume_data.title
    if resume_data.content is not None:
        resume.content = resume_data.content
    if resume_data.template is not None:
        resume.template = resume_data.template
    if resume_data.personal_info is not None:
        resume.personal_info = resume_data.personal_info
    if resume_data.customization is not None:
        resume.customization = resume_data.customization.dict()
    
    db.commit()
    db.refresh(resume)
    
    return resume

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a resume"""
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id,
        models.Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    db.delete(resume)
    db.commit()
    
    return None

@router.get("/{resume_id}/download/pdf")
def download_pdf(
    resume_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download resume as PDF"""
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id,
        models.Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Generate PDF with template styling
    pdf_file = generate_pdf(
        resume.content, 
        resume.title,
        template=resume.template,
        personal_info=resume.personal_info,
        customization=resume.customization
    )
    
    return FileResponse(
        pdf_file,
        media_type="application/pdf",
        filename=f"{resume.title.replace(' ', '_')}.pdf"
    )

@router.get("/{resume_id}/download/docx")
def download_docx(
    resume_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download resume as DOCX"""
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id,
        models.Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Generate DOCX with template styling
    docx_file = generate_docx(
        resume.content, 
        resume.title,
        template=resume.template,
        personal_info=resume.personal_info,
        customization=resume.customization
    )
    
    return FileResponse(
        docx_file,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"{resume.title.replace(' ', '_')}.docx"
    )

@router.post("/check-ats", response_model=schemas.ATSResponse)
def check_ats(
    request: schemas.ATSCheckRequest,
    current_user: models.User = Depends(get_current_user)
):
    """Check resume ATS compatibility"""
    try:
        ats_result = check_ats_compatibility(request.content)
        return ats_result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check ATS compatibility: {str(e)}"
        )

@router.get("/{resume_id}/check-ats", response_model=schemas.ATSResponse)
def check_resume_ats(
    resume_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check ATS compatibility for a saved resume"""
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id,
        models.Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    try:
        ats_result = check_ats_compatibility(resume.content)
        return ats_result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check ATS compatibility: {str(e)}"
        )

@router.post("/improve", response_model=str)
async def improve_resume(
    request: schemas.ResumeImproveRequest,
    current_user: models.User = Depends(get_current_user)
):
    """Improve resume content based on ATS analysis"""
    try:
        # First check ATS compatibility
        ats_result = check_ats_compatibility(request.content)
        
        # If already perfect or no issues, return original
        if not ats_result.get('issues') and not ats_result.get('suggestions'):
            return request.content
        
        # Improve using AI
        improved_content = await improve_resume_for_ats(
            current_content=request.content,
            ats_issues=ats_result.get('issues', []),
            ats_suggestions=ats_result.get('suggestions', []),
            use_openai=request.use_openai
        )
        
        return improved_content
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to improve resume: {str(e)}"
    )

