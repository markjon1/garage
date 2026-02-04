# Add Native iOS Widget to the React Native App

This guide shows how to add a true native iOS widget to the React Native garage door app.

## What You Get

- **Small Widget**: Shows door status, tap to open
- **Medium Widget**: Shows status + Open/Close buttons
- **Live Updates**: Widget updates every 5 minutes
- **Native Performance**: True iOS widget using WidgetKit

---

## Prerequisites

- Mac with Xcode 14+
- iOS 14+ device or simulator
- The React Native app from this repo
- Apple Developer Account

---

## Setup Steps

### Step 1: Build the iOS Project

First, generate the native iOS files:

```bash
cd /home/user/garage
npx expo prebuild --platform ios
```

This creates the `ios/` folder with native Xcode project.

---

### Step 2: Add Widget Extension in Xcode

1. Open the project in Xcode:
```bash
open ios/garage.xcworkspace
```

2. In Xcode, click **File → New → Target**

3. Select **Widget Extension**

4. Configure:
   - Product Name: `GarageWidget`
   - Team: Your Apple Developer Team
   - Language: **Swift**
   - Include Configuration Intent: **Unchecked**
   - Click **Finish**

5. When asked "Activate GarageWidget scheme?", click **Activate**

---

### Step 3: Add the Widget Code

1. In Xcode, find **GarageWidget** folder in the project navigator

2. Delete the existing `GarageWidget.swift` file

3. Copy the `ios-widget/GarageWidget.swift` file from this repo into the `GarageWidget` folder

4. Make sure it's added to the **GarageWidget** target (not the main app)

---

### Step 4: Enable App Groups

Both the main app and widget need to share data:

**For Main App:**
1. Select **garage** target
2. Go to **Signing & Capabilities**
3. Click **+ Capability**
4. Add **App Groups**
5. Click **+** and add: `group.com.garage.autoopener`

**For Widget:**
1. Select **GarageWidget** target
2. Repeat the same steps
3. Add the same group: `group.com.garage.autoopener`

---

### Step 5: Update React Native App to Share Data

Edit `/home/user/garage/services/myq.ts` and add this method to the `MyQService` class:

```typescript
async updateWidgetData(doorState: string): Promise<void> {
  // On iOS, update shared UserDefaults for widget
  if (Platform.OS === 'ios') {
    try {
      const SharedGroupPreferences = require('react-native').NativeModules.SharedGroupPreferences;
      if (SharedGroupPreferences) {
        await SharedGroupPreferences.setItem('doorState', doorState, 'group.com.garage.autoopener');
      }
    } catch (error) {
      console.log('Could not update widget:', error);
    }
  }
}
```

Then in `/home/user/garage/screens/HomeScreen.tsx`, update the `updateDoorState` function:

```typescript
const updateDoorState = async (serialNumber: string) => {
  try {
    const state = await myqService.getDeviceState(serialNumber);
    setDoorState(state.door_state);

    // Update widget
    await myqService.updateWidgetData(state.door_state);
  } catch (error) {
    console.error('Failed to get door state:', error);
  }
};
```

---

### Step 6: Add URL Scheme Handling

The widget uses deep links. Add this to `App.tsx`:

```typescript
import { Linking } from 'react-native';

// Inside the App component, add:
useEffect(() => {
  const handleDeepLink = async (event: { url: string }) => {
    const url = event.url;

    if (url === 'garage://open') {
      // Open garage door
      const serial = await AsyncStorage.getItem('selected_garage_serial');
      if (serial) {
        await myqService.openDoor(serial);
      }
    } else if (url === 'garage://close') {
      // Close garage door
      const serial = await AsyncStorage.getItem('selected_garage_serial');
      if (serial) {
        await myqService.closeDoor(serial);
      }
    }
  };

  // Handle URL when app is opened from widget
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink({ url });
    }
  });

  // Handle URL when app is already open
  const subscription = Linking.addEventListener('url', handleDeepLink);

  return () => {
    subscription.remove();
  };
}, []);
```

---

### Step 7: Update Info.plist

1. In Xcode, open **garage/Info.plist**

2. Add URL scheme:
   - Right click → **Add Row**
   - Key: `URL types` (Array)
   - Expand it, add item
   - Add `URL Schemes` (Array)
   - Expand it, add item: `garage`

Or add this XML to Info.plist:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>garage</string>
        </array>
    </dict>
</array>
```

---

### Step 8: Build and Run

1. In Xcode, select your device or simulator

2. Select the **garage** scheme (not GarageWidget)

3. Click **Run** (▶️)

4. Once the app is running, go to home screen

5. Long press → Add Widget → Search "Garage Control"

6. Add the widget!

---

## Widget Features

### Small Widget:
- Shows current door state icon
- Shows state text (Open/Closed/etc)
- Tap anywhere to open door

### Medium Widget:
- Shows large door state icon
- Shows state text
- "Open" button
- "Close" button
- Each button works independently

### Widget Updates:
- Updates every 5 minutes automatically
- Updates when you open the main app
- Updates after controlling the door

---

## Troubleshooting

**Widget shows "Unknown":**
- Run the main app first to initialize data
- Make sure App Groups are configured correctly
- Check that both targets use the same group ID

**Widget doesn't open app:**
- Verify URL scheme in Info.plist
- Check deep link handling code in App.tsx
- Make sure the app is installed

**Build errors:**
- Make sure Xcode is up to date
- Clean build folder: Product → Clean Build Folder
- Delete `ios/Pods` and run `pod install` again

**Widget not updating:**
- Widgets update every 5 minutes max
- Use the main app to force an update
- Check shared UserDefaults are being written

---

## Customization

### Change Colors:
Edit `GarageWidget.swift`, find the gradients:
```swift
LinearGradient(
    gradient: Gradient(colors: [Color.blue.opacity(0.8), Color.blue]),
    // Change Color.blue to Color.green, Color.purple, etc.
```

### Change Icons:
Find `doorStateIcon` variables and change SF Symbols:
- `door.garage.open` → your preferred icon
- `door.garage.closed` → your preferred icon
- See [SF Symbols App](https://developer.apple.com/sf-symbols/) for all icons

### Change Update Frequency:
In `getTimeline`, change:
```swift
let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: currentDate)!
// Change value: 5 to value: 1 for every minute (uses more battery)
```

---

## Alternative: Use the Shortcut Widget Instead

If native widgets seem too complex, **use the iOS Shortcut approach from `WIDGET_SETUP.md`**:
- ✅ No Xcode needed
- ✅ No native code
- ✅ 30 seconds to set up
- ✅ Works perfectly

The shortcut widget is honestly the easier solution for most people!

---

## Distribution

To share with others:

1. Build for distribution in Xcode
2. Archive the app
3. Submit to TestFlight or App Store
4. Widget will work automatically once app is installed

---

This gives you a true native iOS widget experience, but requires Mac + Xcode. For a simpler solution, use the Shortcut widget from `WIDGET_SETUP.md`!
