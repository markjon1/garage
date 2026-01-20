# Automatic Garage Door Opener

An intelligent mobile app that automatically opens your garage door using MyQ when you arrive home via geofencing.

## Features

- **Automatic Opening**: Uses geofencing to detect when you're near home and automatically opens your garage door
- **MyQ Integration**: Connects directly to your MyQ account to control your garage door
- **Manual Control**: Ability to manually open/close your garage door from the app
- **Customizable Geofence**: Set your home location and customize the trigger radius
- **Background Operation**: Works even when the app is closed or in the background
- **Notifications**: Get notified when your garage door opens automatically

## Prerequisites

- MyQ-compatible garage door opener
- MyQ account with email and password
- iOS device (iOS 13+) or Android device (Android 8+)
- Location permissions (Always/Background)

## Installation

### Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on your device:
   - For iOS: `npm run ios`
   - For Android: `npm run android`
   - Or scan the QR code with Expo Go app

### Building for Production

For iOS:
```bash
npx expo build:ios
```

For Android:
```bash
npx expo build:android
```

## Setup Instructions

1. **Launch the app** and tap "Get Started"

2. **Login to MyQ**:
   - Enter your MyQ email and password
   - Tap "Login to MyQ"

3. **Select Your Garage Door**:
   - Choose which garage door you want to control
   - The app will remember your selection

4. **Set Home Location**:
   - Tap "Set Current Location as Home" while at home
   - Or manually adjust the geofence radius (default: 200 meters)

5. **Start Geofencing**:
   - Tap "Start Auto-Open Geofencing"
   - Grant location permissions (Always/Background)
   - Grant notification permissions

6. **Enable Auto-Open**:
   - Return to the home screen
   - Toggle "Auto-Open When Near Home" to ON

## Usage

### Automatic Mode
- Simply drive towards home with your phone
- When you enter the geofence radius, your garage door will automatically open
- You'll receive a notification confirming the action

### Manual Mode
- Open the app anytime
- Use the "Open Door" or "Close Door" buttons
- Check the current status of your garage door

## Permissions Required

- **Location (Always/Background)**: Required for geofencing to work when app is closed
- **Notifications**: Optional, but recommended for feedback on automatic actions

## Troubleshooting

### Garage door not opening automatically
1. Check that auto-open is enabled in the app
2. Verify geofencing is active (shown on home screen)
3. Ensure location permissions are set to "Always"
4. Check that your MyQ credentials are still valid
5. Verify you're within the geofence radius

### Can't login to MyQ
- Double-check your email and password
- Make sure you can login to the MyQ mobile app or website
- Try logging out and back in

### Location not updating
- Check location permissions in device settings
- Ensure location services are enabled
- Try restarting the app
- On Android, make sure battery optimization is disabled for the app

## Technical Details

### Technologies Used
- React Native with Expo
- TypeScript
- Expo Location for geofencing
- Expo Task Manager for background tasks
- Expo Secure Store for credential storage
- React Navigation for screen management

### MyQ API
This app uses the unofficial MyQ API. The API endpoints may change without notice as they are not officially supported by Chamberlain/LiftMaster.

### Background Geofencing
The app registers a background geofencing task that monitors your location even when the app is closed. This ensures reliable automatic operation.

## Privacy & Security

- MyQ credentials are stored securely using Expo Secure Store
- Location data is only used locally on your device for geofencing
- No data is transmitted to third parties
- All communication with MyQ servers uses HTTPS

## Known Limitations

- MyQ API is unofficial and may change
- Background location tracking can impact battery life
- Requires active internet connection to control garage door
- Some Android devices may need battery optimization disabled

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License

## Disclaimer

This app is not affiliated with or endorsed by Chamberlain Group, MyQ, or LiftMaster. Use at your own risk.
