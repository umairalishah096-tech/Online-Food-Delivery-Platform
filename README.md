# 🍔 FoodRush — Online Food Delivery Platform

A full-stack food delivery web app built with **React 19 + Firebase**, featuring a customer storefront and a complete admin dashboard.

---

## ✨ Features

### Customer Frontend
- **Home page** — Hero search, category pills, featured restaurants, how-it-works, CTA
- **Restaurant listing** — Search, filter by cuisine/category, sort by rating/delivery time/fee, open-now toggle
- **Restaurant detail** — Menu (search + category tabs), Info, Reviews tabs; sticky cart sidebar; mobile cart bar
- **Cart** — Quantity controls, promo codes (WELCOME10, RUSH20, NEWUSER), order summary
- **Checkout** — 2-step (address → payment); COD + card simulation; order saved to Firestore
- **Order tracking** — Real-time Firestore subscription; animated progress stepper; auto-progresses status
- **Order history** — Search + filter by status; all past orders
- **User dashboard** — Stats (total orders, spent, active), active order live feed, recent orders
- **Profile settings** — Avatar upload (Firebase Storage), update name/phone/address, change password

### Admin Dashboard (`/admin`)
- **Overview** — KPI cards, 7-day revenue (area chart) + orders (bar chart), recent orders table
- **Orders** — Status filter chips, search, full data table, order detail modal with inline status update
- **Restaurants** — Card grid, full CRUD modal, image upload, toggle open/closed
- **Menu Items** — Table, CRUD modal with image upload, availability toggle, category/restaurant filters
- **Users** — Table with role management (promote/demote admin), user detail modal
- **Analytics** — 6-month revenue & orders charts, restaurant revenue horizontal bar, order status pie, avg order line chart
- **Settings** — Seed sample data, clear orders, admin profile, Firebase status

### Advanced Features
- **Real-time order tracking** — Live Firestore listener, animated stepper, auto-progress simulation
- **Reviews & ratings** — Star picker, duplicate check, live-appended on submit
- **Real-time notifications** — Bell icon with unread count, dropdown panel, mark-as-read
- **Image upload** — Firebase Storage for avatars, restaurant images, menu item images with progress bar
- **Role-based access** — Admin vs user roles enforced in UI and Firestore security rules
- **Analytics charts** — Full recharts dashboard with 5 chart types

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Routing | React Router v7 |
| State | Context API (Auth, Cart, Notifications) |
| Backend | Firebase Auth, Firestore, Storage |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | react-hot-toast |
| Forms | Custom hooks + react-hook-form |
| Date utils | date-fns |

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

### First-time Setup
1. Register an account at `/register`
2. In Firestore, manually set your user's `role` field to `"admin"`
3. Log in and navigate to `/admin/settings`
4. Click **"Seed Sample Restaurants & Menu"** to populate data

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@foodrush.pk | admin123 |

> Create this account via `/register`, then set `role: "admin"` in Firestore → users collection.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── food/         # FoodCard, RestaurantCard, ReviewForm, CategoryFilter, OrderStatusBadge
│   ├── layout/       # Navbar, Footer, NotificationPanel
│   └── ui/           # Button, Input, Modal, Badge, Card, EmptyState, StarRating, ...
├── contexts/         # AuthContext, CartContext, NotificationContext
├── firebase/         # config.js, firestore.js, storage.js
├── hooks/            # useFirestore.js, useSeedData.js
├── layouts/          # MainLayout, AdminLayout
├── pages/
│   ├── admin/        # Dashboard, Orders, Restaurants, MenuItems, Users, Analytics, Settings
│   ├── auth/         # Login, Register, ForgotPassword
│   ├── customer/     # Cart, Checkout, OrderTracking, OrderHistory, UserProfile, UserDashboard
│   └── public/       # Home, Restaurants, RestaurantDetail, About, Contact
└── routes/           # ProtectedRoute, PublicRoute
```

---

## 🔒 Security Rules

- Firestore rules in `firestore.rules` — users own their data, admins control everything
- Storage rules in `storage.rules` — image type + 5MB size validation
- New accounts are forced to use the `user` role; promote the first admin manually in Firestore
- Restaurant and menu image uploads require an admin Firestore role
- Orders, reviews, and notifications validate ownership and protected fields in rules

---

## 📦 Deployment (Firebase Hosting)

```bash
npm install -g firebase-tools
firebase login
npm run build
firebase deploy
```

---

## 🎨 Promo Codes (for testing cart)

| Code | Discount |
|---|---|
| WELCOME10 | 10% off |
| RUSH20 | 20% off |
| NEWUSER | 15% off |
# Online-Food-Delivery-Platform
