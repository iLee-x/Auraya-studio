#!/bin/bash

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install django djangorestframework djangorestframework-simplejwt psycopg2-binary django-cors-headers pillow paypalrestsdk python-decouple

# Create Django project
django-admin startproject auraya_backend .

# Create Django apps
python manage.py startapp products
python manage.py startapp orders
python manage.py startapp users

echo "Backend setup complete! Next steps:"
echo "1. Update auraya_backend/settings.py with database settings"
echo "2. Run: python manage.py makemigrations"
echo "3. Run: python manage.py migrate"
echo "4. Run: python manage.py createsuperuser"
echo "5. Run: python manage.py runserver"
