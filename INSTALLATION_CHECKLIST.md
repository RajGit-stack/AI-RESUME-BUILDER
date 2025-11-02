# ✅ Installation Checklist

Use this checklist to ensure your AI Resume Creator is properly set up.

## Prerequisites

- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Python 3.8+ installed (`python --version`)
- [ ] pip installed (`pip --version`)

## Backend Setup

- [ ] Navigate to backend directory (`cd backend`)
- [ ] Create virtual environment (`python -m venv venv`)
- [ ] Activate virtual environment
  - Windows: `venv\Scripts\activate`
  - Linux/Mac: `source venv/bin/activate`
- [ ] Install dependencies (`pip install -r requirements.txt`)
- [ ] Create `.env` file from `.env.example`
- [ ] Add `GROQ_API_KEY` to `.env`
- [ ] Generate and add `SECRET_KEY` to `.env`
- [ ] Initialize database (`python init_db.py`)
- [ ] Start backend server (`uvicorn app.main:app --reload`)
- [ ] Verify backend running at http://localhost:8000
- [ ] Check API docs at http://localhost:8000/docs

## Frontend Setup

- [ ] Navigate to frontend directory (`cd frontend`)
- [ ] Install dependencies (`npm install`)
- [ ] Check TailwindCSS config exists
- [ ] Check PostCSS config exists
- [ ] Create `.env` file (optional)
- [ ] Add `REACT_APP_API_URL` if using non-default port
- [ ] Start frontend (`npm start`)
- [ ] Verify frontend running at http://localhost:3000
- [ ] Check browser console for errors

## API Keys

- [ ] Groq API key obtained
- [ ] Groq API key added to backend `.env`
- [ ] (Optional) OpenAI API key obtained
- [ ] (Optional) OpenAI key added to backend `.env`

## Testing

### Backend Tests

- [ ] Backend health check: `curl http://localhost:8000/health`
- [ ] API docs accessible: http://localhost:8000/docs
- [ ] Register endpoint works
- [ ] Login endpoint works
- [ ] Resume generation works

### Frontend Tests

- [ ] Home page loads
- [ ] Registration form works
- [ ] Login form works
- [ ] Dashboard accessible when logged in
- [ ] Resume builder form loads
- [ ] Can add/remove education entries
- [ ] Can add/remove experience entries
- [ ] Can add/remove skills
- [ ] AI generation works
- [ ] Preview renders correctly
- [ ] PDF download works
- [ ] DOCX download works
- [ ] Resume saves to dashboard

## File Structure

### Backend Files

- [ ] `backend/app/main.py` exists
- [ ] `backend/app/config.py` exists
- [ ] `backend/app/database.py` exists
- [ ] `backend/app/models.py` exists
- [ ] `backend/app/schemas.py` exists
- [ ] `backend/app/auth.py` exists
- [ ] `backend/app/routers/auth.py` exists
- [ ] `backend/app/routers/resumes.py` exists
- [ ] `backend/app/services/ai_service.py` exists
- [ ] `backend/app/services/export_service.py` exists
- [ ] `backend/requirements.txt` exists
- [ ] `backend/.env.example` exists
- [ ] `backend/init_db.py` exists

### Frontend Files

- [ ] `frontend/public/index.html` exists
- [ ] `frontend/src/index.js` exists
- [ ] `frontend/src/index.css` exists
- [ ] `frontend/src/App.js` exists
- [ ] `frontend/src/App.css` exists
- [ ] `frontend/src/components/Navbar.js` exists
- [ ] `frontend/src/components/ProtectedRoute.js` exists
- [ ] `frontend/src/contexts/AuthContext.js` exists
- [ ] `frontend/src/pages/Home.js` exists
- [ ] `frontend/src/pages/Login.js` exists
- [ ] `frontend/src/pages/Register.js` exists
- [ ] `frontend/src/pages/Dashboard.js` exists
- [ ] `frontend/src/pages/ResumeBuilder.js` exists
- [ ] `frontend/src/pages/ResumePreview.js` exists
- [ ] `frontend/package.json` exists
- [ ] `frontend/tailwind.config.js` exists
- [ ] `frontend/postcss.config.js` exists

### Documentation Files

- [ ] `README.md` exists
- [ ] `QUICKSTART.md` exists
- [ ] `SETUP.md` exists
- [ ] `DEPLOYMENT.md` exists
- [ ] `PROJECT_SUMMARY.md` exists
- [ ] `FEATURES.md` exists

---

**All checked?** You're ready to use AI Resume Creator! 🎉

