<div align="center">

# <img src="https://img.icons8.com/fluency/96/business-contact.png" width="70"/> CardConnect AI

### 🚀 Smart Business Card Scanner with OCR, CRM Integration & Automated Communication

<p align="center">

Transform physical business cards into digital contacts using AI-powered OCR, automatically sync them with Zoho CRM, send personalized follow-up Emails & WhatsApp messages, and securely manage contacts with offline support.

</p>

<p align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![NodeJS](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![OCR.Space](https://img.shields.io/badge/OCR-OCR.Space-blue)
![Zoho CRM](https://img.shields.io/badge/Zoho-CRM-red)
![WhatsApp API](https://img.shields.io/badge/Meta-WhatsApp%20Cloud%20API-25D366?logo=whatsapp)
![EmailJS](https://img.shields.io/badge/EmailJS-Automation-orange)
![IndexedDB](https://img.shields.io/badge/Offline-IndexedDB-success)

</p>

</div>

---

# 📖 Overview

**CardConnect AI** is a modern Progressive Web Application (PWA) that digitizes business cards using **OCR.Space**, intelligently extracts contact details, detects duplicates, synchronizes contacts with **Zoho CRM**, sends personalized **Email** and **WhatsApp** follow-up messages, and securely stores data for offline use.

Designed for professionals, businesses, networking events, and exhibitions, the application streamlines contact management while reducing manual data entry.

---

# ✨ Key Features

## 📷 Smart Business Card Scanning

- Upload image
- Camera capture
- OCR.Space API integration
- Automatic text extraction

---

## 🤖 Intelligent OCR Parsing

Automatically extracts:

- 👤 Name
- 🏢 Company
- 📧 Email
- 📱 Phone Number
- 🌐 Website
- 💼 Designation
- 📍 Address

with post-processing and intelligent parsing.

---

## ✍ Editable Review Screen

Before saving, users can:

- Edit OCR results
- Correct mistakes
- Modify Email message
- Modify WhatsApp template parameters
- Verify extracted information

---

## 🔍 Duplicate Detection

Prevents duplicate contacts by checking:

- Email
- Phone Number

against Zoho CRM before insertion.

---

## ☁ Zoho CRM Integration

Automatically:

- Creates Leads
- Detects existing contacts
- Maps business card fields
- Synchronizes contact data

---

## 📧 Email Automation

Integrated with **EmailJS**

Features:

- Editable email template
- Personalized follow-up email
- Automatic sending after successful CRM sync

---

## 💬 WhatsApp Automation

Integrated using **Meta WhatsApp Cloud API**

Supports:

- Approved Template Messages
- Dynamic parameters
- Personalized follow-up
- Business communication

---

## 📦 Offline Support

Even without internet:

✔ Scan cards

✔ Store contacts locally

✔ Queue pending operations

✔ Auto-sync when online

---

## 🔐 Secure Local Storage

Uses:

- IndexedDB
- Offline Queue
- Encrypted Local Storage

to protect locally stored business contacts.

---

# ⚙ System Workflow

```text
Business Card
      │
      ▼
OCR.Space
      │
      ▼
Text Extraction
      │
      ▼
Smart Parser
      │
      ▼
Review Contact
      │
      ▼
Duplicate Detection
      │
      ▼
Save & Send
      │
 ┌────┼────────────┐
 ▼    ▼            ▼
Zoho  EmailJS   WhatsApp
 CRM
      │
      ▼
IndexedDB Backup
```

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3

## Backend

- Node.js
- Express.js

## OCR

- OCR.Space API

## CRM

- Zoho CRM API

## Communication

- EmailJS
- Meta WhatsApp Cloud API

## Database

- IndexedDB

## Hosting

- Vercel
- Render

---

# 📂 Project Structure

```text
CardConnect-AI

frontend/
│
├── components/
├── services/
├── utils/
├── hooks/
├── context/
├── assets/

backend/
│
├── controllers/
├── routes/
├── services/
├── middleware/
├── config/

Documentation/
README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone <repository-url>
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Backend

```bash
cd backend

npm install

npm run dev
```

---

# 🔑 Environment Variables

Create:

```text
backend/.env
```

Required variables include:

- Zoho CRM Credentials
- WhatsApp Cloud API Credentials
- EmailJS Configuration
- OCR.Space API Key

> **Important:** Never commit actual API keys or secrets. Keep your `.env` file out of version control and use placeholder values or a `.env.example` file instead.

---

# 🌟 Highlights

- AI-powered OCR extraction
- Smart duplicate detection
- CRM automation
- Automated Email follow-up
- Automated WhatsApp follow-up
- Offline-first architecture
- Secure local storage
- Responsive design
- Progressive Web Application (PWA)

---

# 📈 Future Enhancements

- AI-powered OCR correction
- Multi-language OCR
- QR Code contact sharing
- Contact analytics dashboard
- Voice notes
- Calendar reminders
- Business card categorization
- AI contact summary
- Mobile application

---

# 🎯 Use Cases

- Business Networking
- Conferences
- Sales Teams
- Marketing Professionals
- Recruitment
- Startup Events
- Client Relationship Management

---

# 📸 Screenshots

> Add screenshots here

- Home Screen
- Scan Screen
- Review Screen
- Duplicate Detection
- Zoho CRM Sync
- Email Preview
- WhatsApp Success

---



---

# ⭐ If you like this project

Give this repository a ⭐ and support the project!

---

<div align="center">

Made with ❤️ using React, Node.js, OCR.Space, Zoho CRM & Meta WhatsApp Cloud API

</div>
