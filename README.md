# Healora — React + PHP + MySQL Online Pharmacy Demo

## Included
- React + Vite storefront
- Product search, category filters, cart and demo checkout
- PHP JSON API and MySQL schema
- Admin dashboard: sign-in, overview stats, product CRUD, stock watch, order status management, customer list/search
- Admin API endpoints protected by bearer tokens with expiring sessions

## Requirements
- Windows, XAMPP (PHP 8+ and MySQL/MariaDB)
- Node.js 20+

## A. Install database
1. Start Apache and MySQL from XAMPP Control Panel.
2. Open `http://localhost/phpmyadmin`.
3. Import `backend/database.sql` (first-time setup only).
4. Import `backend/upgrade_admin.sql`.

If you already imported the original database, import only `backend/upgrade_admin.sql`. It creates the admin tables without dropping existing products or orders.

## B. Install backend
Copy the `backend` folder to:
`C:\xampp\htdocs\healora\backend`

Check `backend/config.php` has the right MySQL host, database name, username and password. Default local XAMPP values are:
- database: `healora_store`
- username: `root`
- password: empty (typical XAMPP default; adjust if yours differs)

Run the admin setup ONCE by opening:
`http://localhost/healora/backend/setup_admin.php`

Demo login:
- URL: `http://localhost:5173/admin`
- username: `admin`
- password: `Healora@123`

After the setup page says the account is ready, delete:
`C:\xampp\htdocs\healora\backend\setup_admin.php`

Change the demo password in a non-demo deployment; this local starter does not include an admin password-change screen.

## C. Install frontend
1. Open `frontend` folder in VS Code.
2. Copy `.env.example` to `.env`.
3. Ensure it contains:
`VITE_API_BASE=http://localhost/healora/backend/api`
4. In terminal:
```bash
npm install
npm run dev
```
5. Open the Vite URL (usually `http://localhost:5173`).

Storefront: `http://localhost:5173/`
Admin: `http://localhost:5173/admin`

## Admin features
- Overview metrics, recent orders and low-stock watch
- Add/edit/delete products, manage category, price, image, stock and prescription-required flag
- Search orders, view order items, update status (Pending, Confirmed, Packed, Delivered, Cancelled)
- Search customer details and order totals

Customer records are derived from placed orders. There is no standalone customer-registration module in this demo.

## API routes
Public:
- `GET /products.php`
- `POST /orders.php` (demo checkout; no payment)

Admin (send `Authorization: Bearer <token>`):
- `POST /admin_login.php`
- `POST /admin_logout.php`
- `GET /admin_dashboard.php`
- `GET|POST|PUT|DELETE /admin_products.php`
- `GET|PATCH /admin_orders.php`
- `GET /admin_customers.php`

## Important safety and deployment notes
- This is a local demo, not a production pharmacy.
- The sample prescription product is excluded from the storefront and cannot be ordered through the demo checkout.
- Before real sales, implement valid prescription upload and licensed pharmacist review, verify applicable Indian pharmacy/drug-sale requirements, and obtain required licences.
- Add CSRF/security hardening as appropriate, rate limiting, secure HTTPS deployment, secure secrets, backups, audit logs, privacy notice/consent, data retention controls, and a real payment gateway with server-side verification.
- Do not expose the admin API publicly without security review. `setup_admin.php` must be deleted after one-time setup.
