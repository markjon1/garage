# iOS Shortcut Setup for Automatic Garage Door Opening

This is a much simpler solution using iOS Shortcuts - no app needed!

## Overview

You'll create 2 shortcuts:
1. **MyQ Login** - Gets your security token (run once, or when token expires)
2. **Open Garage** - Opens your garage door
3. **Automation** - Triggers "Open Garage" when you arrive home

---

## Step 1: Create "MyQ Login" Shortcut

1. Open the **Shortcuts** app on your iPhone
2. Tap **+** (top right) to create a new shortcut
3. Name it **"MyQ Login"**
4. Add these actions:

### Actions:

**1. Text**
```
Enter your MyQ email here
```
(Replace with your actual MyQ email)

**2. Set Variable**
- Name: `email`

**3. Text**
```
Enter your MyQ password here
```
(Replace with your actual MyQ password)

**4. Set Variable**
- Name: `password`

**5. Get Contents of URL**
- URL: `https://api.myqdevice.com/api/v5.2/Login`
- Method: `POST`
- Headers:
  - `Content-Type`: `application/json`
  - `MyQApplicationId`: `JVM/G9Nwih5BwKgNCjLxiFUQxQijAebyyg8QUHr7JOrP+tuPb8iHfRHKwTmDzHOu`
- Request Body: `JSON`
- Body content:
```json
{
  "Username": "[email variable]",
  "Password": "[password variable]"
}
```

**6. Get Dictionary Value**
- Key: `SecurityToken`

**7. Set Variable**
- Name: `token`

**8. Save File**
- Save `token` to iCloud Drive/Shortcuts/myq_token.txt

**9. Show Notification**
- Title: "MyQ Login Successful"
- Body: "Token saved"

---

## Step 2: Create "Open Garage" Shortcut

1. Create a new shortcut
2. Name it **"Open Garage"**
3. Add these actions:

### Actions:

**1. Get File**
- File: iCloud Drive/Shortcuts/myq_token.txt

**2. Set Variable**
- Name: `token`

**3. Get Contents of URL** (Get Account ID)
- URL: `https://api.myqdevice.com/api/v5.2/Accounts`
- Method: `GET`
- Headers:
  - `Content-Type`: `application/json`
  - `MyQApplicationId`: `JVM/G9Nwih5BwKgNCjLxiFUQxQijAebyyg8QUHr7JOrP+tuPb8iHfRHKwTmDzHOu`
  - `SecurityToken`: `[token variable]`

**4. Get Dictionary Value**
- Key path: `accounts[0].account_id`

**5. Set Variable**
- Name: `accountId`

**6. Get Dictionary Value**
- Key path: `accounts[0].devices`

**7. Filter**
- Where `device_family` is `garagedoor`
- Limit: 1

**8. Get Dictionary Value**
- Key: `serial_number`

**9. Set Variable**
- Name: `serialNumber`

**10. Get Contents of URL** (Open Door)
- URL: `https://api.myqdevice.com/api/v5.2/Accounts/[accountId]/Devices/[serialNumber]/actions`
- Method: `PUT`
- Headers:
  - `Content-Type`: `application/json`
  - `MyQApplicationId`: `JVM/G9Nwih5BwKgNCjLxiFUQxQijAebyyg8QUHr7JOrP+tuPb8iHfRHKwTmDzHOu`
  - `SecurityToken`: `[token variable]`
- Request Body: `JSON`
- Body:
```json
{
  "action_type": "open"
}
```

**11. Show Notification**
- Title: "Garage Opening"
- Body: "Your garage door is opening"

---

## Step 3: Set Up Location Automation

1. Open **Shortcuts** app
2. Tap **Automation** tab (bottom)
3. Tap **+** (top right)
4. Choose **Create Personal Automation**
5. Select **Arrive**
6. Tap **Choose** next to Location
7. Search for your home address and select it
8. Set **Radius** (200m recommended)
9. Tap **Next**
10. Tap **Add Action**
11. Search for "Run Shortcut"
12. Select **"Open Garage"** shortcut
13. Tap **Next**
14. **IMPORTANT**: Toggle OFF "Ask Before Running"
15. Tap **Done**

---

## Initial Setup

### First Time:
1. Run **"MyQ Login"** shortcut manually once
   - This saves your security token
2. Test **"Open Garage"** shortcut manually
   - Make sure it works
3. The automation will now run automatically when you arrive home

### If it stops working:
- Token may have expired (they last ~30 days)
- Just run **"MyQ Login"** again to get a new token

---

## Simplified Version (Even Easier!)

If the above is too complex, here's a single shortcut:

### "Open My Garage" (All-in-One)

1. Create new shortcut named "Open My Garage"
2. Add these actions:

**Text** (your email)
**Set Variable**: `email`

**Text** (your password)
**Set Variable**: `password`

**Get Contents of URL**: Login endpoint (as above)
**Get Dictionary Value**: `SecurityToken`
**Set Variable**: `token`

**Get Contents of URL**: Get accounts (as above)
**Get Dictionary Value**: `accounts[0].account_id`
**Set Variable**: `accountId`

**Get Dictionary Value**: `accounts[0].devices`
**Filter**: `device_family` is `garagedoor`
**Get Dictionary Value**: `serial_number`
**Set Variable**: `serialNumber`

**Get Contents of URL**: Open door action (as above)
**Show Notification**: "Garage Opening"

Then set up the automation to run this single shortcut.

---

## Security Notes

⚠️ **Important**:
- Your MyQ password will be stored in the shortcut in plain text
- Only you have access to your shortcuts
- Consider using a strong device passcode
- The token file is stored in your private iCloud Drive

---

## Advantages Over the App

✅ No app to install
✅ Native iOS feature
✅ Works completely offline (after token is obtained)
✅ Lower battery usage
✅ Instant triggering
✅ No Expo/React Native needed
✅ Can add to home screen

---

## Troubleshooting

**Automation not running:**
- Check Settings → Shortcuts → Allow Running Automatically
- Make sure "Ask Before Running" is OFF
- Check location permissions for Shortcuts app

**API errors:**
- Token expired - run MyQ Login again
- MyQ credentials changed - update the text values
- MyQ API changed - check MyQ API documentation

**Door not opening:**
- Run the shortcut manually to see error messages
- Check MyQ app to verify door is online
- Verify serial number is correct

---

Would you like me to create downloadable .shortcut files for you? Or walk you through setting this up step-by-step?
