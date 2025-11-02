# 🚀 AI Resume Creator

A full-stack web application that uses AI to generate professional, ATS-friendly resumes. Users can create, edit, and download resumes powered by LLM technology.

## ✨ Features

- 🤖 **AI-Powered Resume Generation** - Generate professional resumes using OpenAI/Groq API
- 📝 **Interactive Resume Builder** - Easy-to-use form for personal info, experience, education
- 👁️ **Live Preview** - See your resume before downloading
- 📄 **Multiple Export Formats** - Download as PDF or DOCX
- 🔐 **Secure Authentication** - JWT-based user authentication
- 💾 **Resume Management** - Save and manage multiple resumes
- 🎨 **Professional UI** - Modern, responsive design with TailwindCSS

## 🏗️ Architecture

### Frontend
- **React** - UI framework
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - API communication
- **Context API** - State management

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Groq/OpenAI** - AI generation
- **ReportLab/python-docx** - PDF/DOCX generation

### Database
- **SQLite** - Local development
- **Supabase** - Production PostgreSQL

### Hosting (Free Tier)
- **Vercel/Netlify** - Frontend hosting
- **Render** - Backend hosting
- **Supabase** - Database & auth

## 📁 Project Structure

```
ai-resume-creator/
├── frontend/               # React application
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # Context API
│   │   ├── services/      # API services
│   │   └── utils/         # Utilities
│   └── package.json
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── models/        # Database models
│   │   ├── routers/       # API routes
│   │   ├── services/      # Business logic
│   │   ├── schemas/       # Pydantic schemas
│   │   └── main.py        # FastAPI app
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Groq/OpenAI API key

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your API keys to .env
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Environment Variables

Create a `.env` file in the backend directory:

```
DATABASE_URL=sqlite:///./resume.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key
GROQ_MODEL=llama-3.1-70b-versatile
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Resume Management
- `POST /api/resumes/generate` - Generate AI resume
- `POST /api/resumes/` - Save resume
- `GET /api/resumes/` - Get all resumes
- `GET /api/resumes/{id}` - Get specific resume
- `GET /api/resumes/{id}/download` - Download resume (PDF/DOCX)

## 🌐 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import project on Vercel
3. Add environment variables
4. Deploy

### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repo
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

### Database (Supabase)
1. Create account on Supabase
2. Create new project
3. Update DATABASE_URL in backend .env
4. Run migrations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

## 🙏 Acknowledgments

- OpenAI & Groq for AI models
- React & FastAPI communities

