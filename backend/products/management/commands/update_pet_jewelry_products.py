from django.core.management.base import BaseCommand
from products.models import Category, Product
from django.utils.text import slugify


class Command(BaseCommand):
    help = 'Update products for Pet and Jewelry categories'

    def handle(self, *args, **kwargs):
        # Clear existing data
        Product.objects.all().delete()
        Category.objects.all().delete()

        # Create categories
        pets_category = Category.objects.create(
            name='Pet Essentials',
            slug='pets',
            description='Premium accessories and essentials for your furry friends'
        )

        jewelry_category = Category.objects.create(
            name='Jewelry',
            slug='jewelry',
            description='Elegant handcrafted jewelry pieces'
        )

        # Pet products
        pet_products = [
            {
                'name': 'Organic Cotton Pet Bed',
                'description': 'Luxuriously soft pet bed made from 100% organic cotton with memory foam cushioning.',
                'price': 89.99,
                'stock': 25,
            },
            {
                'name': 'Leather Pet Collar - Tan',
                'description': 'Handcrafted vegetable-tanned leather collar with brass hardware.',
                'price': 45.00,
                'stock': 40,
            },
            {
                'name': 'Ceramic Water Bowl',
                'description': 'Handmade ceramic bowl with non-slip rubber base.',
                'price': 32.00,
                'stock': 30,
            },
            {
                'name': 'Natural Fiber Scratch Post',
                'description': 'Eco-friendly sisal scratch post with modern design.',
                'price': 78.00,
                'stock': 15,
            },
            {
                'name': 'Wool Pet Blanket',
                'description': 'Soft merino wool blanket perfect for cozy naps.',
                'price': 54.00,
                'stock': 35,
            },
            {
                'name': 'Stainless Steel Food Bowl Set',
                'description': 'Premium stainless steel bowls with bamboo stand.',
                'price': 42.00,
                'stock': 28,
            },
            {
                'name': 'Hemp Rope Leash',
                'description': 'Durable and sustainable hemp rope leash with leather handle.',
                'price': 38.00,
                'stock': 45,
            },
            {
                'name': 'Organic Catnip Toys',
                'description': 'Set of 3 handmade toys filled with organic catnip.',
                'price': 24.00,
                'stock': 50,
            },
        ]

        for product_data in pet_products:
            Product.objects.create(
                category=pets_category,
                slug=slugify(product_data['name']),
                **product_data
            )

        # Jewelry products
        jewelry_products = [
            {
                'name': 'Sterling Silver Chain Necklace',
                'description': 'Minimalist sterling silver chain with adjustable length.',
                'price': 125.00,
                'stock': 20,
            },
            {
                'name': 'Gold Vermeil Stacking Rings',
                'description': 'Set of 3 delicate gold vermeil stacking rings.',
                'price': 165.00,
                'stock': 15,
            },
            {
                'name': 'Pearl Drop Earrings',
                'description': 'Freshwater pearl earrings with 14k gold hooks.',
                'price': 95.00,
                'stock': 25,
            },
            {
                'name': 'Rose Gold Cuff Bracelet',
                'description': 'Hammered rose gold cuff with adjustable fit.',
                'price': 145.00,
                'stock': 18,
            },
            {
                'name': 'Moonstone Pendant',
                'description': 'Natural moonstone set in recycled silver.',
                'price': 110.00,
                'stock': 12,
            },
            {
                'name': 'Minimalist Bar Necklace',
                'description': 'Sleek bar necklace in brushed sterling silver.',
                'price': 85.00,
                'stock': 30,
            },
            {
                'name': 'Turquoise Stud Earrings',
                'description': 'Genuine turquoise stones in silver settings.',
                'price': 68.00,
                'stock': 22,
            },
            {
                'name': 'Layered Chain Bracelet',
                'description': 'Multi-strand bracelet with mixed metals.',
                'price': 92.00,
                'stock': 16,
            },
        ]

        for product_data in jewelry_products:
            Product.objects.create(
                category=jewelry_category,
                slug=slugify(product_data['name']),
                **product_data
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(pet_products)} pet products and {len(jewelry_products)} jewelry products'
            )
        )
