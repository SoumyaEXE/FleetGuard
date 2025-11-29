# 🚀 Quick Start - Repair Scheduling Feature

## ⚡ Get Started in 3 Steps

### Step 1: Set Up Email (2 minutes)

1. Go to: https://myaccount.google.com/apppasswords
2. Generate an App Password for "Mail"
3. Copy the 16-character password
4. Open `.env.local` and update:

```env
MAIL_USER=your-email@gmail.com
MAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

> **Note:** Remove spaces from the app password: `abcdefghijklmnop`

### Step 2: Restart Server

```bash
# Press Ctrl+C to stop
npm run dev
```

### Step 3: Test It!

1. **Go to**: http://localhost:3000/dashboard
2. **Add a vehicle** (or use existing one)
3. **Click** "View Details" → Fill inspection form
4. **Submit** → Wait for AI analysis
5. **Click** "Schedule Repair" button
6. **Fill form** and submit
7. **Check your email** 📧

---

## 📧 Email Setup Details

### Gmail App Password Setup

**Why App Password?**

- Gmail requires App Passwords for third-party apps
- More secure than using your actual password
- Required for SMTP access

**Get Your App Password:**

1. **Enable 2-Step Verification** (if not already):

   - Visit: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow setup instructions

2. **Generate App Password**:

   - Visit: https://myaccount.google.com/apppasswords
   - Or search "App passwords" in Google Account settings
   - Sign in if prompted
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Type: "FleetGuard" and click Generate
   - Copy the 16-character password shown
   - Click "Done"

3. **Update `.env.local`**:

   ```env
   MAIL_USER=youremail@gmail.com
   MAIL_APP_PASSWORD=abcdefghijklmnop
   ```

   Replace:

   - `youremail@gmail.com` with your Gmail address
   - `abcdefghijklmnop` with your App Password (no spaces!)

---

## ✅ What's Working

After setup, you can:

✨ **Schedule repairs** from analysis page  
📅 **Send calendar invites** via email  
💾 **Store records** in CSV format  
🤖 **Get AI-suggested dates** based on severity  
📧 **Notify managers** (optional)  
⏰ **Auto-reminders** 24 hours before repair

---

## 🧪 Quick Test

```bash
# 1. Make sure email is configured
cat .env.local | grep MAIL_

# 2. Start server
npm run dev

# 3. Open browser
# http://localhost:3000

# 4. Complete one inspection and schedule repair

# 5. Check CSV was created
ls -la data/repairs.csv
cat data/repairs.csv
```

---

## 🎯 Features at a Glance

### Schedule Repair Button

- Appears on analysis results page
- Opens modal with smart form

### Modal Form

- ✅ Use default email (logged-in user)
- ✅ Or enter custom driver email
- ✅ Optional manager email
- ✅ AI-suggested repair date
- ✅ Can adjust date manually

### Email Sent Contains

- ✅ Professional HTML design
- ✅ Vehicle information
- ✅ Severity badge (color-coded)
- ✅ Scheduled date
- ✅ `.ics` calendar attachment
- ✅ Accept invite button

### CSV Record Includes

- Repair ID (UUID)
- Vehicle ID
- Damage level (CRITICAL/HIGH/MEDIUM/LOW)
- Repair date
- Driver & manager emails
- Status (pending)
- Link to inspection

---

## 🎨 AI Suggestions

The system automatically suggests repair dates based on vehicle health:

| Health Score | Urgency  | Suggested Timeline |
| ------------ | -------- | ------------------ |
| 0-39         | CRITICAL | Tomorrow           |
| 40-59        | HIGH     | 3 days             |
| 60-79        | MEDIUM   | 1 week             |
| 80-100       | LOW      | 2 weeks            |

Users can always override the suggested date.

---

## ⚠️ Troubleshooting

### "Email credentials not configured" error?

- Check `.env.local` has MAIL_USER and MAIL_APP_PASSWORD
- Make sure there are no typos
- Restart the dev server

### Email not received?

- Check spam/junk folder
- Verify email address is correct
- Check server logs for errors
- Try with a different email client

### CSV file not created?

- Check `data/` directory exists
- Look for errors in server logs
- Verify write permissions

### Calendar invite not showing?

- Check if `.ics` file is attached to email
- Try opening in different email client
- Some webmail clients may not show .ics properly

---

## 📁 File Locations

```
FleetGuard/
├── .env.local              ← Update this with email credentials
├── data/
│   └── repairs.csv         ← Auto-created when first repair scheduled
├── lib/
│   ├── csv.ts              ← CSV utilities
│   └── ics.ts              ← Calendar generator
└── app/
    ├── api/repairs/
    │   └── route.ts        ← API endpoint
    └── analysis/[id]/
        └── page.js         ← Has "Schedule Repair" button
```

---

## 🔐 Security Reminder

- ✅ `.env.local` is in `.gitignore` (not committed)
- ✅ Use App Password, not your Gmail password
- ✅ Never share your App Password
- ✅ CSV stored server-side only

---

## 🎓 Learn More

- **Full Guide**: See `REPAIR_SCHEDULING_GUIDE.md`
- **Implementation**: See `IMPLEMENTATION_COMPLETE.md`
- **Project Context**: See `.context.md`

---

## 💬 Need Help?

1. Check server console for errors
2. Check browser console (F12)
3. Read the full guide
4. Verify email setup is correct

---

**Ready to go! Just add your Gmail credentials and test it out.** 🚀

For detailed documentation, see `REPAIR_SCHEDULING_GUIDE.md`
