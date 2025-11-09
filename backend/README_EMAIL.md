# Email Feature - Developer Guide

## Quick Reference

### Setup (First Time Only)

1. **Get Gmail App Password:**
   ```
   https://myaccount.google.com/apppasswords
   ```

2. **Update .env:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   FRONTEND_URL=http://localhost:3000
   ```

3. **Test:**
   ```bash
   node test-email.js
   ```

4. **Restart Server:**
   ```bash
   npm start
   ```

---

## How It Works

```
Frontend (Add Employee Form)
         ↓
    POST /employees
         ↓
Backend (employeeController.js)
    ├─> Create employee in DB
    ├─> Hash password
    ├─> Commit transaction
    ├─> Send welcome email (async) ← NEW!
    └─> Return success response
         ↓
Email Service (emailService.js)
    ├─> Connect to Gmail SMTP
    ├─> Build HTML email
    ├─> Send to employee
    └─> Log result
         ↓
Employee receives email with:
    • Employee ID
    • Email
    • Password
    • Login link
```

---

## Code Example

### Sending Welcome Email

```javascript
const { sendWelcomeEmail } = require('./utils/emailService');

// After creating employee
await connection.commit();

// Send email (non-blocking)
sendWelcomeEmail({
  email: 'employee@company.com',
  first_name: 'John',
  last_name: 'Doe',
  employee_id: 'DEMO-EMP-2025-001',
  password: 'TempPass123',
  company_name: 'WorkZen'
});

// Response sent immediately
return res.json({ ok: true, message: "Employee added" });
```

---

## Email Template

The email includes:
- ✅ Welcome header with company name
- ✅ Employee credentials (ID, email, password)
- ✅ Security warning
- ✅ Login button
- ✅ Next steps instructions
- ✅ Professional footer

---

## Testing

### Test Email Configuration
```bash
node test-email.js
```

### Test Full Flow
1. Start backend: `npm start`
2. Start frontend: `cd ../frontend && npm run dev`
3. Login as admin: `admin@demo.com` / `admin123`
4. Add new employee with your email
5. Check your inbox

---

## Troubleshooting

### Email not sending?
```bash
# Check console for errors
✅ Welcome email sent successfully: <message-id>
❌ Error sending welcome email: <error>
```

### Common Issues:
- Wrong email/password in .env
- Need to enable 2-Step Verification
- Using regular password instead of App Password
- Firewall blocking SMTP port 587

---

## Files

```
backend/
├── utils/
│   └── emailService.js       # Email functions
├── controllers/
│   └── employeeController.js # Sends email
├── .env                      # Email config
└── test-email.js            # Test script
```

---

## Environment Variables

```env
# Required
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional
FRONTEND_URL=http://localhost:3000
```

---

## Security

- ✅ App Password (not account password)
- ✅ Environment variables (not hardcoded)
- ✅ Password sent only once
- ✅ Encourages password change
- ✅ HTTPS login link

---

## Support

- Setup Guide: `../EMAIL_SETUP_GUIDE.md`
- Quick Start: `../QUICK_START_EMAIL.md`
- Full Summary: `../EMAIL_FEATURE_SUMMARY.md`

---

**Status:** ✅ Ready to Use
