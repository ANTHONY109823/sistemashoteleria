import requests
import json
import sys

BASE_URL = "http://localhost:5036/api"
# Check if running on https, adjust if needed based on launchSettings.json
# launchSettings said: http://localhost:5036 and https://localhost:7259

def test_api():
    print("1. Authenticating...")
    auth_data = {
        "email": "admin@hotel.com",
        "password": "Pa$$w0rd!"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/Auth/Login", json=auth_data)
    except requests.exceptions.ConnectionError:
        print(f"ERROR: Could not connect to {BASE_URL}. Is the server running?")
        sys.exit(1)

    if response.status_code != 200:
        print(f"Login Failed: {response.status_code} - {response.text}")
        return

    token = response.json().get("token")
    if not token:
        print("Login succeeded but no token returned.")
        return

    print("Login Successful. Token received.")
    headers = {"Authorization": f"Bearer {token}"}

    print("\n2. Testing Create Room Type...")
    create_data = {
        "name": "Test Room Type Script",
        "description": "Created by python script",
        "basePrice": 123.45,
        "capacity": 2
    }

    response = requests.post(f"{BASE_URL}/RoomTypes", json=create_data, headers=headers)
    
    if response.status_code not in [200, 201]:
        print(f"Create Failed: {response.status_code} - {response.text}")
        return

    # Assuming response is the ID (Guid)
    room_type_id = response.json()
    print(f"Create Successful. ID: {room_type_id}")

    print("\n3. Testing Update Room Type...")
    update_data = {
        "id": room_type_id,
        "name": "Test Room Type Script Updated",
        "description": "Updated by python script",
        "basePrice": 200.00,
        "capacity": 3
    }
    
    # Note: The controller expects ID in URL and ID in Body
    response = requests.put(f"{BASE_URL}/RoomTypes/{room_type_id}", json=update_data, headers=headers)

    if response.status_code != 200:
        print(f"Update Failed: {response.status_code} - {response.text}")
    else:
        print("Update Successful.")

if __name__ == "__main__":
    test_api()
