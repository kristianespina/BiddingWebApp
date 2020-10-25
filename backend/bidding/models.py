from django.db import models
from django.contrib.auth.models import User


class Product(models.Model):
    productId = models.AutoField(primary_key=True)
    seller = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="product_seller"
    )
    name = models.CharField(max_length=128)
    photo = models.ImageField(upload_to="images/")
    description = models.TextField(null=True)
    minimumBid = models.FloatField()
    maximumBid = models.FloatField()
    expiration = models.DateTimeField()
    buyer = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, related_name="product_buyer"
    )
    winningBid = models.ForeignKey("bidding.Bids", on_delete=models.CASCADE, null=True)


class Bids(models.Model):
    bidId = models.AutoField(primary_key=True)
    productId = models.ForeignKey(Product, on_delete=models.CASCADE)
    # seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name="seller")
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="buyer")
    amount = models.FloatField(default=0)
    datetime = models.DateTimeField()


class Credits(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    amount = models.FloatField(default=50000)
