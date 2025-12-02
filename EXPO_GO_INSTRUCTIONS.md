# Expo Go - Mobile App Testing Instructions

**Date**: December 2, 2025  
**Status**: Starting Shipper App with Expo Go

---

## 📱 SHIPPER APP - EXPO GO SETUP

### Step 1: Install Expo Go on Your Phone ✅

#### For Android:
Download from **Play Store**: https://play.google.com/store/apps/details?id=host.exp.exponent

#### For iOS:
Download from **App Store**: https://apps.apple.com/app/expo-go/id982107779

---

### Step 2: Start the App (In Progress) 🔄

**Command Running**:
```bash
cd packages/mobile/shipper
pnpm start
```

**Status**: Starting Expo dev server...

---

### Step 3: Scan QR Code 📷

Once Expo starts, you'll see:
1. A **QR code** in the terminal
2. A **URL** (like exp://192.168.x.x:8081)

**To Connect**:
- **Android**: Open Expo Go app → Scan QR code
- **iOS**: Open Camera app → Scan QR code → Open in Expo Go

---

## 📋 SHIPPER APP FEATURES

### Screens Available (8 total):

#### 1. Login Screen ✅
- Phone number input (10 digits)
- OTP authentication
- Rodistaa branding

#### 2. Home/Dashboard ✅
- Active bookings overview
- Quick actions
- Recent activity

#### 3. Bookings List ✅
- View all bookings
- Filter by status
- Search functionality

#### 4. Create Booking ✅
- Pickup location
- Drop location
- Goods details
- Tonnage and price range

#### 5. Booking Details ✅
- View booking information
- See bids from operators
- Accept/reject bids

#### 6. My Bookings (Tab) ✅
- List of your bookings
- Status tracking

#### 7. Active Shipments ✅
- Track ongoing shipments
- GPS tracking
- ETA display

#### 8. Profile/Settings ✅
- User information
- App settings
- Logout

---

## 🧪 TEST CREDENTIALS

**Phone**: `9876543210`  
**OTP**: `123456` (mock)

---

## 🎯 TESTING WORKFLOW

### Complete Booking Flow:

1. **Login**
   - Enter phone: 9876543210
   - Enter OTP: 123456

2. **Create Booking**
   - Tap "Create Booking"
   - Fill pickup: Mumbai Port
   - Fill drop: Delhi Warehouse
   - Enter goods: Electronics
   - Set tonnage: 15
   - Set price range: ₹20,000 - ₹30,000
   - Submit

3. **View Bids**
   - Wait for operators to bid
   - Compare bid amounts
   - Select lowest bid

4. **Track Shipment**
   - View shipment on map
   - Check GPS updates
   - Monitor ETA

5. **Complete Delivery**
   - Verify POD upload
   - Enter OTP for completion
   - Review shipment

---

## 🔧 TROUBLESHOOTING

### QR Code Not Appearing
- Wait 30-60 seconds for Expo to start
- Check terminal output for errors
- Ensure port 8081 is not blocked

### Cannot Connect
- Ensure phone and computer on **same WiFi network**
- Check firewall settings
- Try tunnel mode: Press `t` in terminal

### App Crashes
- Check Expo Go app is latest version
- Clear Expo Go cache
- Restart Expo dev server

---

## 🚀 OTHER APPS AVAILABLE

### Operator App
```bash
cd packages/mobile/operator
pnpm start
```

**Features**: Fleet management, bid placement, driver assignment

### Driver App
```bash
cd packages/mobile/driver
pnpm start
```

**Features**: Shipment execution, GPS streaming, POD upload

---

## 📊 CURRENT STATUS

**Shipper App**: 🔄 Starting...  
**Expo Server**: Will run on port 8081  
**Connection**: Waiting for QR code  

**Check terminal for**:
- QR code to scan
- Connection URL
- Dev server status

---

**Once QR code appears, scan it with Expo Go to test the Shipper app!**

**All 3 mobile apps are ready to run with Expo Go!** 📱

---

**Guide**: EXPO_GO_INSTRUCTIONS.md  
**Date**: December 2, 2025  
**Status**: Shipper app starting...

