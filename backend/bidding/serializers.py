from django.contrib.auth.models import User, Group
from .models import Product, Bids
from rest_framework import serializers
from rest_framework_jwt.settings import api_settings


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ["url", "username", "email", "groups"]


class UserSerializeWithToken(serializers.ModelSerializer):
    token = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True)

    def get_token(self, obj):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        payload = jwt_payload_handler(obj)
        token = jwt_encode_handler(payload)
        return token

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

    class Meta:
        model = User
        fields = ("token", "username", "password", "is_staff")


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["url", "name"]


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "productId",
            "seller",
            "name",
            "photo",
            "minimumBid",
            "maximumBid",
            "expiration",
            "description",
            "winningBid",
            "buyer",
        ]


class BidsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bids
        fields = ["bidId", "productId", "buyer", "datetime", "amount"]
