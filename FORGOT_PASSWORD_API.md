# Forgot Password API Documentation

## Overview
The forgot password feature implements a 3-step secure process:
1. **Request Reset Code**: User requests a password reset via email
2. **Verify Code**: User enters the 6-digit code received via email
3. **Reset Password**: User sets a new password using the reset token

---

## API Endpoints

### 1. Request Password Reset Code

**Endpoint**: `POST /auth/forgot-password`

**Description**: Sends a 6-digit verification code to the user's email address.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset code sent to your email"
}
```

**Notes**:
- The code expires in 10 minutes
- For security, the response is the same whether the email exists or not
- Only one active reset request per email (old ones are deleted)

---

### 2. Verify Reset Code

**Endpoint**: `POST /auth/verify-reset-code`

**Description**: Verifies the 6-digit code and returns a reset token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response** (200 OK):
```json
{
  "message": "Code verified successfully",
  "resetToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid or expired verification code
```json
{
  "statusCode": 400,
  "message": "Invalid or expired verification code"
}
```

---

### 3. Reset Password

**Endpoint**: `POST /auth/reset-password`

**Description**: Sets a new password using the reset token.

**Request Body**:
```json
{
  "resetToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "password": "newSecurePassword123"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid or expired reset token
- `404 Not Found`: User not found

**Notes**:
- Password must be at least 6 characters
- All active device sessions are logged out for security
- The reset token is deleted after successful password reset

---

## Complete Flow Example

### Step 1: Request Reset Code
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Step 2: Check Email & Verify Code
User receives an email with a 6-digit code (e.g., `123456`)

```bash
curl -X POST http://localhost:3000/auth/verify-reset-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "code": "123456"
  }'
```

Response includes the `resetToken`:
```json
{
  "message": "Code verified successfully",
  "resetToken": "abc123..."
}
```

### Step 3: Reset Password
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "resetToken": "abc123...",
    "password": "myNewPassword123"
  }'
```

---

## Email Configuration

### Option 1: Mailtrap (for testing)
Add to your `.env` file:
```env
MAILTRAP_TOKEN=a8c6723be807f8386ab522582e81e646
MAILTRAP_INBOX_ID=4232898
```

**Note**: 
- Get your Mailtrap token from [Mailtrap Dashboard](https://mailtrap.io/)
- The inbox ID is found in your Mailtrap inbox settings
- Uses the new Mailtrap API with `mailtrap` npm package

### Option 2: Gmail (for production)
Add to your `.env` file:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=shariarhosain1315@gmail.com
EMAIL_PASS=ihgrauqvhsfuhxlh
```

**Note**: Comment out `MAILTRAP_TOKEN` to use Gmail.

---

## Email Template

The password reset email includes:
- Beautiful responsive HTML design
- 6-digit verification code prominently displayed
- 10-minute expiration warning
- Security notice not to share the code
- Professional branding for Travel Nova

---

## Security Features

1. **Code Expiration**: Verification codes expire after 10 minutes
2. **One-Time Use**: Reset tokens are deleted after successful password reset
3. **Session Invalidation**: All device sessions are logged out after password reset
4. **Rate Limiting**: Only one active reset request per email
5. **Privacy**: Doesn't reveal if email exists in the system
6. **Secure Tokens**: 64-character random reset tokens

---

## Database Schema

```prisma
model PasswordReset {
  id            String   @id @default(uuid())
  email         String
  code          String
  resetToken    String?  @unique
  isVerified    Boolean  @default(false)
  expiresAt     DateTime
  createdAt     DateTime @default(now())

  @@index([email])
  @@index([code])
  @@map("password_resets")
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200 OK`: Success
- `400 Bad Request`: Invalid input or expired code/token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server/email sending error

---

## Testing with Postman

Import the provided Postman collection or manually test:

1. **Forgot Password**
   - Method: POST
   - URL: `http://localhost:3000/auth/forgot-password`
   - Body (JSON):
     ```json
     {"email": "test@example.com"}
     ```

2. **Verify Code**
   - Method: POST
   - URL: `http://localhost:3000/auth/verify-reset-code`
   - Body (JSON):
     ```json
     {"email": "test@example.com", "code": "123456"}
     ```

3. **Reset Password**
   - Method: POST
   - URL: `http://localhost:3000/auth/reset-password`
   - Body (JSON):
     ```json
     {"resetToken": "your-token-here", "password": "newPassword123"}
     ```
