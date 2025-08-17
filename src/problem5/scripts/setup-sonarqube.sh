#!/bin/bash

PROJECT_KEY="bookstore-api"
PROJECT_NAME="Bookstore API"
SONAR_URL="http://localhost:9000"
TOKEN_NAME="${PROJECT_KEY}-token"

echo "🚀 Setting up SonarQube..."

# Start SonarQube
echo "🐳 Starting SonarQube container..."
docker-compose -f docker-compose.sonarqube.yml up -d

# Wait for SonarQube to be ready
echo "⏳ Waiting for SonarQube to start..."
READY=false
for i in {1..30}; do
  STATUS_RESPONSE=$(curl -s "${SONAR_URL}/api/system/status" 2>/dev/null)
  if echo "$STATUS_RESPONSE" | grep -q "UP"; then
    echo "✅ SonarQube is ready!"
    READY=true
    break
  fi
  echo "⏳ Attempt $i/30... (Response: $STATUS_RESPONSE)"
  sleep 5
done

if [ "$READY" = false ]; then
  echo "❌ SonarQube failed to start within 150 seconds"
  exit 1
fi

# Wait additional time for full initialization
echo "⏳ Waiting for full initialization..."
sleep 10

# Create project
echo "📂 Creating SonarQube project..."
PROJECT_RESPONSE=$(curl -s -u admin:admin -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "project=${PROJECT_KEY}&name=${PROJECT_NAME}" \
  "${SONAR_URL}/api/projects/create")

# Check if project was created successfully
if echo "$PROJECT_RESPONSE" | grep -q "project"; then
  echo "✅ Project created successfully"
elif echo "$PROJECT_RESPONSE" | grep -q "already exists"; then
  echo "✅ Project already exists"
else
  echo "⚠️  Project creation response: $PROJECT_RESPONSE"
  # Try alternative method for newer SonarQube versions
  echo "🔄 Trying alternative project creation method..."
  ALT_RESPONSE=$(curl -s -u admin:admin -X POST \
    -H "Content-Type: application/json" \
    -d "{\"project\":\"${PROJECT_KEY}\",\"name\":\"${PROJECT_NAME}\"}" \
    "${SONAR_URL}/api/projects/create")
  echo "📄 Alternative response: $ALT_RESPONSE"
fi

# Generate token
echo "🔑 Generating token..."
TOKEN_RESPONSE=$(curl -s -u admin:admin -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=${TOKEN_NAME}" \
  "${SONAR_URL}/api/user_tokens/generate")

echo "📄 Token response: $TOKEN_RESPONSE"

# Extract token from response
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to generate token. Response: $TOKEN_RESPONSE"
  exit 1
fi

# Save token to .env file
echo "SONAR_TOKEN=${TOKEN}" >> .env
echo "SONAR_URL=${SONAR_URL}" >> .env

echo ""
echo "✅ Setup completed!"
echo "🔑 Token saved to .env file"
echo "🌐 Access SonarQube at: ${SONAR_URL}"
echo "👤 Login: admin / admin"
echo ""
echo "🎯 Run analysis with: npm run sonar:analyze"
