from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Address


class AddressSerializer(serializers.ModelSerializer):
    country_display = serializers.CharField(source='get_country_display', read_only=True)

    class Meta:
        model = Address
        fields = [
            'id', 'label', 'full_name', 'address_line1', 'address_line2',
            'city', 'state', 'zip_code', 'country', 'country_display',
            'phone', 'is_default', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['phone', 'first_name', 'last_name', 'email']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})

        # Update user fields
        if user_data:
            user = instance.user
            user.first_name = user_data.get('first_name', user.first_name)
            user.last_name = user_data.get('last_name', user.last_name)
            user.save()

        # Update profile fields
        instance.phone = validated_data.get('phone', instance.phone)
        instance.save()

        return instance


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    addresses = AddressSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_staff", "profile", "addresses"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user
