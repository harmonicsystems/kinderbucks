# Kinderbucks - Technical Reference

## Project Overview
A local currency and rewards system for Kinderhook, NY village businesses. Physical currency with digital QR-based verification, business check-ins, membership tiers, and promotional codes.

**Live Site:** `https://harmonicsystems.github.io/kinderbucks`

## Tech Stack
- **Frontend:** React 18 + Vite
- **Routing:** React Router v6 with `HashRouter` (GitHub Pages compatibility)
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication (Google Sign-In)
- **QR Generation:** `qrcode.react` with custom styling
- **Animations:** Framer Motion
- **Icons:** Lucide React (no emojis - they render inconsistently)
- **Maps:** Google Maps JavaScript API + Places API
- **Hosting:** GitHub Pages

## Authentication & Roles

### Role Hierarchy
```javascript
// src/firebase/auth.js
export const ROLES = {
  ADMIN: 'admin',      // Full system access
  BUSINESS: 'business', // Business dashboard access
  MEMBER: 'member'      // Regular member (default)
}
```

### Role Logic (AuthContext.jsx)
```javascript
const isAdmin = profile?.role === ROLES.ADMIN
// Admins with a businessCode also get business access
const isBusiness = profile?.role === ROLES.BUSINESS || (isAdmin && profile?.businessCode)
const isMember = profile?.role === ROLES.MEMBER || isAuthenticated
```

**Key:** Admins can be assigned a `businessCode` to also view the Business Dashboard.

## Firebase Collections

### `users`
```javascript
{
  uid: "firebase-uid",
  email: "user@example.com",
  displayName: "Name",
  role: "admin" | "business" | "member",
  businessCode: "AVIARY", // Optional - links to business
  createdAt: Timestamp,
  lastLogin: Timestamp
}
```

### `businesses`
```javascript
{
  code: "AVIARY",           // Primary key
  name: "The Aviary",
  category: "food" | "retail" | "services" | "arts",
  isActive: true,
  checkinCount: 42,
  createdAt: Timestamp
}
```

### `kinderbucks`
```javascript
{
  serial: "KB-0042",
  denomination: 5,
  status: "draft" | "issued" | "active" | "redeemed" | "retired",
  issuedAt: Timestamp,
  scanCount: 12,
  lastScanned: Timestamp
}
```

### `checkins`
```javascript
{
  odaCode: "ODA-XXXXXX",    // 6-char unique ID
  odaCodeHash: "sha256...", // For validation
  memberId: "firebase-uid",
  memberEmail: "user@example.com",
  businessCode: "AVIARY",
  businessName: "The Aviary",
  timestamp: Timestamp
}
```

### `promoCodes`
```javascript
{
  code: "SUMMER10",
  businessCode: "AVIARY",
  discountType: "percentage" | "fixed" | "freeItem",
  discountValue: 10,
  description: "10% off summer drinks",
  minTier: "curious" | "hooked" | "lineAndSinker" | "villagePatron",
  usageLimit: 100,
  usageCount: 42,
  expiresAt: Timestamp,
  isActive: true,
  createdAt: Timestamp
}
```

## Membership Tiers

```javascript
// src/utils/membershipTiers.js
export const MEMBERSHIP_TIERS = {
  curious: {
    name: 'Curious',
    minCheckins: 0,
    color: '#94a3b8'
  },
  hooked: {
    name: 'Hooked',
    minCheckins: 5,
    color: '#c9a227'
  },
  lineAndSinker: {
    name: 'Line & Sinker',
    minCheckins: 15,
    color: '#16a34a'
  },
  villagePatron: {
    name: 'Village Patron',
    minCheckins: 30,
    color: '#7c3aed'
  }
}
```

## Business Data (VillageMap.jsx)

Businesses with verified addresses for Google Maps:

| Code | Name | Category |
|------|------|----------|
| AVIARY | The Aviary | food |
| MORNINGBIRD | Morningbird Cafe | food |
| SAISONNIER | Saisonnier | food |
| BROADST-BAGEL | Broad Street Bagel Co. | food |
| ISOLA | Isola Wine Bar | food |
| BOTTLE-SHOP | Kinderhook Bottle Shop | retail |
| SAMASCOTTS | Samascott's Garden Market | retail |
| SAMASCOTT-ORCHARDS | Samascott Orchards | retail |
| SCHOOL-GALLERY | The School \| Jack Shainman Gallery | arts |
| OLD-DUTCH | The Old Dutch Inn | services |
| VILLAGE-YOGA | Village Yoga | services |
| WALSH-DENTISTRY | Walsh & Walsh Dentistry | services |
| FEED-SEED | The Feed and Seed | services |

**Map Implementation:** Uses Google Places API `findPlaceFromQuery` for accurate coordinates, with Geocoding API fallback for addresses.

## Key Files

### Pages
- `src/pages/Home.jsx` - Landing page
- `src/pages/Demo.jsx` - Public demo with audience tabs (customer/business/association)
- `src/pages/Scan.jsx` - Kinderbuck verification (`/scan/:serial`)
- `src/pages/Checkin.jsx` - Business check-in (`/checkin/:businessCode`)
- `src/pages/MemberDashboard.jsx` - Member's check-in history and tier
- `src/pages/BusinessDashboard.jsx` - Business Resource Center (5 tabs)
- `src/pages/Admin*.jsx` - Admin pages (Dashboard, Businesses, Users, Generate, Issue)

### Components
- `src/components/QRCode.jsx` - Styled QR with denomination colors
- `src/components/VillageMap.jsx` - Google Maps with business markers
- `src/components/AdminLayout.jsx` - Admin page wrapper
- `src/components/ProtectedRoute.jsx` - Role-based route guards

### Firebase Modules
- `src/firebase/config.js` - Firebase initialization
- `src/firebase/auth.js` - Auth functions + user management
- `src/firebase/kinderbucks.js` - Kinderbuck CRUD
- `src/firebase/businesses.js` - Business CRUD
- `src/firebase/checkins.js` - Check-in operations + getAllCheckins
- `src/firebase/promoCodes.js` - Promo code CRUD + validation

### Contexts
- `src/contexts/AuthContext.jsx` - Auth state + role helpers

## Business Dashboard (5 Tabs)

1. **Overview** - Stats, recent check-ins, growth metrics
2. **QR Code** - Printable QR with display guide
3. **Promo Codes** - Create/manage codes with tier requirements
4. **Village Trends** - Aggregate data, category breakdown, leaderboard
5. **Resource Guide** - Expandable help sections

## Deployment

```bash
# Development
npm run dev

# Build and deploy to GitHub Pages
npm run build
npm run deploy
```

**Note:** Uses `HashRouter` - all routes work as `/#/path`

## Google APIs Required

1. **Maps JavaScript API** - Map display
2. **Places API** - Business location lookup
3. **Geocoding API** - Address fallback

API key is in `VillageMap.jsx` and restricted to the GitHub Pages domain.

## Design Patterns

- **No emojis in code** - Use Lucide React icons instead (emojis render inconsistently)
- **Responsive breakpoint:** 900px for major layout changes
- **Color palette:** CSS variables in `index.css` (`--kb-navy`, `--kb-gold`, `--kb-green`, etc.)
- **Cards:** `.card` class for consistent container styling
- **Buttons:** `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-gold` classes
