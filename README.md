# The Paws Store

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Runtime](https://img.shields.io/badge/Runtime-Node.js_18+_|_TypeScript-green.svg)](#)
[![Framework](https://img.shields.io/badge/Framework-React_19_|_Vite_6_|_Express_4-orange.svg)](#)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue.svg)](#)

> An ultra-premium full-stack e-commerce experience for curated pet goods, featuring customer dashboards, administrative control centers, live voice-activated concierge searches, and automated fulfillment logic.

---

## 🚀 Recent Release Changelog

| Feature | Description | File Locations |
| :--- | :--- | :--- |
| **Low-Latency AI Concierge** | Integrated `gemini-3.1-flash-lite` model with `thinkingLevel: ThinkingLevel.MINIMAL` and live Google Search Grounding for ultra-fast response speed. | `server.ts`, `src/components/ConciergeSearch.tsx` |
| **Order History Product Reviews** | Added "Write a Review" form on past orders in Customer Dashboard, allowing verified buyers to leave 1-5 star ratings, pet tags, headlines, and comments with persistent storage. | `src/components/CustomerDashboard.tsx` |
| **Interactive Size Helper Modal** | Built a visual pet sizing assistant with `lbs`/`kg` unit toggling, weight range presets, fine-tuning slider, real-time scale bars, breed specs, 1-click size selection, and persistent `localStorage` memory across sessions. | `src/components/ProductDetails.tsx` |
| **Product Search Autocomplete** | Implemented real-time autocomplete suggestions directly matching `MOCK_PRODUCTS` names, brands, categories, prices, and thumbnails as the user types. | `App.tsx`, `src/components/ShopAll.tsx` |
| **Printable PDF Invoice Generator** | Integrated `jsPDF` to generate branded, downloadable PDF purchase receipts for orders with itemized tables, totals, shipping details, and official order IDs. | `src/components/CustomerDashboard.tsx` |
| **Professional Confirmation Dialog Modal** | Added smooth, accessible confirmation dialogs using Framer Motion when clearing search history or removing items from the shopping bag with item previews and explicit action buttons. | `src/components/ConfirmationModal.tsx`, `App.tsx`, `src/components/Cart.tsx` |
| **Back-In-Stock Notifications** | Replaced 'Add to Cart' with 'Notify Me When Available' for out-of-stock items, captured user email via modal dialog, and added a dedicated 'Stock Alerts' tab in Customer Dashboard backed by persistent `notifications` state in `localStorage`. | `src/components/NotifyMeModal.tsx`, `src/components/CustomerDashboard.tsx`, `App.tsx`, `src/components/ProductDetails.tsx`, `src/components/ShopAll.tsx`, `src/components/QuickViewModal.tsx` |
| **Hover-Zoom Material Inspection** | Integrated an interactive high-resolution magnifying loupe with real-time cursor tracking, custom magnification toggles (2x, 2.8x, 3.8x), transform origin positioning, and a precision reticle overlay on product detail gallery images. | `src/components/ProductDetails.tsx` |
| **Partner Onboarding & Admin Approval** | Added Prisma schema with `Role` & `ApprovalStatus` enums, `PartnerStore` model, `/api/auth/register` partner onboarding logic, `/api/partner/apply` endpoint, `409 Conflict` duplicate check, `/api/admin/partners/pending` queue, `/api/admin/partners/:id/approve` endpoint, and `isActivePartner` middleware. | `prisma/schema.prisma`, `server.ts`, `tests/test-api.ts` |

---

## 📌 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Tech Stack](#-tech-stack)
4. [Architecture Overview](#-architecture-overview)
5. [Folder Structure](#-folder-structure)
6. [Core Modules](#-core-modules)
7. [API Overview](#-api-overview)
8. [Database & State Models](#-database--state-models)
9. [Setup & Installation](#-setup--installation)
10. [Environment Variables](#-environment-variables)
11. [Testing & Verification](#-testing--verification)
12. [Deployment Guidelines](#-deployment-guidelines)
13. [Security Guardrails](#-security-guardrails)
14. [Future Roadmap](#-future-roadmap)
15. [Contributing](#-contributing)
16. [License](#-license)
17. [Maintainer & Support](#-maintainer--support)

---

## 🔍 Project Overview

**The Paws Store** is an enterprise-grade, high-fidelity e-commerce ecosystem designed for luxury pet accessory vendors and discerning pet companions. Built upon a unified Express-Vite architecture, the application delivers a premium, cohesive client experience paired with highly robust administrative controls, advanced behavioral recommendation engines, and rigorous in-memory persistence.

Historically, pet retail solutions have treated catalog browsing and pet companion profiles as isolated units. **The Paws Store** bridges this gap. It serves as a unified digital boutique where customers configure bespoke pet profiles (detailing age, weight, breed, and unique behavioral traits), allowing the platform to dynamically personalize item recommendations, suggest tailored diets, and configure spatial solutions.

The codebase is engineered with strict type safety, modular layout architecture, and high-performance server-side APIs. Whether executing automated stock-replenishment loops, applying cryptographic promotional campaigns, generating printable PDF-style invoices, or reviewing live administrative audit logs, the system runs with absolute production-ready reliability.

---

## ✨ Key Features

- **⚡ Low-Latency AI & Grounded Search (`gemini-3.1-flash-lite`)**
  Accelerated AI search concierge leveraging `gemini-3.1-flash-lite` with minimal thinking overhead and live Google Search Grounding for ultra-fast response delivery.

- **⭐ Verified Customer Product Reviews**
  Order history review modal in Customer Dashboard enabling verified buyers to rate purchased items (1–5 stars), tag companion pets, submit feedback, and view published reviews.

- **📐 Interactive Size Helper Modal**
  Visual sizing recommendation tool in Product Details with `lbs`/`kg` unit toggling, weight range presets, fine-tuning slider, real-time visual scale spectrums, target breed specs, and one-click size application.

- **🔐 Cryptographic Authentication & Session Rotation**
  Robust JSON token handling with refresh token rotation sequences designed to defend against replay attacks. Includes administrative monitoring to lock down compromised nodes.

- **🛍️ Deep-Query Catalog & Inventory Tracking**
  Interactive boutique browsing with category, tag, and brand index filtering. Includes low-stock alerts and automatic safety threshold notifications (`stock <= 5`).

- **🎤 Voice-Activated Concierge Search**
  An integrated hands-free search experience utilizing native browser speech-recognition APIs, allowing users to vocally query premium pet items and trigger matching results on voice pause.

- **👤 Multi-Pet Persona Configurations**
  Sophisticated profile managers for canine and feline companions, storing specialized biological data and serving as the primary context for dynamic recommendations.

- **🎟️ Promotional Campaign Validations**
  Custom coupon managers supporting percentage-off discount lookups, validation pipelines, and secure calculations at checkout.

- **📑 Automated Order Lifecycles & Printable Invoices**
  Automated stock deduction on successful checkout, package tracking timelines, self-service cancellation with auto-restock, and elegant text-based transaction invoice generators.

- **🛡️ Surveillance Logs & Admin Curation Tools**
  A centralized administrative panel that tracks system logs, low-stock flags, coupon generation, profile adjustments, and potential token exploits.

- **🤖 AI-Ready Recommendation Structures**
  Pre-architected services including `feline-synergy` behavioral matching and personalized multi-item recommendation vectors combining client wishlists and current active baskets.

---

## 💻 Tech Stack

### Frontend Client
- **Runtime Library:** React 19 (Functional Components, Custom Hooks)
- **Bundler & Tooling:** Vite 6
- **Styling & Theme:** Tailwind CSS 4.0
- **Animation Engine:** Motion (`motion/react`)
- **Iconographies:** Lucide React

### Backend Service
- **Runtime:** Node.js 18+ (TypeScript Native Engine via `tsx`)
- **Server Framework:** Express.js 4.21
- **Asset Bundle Compiler:** Esbuild (Bundles production server into a single standalone `.cjs` file)
- **Local Proxying:** Nginx Reverse Proxy Layer

### Storage & Cache
- **Primary Database:** High-Performance Modular In-Memory Datastore (resilient JSON schemas, fully isolated)
- **File Management:** Cloudinary Media signing and upload simulation modules

### Development & DevOps
- **Linter & Type Compiler:** TypeScript Compiler (`tsc --noEmit`)
- **Containerization:** Docker, Docker-Compose
- **API Specifier:** Swagger Specification (`swagger.json`), Postman Collections (`postman_collection.json`)
- **Testing:** Automated Integration Test Engine (`tests/test-api.ts`)

---

## 📐 Architecture Overview

The system operates as a unified full-stack application, ensuring that server-side endpoints handle sensitive operations (cryptographic tokens, coupon validation, stock changes, and future Gemini/Cloud payment connections) securely behind an ingress controller, shielding clients from sensitive tokens.

```
+-------------------------------------------------------------+
|                     NGINX Ingress Proxy                     |
+------------------------------+------------------------------+
                               |
                               ▼
+-------------------------------------------------------------+
|               Express Port:3000 Ingress Layer               |
|  - Rate Limiting Safeguards                                 |
|  - Security Auditing Engine                                 |
+------------------------------+------------------------------+
                               |
                               ▼
                +--------------+--------------+
                |                             |
                ▼                             ▼
+-------------------------------+  +--------------------------+
|       Vite Client SPA         |  |   REST API Controllers   |
|  - Custom Responsive Layouts  |  |  - Auth State Managers   |
|  - Voice Search Controller    |  |  - Order Lifecycle Engine|
|  - Personal Curation UI       |  |  - Recommendation Logic  |
+-------------------------------+  +--------------+-----------+
                                                  |
                                                  ▼
                                   +--------------------------+
                                   |    In-Memory Datastore   |
                                   |  - State Guardrails      |
                                   |  - Strict Schemas        |
                                   +--------------------------+
```

---

## 📂 Folder Structure

```
.
├── .github/                   # GitHub action CI/CD workflows
├── assets/                    # Static image resources and platform branding
├── src/                       # Client frontend application source
│   ├── components/            # Extracted UI modules & specific workflows
│   │   ├── AdminDashboard.tsx # Surveillance logs, inventory warnings, and coupon managers
│   │   ├── AuthSplit.tsx      # Secure token exchange and authentication interface
│   │   ├── Cart.tsx           # Shopping basket overview and gift customization
│   │   ├── Checkout.tsx       # Secured transactional address and coupon validators
│   │   ├── ConciergeSearch.tsx# Speech-recognition & instant interactive search layout
│   │   ├── CustomerDashboard.tsx # VIP orders, address managers, and companion profiles
│   │   ├── FelineSpaceHarmonizer.tsx # AI-ready layout for high-end spatial feline synergy
│   │   ├── OrderTracker.tsx   # Real-time dispatch tracking, status timelines, and invoices
│   │   ├── ProductDetails.tsx # Multi-image boutique detail, size guides, and reviews
│   │   ├── ShopAll.tsx        # Comprehensive searchable, filterable shop catalog
│   │   └── Storefront.tsx     # Premium landing page, hero modules, and curated sliders
│   ├── App.tsx                # Main client layout, screen navigations, and global states
│   ├── index.css              # Global tailwind stylesheets & bespoke display fonts
│   ├── main.tsx               # Frontend client entry point mounting React
│   ├── postman_collection.json # API collection for local testing and validation
│   ├── swagger.json           # Interactive API endpoint swagger specification
│   └── types.ts               # Strict TypeScript interface declarations & mock schemas
├── tests/                     # System validation and integration suites
│   └── test-api.ts            # High-performance automated integration tests
├── .env.example               # Template documenting variables needed for boot
├── .gitignore                 # Exclusion configuration for untracked logs and build objects
├── Dockerfile                 # Unified container specification
├── docker-compose.yml         # Development container network compose script
├── WALKTHROUGH.md             # Developer architecture walkthrough
├── metadata.json              # Platform identity and framing permissions
├── package.json               # Module manager scripts & package dependencies
├── server.ts                  # Unified Express API server, rate limiters, and router
├── tsconfig.json              # TypeScript compilation options
└── vite.config.ts             # React optimization & Vite configuration
```

---

## ⚙️ Core Modules

1. **Authentication Engine:** Evaluates client session states. Coordinates token rotations using rotated token pairs and raises server-side alarms if expired tokens are reused.
2. **Product Catalog & Curation:** Stores comprehensive product metadata, high-resolution secondary media arrays, sizes, bespoke colors, and customer reviews.
3. **Cart & Wishlist Controller:** Manages multi-item active baskets, custom gift notes, item configurations (colors/sizes), and high-contrast favorite tracking.
4. **Order & Invoice Generator:** Processes checkouts, validates postal codes, subtracts stock from inventory, posts dispatch tracking timelines, and renders high-fidelity text-based invoices.
5. **Admin Surveillance Panel:** Real-time administrative surveillance including low-stock banners, audit logs, promotional campaign creators, and global transaction monitors.
6. **AI Concierge & Recommendations:** Connects user companion biological variables to spatial curations (`feline-synergy`) and computes matching cross-sell opportunities based on wishlist-to-basket overlaps.

---

## 📡 API Overview

Below is a summary of the main route groups exposed by the Express backend. Detailed request structures, JSON schemas, and response examples are located in the interactive `/src/swagger.json` file.

| Route Group | Base Endpoint | Main Operations | Auth Required |
| :--- | :--- | :--- | :--- |
| **Authentication** | `/api/auth` | Rotation check, security token rotation | Yes (Signature validation) |
| **System Auditing** | `/api/audit-logs` | Fetching system surveillance files and alerts | Yes (Admin Role) |
| **Profiles & Pets** | `/api/user` | Edit user profile details, read/create companion pet logs | Yes |
| **Inventory Alerts**| `/api/inventory` | View current product counts, view low-stock alerts | Yes (Admin Role) |
| **Coupons** | `/api/coupons` | Manage campaigns, check code validation and discount rates | Variable |
| **Boutique Catalog**| `/api/categories` | Manage shop classification indices | No |
| **Vendor Partnerships**| `/api/brands` | Manage premium brands and vendor lists | No |
| **Customer Reviews**| `/api/reviews` | Fetch verified customer comments, post rated feedback | Yes (For creation) |
| **Order Management**| `/api/orders` | Create orders, update dispatch state, cancel, pull invoices | Yes |
| **AI Recommendations**| `/api/recommendations` | Synergy-matching matrices, combined wishlist curations | Yes |
| **File Management** | `/api/upload` | Media storage signing and secure resource simulation | Yes |

---

## 🗄️ Database & State Models

The system architecture utilizes a robust local schema layer defined in `src/types.ts` to govern the following models:

- **`Product`:** Defines catalog item details (`id`, `name`, `brand`, `price`, `rating`, `reviewsCount`, `image`, `secondaryImages`, `sizes`, `colors`, `tags`, `category`).
- **`CartItem`:** Represents active checkout selections linked directly to a product, sizing options, color choices, and custom gift notes.
- **`Order`:** Tracks client transactions, payment metrics, item configurations, unique identifier hashes, timestamp metrics, and shipping addresses.
- **`PetProfile`:** Stores details for the client's animal companions (`name`, `type`, `breed`, `age`, `weight`, `bio`, `image`, and dynamic recommendations list).
- **`AuditLog`:** Holds administrative activity logs, coupon activations, status adjustments, profile revisions, and security warning flags.
- **`Coupon`:** Configures active discounts (`code`, `percent`, `expiryDate`, `description`).
- **`Inventory`:** Captures stock counts, depletion limits, and low-stock indicators.

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js:** Ensure `Node.js (v18.0.0+)` is installed.
- **npm:** Ensure package manager is active.
- *(Optional)* **Docker:** Ensure `Docker Desktop` and `Docker-Compose` are available for containerized boot.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/the-cultivated-companion.git
cd the-cultivated-companion
```

### 2. Install Project Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the template variables file into a localized environment file:
```bash
cp .env.example .env
```

### 4. Boot the Development Environment
Run the unified Express backend and Vite React compiler concurrently:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to interact with the application.

### 5. Launch via Docker Container (Alternative)
To boot the complete application network inside a containerized sandbox:
```bash
docker-compose up --build
```
The application will be securely exposed at `http://localhost:3000`.

---

## 🔒 Environment Variables

Configure the following variables inside your local `.env` file to regulate access and features:

| Environment Variable | Description | Recommended Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Sets compilation environment. Use `development` or `production`. | `development` |
| `PORT` | Designated host port (locked to `3000` for default ingress routing). | `3000` |
| `GEMINI_API_KEY` | Server-only key used to power future natural language curators. | *(Your Gemini API Key)* |
| `CLOUDINARY_CLOUD_NAME`| Cloud name parameter for asset upload validation hooks. | `d-pet-boutique` |
| `CLOUDINARY_API_KEY` | API authentication key for secure file uploading. | *(Your Cloudinary Key)* |
| `CLOUDINARY_API_SECRET`| Cryptographic secret protecting Cloudinary operations. | *(Your Secret)* |

*Note: Never commit your `.env` file containing actual secrets or keys to public source control.*

---

## 🧪 Testing & Verification

The codebase includes an automated API test runner executing comprehensive end-to-end integration tests to guarantee server stability, database state integrity, and API contract compliance.

### Run Integration Tests
```bash
# Execute suite via tsx
npx tsx tests/test-api.ts
```

### What Is Verified:
1. **User Profile Retrieval:** Confirms database accurately registers Sarah as the default VIP Curator.
2. **Postal & Address Controls:** Verifies listing delivery options and matches coordinates.
3. **Coupon Code Checking:** Runs valid discount validations against the campaign rules.
4. **Low-Stock Triggers:** Tests that items falling below threshold boundaries trigger low-stock safety alarms.
5. **Token Rotation Security:** Simulates rotation pipelines to verify cryptographic security.
6. **AI Curation:** Confirms behavioral matrices match pet profiles with correct product vectors.

All operations are logged in detail inside the Security Audit log at `/api/audit-logs`.

---

## 🌐 Deployment Guidelines

For deployment to production systems, execute the following steps to ensure speed and performance:

1. **Production Compilation:**
   ```bash
   npm run build
   ```
   This compiles all static client-side React files into highly optimized chunks in `dist/` and compiles the backend server into a single self-contained CommonJS file at `dist/server.cjs` using `esbuild`.

2. **Starting Production Server:**
   ```bash
   npm start
   ```
   This launches the pre-compiled server at `dist/server.cjs` natively with Node.js, maximizing response speed and minimizing container load-times.

3. **Recommended Production Hosting Setup:**
   - **Frontend & Backend Hosting:** Deploy unified Docker containers to Google Cloud Run, AWS ECS, or Render, exposing port `3000` behind a load balancer or Nginx reverse proxy.
   - **Environment Protection:** Inject `.env` keys securely using Cloud Secret Manager or direct container deployment platform secrets.

---

## 🛡️ Security Guardrails

The system implements strict defensive architectures to protect transactions and customer records:
- **JWT Rotation Safeness:** If a rotated refresh token is presented more than once, all companion access tokens under that lineage are immediately terminated, preventing session hijacking.
- **Audit Surveillance Logging:** Any administrative updates, inventory modifications, coupon actions, or token issues generate immutable records viewable in `/api/audit-logs`.
- **Ingress Rate Limiting:** Rate limiting safeguards constrain clients to a maximum of 120 API requests per minute to block DDoS vectors.
- **Strict Validation Filters:** Input payloads are filtered for correct types, character boundaries, and sanitization parameters before touching state arrays.

---

## 🗺️ Future Roadmap

- [ ] **AI-Powered Companion Curator:** Direct integration with Google Gemini SDK using advanced text, image, and structured schemas to curate complete lifestyle packages.
- [ ] **Smart Semantic Search:** Natural language search mapping semantic user intents to catalog tags.
- [ ] **Bespoke Care Scheduler:** Calendar alerts for pet medical checks, vaccine timelines, and nutritional cycles.
- [ ] **Native Mobile Clients:** Integration with Flutter or React Native frameworks communicating directly with core API endpoints.
- [ ] **Automated Subscription Renewals:** Set recurring monthly delivery frequencies for gourmet treat bundles and essential items.

---

## 🤝 Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file or file headers for details.

```
Copyright 2026 The Paws Store Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

## ✉️ Maintainer & Support

Developed and maintained with care by **The Paws Store Team**.

For developer inquires, technical help, or enterprise boutique partnership opportunities, contact:
- **Email:** `spacecraftech1@gmail.com`
- **Developer Portal:** [Google AI Studio Build](https://ai.studio/build)
- **Preview Site:** [Live Dev App](https://ais-dev-kozf3q3xayuzbbuuand2uz-72897400089.asia-east1.run.app)
