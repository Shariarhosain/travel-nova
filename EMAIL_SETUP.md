# Email Setup Instructions

## Updated Configuration (December 2025)

The mail service has been updated to use the latest Mailtrap API. Follow these steps to configure email:

---

## Setup Steps

### 1. Add Environment Variables

Copy your `.env.example` to `.env` if you haven't already:
```bash
cp .env.example .env
```

### 2. Configure Mailtrap (Recommended for Development)

Add these variables to your `.env` file:
```env
MAILTRAP_TOKEN=a8c6723be807f8386ab522582e81e646
MAILTRAP_INBOX_ID=4232898
```

**How to get your Mailtrap credentials:**
1. Go to [Mailtrap.io](https://mailtrap.io/)
2. Sign up or log in
3. Navigate to your inbox
4. Click on "Show Credentials" or "API & SMTP"
5. Copy your API token
6. Copy your Test Inbox ID

---

## Alternative: Use Gmail (Production)

If you want to use Gmail instead of Mailtrap:

1. **Comment out** the Mailtrap variables in `.env`
2. **Add** these Gmail variables:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Getting Gmail App Password:
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security → App Passwords
4. Generate a new app password for "Mail"
5. Use that password (not your regular Gmail password)

---

## Testing the Email

Once configured, test the forgot password flow:

```bash
# 1. Request password reset
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 2. Check your Mailtrap inbox for the 6-digit code

# 3. Verify the code
curl -X POST http://localhost:3000/auth/verify-reset-code \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "123456"}'

# 4. Reset password with the token you received
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"resetToken": "your-token-here", "password": "newPassword123"}'
```

---

## Troubleshooting

### Error: "Cannot find module 'mailtrap'"
**Solution**: Run `npm install mailtrap --legacy-peer-deps`

### Error: "connect ETIMEDOUT"
**Solution**: 
- Check your Mailtrap token is correct
- Ensure you have internet connection
- Verify the inbox ID is correct

### Gmail: "Invalid login"
**Solution**: 
- Use an App Password, not your regular password
- Enable 2-Factor Authentication first
- Make sure "Less secure app access" is enabled (if not using app password)

---

## Package Dependencies

The following packages are required:
- `nodemailer` - Email sending
- `@types/nodemailer` - TypeScript types
- `mailtrap` - Mailtrap API integration

All packages are already installed via:
```bash
npm install nodemailer @types/nodemailer mailtrap --legacy-peer-deps
```
