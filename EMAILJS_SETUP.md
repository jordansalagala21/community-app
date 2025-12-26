# EmailJS Setup Instructions

## Quick Setup (5 minutes)

### Step 1: Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Click "Sign Up" (it's FREE - 200 emails/month)
3. Sign up with your email

### Step 2: Add Email Service

1. In EmailJS Dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail recommended)
4. Click "Connect Account" and authorize
5. Copy your **Service ID** (looks like: `service_abc1234`)

### Step 3: Create Email Template

1. Go to "Email Templates"
2. Click "Create New Template"
3. Use this template content:

**Subject:**

```
Account Approved - {{subject}}
```

**Body:**

```
Dear {{to_name}},

{{message}}

Best regards,
HOA Administration Team
```

4. Save the template
5. Copy your **Template ID** (looks like: `template_xyz5678`)

### Step 4: Get Public Key

1. Go to "Account" → "General"
2. Find your **Public Key** (looks like: `aBcDeFgHiJkLmNo`)

### Step 5: Add to Your .env File

1. Create a `.env` file in your project root (copy from `.env.example`)
2. Add these values:

```env
VITE_EMAILJS_SERVICE_ID=service_abc1234
VITE_EMAILJS_TEMPLATE_ID=template_xyz5678
VITE_EMAILJS_PUBLIC_KEY=aBcDeFgHiJkLmNo
```

3. Restart your dev server: `npm run dev`

### Step 6: Test It!

1. Create a new resident account
2. Go to Admin Dashboard → Residents
3. Click "Approve" on the pending account
4. The resident will receive an email! ✅

## Template Variables Reference

Your EmailJS template can use these variables:

- `{{to_email}}` - Recipient's email
- `{{to_name}}` - Resident's name
- `{{subject}}` - Email subject
- `{{message}}` - Full approval message
- `{{login_link}}` - Direct link to login page

## Troubleshooting

**Emails not sending?**

- Check console for error messages
- Verify all 3 credentials are correct
- Make sure you restarted the dev server after adding .env
- Check EmailJS dashboard for delivery status

**Rate limiting?**

- Free tier: 200 emails/month
- Upgrade for more: https://www.emailjs.com/pricing/

## Security Note

Your `.env` file is already in `.gitignore` - credentials won't be committed to Git! ✅
