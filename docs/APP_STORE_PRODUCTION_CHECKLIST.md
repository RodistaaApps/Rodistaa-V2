# 📱 App Store Production Checklist

Complete checklist for preparing Rodistaa mobile apps for store submission.

---

## Pre-Submission Checklist

### ✅ App Functionality
- [ ] All features working in production build
- [ ] No console.log or debug code
- [ ] No test/development API endpoints
- [ ] Proper error handling for all edge cases
- [ ] Offline functionality working (if applicable)
- [ ] Push notifications configured and tested
- [ ] Deep linking working
- [ ] App doesn't crash on startup
- [ ] No memory leaks detected

### ✅ Performance
- [ ] App launches in < 3 seconds
- [ ] Smooth scrolling (60 FPS)
- [ ] Images optimized
- [ ] App size < 50MB (initial download)
- [ ] Network requests optimized
- [ ] Battery usage acceptable

### ✅ UI/UX
- [ ] All screens responsive (different device sizes)
- [ ] Dark mode supported (if applicable)
- [ ] Accessibility features implemented
- [ ] Loading states for all async operations
- [ ] Error messages user-friendly
- [ ] No placeholder text/images
- [ ] App follows platform design guidelines

### ✅ Security
- [ ] SSL pinning implemented
- [ ] Sensitive data encrypted
- [ ] No hardcoded secrets/API keys
- [ ] Biometric authentication working
- [ ] Token refresh implemented
- [ ] Secure storage used for credentials

### ✅ Legal & Compliance
- [ ] Privacy policy published and linked
- [ ] Terms of service published and linked
- [ ] Data collection disclosed
- [ ] GDPR compliance (if applicable)
- [ ] Age rating determined
- [ ] Export compliance reviewed

### ✅ App Store Assets

#### App Icons
- [ ] iOS Icon (1024x1024, PNG, no alpha)
- [ ] Android Adaptive Icon (512x512, PNG)
- [ ] Background layer (432x432)
- [ ] Foreground layer (432x432)

#### Screenshots (iOS)
- [ ] 6.7" (iPhone 14 Pro Max): 1290x2796 (3 required)
- [ ] 6.5" (iPhone 11 Pro Max): 1242x2688 (3 required)
- [ ] 5.5" (iPhone 8 Plus): 1242x2208 (3 required)
- [ ] 12.9" iPad Pro: 2048x2732 (optional)

#### Screenshots (Android)
- [ ] Phone: 1080x1920 minimum (2-8 required)
- [ ] 7" Tablet: 1200x1920 (optional)
- [ ] 10" Tablet: 1600x2560 (optional)
- [ ] Feature Graphic: 1024x500 (required)

#### App Previews/Videos
- [ ] iOS: 15-30 seconds, H.264, portrait
- [ ] Android: 30-120 seconds, optional

---

## App Store Metadata

### Shipper App

#### Name
- **iOS**: Rodistaa Shipper - Book Trucks
- **Android**: Rodistaa Shipper
- **Max**: 30 characters

#### Subtitle (iOS only)
"Book trucks instantly across India"

#### Short Description (Android)
"Book FTL & PTL trucks instantly. Real-time tracking. Secure payments."

#### Full Description
```
Rodistaa Shipper - India's Most Trusted Logistics Platform

📦 BOOK TRUCKS INSTANTLY
• Full Truck Load (FTL) & Part Truck Load (PTL)
• 50,000+ verified trucks across India
• Competitive pricing through smart bidding
• Instant booking or receive multiple quotes

📍 REAL-TIME TRACKING
• Live GPS tracking of your shipment
• ETA updates and route optimization
• Driver details and contact
• Proof of delivery with photos

💰 SECURE PAYMENTS
• Pay after delivery
• Multiple payment options
• Transparent pricing
• Digital invoices

✅ TRUSTED BY 10,000+ BUSINESSES
• 99.5% on-time delivery rate
• 24/7 customer support
• Insurance covered shipments
• Verified operators and drivers

🚀 FEATURES
• Smart bid matching
• Multi-city shipments
• Bulk booking discounts
• Dedicated account manager
• Fleet management dashboard

Download now and experience hassle-free logistics!

Support: support@rodistaa.com
Website: www.rodistaa.com
```

#### Keywords (iOS - 100 chars max)
"truck booking, logistics, transport, freight, shipping, cargo, delivery, trucking, FTL, PTL"

#### Category
- **Primary**: Business
- **Secondary**: Productivity

#### Content Rating
- **Everyone** (no age restriction)

---

### Operator App

#### Name
- **iOS**: Rodistaa Operator - Manage Fleet
- **Android**: Rodistaa Operator

#### Short Description
"Manage your truck fleet, receive bookings, and track shipments in real-time."

#### Full Description
```
Rodistaa Operator - Grow Your Transport Business

🚛 RECEIVE MORE BOOKINGS
• Access 1000+ daily bookings
• Smart bid on opportunities
• Instant booking notifications
• Competitive commission rates

📊 FLEET MANAGEMENT
• Manage unlimited trucks
• Track all vehicles in real-time
• Driver assignment & tracking
• Revenue and expense tracking

💼 BUSINESS GROWTH
• Build your reputation
• Get verified badge
• Access premium customers
• Franchise opportunities

📱 EASY OPERATIONS
• Paperless documentation
• Digital POD collection
• Instant payments
• Financial reports

Join 5,000+ transport operators growing with Rodistaa!

Support: support@rodistaa.com
Website: www.rodistaa.com
```

