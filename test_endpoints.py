import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

endpoints = [
    # Auth routes
    ("POST", "/auth/auth/register", {"email":"testuser@test.com", "password":"password123", "name":"Test"}),
    ("POST", "/auth/auth/login", {"email":"testuser@test.com", "password":"password123"}),
    ("POST", "/auth/auth/register-agency", {"email":"agency@test.com", "password":"password123", "name":"Test Agency"}),
    ("POST", "/auth/auth/login-agency", {"email":"agency@test.com", "password":"password123"}),
    
    # Packages
    ("GET", "/packages/", None),
    ("POST", "/agency/create-package", {"title":"Test Package", "price":100}),
    
    # Enquiry
    ("POST", "/enquiry/send-enquiry", {"message":"Hi"}),
    ("GET", "/enquiry/agency/enquiries", None),
    
    # Booking
    ("POST", "/booking/", {"packageId": 1}),
    ("PATCH", "/booking/update/1", {"status": "confirmed"}),
    
    # Dashboard
    ("GET", "/user/dashboard", None),
    ("GET", "/user/booking/1", None),
    ("PATCH", "/user/booking/1/cancel", None),
    ("GET", "/agency/dashboard/packages", None),
    ("GET", "/agency/dashboard/bookings", None),
    ("GET", "/agency/dashboard/booking/1", None),
    ("PATCH", "/agency/dashboard/booking/1/status", {"status": "completed"}),
    ("GET", "/agency/dashboard/stats", None),
    
    # AI & Features
    ("POST", "/ai/search", {"query": "Kerala trip"}),
    ("POST", "/dna/quiz", {"answers": []}),
    ("GET", "/dna/questions", None),
    ("POST", "/trip/create", {"name": "Goa Trip"}),
    ("POST", "/trip/123/join", {}),
    ("POST", "/trip/123/add-package", {"packageId": 1}),
    ("POST", "/trip/123/vote", {"packageId": 1}),
    ("GET", "/trip/123", None),
    ("PATCH", "/trip/123/close", None),
    ("POST", "/packages/1/view", None),
    ("GET", "/packages/1/social-proof", None),
    ("POST", "/itinerary/generate", {"destination": "Goa"}),
    ("POST", "/matchmaking/score", {"user1": 1, "user2": 2}),
    ("POST", "/gamified/mystery-booking", {}),
    ("POST", "/marketing/reels", {"packageId": 1}),
    ("POST", "/vision/analyze", {"imageUrl": "http://example.com/image.jpg"})
]

def run_tests():
    print(f"--- Starting tests on {BASE_URL} ---")
    for method, url, data in endpoints:
        print(f"\nEvaluating: {method} {url}")
        try:
            if method == "GET":
                res = requests.get(f"{BASE_URL}{url}")
            elif method == "POST":
                res = requests.post(f"{BASE_URL}{url}", json=data)
            elif method == "PATCH":
                res = requests.patch(f"{BASE_URL}{url}", json=data)
            
            print(f"Status: {res.status_code}")
            try:
                resp_data = res.json()
                print(f"Response: {str(resp_data)[:150]}...")
            except:
                print(f"Response: {res.text[:150]}...")
        except Exception as e:
            print(f"Request failed: {e}")

if __name__ == "__main__":
    run_tests()
