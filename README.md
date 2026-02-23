# ⚡ CreatorHub — Professional Creator Toolkit

A full-stack MERN application that gives Instagram creators a professional system to manage brand deals, track affiliate revenue, and generate media kits.

---

## 🧩 Features

### 1. 📬 Brand Inquiry CRM
- **Public collab page**: `yourapp.com/collab/:username`
- Professional brand inquiry form (fields: brand name, contact, email, phone, budget, campaign type, timeline, message)
- File upload support for campaign briefs (PDF, PPT, images)
- Auto-reply email to brand on submission
- Creator gets email + WhatsApp notification
- Dashboard with inquiry management (New → Negotiating → Accepted/Closed)
- Deal value tracking for revenue reporting
- Internal notes per inquiry
- Status filter tabs
- CSV export of all inquiries

### 2. 🔗 Affiliate Link Tracker
- Create short trackable links: `yourapp.com/p/:slug`
- Platform tagging (Amazon, Flipkart, Meesho, Myntra, Nykaa, etc.)
- Click analytics: total clicks, 7-day trend
- Device breakdown (mobile/desktop/tablet)
- Hourly click heatmap (24-hour grid)
- Country detection
- UTM parameter auto-injection
- Manual revenue input per link
- ROI tracking

### 3. 📄 Media Kit Generator
- Multi-tab editor (Stats, Audience, Brands, Services, Theme)
- Instagram followers, engagement rate, avg views
- Age group demographics + gender split
- Top audience locations
- Brands worked with history
- Services & rates table
- 4 PDF themes: Minimal, Bold, Gradient, Elegant
- One-click PDF download via Puppeteer
- Public shareable link for media kit

---

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router 6, Chart.js, Axios |
| Backend | Express.js, Node.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| PDF | Puppeteer |
| File Upload | Multer |
| Analytics | Custom click tracking |

---

## 📁 Project Structure

```
creatorhub/
├── backend/
│   ├── models/
│   │   ├── Creator.js          # User model with auth
│   │   ├── BrandInquiry.js     # Brand inquiries + CRM
│   │   ├── Affiliate.js        # AffiliateLink + ClickAnalytics
│   │   └── MediaKit.js         # Media kit data
│   ├── routes/
│   │   ├── auth.js             # Register, login, profile
│   │   ├── brandInquiry.js     # CRUD + email notifications
│   │   ├── affiliate.js        # Link management + analytics
│   │   ├── redirect.js         # /p/:slug click tracking
│   │   ├── mediaKit.js         # Kit CRUD + PDF generation
│   │   └── creators.js         # Public profile
│   ├── middleware/
│   │   └── auth.js             # JWT protection
│   ├── utils/
│   │   └── email.js            # Nodemailer templates
│   ├── uploads/                # Uploaded brief files
│   ├── server.js               # Express app + MongoDB
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js  # Global auth state
│   │   ├── components/
│   │   │   └── Sidebar.js      # Dashboard navigation
│   │   ├── pages/
│   │   │   ├── LandingPage.js      # Marketing homepage
│   │   │   ├── LoginPage.js        # Auth pages
│   │   │   ├── Dashboard.js        # Overview + stats
│   │   │   ├── InquiriesPage.js    # Brand inquiry CRM
│   │   │   ├── AffiliatePage.js    # Link tracker + analytics
│   │   │   ├── MediaKitPage.js     # Media kit editor
│   │   │   └── PublicInquiryForm.js # Public brand form
│   │   ├── App.js              # Routes + layout
│   │   ├── App.css             # Design system
│   │   └── index.js
│   └── package.json
├── setup.sh
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account for SMTP (or other provider)

### Quick Setup
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

**1. Clone and install**
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials

# Frontend
cd ../frontend
npm install
```

**2. Configure `.env`**
```env
MONGO_URI=mongodb://localhost:27017/creatorhub
JWT_SECRET=your_super_secret_key_min_32_chars
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password  # Not your normal password!
APP_URL=http://localhost:3000
```

**3. Enable Gmail App Password**
- Go to myaccount.google.com → Security → 2-Step Verification → App Passwords
- Generate a password for "Mail"

**4. Run**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

---

## 🔗 Key Routes

### Public Routes
| Route | Description |
|-------|-------------|
| `GET /` | Landing page |
| `GET /collab/:username` | Brand inquiry form for creator |
| `GET /p/:slug` | Affiliate link redirect + click tracking |

### API Routes
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register creator |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current creator |
| POST | `/api/brand-inquiry/:username` | Submit brand inquiry (public) |
| GET | `/api/brand-inquiry` | Get all inquiries (auth) |
| PUT | `/api/brand-inquiry/:id` | Update status/notes (auth) |
| GET | `/api/brand-inquiry/export/csv` | Export to CSV (auth) |
| GET | `/api/affiliate/links` | Get links with stats |
| POST | `/api/affiliate/links` | Create link |
| GET | `/api/affiliate/links/:id/analytics` | Detailed analytics |
| GET | `/api/affiliate/dashboard` | Overview stats |
| GET | `/api/media-kit/me` | Get/init media kit |
| PUT | `/api/media-kit/me` | Update media kit |
| GET | `/api/media-kit/download` | Download PDF |

---

## 💎 Upgrade Ideas (Monetization)

### Free Tier
- 1 collab page, 5 links, basic analytics

### Pro Tier (₹299/mo)
- Unlimited links + inquiries
- CSV export
- PDF media kit download
- WhatsApp notifications
- UTM tracking

### Enterprise Tier (₹999/mo)
- Custom domain for collab page
- White-label media kit
- Priority email support
- Revenue analytics dashboard
- Team access

---

## 🔒 Security Features
- JWT token authentication (30-day expiry)
- bcrypt password hashing (salt rounds: 10)
- Rate limiting (100 req/15min)
- File upload validation (type + size)
- CORS configured for specific origin

---

## 📸 Design System

**Colors**
- Primary: `#6C63FF` (Purple)
- Accent: `#4ECDC4` (Teal)
- Text: `#1A1A2E` (Dark Navy)
- Muted: `#6B7280`

**Fonts**
- Display: Playfair Display (headings)
- Body: DM Sans (UI text)

---

Built for the Indian creator economy 🇮🇳
