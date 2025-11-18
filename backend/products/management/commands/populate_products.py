from django.core.management.base import BaseCommand
from products.models import Category, Product


class Command(BaseCommand):
    help = "Populate database with sample products"

    def handle(self, *args, **kwargs):
        # Clear existing data
        Product.objects.all().delete()
        Category.objects.all().delete()

        # Create categories
        electronics = Category.objects.create(
            name="Electronics",
            slug="electronics",
            description="Electronic devices and gadgets",
        )

        fashion = Category.objects.create(
            name="Fashion",
            slug="fashion",
            description="Clothing and accessories",
        )

        home = Category.objects.create(
            name="Home & Living",
            slug="home-living",
            description="Home decor and living essentials",
        )

        sports = Category.objects.create(
            name="Sports & Fitness",
            slug="sports-fitness",
            description="Sports equipment and fitness gear",
        )

        # Create sample products
        products_data = [
            # Electronics
            {
                "name": "Wireless Headphones Pro",
                "slug": "wireless-headphones-pro",
                "description": "Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals.",
                "price": 299.99,
                "category": electronics,
                "stock": 50,
            },
            {
                "name": "Smart Watch Series 5",
                "slug": "smart-watch-series-5",
                "description": "Advanced smartwatch with health tracking, GPS, water resistance, and seamless smartphone integration. Track your fitness goals in style.",
                "price": 399.99,
                "category": electronics,
                "stock": 30,
            },
            {
                "name": "4K Webcam Ultra",
                "slug": "4k-webcam-ultra",
                "description": "Crystal clear 4K video quality webcam with auto-focus and built-in noise-canceling microphone. Ideal for streaming and video conferences.",
                "price": 129.99,
                "category": electronics,
                "stock": 75,
            },
            {
                "name": "Portable Bluetooth Speaker",
                "slug": "portable-bluetooth-speaker",
                "description": "Compact waterproof speaker with 360-degree sound, 12-hour battery, and deep bass. Take your music anywhere.",
                "price": 79.99,
                "category": electronics,
                "stock": 100,
            },
            # Fashion
            {
                "name": "Premium Leather Jacket",
                "slug": "premium-leather-jacket",
                "description": "Genuine leather jacket with classic design, multiple pockets, and comfortable fit. A timeless wardrobe essential.",
                "price": 249.99,
                "category": fashion,
                "stock": 25,
            },
            {
                "name": "Designer Sunglasses",
                "slug": "designer-sunglasses",
                "description": "UV-protected polarized sunglasses with elegant frame design. Combines style with eye protection.",
                "price": 159.99,
                "category": fashion,
                "stock": 60,
            },
            {
                "name": "Classic Denim Jeans",
                "slug": "classic-denim-jeans",
                "description": "Premium quality denim jeans with comfortable stretch fabric and modern fit. Available in multiple sizes.",
                "price": 89.99,
                "category": fashion,
                "stock": 120,
            },
            {
                "name": "Luxury Handbag",
                "slug": "luxury-handbag",
                "description": "Elegant designer handbag with genuine leather finish, spacious interior, and adjustable strap. Perfect for any occasion.",
                "price": 329.99,
                "category": fashion,
                "stock": 35,
            },
            # Home & Living
            {
                "name": "Smart LED Desk Lamp",
                "slug": "smart-led-desk-lamp",
                "description": "App-controlled LED lamp with adjustable brightness, color temperature, and built-in USB charging port.",
                "price": 69.99,
                "category": home,
                "stock": 80,
            },
            {
                "name": "Ceramic Coffee Maker",
                "slug": "ceramic-coffee-maker",
                "description": "Programmable coffee maker with thermal carafe, auto-brew feature, and 12-cup capacity. Start your day right.",
                "price": 89.99,
                "category": home,
                "stock": 45,
            },
            {
                "name": "Memory Foam Pillow Set",
                "slug": "memory-foam-pillow-set",
                "description": "Set of 2 ergonomic memory foam pillows with cooling gel technology. Improves sleep quality and neck support.",
                "price": 79.99,
                "category": home,
                "stock": 90,
            },
            {
                "name": "Modern Wall Art Canvas",
                "slug": "modern-wall-art-canvas",
                "description": "Abstract design canvas print with wooden frame. Adds contemporary elegance to any room.",
                "price": 149.99,
                "category": home,
                "stock": 40,
            },
            # Sports & Fitness
            {
                "name": "Yoga Mat Premium",
                "slug": "yoga-mat-premium",
                "description": "Extra thick non-slip yoga mat with carrying strap. Eco-friendly material, perfect for yoga and pilates.",
                "price": 49.99,
                "category": sports,
                "stock": 150,
            },
            {
                "name": "Adjustable Dumbbells Set",
                "slug": "adjustable-dumbbells-set",
                "description": "Space-saving adjustable dumbbell set (5-50 lbs). Perfect for home gym workouts.",
                "price": 299.99,
                "category": sports,
                "stock": 30,
            },
            {
                "name": "Running Shoes Pro",
                "slug": "running-shoes-pro",
                "description": "Lightweight running shoes with responsive cushioning and breathable mesh upper. Engineered for performance.",
                "price": 129.99,
                "category": sports,
                "stock": 85,
            },
            {
                "name": "Fitness Resistance Bands",
                "slug": "fitness-resistance-bands",
                "description": "Set of 5 resistance bands with different strengths, door anchor, and carry bag. Full body workout anywhere.",
                "price": 34.99,
                "category": sports,
                "stock": 200,
            },
        ]

        # Create products
        for product_data in products_data:
            Product.objects.create(
                is_active=True,
                **product_data
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully created {len(products_data)} products across {Category.objects.count()} categories!"
            )
        )
