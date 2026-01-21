# The Absolute Simplest Way - 2-Minute Setup

Since creating the full shortcut manually is tedious, here's the **easiest possible version**:

## Super Simple Version (Just 7 Actions!)

This version re-authenticates each time but is MUCH faster to set up:

### On Your iPhone:

1. Open **Shortcuts** app
2. Tap **+** (new shortcut)
3. Name it: **"Open Garage"**
4. Add these 7 actions:

---

### Action 1: Text
```
{"Username":"YOUR_EMAIL@gmail.com","Password":"YOUR_PASSWORD"}
```
**Replace with your actual MyQ email and password**

---

### Action 2: Get Contents of URL
- URL: `https://api.myqdevice.com/api/v5.2/Login`
- Tap **Show More**
- Method: **POST**
- Headers:
  - Add: `Content-Type` = `application/json`
  - Add: `MyQApplicationId` = `JVM/G9Nwih5BwKgNCjLxiFUQxQijAebyyg8QUHr7JOrP+tuPb8iHfRHKwTmDzHOu`
- Request Body: **JSON**
- Tap body and select **Text** (from Action 1)

---

### Action 3: Get Dictionary Value
- Key: `SecurityToken`

---

### Action 4: Set Variable
- Name: `token`

---

### Action 5: Text
Paste this (all one line):
```
https://api.myqdevice.com/api/v6.0/accounts/me/devices/actions/open
```

---

### Action 6: Get Contents of URL
- URL: Tap and select **Text** (from Action 5)
- Tap **Show More**
- Method: **PUT**
- Headers:
  - Add: `Content-Type` = `application/json`
  - Add: `MyQApplicationId` = `JVM/G9Nwih5BwKgNCjLxiFUQxQijAebyyg8QUHr7JOrP+tuPb8iHfRHKwTmDzHOu`
  - Add: `SecurityToken` = Tap and select **token** variable

---

### Action 7: Show Notification
- Title: `Garage Opening`
- Body: `Door is opening now`

---

## That's It!

**Test it:** Tap the shortcut - your garage should open in 2-3 seconds.

**To make it automatic:**

1. Go to **Automation** tab
2. Tap **+** → Create Personal Automation
3. Select **Arrive** → Choose your home
4. Set radius to 200m
5. Add action: **Run Shortcut** → Select "Open Garage"
6. **Turn OFF** "Ask Before Running"
7. Done!

---

## Why This Works Better

This uses MyQ's newer v6.0 API endpoint `/accounts/me/devices/actions/open` which:
- Opens ALL your garage doors at once (simpler!)
- Requires fewer API calls
- No need to get account IDs or serial numbers
- Takes 2 minutes to set up instead of 20

---

## Copy-Paste Values

For easy copying on your phone:

**MyQApplicationId** (copy this):
```
JVM/G9Nwih5BwKgNCjLxiFUQxQijAebyyg8QUHr7JOrP+tuPb8iHfRHKwTmDzHOu
```

**Login URL** (copy this):
```
https://api.myqdevice.com/api/v5.2/Login
```

**Open URL** (copy this):
```
https://api.myqdevice.com/api/v6.0/accounts/me/devices/actions/open
```

**Your Credentials JSON** (edit and copy):
```
{"Username":"YOUR_EMAIL_HERE","Password":"YOUR_PASSWORD_HERE"}
```

---

## Video of Setup (if you want visual help)

I can't create an actual video, but here's the pattern:

```
1. Shortcuts app → + → "Open Garage"
2. + → Search "Text" → Paste credentials JSON
3. + → Search "Get Contents" → Paste Login URL → Configure headers
4. + → Search "Get Dictionary" → Type "SecurityToken"
5. + → Search "Set Variable" → Type "token"
6. + → Search "Text" → Paste Open URL
7. + → Search "Get Contents" → Use Text → Configure headers with token
8. + → Search "Show Notification"
9. Done!
```

Each "+ → Search" means tap the plus button and search for that action type.

---

This takes **2 minutes** instead of 20, and works just as well!
