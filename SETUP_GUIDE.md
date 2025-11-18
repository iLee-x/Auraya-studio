# Auraya Studio - Complete Setup Guide

This guide will walk you through setting up your complete e-commerce platform.

## Prerequisites

- Python 3.10+ installed
- Node.js 18+ and npm installed
- PostgreSQL installed and running
- PayPal Developer Account

## Part 1: Database Setup

### 1. Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE auraya_studio;

# Create user (optional)
CREATE USER auraya_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE auraya_studio TO auraya_user;

# Exit
\q
```

## Part 2: Backend Setup (Django)

### 1. Navigate to backend directory

```bash
cd backend
```

### 2. Create and activate virtual environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create Django project and apps

```bash
django-admin startproject auraya_backend .
python manage.py startapp products
python manage.py startapp orders
python manage.py startapp users
```

### 5. Configure settings

Copy the content from `settings_example.py` to `auraya_backend/settings.py`

Update the database configuration:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'auraya_studio',
        'USER': 'postgres',  # or 'auraya_user'
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 6. Copy model files

```bash
# Copy the model files to their respective apps
cp products_models.py products/models.py
cp orders_models.py orders/models.py

# Copy serializers
cp products_serializers.py products/serializers.py
cp orders_serializers.py orders/serializers.py

# Copy views
cp products_views.py products/views.py
cp orders_views.py orders/views.py

# Copy URL configuration
cp urls_config.py auraya_backend/urls.py
```

### 7. Create admin configurations

Create `products/admin.py`:
```python
from django.contrib import admin
from .models import Category, Product, ProductImage

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'stock', 'is_active', 'created_at']
    list_filter = ['is_active', 'category']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'created_at']
```

Create `orders/admin.py`:
```python
from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total_amount', 'paid', 'created_at']
    list_filter = ['status', 'paid']
    search_fields = ['user__username', 'user__email']
    inlines = [OrderItemInline]
```

### 8. Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 9. Create superuser

```bash
python manage.py createsuperuser
```

### 10. Create media directory

```bash
mkdir media
mkdir media/products
```

### 11. Run the server

```bash
python manage.py runserver
```

Backend should now be running at http://localhost:8000
Admin panel: http://localhost:8000/admin

## Part 3: Frontend Setup (Next.js)

### 1. Navigate to frontend directory

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
```

### 4. Run development server

```bash
npm run dev
```

Frontend should now be running at http://localhost:3000

## Part 4: PayPal Integration

### 1. Create PayPal Developer Account

- Go to https://developer.paypal.com/
- Sign up or log in
- Navigate to "My Apps & Credentials"

### 2. Create Sandbox App

- Click "Create App"
- Choose "Merchant" for app type
- Note down the Client ID and Secret

### 3. Configure PayPal

Backend (`auraya_backend/settings.py`):
```python
PAYPAL_MODE = 'sandbox'  # or 'live' for production
PAYPAL_CLIENT_ID = 'your_client_id'
PAYPAL_CLIENT_SECRET = 'your_client_secret'
```

Frontend (`.env.local`):
```
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
```

## Part 5: Testing

### 1. Create test categories and products

Use Django admin panel:
- Login to http://localhost:8000/admin
- Create some categories
- Create some products with images

### 2. Test the frontend

- Visit http://localhost:3000
- Browse products
- Add to cart
- Create an account
- Test checkout with PayPal sandbox

### PayPal Sandbox Test Credentials

You can create test buyer accounts in PayPal Developer Dashboard, or use:
- Email: Use a test account from your PayPal sandbox
- Password: (provided when you create the test account)

## Part 6: Production Deployment

### Backend (Django)

1. Update settings for production:
```python
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com']
SECRET_KEY = 'generate-a-secure-key'
```

2. Collect static files:
```bash
python manage.py collectstatic
```

3. Use a production server (Gunicorn):
```bash
pip install gunicorn
gunicorn auraya_backend.wsgi:application
```

### Frontend (Next.js)

1. Build for production:
```bash
npm run build
npm start
```

2. Or deploy to Vercel:
```bash
npm install -g vercel
vercel
```

## Troubleshooting

### CORS Issues

Make sure CORS is properly configured in Django settings:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "your-frontend-domain.com",
]
```

### Image Upload Issues

Ensure media directory has proper permissions:
```bash
chmod -R 755 media/
```

### Database Connection Issues

Check PostgreSQL is running:
```bash
sudo service postgresql status  # Linux
brew services list  # macOS
```

## Next Steps

1. Customize the design and branding
2. Add more product categories
3. Configure email notifications
4. Add product reviews
5. Implement wishlist functionality
6. Add promotional codes/discounts
7. Set up analytics
8. Configure production database
9. Set up automated backups
10. Implement security best practices

## Support

For issues or questions:
- Check Django documentation: https://docs.djangoproject.com/
- Check Next.js documentation: https://nextjs.org/docs
- Check PayPal SDK docs: https://developer.paypal.com/docs/

## License

MIT License - feel free to use and modify for your needs!
