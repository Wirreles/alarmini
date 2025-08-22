# Firebase Setup Instructions

## 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "shared-alarm-app"
4. Enable Google Analytics (optional)
5. Create project

## 2. Enable Cloud Messaging
1. In Firebase Console, go to "Project Settings"
2. Click on "Cloud Messaging" tab
3. Note down the "Server key" and "Sender ID"

## 3. Setup Firebase Functions
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize project: `firebase init functions`
4. Select existing project: "shared-alarm-app"
5. Choose TypeScript
6. Install dependencies

## 4. Deploy Functions
\`\`\`bash
cd functions
npm install
npm run build
firebase deploy --only functions
\`\`\`

## 5. Update Configuration
1. Copy the function URLs from deployment output
2. Update `lib/firebase-config.js` with your project details
3. Update API_ENDPOINTS with your deployed function URLs

## 6. Test Functions
Use these curl commands to test:

### Subscribe Device
\`\`\`bash
curl -X POST https://your-region-your-project.cloudfunctions.net/subscribeToAlarm \
  -H "Content-Type: application/json" \
  -d '{"token": "test-fcm-token"}'
\`\`\`

### Send Alarm
\`\`\`bash
curl -X POST https://your-region-your-project.cloudfunctions.net/sendAlarmNotification \
  -H "Content-Type: application/json" \
  -d '{"type": "sound", "message": "Test alarm"}'
\`\`\`

## 7. Mobile App Integration
- Add Firebase SDK to your mobile app
- Configure FCM for push notifications
- Use the API endpoints to subscribe/send alarms
