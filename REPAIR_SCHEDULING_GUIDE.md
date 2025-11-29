# FleetGuard - Repair Scheduling & Calendar Integration Setup

## 🎉 New Features Added

### 1. **Repair Scheduling System**

After AI analysis, users can now schedule repair appointments with automatic calendar invites sent via email.

### 2. **CSV Data Storage**

Repair records are stored in `data/repairs.csv` for simple tracking and export.

### 3. **Calendar Integration**

Automatic `.ics` calendar invites sent via email that users can accept into their personal calendars (Google Calendar, Outlook, Apple Calendar, etc.).

### 4. **Email Notifications**

Professional HTML emails with calendar attachments sent to drivers and managers.

---

## 📋 Setup Instructions

### Step 1: Configure Email Credentials

You need a Gmail account with an App Password to send calendar invites.

#### Get Gmail App Password:

1. **Go to Google Account Settings**: https://myaccount.google.com/security

2. **Enable 2-Step Verification** (if not already enabled):

   - Click "2-Step Verification"
   - Follow the setup process

3. **Generate App Password**:

   - Go to: https://myaccount.google.com/apppasswords
   - Select app: **Mail**
   - Select device: **Other** (enter "FleetGuard")
   - Click **Generate**
   - Copy the 16-character password (remove spaces)

4. **Update `.env.local`**:

   ```env
   MAIL_USER=your-email@gmail.com
   MAIL_APP_PASSWORD=your16charpassword
   ```

   Replace:

   - `your-email@gmail.com` with your actual Gmail address
   - `your16charpassword` with the app password from step 3

### Step 2: Restart Development Server

After updating `.env.local`, restart your Next.js server:

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## 🚀 How to Use

### User Flow:

1. **Complete Vehicle Inspection**

   - Fill out the comprehensive 12-section inspection form
   - Upload photos
   - Submit for AI analysis

2. **View Analysis Results**

   - AI generates health score, issues, and cost estimates
   - Review critical and upcoming maintenance items

3. **Schedule Repair**

   - Click the **"Schedule Repair"** button on the analysis page
   - Choose email option:
     - **Use my email**: Sends to your logged-in email
     - **Custom email**: Enter a different driver email
   - Optionally add a manager email
   - Review AI-suggested repair date (can be changed)
   - Click **"Send Calendar Invite"**

4. **Receive Calendar Invite**
   - Email sent with professional HTML format
   - `.ics` calendar attachment included
   - Accept invite to add to personal calendar
   - Automatic 24-hour reminder

---

## 🗂️ File Structure

```
FleetGuard/
├── data/
│   └── repairs.csv              # Repair scheduling records (auto-created)
│
├── lib/
│   ├── csv.ts                   # CSV file handling utilities
│   └── ics.ts                   # ICS calendar generator
│
├── app/
│   ├── api/
│   │   └── repairs/
│   │       └── route.ts         # API endpoint for scheduling repairs
│   │
│   ├── analysis/[id]/
│   │   └── page.js              # Analysis page with Schedule Repair button
│   │
│   └── vehicle/[id]/
│       └── page.js              # Inspection form (Gemini prompt updated)
│
└── .env.local                   # Environment variables (email credentials)
```

---

## 📊 CSV Schema

`data/repairs.csv` contains:

| Column       | Type   | Description                            |
| ------------ | ------ | -------------------------------------- |
| id           | UUID   | Unique repair record ID                |
| vehicleId    | String | Vehicle identifier (name + plate)      |
| damageLevel  | Enum   | LOW, MEDIUM, HIGH, CRITICAL            |
| repairDate   | Date   | Scheduled repair date (YYYY-MM-DD)     |
| createdAt    | ISO    | Timestamp when repair was scheduled    |
| driverEmail  | Email  | Driver who receives calendar invite    |
| managerEmail | Email  | Optional manager email                 |
| status       | Enum   | "pending" or "completed"               |
| inspectionId | String | Links to Firestore inspection document |

---

## 🔧 API Endpoint

### `POST /api/repairs`

