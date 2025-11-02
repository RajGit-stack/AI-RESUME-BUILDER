"""
Test script for the /api/resumes/generate endpoint
Based on the provided curl command
"""

import requests
import json

# API endpoint
url = "http://localhost:8000/api/resumes/generate"

# Authorization token (replace with a valid token)
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzYyMDAyMzUxfQ.pO21nLZb6TbCKnQkM6C4pCSVfPidVvlFkvU2Z6JLqpI"

# Headers
headers = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9,en-IN;q=0.8",
    "Authorization": f"Bearer {token}",
    "Connection": "keep-alive",
    "Content-Type": "application/json",
    "Origin": "http://localhost:3000",
    "Referer": "http://localhost:3000/",
}

# Request payload
payload = {
    "resume_data": {
        "personal_info": {
            "name": "Raj Kumar Prajapati",
            "email": "rajuphsp140721@gmail.com",
            "phone": "06289783219",
            "location": "Kolkata",
            "linkedin": "",
            "portfolio": ""
        },
        "summary": "",
        "education": [
            {
                "degree": "",
                "institution": "",
                "year": "",
                "gpa": ""
            }
        ],
        "experience": [
            {
                "title": "",
                "company": "",
                "start_date": "",
                "end_date": "",
                "description": ""
            }
        ],
        "skills": [],
        "use_openai": False
    },
    "use_openai": False
}

def test_generate_resume():
    """Test the resume generation endpoint"""
    try:
        print("Testing /api/resumes/generate endpoint...")
        print(f"URL: {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        print("-" * 50)
        
        response = requests.post(url, json=payload, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print("-" * 50)
        
        if response.status_code == 200:
            print("[SUCCESS]")
            print("\nGenerated Resume:")
            print(response.text)
        else:
            print(f"[ERROR] Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("[ERROR] Connection Error: Make sure the backend server is running on http://localhost:8000")
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Request Error: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected Error: {e}")

if __name__ == "__main__":
    test_generate_resume()