---

### Driver App

#### Name
- **iOS**: Rodistaa Driver - Start Earning
- **Android**: Rodistaa Driver

#### Short Description
"Accept trips, navigate to destination, and earn money with your truck."

#### Full Description
```
Rodistaa Driver - Drive & Earn

🚚 START EARNING TODAY
• Accept trip requests instantly
• Flexible working hours
• Weekly payouts
• Bonus incentives

🗺️ SMART NAVIGATION
• Turn-by-turn GPS directions
• Traffic updates
• Fuel station finder
• Toll information

📸 EASY DOCUMENTATION
• Digital delivery proof
• Photo upload POD
• E-signature collection
• Automated billing

💵 TRANSPARENT EARNINGS
• Track your income daily
• Trip history and reports
• Instant notifications
• Direct bank transfers

👨‍✈️ DRIVER BENEFITS
• Insurance coverage
• 24/7 support
• Training programs
• Safety features

Join 50,000+ drivers earning with Rodistaa!

Support: support@rodistaa.com
Website: www.rodistaa.com
```

---

## Build Configuration

### iOS (Shipper App)

**File**: `packages/mobile/shipper/app.json`
```json
{
  "expo": {
    "name": "Rodistaa Shipper",
    "slug": "rodistaa-shipper",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.rodistaa.shipper",
      "buildNumber": "1",
      "supportsTablet": false,
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to show nearby trucks and estimate delivery times.",
        "NSCameraUsageDescription": "We need camera access to upload shipment photos.",
        "NSPhotoLibraryUsageDescription": "We need access to your photos to upload shipment images."
      }
    },
    "android": {
      "package": "com.rodistaa.shipper",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

---

## Build & Submit Commands

### iOS Build
```bash
cd packages/mobile/shipper

# 1. Update version
# Edit app.json: version and ios.buildNumber

# 2. Build for production
eas build --platform ios --profile production

# 3. Submit to App Store
eas submit --platform ios
```

### Android Build
```bash
cd packages/mobile/shipper

# 1. Update version
# Edit app.json: version and android.versionCode

# 2. Build for production
eas build --platform android --profile production

# 3. Submit to Play Store
eas submit --platform android
```

---

## EAS Configuration

**File**: `packages/mobile/shipper/eas.json`
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      },
      "ios": {
        "buildConfiguration": "Release"
      },
      "env": {
        "API_URL": "https://api.rodistaa.com/v1",
        "SENTRY_DSN": "https://xxxxx@sentry.io/xxxxx",
        "GOOGLE_MAPS_KEY": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@rodistaa.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account.json",
        "track": "production"
      }
    }
  }
}
```

---

## Review Preparation

### Common Rejection Reasons

1. **Crashes on Launch**
   - Test on multiple devices
   - Handle all error cases

2. **Incomplete Information**
   - Ensure all metadata filled
   - Screenshots match app functionality

3. **Privacy Policy Missing**
   - Must be accessible without login
   - Must explain data collection

4. **Broken Links**
   - Test all external links
   - Ensure support email works

5. **Location Usage**
   - Clearly explain why location is needed
   - Must work if location denied

---

## Post-Submission

### Monitor Review Status
- iOS: Check App Store Connect daily
- Android: Check Google Play Console

### Typical Review Times
- iOS: 2-5 business days
- Android: 1-3 business days

### If Rejected
1. Read rejection reason carefully
2. Fix the issue
3. Resubmit with detailed explanation

### After Approval
1. ✅ Test live app immediately
2. ✅ Monitor crash reports (Sentry)
3. ✅ Check user reviews
4. ✅ Respond to feedback

---

## Version Updates

For future updates:

```bash
# 1. Update version numbers
# iOS: Increment version (1.0.0 → 1.0.1) and buildNumber (1 → 2)
# Android: Increment version and versionCode

# 2. Write release notes
# Summarize what's new, improved, and fixed

# 3. Build and submit
eas build --platform all --profile production
eas submit --platform all
```

---

## Support Information

### Required Links
- **Support URL**: https://rodistaa.com/support
- **Privacy Policy**: https://rodistaa.com/privacy
- **Terms of Service**: https://rodistaa.com/terms

### Contact Information
- **Support Email**: support@rodistaa.com
- **Phone**: +91-XXXXXXXXXX
- **Address**: [Company Address]

---

## Final Checks Before Submission

- [ ] All 3 apps built successfully
- [ ] Tested on physical devices (iOS & Android)
- [ ] All required metadata filled
- [ ] Screenshots uploaded
- [ ] Privacy policy live
- [ ] Support email working
- [ ] Developer accounts active
- [ ] Payment information configured
- [ ] Team members have access
- [ ] Release notes prepared

---

**Ready to submit?** Follow the [APP_STORE_SUBMISSION_GUIDE.md](./guides/APP_STORE_SUBMISSION_GUIDE.md) for step-by-step instructions!

