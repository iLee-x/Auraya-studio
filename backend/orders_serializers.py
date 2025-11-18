# orders/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source="product", read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_detail", "quantity", "price", "subtotal"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "user_email",
            "status",
            "total_amount",
            "shipping_name",
            "shipping_email",
            "shipping_address",
            "shipping_city",
            "shipping_state",
            "shipping_zip",
            "shipping_country",
            "payment_method",
            "paypal_order_id",
            "paid",
            "paid_at",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["user", "created_at", "updated_at", "paid_at"]


class OrderCreateSerializer(serializers.Serializer):
    items = serializers.ListField(
        child=serializers.DictField(child=serializers.IntegerField())
    )
    shipping_name = serializers.CharField(max_length=200)
    shipping_email = serializers.EmailField()
    shipping_address = serializers.CharField(max_length=500)
    shipping_city = serializers.CharField(max_length=100)
    shipping_state = serializers.CharField(max_length=100)
    shipping_zip = serializers.CharField(max_length=20)
    shipping_country = serializers.CharField(max_length=100)
    paypal_order_id = serializers.CharField(max_length=200, required=False)

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        user = self.context["request"].user

        # Calculate total
        from products.models import Product

        total = 0
        order_items = []

        for item in items_data:
            product = Product.objects.get(id=item["product_id"])
            quantity = item["quantity"]
            price = product.price
            total += price * quantity
            order_items.append(
                {"product": product, "quantity": quantity, "price": price}
            )

        # Create order
        order = Order.objects.create(user=user, total_amount=total, **validated_data)

        # Create order items
        for item in order_items:
            OrderItem.objects.create(order=order, **item)

        return order
