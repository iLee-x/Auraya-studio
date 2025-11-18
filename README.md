# Auraya Studio E-Commerce Platform

A modern e-commerce platform built with Next.js, Django, PostgreSQL, and PayPal integration.

## Project Structure

```
auraya-studio/
├── frontend/          # Next.js frontend
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── lib/          # Utility functions
│   └── public/       # Static assets
├── backend/          # Django backend
│   ├── api/          # REST API
│   ├── products/     # Product management
│   ├── orders/       # Order management
│   └── users/        # User management
└── README.md
```

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Django 5.x, Django REST Framework
- **Database**: PostgreSQL
- **Payment**: PayPal SDK
- **Authentication**: JWT tokens

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Create virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install django djangorestframework djangorestframework-simplejwt psycopg2-binary django-cors-headers pillow paypalrestsdk
```

4. Create PostgreSQL database:

```bash
createdb auraya_studio
```

5. Update database settings in backend/auraya_backend/settings.py
6. Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

7. Create superuser:

```bash
python manage.py createsuperuser
```

8. Run server:

```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create .env.local file with:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
```

4. Run development server:

```bash
npm run dev
```

## Features

### Customer Features

- Browse products with filtering and search
- Product detail pages with images
- Shopping cart management
- Secure checkout with PayPal
- Order history
- User authentication and profiles

### Admin Features

- Product management (add, edit, delete)
- Image upload for products
- Order management
- User management
- Dashboard with analytics

## API Endpoints

### Products

- GET /api/products/ - List all products
- GET /api/products/:id/ - Get product details
- POST /api/products/ - Create product (admin)
- PUT /api/products/:id/ - Update product (admin)
- DELETE /api/products/:id/ - Delete product (admin)

### Orders

- GET /api/orders/ - List user orders
- POST /api/orders/ - Create order
- GET /api/orders/:id/ - Get order details

### Authentication

- POST /api/auth/register/ - Register user
- POST /api/auth/login/ - Login user
- POST /api/auth/refresh/ - Refresh token

## Development

- Frontend runs on http://localhost:3000
- Backend runs on http://localhost:8000
- Admin panel at http://localhost:8000/admin

## Deployment

See individual README files in frontend/ and backend/ directories for deployment instructions.
