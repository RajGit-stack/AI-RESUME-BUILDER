"""Test script for registration endpoint"""
import requests
import json

url = "http://localhost:8000/api/auth/register"

test_data = {
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
}

try:
    response = requests.post(url, json=test_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")


