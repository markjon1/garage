# Quick Start: iPhone Shortcut to Open Garage

The simplest way to auto-open your garage door using just iOS Shortcuts.

## 5-Minute Setup

### 1. Create the Shortcut (2 minutes)

1. Open **Shortcuts** app
2. Tap **+** to create new shortcut
3. Name it **"Open My Garage"**
4. Copy this shortcut link and open it on your iPhone:

**Or build it manually:**

Add these actions in order:

```
1. Dictionary with:
   {
     "Username": "YOUR_MYQ_EMAIL",
     "Password": "YOUR_MYQ_PASSWORD"
   }

2. Get Contents of URL
   - URL: https://api.myqdevice.com/api/v5.2/Login
   - Method: POST
   - Headers:
     • Content-Type: application/json
     • MyQApplicationId: JVM/G9Nwih5BwKgNCjLxiFUQxQijAebyyg8QUHr7JOrP+tuPb8iHfRHKwTmDzHOu
   - Body: JSON = Dictionary (from step 1)

3. Get Dictionary Value
   - Key: SecurityToken
   - Dictionary: Contents of URL

4. Set Variable
   - Variable Name: Token

5. Get Contents of URL
   - URL: https://api.myqdevice.com/api/v5.2/Accounts
   - Method: GET
   - Headers:
     • Content-Type: application/json
     • MyQApplicationId: JVM/G9Nwih5BwKgNCjLxiFUQxQijAebyyg8QUHr7JOrP+tuPb8iHfRHKwTmDzHOu
     • SecurityToken: [Token variable]

6. Get Dictionary Value
   - Key: accounts
   - Dictionary: Contents of URL

7. Get Item from List
   - Get: First Item

8. Set Variable
   - Variable Name: Account

9. Get Dictionary Value
   - Key: account_id
   - Dictionary: Account

10. Set Variable
    - Variable Name: AccountID

11. Get Dictionary Value
    - Key: devices
    - Dictionary: Account

12. Filter
    - Find all items where:
      device_family is "garagedoor"
    - Limit: 1

13. Get Item from List
    - Get: First Item

14. Set Variable
    - Variable Name: Device

15. Get Dictionary Value
    - Key: serial_number
    - Dictionary: Device

16. Set Variable
    - Variable Name: SerialNumber

17. Text
    - {"action_type": "open"}

18. Get Contents of URL
    - URL: https://api.myqdevice.com/api/v5.2/Accounts/[AccountID]/Devices/[SerialNumber]/actions
    - Method: PUT
    - Headers:
      • Content-Type: application/json
      • MyQApplicationId: JVM/G9Nwih5BwKgNCjLxiFUQxQijAebyyg8QUHr7JOrP+tuPb8iHfRHKwTmDzHOu
      • SecurityToken: [Token variable]
    - Body: JSON = Text (from step 17)

19. Show Notification
    - Title: Garage Opening
    - Body: Your garage door is now opening
```

### 2. Test It (30 seconds)

1. Tap the shortcut to run it
2. Your garage should open
3. If it works, proceed to automation

### 3. Set Up Automation (2 minutes)

1. In Shortcuts app, go to **Automation** tab
2. Tap **+** → **Create Personal Automation**
3. Select **Arrive**
4. Choose your home location
5. Set radius to **200 meters** (or your preference)
6. Tap **Next**
7. Search for **"Run Shortcut"**
8. Select **"Open My Garage"**
9. Tap **Next**
10. **Toggle OFF** "Ask Before Running" ⚠️ Important!
11. Tap **Done**

### 4. Grant Permissions (30 seconds)

When you run it the first time:
- Allow access to myqdevice.com
- Allow notifications

---

## That's It!

Now when you arrive home:
1. Your iPhone detects you're within 200m of home
2. Automatically runs the shortcut
3. Opens your garage door
4. Shows you a notification

---

## Pros vs. the React Native App

| Feature | iOS Shortcut | React Native App |
|---------|-------------|------------------|
| Setup time | 5 minutes | 30+ minutes |
| Installation | Nothing to install | Expo Go or build required |
| Battery impact | Minimal | Moderate |
| Reliability | Very high | High |
| Customization | Limited | Extensive |
| Works offline | ✅ Yes (after login) | ❌ No |
| Background running | ✅ Native iOS | ✅ Via Expo |

---

## Tips

**Increase radius** if it doesn't trigger in time:
- Automation → Edit → Change radius to 300-500m

**Add delay** if you want time to slow down first:
- Add "Wait 10 seconds" action before the URL actions

**Close door when leaving**:
- Create duplicate automation
- Choose "Leave" instead of "Arrive"
- Change action_type to "close"

**Add to home screen**:
- Long press the shortcut
- Select "Add to Home Screen"
- Tap the icon to manually open garage anytime

---

## Security

Your password is stored in the shortcut, but:
- Only accessible from your iPhone
- Protected by your device passcode/Face ID
- Never sent anywhere except MyQ servers
- Can be deleted anytime

To remove:
- Delete the shortcut and automation

---

## Troubleshooting

**"This shortcut can't be opened"**
- Make sure you're building it manually step-by-step

**Automation not running**
- Settings → Shortcuts → Allow Running Automatically = ON
- "Ask Before Running" must be OFF

**API error**
- Check your MyQ email/password
- Make sure they work in the MyQ app first

**Wrong garage door opening**
- Modify step 12 filter to match your specific door name
- Or adjust to get Second Item instead of First Item

---

This is the simplest, most reliable way to auto-open your garage with your iPhone!
