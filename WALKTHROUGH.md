# Walkthrough: Enterprise Pet Boutique Backend Infrastructure

Welcome to the production-grade architectural walkthrough for **The Cultivated Companion** backend. This system is engineered as an Express-Vite unified full-stack application featuring modular, resilient, high-performance in-memory datastores, complete with state validation, security audits, rate-limiting safeguards, and advanced recommendation modules.

---

## 1. System Architecture

The companion backend balances rapid in-memory database execution with secure state-checking pipelines. 
```
 ┌────────────────────────────────────────────────────────┐
 │                   NGINX Reverse Proxy                  │
 └───────────────────────────┬────────────────────────────┘
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │             Express Port:3000 Ingress Layer            │
 ├───────────────────────────┼────────────────────────────┤
 │      Rate Limiter Middleware (120 reqs/min)            │
 ├───────────────────────────┼────────────────────────────┤
 │     Audit Logging & Security Surveillance Engines      │
 └───────────────────────────┬────────────────────────────┘
                             ▼
                 ┌───────────┴───────────┐
                 ▼                       ▼
      ┌─────────────────────┐ ┌─────────────────────┐
      │   Client UI Assets  │ │     REST Router     │
      │   (Vite SPA Engine) │ │  (Enterprise APIs)  │
      └─────────────────────┘ └──────────┬──────────┘
                                         ▼
                              ┌─────────────────────┐
                              │  In-Memory Database │
                              │   (CRUD Modules)    │
                              └─────────────────────┘
```

---

## 2. API Endpoint Protocols

All endpoints return standardized JSON. Error handling incorporates distinct HTTP status codes (`400`, `403`, `404`, `429`, `500`) with helpful diagnostic feedback.

### 🔑 Security & Authentication Module
*   **POST** `/api/auth/token`
    *   **Description**: Exposes token rotation logic. Exchanges a valid refresh token for a brand new rotated pair to prevent replay attacks.
    *   **Payload Example**:
        ```json
        { "refreshToken": "token-sarah-rotation-928" }
        ```
    *   **Success Response (200)**:
        ```json
        {
          "accessToken": "access-token-rotated-8172",
          "refreshToken": "refresh-token-rotated-9921"
        }
        ```
    *   **Abuse Response (403)**: Triggers an alert audit log if an invalid or already rotated token is presented.

*   **GET** `/api/audit-logs`
    *   **Description**: Administrative surveillance feed displaying all structural state adjustments, coupon generation, profile updates, and potential token misuse alerts.

---

### 👤 User Profile & Companion Pet Curation
*   **GET** `/api/user/profile`
    *   **Response**: Current authenticated user profile information (e.g. Username: Sarah, Membership: VIP Curator).
*   **PUT** `/api/user/profile`
    *   **Description**: Synchronizes contact information.
*   **GET** `/api/user/pets`
    *   **Response**: Companion animal configurations (Luna, breed, bio, age).
*   **POST** `/api/user/pets`
    *   **Description**: Launches a new companion profile. Generates matching product recommendations automatically based on pet classification (`dog` or `cat`).

---

### 📍 Addresses & Wishlists
*   **GET / POST / PUT / DELETE** `/api/user/addresses`
    *   **Description**: Manage delivery destinations, supporting single-active-default shipping destinations.
*   **GET / POST / DELETE** `/api/user/wishlist`
    *   **Description**: Localized favorites tracking synchronized across client profiles.

---

### 🏷️ Categories & Brands Administration
*   **GET / POST / PUT / DELETE** `/api/categories`
    *   **Description**: CRUD interface for defining pet categorization indices.
*   **GET / POST / PUT / DELETE** `/api/brands`
    *   **Description**: CRUD indices for luxury vendor partnerships (e.g., Wild One, Aesop Hound).

---

### 📦 Inventory Control & Low-Stock Warners
*   **GET** `/api/inventory`
    *   **Response**: Current real-time stock levels of all active product IDs.
*   **GET** `/api/inventory/low-stock-alerts`
    *   **Description**: Automatically identifies items below the safety threshold (<= 5).
    *   **Response Example**:
        ```json
        [
          { "productId": "walnut-cat-hammock", "stock": 3, "threshold": 5, "warning": "Urgent inventory restock recommended." }
        ]
        ```

---

### 🎟️ Coupons & Campaigns
*   **GET / POST / PUT / DELETE** `/api/coupons`
    *   **Description**: Manage active promotional offer codes.
*   **POST** `/api/coupons/validate`
    *   **Payload**: `{ "code": "ELEVATE10" }`
    *   **Response**: Returns validation status and savings rate.

---

### 📝 Product Reviews & Verified Feedback
*   **GET** `/api/reviews/:productId`
    *   **Response**: All verified customer comments, ratings, and pet credentials associated with a product.
*   **POST** `/api/reviews/:productId`
    *   **Description**: Submits verified feedback.

---

### 🛒 Complete Order Lifecycle & Automated Invoices
*   **GET** `/api/orders`
    *   **Description**: Lists transactions.
*   **POST** `/api/orders`
    *   **Description**: Submits checkouts, deducts inventory automatically, and establishes transaction tracking timelines.
    *   **Payload**:
        ```json
        {
          "items": [
            { "productId": "cloud-bed", "name": "Cloud Orthopedic Bed", "quantity": 1, "price": 189.00 }
          ],
          "addressId": "addr-1",
          "couponCode": "ELEVATE10"
        }
        ```
*   **PUT** `/api/orders/:id/status`
    *   **Description**: Updates order dispatch state and posts a tracking timeline log.
*   **POST** `/api/orders/:id/cancel`
    *   **Description**: Cancels order, automatically credits inventory back to the store, and posts cancellation timelines.
*   **GET** `/api/orders/:id/invoice`
    *   **Description**: Generates an elegant, high-contrast, printable text-based transaction invoice.
*   **GET** `/api/orders/:id/timeline`
    *   **Response**: Step-by-step dispatch trail of a package.

---

### ☁️ Cloudinary Upload Simulation
*   **POST** `/api/upload`
    *   **Description**: Simulates the backend signing process and file uploads to Cloudinary media buckets, returning safe, secured image assets.

---

### 🤖 AI-Powered Curation & Recommendations
*   **GET** `/api/recommendations/feline-synergy`
    *   **Parameters**: `persona` (e.g., explorer, lounger), `goal`
    *   **Description**: Pairs companion behavioural traits with matching high-end spaces.
*   **GET** `/api/recommendations/user`
    *   **Description**: Recommends personalized items based on a user's combined wishlist and active basket profile.

---

## 3. Local Execution & Docker Support

This application can be run directly inside containerized networks.

### Direct Execution
```bash
# Install package dependencies
npm install

# Run the unified Express-Vite development server
npm run dev
```

### Containerized Execution
```bash
# Build & run inside Docker container on port 3000
docker-compose up --build
```
The application will be securely exposed at `http://localhost:3000`.

---

## 4. Operational Monitoring & Testing

An automated suite is provided in `/tests/test-api.ts` to execute end-to-end integration tests confirming profile updates, validation, coupon code checking, and database state transitions.

Run tests using:
```bash
npx tsx tests/test-api.ts
```
All system activities are recorded cleanly in the security audit logs at `/api/audit-logs`.