**Request Body:**

```json
{
  "vehicleId": "Mercedes (ABC-1234)",
  "driverEmail": "driver@example.com",
  "managerEmail": "manager@example.com",
  "damageLevel": "HIGH",
  "repairDate": "2025-12-05",
  "reportDetails": "Critical brake pad wear, oil leak detected",
  "inspectionId": "firestore-doc-id"
}
```

**Response (Success):**

```json
{
  "success": true,
  "id": "uuid-here",
  "message": "Repair scheduled and calendar invite sent"
}
```

**Response (Error):**

```json
{
  "error": "Failed to create repair",
  "details": "Email credentials not configured"
}
```

---

## 🤖 AI Integration

### Gemini Prompt Enhanced

The AI analysis now includes:

- **Suggested repair dates** based on severity
- **Repair urgency levels** (CRITICAL, HIGH, MEDIUM, LOW)
- **Timeline recommendations** for each issue

### Repair Date Logic:

| Health Score | Urgency  | Suggested Days | Example Date |
| ------------ | -------- | -------------- | ------------ |
| < 40         | CRITICAL | 1 day          | Tomorrow     |
| 40-60        | HIGH     | 3 days         | In 3 days    |
| 60-80        | MEDIUM   | 7 days         | Next week    |
| > 80         | LOW      | 14 days        | In 2 weeks   |

---

## 📧 Email Template

Users receive a professional HTML email with:

- **FleetGuard branding**
- **Vehicle information**
- **Damage level badge** (color-coded)
- **Scheduled date**
- **Calendar invite attachment**
- **24-hour reminder notification**

---

## 🧪 Testing

### Test the Full Flow:

1. **Create a test vehicle**
2. **Fill inspection form** with some issues
3. **Get AI analysis**
4. **Click "Schedule Repair"**
5. **Use your own email** to test
6. **Check your inbox** for calendar invite
7. **Accept the invite** in your calendar
8. **Verify CSV** created at `data/repairs.csv`

### Verify CSV:

```bash
cat data/repairs.csv
```

---

## ⚠️ Troubleshooting

### Email not sending?

- Verify `MAIL_USER` and `MAIL_APP_PASSWORD` in `.env.local`
- Check Gmail account has 2-Step Verification enabled
- Ensure App Password is correct (16 characters, no spaces)
- Restart Next.js server after updating `.env.local`

### CSV not created?

- Check `data/` directory exists (auto-created)
- Verify file write permissions
- Check server logs for errors

### Calendar invite not appearing?

- Check spam/junk folder
- Ensure email client supports `.ics` attachments
- Try accepting from different email client

### API errors?

- Check browser console for detailed errors
- Verify all required fields in request
- Check server terminal for error logs

---

## 🔐 Security Notes

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use App Passwords** - Never use your actual Gmail password
3. **Validate email inputs** - API validates email formats
4. **Rate limiting** - Consider adding for production

---

## 🎯 Future Enhancements

- [ ] Mark repairs as "completed" in CSV
- [ ] View repair history in dashboard
- [ ] Send reminder emails before repair date
- [ ] Export CSV to Excel format
- [ ] SMS notifications (Twilio integration)
- [ ] Multiple repair scheduling
- [ ] Recurring maintenance schedules

---

## 📝 Integration with Existing System

### Preserves All Current Features:

✅ Firebase Authentication  
✅ Firestore database for inspections  
✅ Comprehensive 12-section forms  
✅ AI diagnostic analysis  
✅ Photo uploads to Firebase Storage  
✅ Health scores and cost estimates

### Adds New Capabilities:

✨ CSV repair tracking  
✨ Calendar invite generation  
✨ Email notifications  
✨ Repair date suggestions  
✨ Manager notifications

---

## 🆘 Support

For issues or questions:

1. Check server logs: `npm run dev`
2. Check browser console
3. Verify `.env.local` configuration
4. Review API response in Network tab
5. Check `data/repairs.csv` file

---

**Built with ❤️ for FleetGuard Hackathon**

Last Updated: November 29, 2025
