# Kinderbucks - Technical Roadmap

## Project Overview
A local currency tracking system for a village economic stimulus program. Physical currency with digital QR-based verification and tracking.

## Tech Stack
- **Frontend:** React 18+
- **Hosting:** GitHub Pages (`harmonicsystems.github.io/kinderbucks`)
- **Database:** Firebase Firestore
- **QR Generation:** `qrcode.react` with custom styling
- **Animations:** Framer Motion (for fun scan confirmations)

## Scale
- **Initial Run:** 2,000 Kinderbucks
- **Serial Format:** `KB-XXXX` (KB-0001 through KB-2000)
- **Denominations:** TBD (suggest: $1, $5, $10, $20)

---

## Features

### 1. QR Scan & Verify (Public)
**Route:** `/scan/:serialNumber`

When a user scans a Kinderbuck QR code:
- Look up serial in Firestore
- Log scan event (timestamp, basic analytics)
- Display fun, animated confirmation page
  - Validity status
  - Denomination
  - Issue date
  - Playful graphics/confetti

**Example URL:** `https://harmonicsystems.github.io/kinderbucks/scan/KB-0042`

### 2. QR Code Generator (Admin)
**Route:** `/admin/generate`

- Batch generate QR codes for serial range
- Custom styling (colors, rounded corners, logo center)
- Export as:
  - Individual PNGs
  - Print-ready PDF sheet
- Each QR encodes full scan URL

### 3. Admin Dashboard (Admin)
**Route:** `/admin/dashboard`

- View all issued Kinderbucks
- Filter by denomination, issue date, status
- Scan history / analytics
- Mark bills as: `issued`, `active`, `redeemed`, `retired`

### 4. Issuance Tracker (Admin)
**Route:** `/admin/issue`

- Record when bills are issued
- Optional: link to participating business or recipient
- Update status in Firestore

---

## Data Model

### Firestore Collection: `kinderbucks`

```javascript
{
  serial: "KB-0042",
  denomination: 5,
  status: "active", // draft | issued | active | redeemed | retired
  issuedAt: Timestamp,
  issuedTo: "string (optional)",
  scanCount: 12,
  lastScanned: Timestamp,
  createdAt: Timestamp
}
```

### Firestore Collection: `scans`

```javascript
{
  serial: "KB-0042",
  scannedAt: Timestamp,
  userAgent: "string (optional, for analytics)"
}
```

---

## Project Structure

```
kinderbucks/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── QRCode.jsx          # Styled QR component
│   │   ├── ScanResult.jsx      # Verification display
│   │   ├── Confetti.jsx        # Fun animations
│   │   └── AdminNav.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Scan.jsx            # /scan/:serial route
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminGenerate.jsx
│   │   └── AdminIssue.jsx
│   ├── firebase/
│   │   ├── config.js
│   │   └── kinderbucks.js      # Firestore operations
│   ├── utils/
│   │   └── serialGenerator.js
│   ├── App.jsx
│   └── index.jsx
├── package.json
├── vite.config.js              # or CRA config
└── README.md
```

---

## Deployment Notes

### GitHub Pages with React Router
- Use `HashRouter` for GitHub Pages compatibility
- Or configure redirects with a 404.html trick for `BrowserRouter`
- Set `homepage` in package.json: `"https://harmonicsystems.github.io/kinderbucks"`

### Firebase Setup
1. Create Firebase project
2. Enable Firestore (start in test mode, secure later)
3. Add web app, copy config to `src/firebase/config.js`
4. Set up Firestore security rules for public read on scan, admin write

---

## QR Code Styling Goals
- Rounded modules (not harsh squares)
- Village/community color palette
- Small logo or mascot in center (error correction allows ~15% coverage)
- High contrast for reliable scanning
- Consider denomination-based color coding

---

## Future Enhancements (v2)
- [ ] Business directory integration
- [ ] Circulation velocity analytics
- [ ] Leaderboard for participating merchants
- [ ] Digital wallet companion (claim/transfer)
- [ ] Physical bill design templates
- [ ] Expiration/seasonal campaigns

---

## Getting Started (Claude Code)

```bash
# Create project
npm create vite@latest kinderbucks -- --template react
cd kinderbucks

# Install dependencies
npm install firebase react-router-dom qrcode.react framer-motion

# Firebase setup
npm install -g firebase-tools
firebase login
firebase init firestore

# Dev server
npm run dev

# Build & deploy
npm run build
npm run deploy  # after gh-pages setup
```

---

## Commands for Claude Code

When working on this project, useful prompts:
- "Set up the Firebase config and Firestore connection"
- "Create the QR code generator component with cute rounded styling"
- "Build the scan verification page with confetti animation"
- "Generate seed data for 2000 Kinderbucks across 4 denominations"
- "Set up GitHub Pages deployment with HashRouter"
