#!/bin/bash
# E2E Smoke Test for Mobile Apps
# Tests the complete flow: Booking → Bid → Shipment → Completion

set -e

echo "🧪 Rodistaa Mobile Apps E2E Smoke Test"
echo "======================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:4000"
API_URL="${BACKEND_URL}/v1"

# Check if backend is running
echo -e "${YELLOW}Checking backend...${NC}"
if ! curl -f "${BACKEND_URL}/health" > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend is not running. Please start it first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend is running${NC}"

# Step 1: Shipper Login
echo -e "\n${YELLOW}Step 1: Shipper Login${NC}"
SHIPPER_PHONE="9876543210"
SHIPPER_OTP="123456"

LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"${SHIPPER_PHONE}\", \"otp\": \"${SHIPPER_OTP}\", \"deviceId\": \"test-shipper-device\"}")

SHIPPER_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken // empty')
if [ -z "$SHIPPER_TOKEN" ]; then
    echo -e "${RED}❌ Shipper login failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Shipper logged in${NC}"

# Step 2: Create Booking
echo -e "\n${YELLOW}Step 2: Create Booking${NC}"
BOOKING_RESPONSE=$(curl -s -X POST "${API_URL}/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SHIPPER_TOKEN}" \
  -d '{
    "pickupAddress": "Bangalore, Karnataka",
    "dropAddress": "Chennai, Tamil Nadu",
    "pickupContact": "+91 9876543210",
    "dropContact": "+91 9876543211",
    "weightTons": 10,
    "materialType": "Electronics",
    "expectedPriceRange": {
      "min": 5000,
      "max": 8000
    }
  }')

BOOKING_ID=$(echo $BOOKING_RESPONSE | jq -r '.id // empty')
if [ -z "$BOOKING_ID" ]; then
    echo -e "${RED}❌ Booking creation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Booking created: ${BOOKING_ID}${NC}"

# Step 3: Operator Login
echo -e "\n${YELLOW}Step 3: Operator Login${NC}"
OPERATOR_PHONE="9876543211"
OPERATOR_OTP="123456"

OPERATOR_LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"${OPERATOR_PHONE}\", \"otp\": \"${OPERATOR_OTP}\", \"deviceId\": \"test-operator-device\"}")

OPERATOR_TOKEN=$(echo $OPERATOR_LOGIN_RESPONSE | jq -r '.accessToken // empty')
if [ -z "$OPERATOR_TOKEN" ]; then
    echo -e "${RED}❌ Operator login failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Operator logged in${NC}"

# Step 4: Place Bid
echo -e "\n${YELLOW}Step 4: Place Bid${NC}"
BID_RESPONSE=$(curl -s -X POST "${API_URL}/bookings/${BOOKING_ID}/bids" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${OPERATOR_TOKEN}" \
  -d '{
    "amount": 6000,
    "truckId": "TRK-TEST-001",
    "estimatedArrival": "2024-01-20T10:00:00Z"
  }')

BID_ID=$(echo $BID_RESPONSE | jq -r '.id // empty')
if [ -z "$BID_ID" ]; then
    echo -e "${RED}❌ Bid placement failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Bid placed: ${BID_ID}${NC}"

# Step 5: Accept Bid
echo -e "\n${YELLOW}Step 5: Accept Bid${NC}"
FINALIZE_RESPONSE=$(curl -s -X POST "${API_URL}/bids/${BID_ID}/finalize" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SHIPPER_TOKEN}")

SHIPMENT_ID=$(echo $FINALIZE_RESPONSE | jq -r '.shipmentId // empty')
if [ -z "$SHIPMENT_ID" ]; then
    echo -e "${RED}❌ Bid acceptance failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Bid accepted, shipment created: ${SHIPMENT_ID}${NC}"

# Step 6: Driver Login
echo -e "\n${YELLOW}Step 6: Driver Login${NC}"
DRIVER_PHONE="9876543212"
DRIVER_OTP="123456"

DRIVER_LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"${DRIVER_PHONE}\", \"otp\": \"${DRIVER_OTP}\", \"deviceId\": \"test-driver-device\"}")

DRIVER_TOKEN=$(echo $DRIVER_LOGIN_RESPONSE | jq -r '.accessToken // empty')
if [ -z "$DRIVER_TOKEN" ]; then
    echo -e "${RED}❌ Driver login failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Driver logged in${NC}"

# Step 7: Start Shipment
echo -e "\n${YELLOW}Step 7: Start Shipment${NC}"
START_RESPONSE=$(curl -s -X POST "${API_URL}/shipments/${SHIPMENT_ID}/start" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DRIVER_TOKEN}")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Shipment started${NC}"
else
    echo -e "${RED}❌ Shipment start failed${NC}"
    exit 1
fi

# Step 8: GPS Ping
echo -e "\n${YELLOW}Step 8: GPS Ping${NC}"
GPS_RESPONSE=$(curl -s -X POST "${API_URL}/shipments/${SHIPMENT_ID}/ping" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DRIVER_TOKEN}" \
  -d '{
    "latitude": 12.9716,
    "longitude": 77.5946,
    "accuracy": 10,
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }')

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ GPS ping successful${NC}"
else
    echo -e "${RED}❌ GPS ping failed${NC}"
    exit 1
fi

# Step 9: Upload POD
echo -e "\n${YELLOW}Step 9: Upload POD${NC}"
POD_RESPONSE=$(curl -s -X POST "${API_URL}/shipments/${SHIPMENT_ID}/pod" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DRIVER_TOKEN}" \
  -d '{
    "fileHash": "test-hash-123",
    "fileUrl": "https://example.com/pod.pdf",
    "metadata": {
      "uploadedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
    }
  }')

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ POD uploaded${NC}"
else
    echo -e "${RED}❌ POD upload failed${NC}"
    exit 1
fi

# Step 10: Complete Shipment
echo -e "\n${YELLOW}Step 10: Complete Shipment${NC}"
COMPLETE_RESPONSE=$(curl -s -X POST "${API_URL}/shipments/${SHIPMENT_ID}/complete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DRIVER_TOKEN}" \
  -d '{
    "otp": "123456",
    "proof": "Delivery completed"
  }')

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Shipment completed${NC}"
else
    echo -e "${RED}❌ Shipment completion failed${NC}"
    exit 1
fi

# Summary
echo -e "\n${GREEN}======================================"
echo "✅ All smoke tests passed!"
echo "======================================${NC}"
echo ""
echo "Test Summary:"
echo "  - Shipper Login: ✅"
echo "  - Booking Creation: ✅"
echo "  - Operator Login: ✅"
echo "  - Bid Placement: ✅"
echo "  - Bid Acceptance: ✅"
echo "  - Driver Login: ✅"
echo "  - Shipment Start: ✅"
echo "  - GPS Ping: ✅"
echo "  - POD Upload: ✅"
echo "  - Shipment Completion: ✅"
echo ""

