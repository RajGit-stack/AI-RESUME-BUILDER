# Quick Start Guide

Get your AI Resume Creator up and running in 5 minutes!

## Prerequisites

✅ Node.js 16+ installed  
✅ Python 3.8+ installed  
✅ Groq API Key ([Get it free here](https://console.groq.com/))

## Installation Steps

### 1. Backend Setup (2 minutes)

```bash
# Navigate to backend
cd ai-resume-creator/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
# cp .env.example .env  # Linux/Mac

# Edit .env and add your GROQ_API_KEY
# Also generate a SECRET_KEY:
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Initialize database
python init_db.py

# Start backend
uvicorn app.main:app --reload
```

✅ Backend running at http://localhost:8000

### 2. Frontend Setup (3 minutes)

```bash
# Open a new terminal
cd ai-resume-creator/frontend

# Install dependencies
npm install

# Start frontend
npm start
```

✅ Frontend running at http://localhost:3000

## Using the App

1. Open http://localhost:3000 in your browser
2. Click "Sign Up" and create an account
3. Login with your credentials
4. Click "Create Resume"
5. Fill in your information
6. Click "Generate Resume with AI"
7. Preview and download your resume!

## Configuration

### Required Environment Variables

Add these to `backend/.env`:

```env
GROQ_API_KEY=your-groq-api-key-here
SECRET_KEY=your-generated-secret-key
DATABASE_URL=sqlite:///./resume.db
CORS_ORIGINS=http://localhost:3000
```

### Optional Environment Variables

```env
OPENAI_API_KEY=your-openai-api-key  # If you want to use OpenAI instead
OPENAI_MODEL=gpt-3.5-turbo
GROQ_MODEL=llama-3.1-70b-versatile
```

## Getting API Keys

### Groq (Free & Recommended)
1. Visit https://console.groq.com/
2. Sign up with Google/GitHub
3. Go to API Keys section
4. Create new key
5. Copy and add to `.env`

### OpenAI (Optional)
1. Visit https://platform.openai.com/
2. Sign up
3. Add payment method (free credits available)
4. Go to API Keys
5. Create new key
6. Copy and add to `.env`

## Troubleshooting

### Backend won't start

```bash
# Check if Python version is correct
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check logs
# Look for import errors or missing modules
```

### Frontend won't start

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 16+
```

### "Module not found" errors

**Backend:**
```bash
pip install -r requirements.txt
```

**Frontend:**
```bash
npm install
```

### AI generation fails

1. Check your API key is correct in `.env`
2. Verify you have API credits
3. Check backend terminal for error messages
4. Make sure you're connected to internet

### Database errors

```bash
# Reinitialize database
cd backend
python init_db.py
```

### Port already in use

**Backend:**
```bash
uvicorn app.main:app --reload --port 8001
```

**Frontend:**
```bash
PORT=3001 npm start
```

Then update `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:8001
```

## Next Steps

- ✅ You're all set! Start creating resumes
- 📚 Check [SETUP.md](SETUP.md) for detailed setup
- 🚀 Read [DEPLOYMENT.md](DEPLOYMENT.md) to deploy online
- 🎨 Customize the UI in `frontend/src`
- ⚙️ Modify AI prompts in `backend/app/services/ai_service.py`

## Features to Try

1. **Generate Resume**: Fill out the form and let AI create your resume
2. **Download PDF**: Get professional PDF version
3. **Download DOCX**: Get editable Word document
4. **Save to Dashboard**: Store multiple versions
5. **Multiple AI Models**: Switch between Groq and OpenAI

## Need Help?

Check out:
- Backend API docs: http://localhost:8000/docs
- Frontend console: Browser Developer Tools (F12)
- Backend logs: Terminal where `uvicorn` is running

## Project Structure Quick Reference

```
ai-resume-creator/
├── backend/
│   ├── app/
│   │   ├── main.py          # Start here for backend
│   │   ├── routers/         # API endpoints
│   │   └── services/        # AI generation logic
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Configuration
├── frontend/
│   ├── src/
│   │   ├── App.js           # Main React app
│   │   ├── pages/           # Pages (Home, Builder, etc.)
│   │   └── components/      # Reusable components
│   └── package.json         # Node dependencies
└── README.md               # Main documentation
```

## Common Commands

```bash
# Backend
cd backend
uvicorn app.main:app --reload              # Start server
python init_db.py                          # Initialize DB
pip install -r requirements.txt            # Install deps

# Frontend
cd frontend
npm install                                # Install deps
npm start                                  # Start dev server
npm run build                              # Build for production

# Database
python init_db.py                          # Create tables
```

Enjoy creating professional resumes with AI! 🚀

