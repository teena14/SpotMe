#!/bin/bash

# SpotMe API Test Script
# This script tests the main API endpoints

BASE_URL="http://localhost:5000/api"

echo "🧪 Testing SpotMe API..."
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Check..."
curl -s $BASE_URL/health | json_pp
echo ""

# Test 2: Register User
echo "2️⃣ Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@spotme.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User"
  }')

echo $REGISTER_RESPONSE | json_pp
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"
echo ""

# Test 3: Login
echo "3️⃣ Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@spotme.com",
    "password": "test123"
  }')

echo $LOGIN_RESPONSE | json_pp
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo ""

# Test 4: Create Layout (will fail if not admin)
echo "4️⃣ Testing Create Layout..."
curl -s -X POST $BASE_URL/layouts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Floor",
    "description": "Test floor layout",
    "floor": "1",
    "capacity": 20
  }' | json_pp
echo ""

# Test 5: Get Layouts
echo "5️⃣ Testing Get Layouts..."
curl -s -X GET $BASE_URL/layouts \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo ""

# Test 6: Get Notifications
echo "6️⃣ Testing Get Notifications..."
curl -s -X GET $BASE_URL/notifications \
  -H "Authorization: Bearer $TOKEN" | json_pp
echo ""

echo "✅ API Tests Complete!"
