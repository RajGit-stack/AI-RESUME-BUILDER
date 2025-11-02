# 🧪 Testing User Registration

## Quick Test via Browser

1. Open: http://localhost:8000/docs
2. Find the `/api/auth/register` endpoint
3. Click "Try it out"
4. Use this test data:
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "test123"
   }
   ```
5. Click "Execute"

## Check the Response

### ✅ Success Response
```json
{
  "id": 1,
  "name": "Test User",
  "email": "test@example.com",
  "created_at": "2024-01-01T12:00:00"
}
```

### ❌ Error Response
Look at the error details to identify the issue.

## Common Issues

### "Table 'users' does not exist"
**Solution**: Database not initialized
```bash
cd C:\ai-resume-creator\backend
.\venv\Scripts\python.exe init_db.py
```

### "Invalid password hash format"
**Solution**: bcrypt issue - check dependency installation
```bash
pip install bcrypt==4.1.1
```

### "Email already exists"
**Solution**: User already registered - try different email

### Generic 500 Error
**Check**: Look at the backend terminal for the full traceback

## Debug Steps

1. **Check backend terminal** - Look for error traceback
2. **Check database** - Make sure `resume.db` exists
3. **Check dependencies** - Verify all packages installed
4. **Restart server** - Stop and start uvicorn again

## Share the Error

If still failing, please share:
1. The full error from backend terminal
2. The request body you're sending
3. Screenshot of the error if possible


