# Umrah Voucher Management System

A full-stack management platform for Umrah travel agencies. Create, approve, cancel and track vouchers, manage companies, customers and agents, and generate live reports, PDF vouchers and QR verification links.

## Features

- Voucher lifecycle: **Draft**, **Approved**, **Cancelled** and **Expired**
- Multi-company voucher management with company branding
- Customer records created from voucher information
- Agent directory with profile photos and voucher statistics
- Role-based access for Super Admin and Admin users
- Admin profile, branding and system configuration settings
- Cloudinary image uploads organised by folders
- Voucher QR codes and public voucher verification pages
- Voucher PDF generation and filtered report PDF/CSV exports
- Date-range reports for individual days, months or custom periods
- Responsive admin dashboard, searchable tables and pagination

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router |
| Backend | Node.js, Express |
| Database | MongoDB Atlas with Mongoose |
| Media | Cloudinary |
| Documents | Puppeteer, QRCode |
| Authentication | JWT, HTTP-only cookies |

## Project Structure

```text
umrah_voucher_management/
├── client/                 # React + Vite admin application
├── server/                 # Express API and MongoDB models
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
├── package.json            # Starts frontend and backend together
└── README.md
```

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- MongoDB Atlas database
- Cloudinary account (required for image uploads)

## Local Setup

### 1. Clone and install dependencies

```bash
git clone https://github.com/YOUR_USERNAME/umrah_voucher_management.git
cd umrah_voucher_management
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Configure environment variables

Copy the provided example files and add your own credentials:

```bash
copy server\\.env.example server\\.env
copy client\\.env.example client\\.env
```

For macOS/Linux, use `cp` instead of `copy`.

Required `server/.env` values:

```env
NODE_ENV=development
PORT=5000
MONGO_URL=your_mongodb_atlas_connection_string
JWT_SECRET=use_a_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

INITIAL_ADMIN_NAME=Admin
INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_PASSWORD=change_this_password
```

Optional `client/.env` value:

```env
VITE_API_URL=http://localhost:5000/api
```

> Never commit `.env` files or real passwords. They are already excluded by `.gitignore`.

### 3. Create the first admin (optional)

```bash
npm run seed:admin --prefix server
```

### 4. Start the application

Run frontend and backend together from the project root:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev --prefix server
npm run dev --prefix client
```

Open [http://localhost:5173](http://localhost:5173). The API health check is available at [http://localhost:5000/api/health](http://localhost:5000/api/health).

## Available Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Runs backend and frontend together |
| `npm run server` | Runs only the Express server |
| `npm run client` | Runs only the React client |
| `npm run build --prefix client` | Creates a production frontend build |
| `npm run seed:admin --prefix server` | Creates the initial admin if one does not exist |

## Voucher Status Flow

```text
Create Voucher
     ├── Draft      → approve later from the voucher pages
     ├── Approved   → can be cancelled when required
     └── Cancelled  → retained for records and reporting
```

## Image Storage

Uploaded images are stored in Cloudinary under organised folders:

- `umrah-voucher/companies`
- `umrah-voucher/admins`
- `umrah-voucher/agents`
- `umrah-voucher/customers`
- `umrah-voucher/dashboard`
- `umrah-voucher/vouchers/headers`
- `umrah-voucher/vouchers/watermarks`

## Deployment Notes

Before deploying:

1. Set `NODE_ENV=production`.
2. Set `CLIENT_URL` to the live frontend URL.
3. Set `VITE_API_URL` to the live API URL ending in `/api`.
4. Add the frontend URL to the backend CORS `CLIENT_URL` value.
5. Store all database, JWT and Cloudinary values in your hosting provider's environment variables.
6. Build the frontend with `npm run build --prefix client`.

## Security

- Do not upload `.env` files to GitHub.
- Rotate any API key, database password or secret that has been shared publicly.
- Use a strong, unique `JWT_SECRET` in production.

---

Built for Umrah travel agencies to manage vouchers simply and securely.