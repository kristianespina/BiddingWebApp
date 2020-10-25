from django.contrib.auth.models import User, Group

from django_filters import rest_framework as filters
from django.core import serializers
from rest_framework import viewsets, permissions, generics, status
from .serializers import (
    UserSerializer,
    GroupSerializer,
    ProductSerializer,
    ProductPostSerializer,
    BidsSerializer,
)
from .models import Product, Bids, Credits
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime
from django.db.models import Sum, Avg

from django.contrib.auth import get_user_model
from django.dispatch import receiver
from django.db.models.signals import post_save


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """

    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProductsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ["productId", "seller", "expiration"]

    # PATCH
    def patch(self, request, pk=None):
        payload = request.data

        instance = Product.objects.get(
            productId=payload["productId"], seller=request.user
        )
        serializer = self.serializer_class(instance, data=payload, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def create(self, request):
        user = request.user
        if not user.is_staff:
            resp = {"message": "Unauthorized"}
            return Response(resp, status=status.HTTP_400_BAD_REQUEST)
        else:
            payload = request.data
            payload["seller"] = user.pk
            # payload["winningBid"] = None
            # payload["buyer"] = None
            if payload["productId"] is not None:

                prod = Product.objects.get(productId=payload["productId"])
                serializer = ProductSerializer(prod)
                print(serializer.is_valid())
            else:
                serializer = ProductSerializer(data=payload)
            if serializer.is_valid():
                # serializer.save()
                resp = {"message": "Successful operation."}
                return Response(resp)
            else:
                resp = {"message": "Failed operation"}
                return Response(resp, status=status.HTTP_400_BAD_REQUEST)


class BidsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """

    queryset = Bids.objects.all()
    serializer_class = BidsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ["bidId", "productId", "buyer", "datetime"]

    def create(self, request):
        payload = request.data
        user = request.user
        if user.is_staff:  # Sellers cannot bid
            resp = {"message": "Sellers cannot bid"}
            return Response(resp, status=status.HTTP_400_BAD_REQUEST)
        else:
            productId = payload["productId"]
            product = Product.objects.get(pk=productId)
            buyer = User.objects.get(username=user)
            amount = payload["amount"]
            # Compute Remaining Credits
            credits = Credits.objects.values_list("amount").get(user=user)
            committed_bid = Bids.objects.filter(
                buyer=user, amount__isnull=False
            ).aggregate(Sum("amount"))
            remaining_credits = credits[0] - committed_bid["amount__sum"]

            # Validate if within min and max bid:
            minimumBid, maximumBid = Product.objects.values_list(
                "minimumBid", "maximumBid"
            ).get(pk=productId)
            if amount < minimumBid or amount > maximumBid:
                resp = {"message": "Please bid within the given bidding range."}
                return Response(resp, status=status.HTTP_400_BAD_REQUEST)

            # Validate if transaction is possible
            if (remaining_credits - amount) >= 0:
                resp = {"message": "Bid successfully placed"}
                Bids.objects.create(
                    productId=product,
                    buyer=buyer,
                    datetime=datetime.now(),  # server-side time
                    amount=amount,
                )
                return Response(resp)
            else:
                resp = {"message": "Insufficient credits"}
                return Response(resp, status=status.HTTP_400_BAD_REQUEST)


class RoleView(APIView):
    """
    View to display user role

    True = Seller
    False = Buyer
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        return Response({"role": request.user.is_staff})


class SelectBidWinner(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        user = request.user
        if not user.is_staff:
            resp = {"message": "Unauthorized"}
            return Response(resp, status=status.HTTP_400_BAD_REQUEST)
        else:
            payload = request.data
            winningBid = payload["winningBid"]  # Bid ID of winner
            productId, bidder, bid_price = Bids.objects.values_list(
                "productId", "buyer", "amount"
            ).get(bidId=winningBid)

            # Check if bid has already been awarded
            hasWinningBid = Product.objects.values_list("winningBid").get(
                productId=productId
            )[0]

            if hasWinningBid is not None or hasWinningBid != "null":
                resp = {"message": "Bid already awarded!"}
                return Response(resp, status=status.HTTP_400_BAD_REQUEST)

            # Get Bid Price
            credits = Credits.objects.values_list("amount").get(user=bidder)[0]
            if credits < bid_price:
                resp = {"message": "Insufficient credits"}
                return Response(resp, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Update Product
                Product.objects.filter(pk=productId).update(
                    buyer=bidder, winningBid=winningBid
                )

                # Deduct credits
                Credits.objects.filter(user=bidder).update(amount=credits - bid_price)

                resp = {"message": "Successfully awarded bid."}
                return Response(resp)


class ProductPermission(APIView):
    """
    View if user is the seller of the product
    Returns True if user is the seller
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        productId = request.query_params["productId"]

        productSeller = Product.objects.values_list("seller").get(productId=productId)[
            0
        ]

        resp = {"isSeller": int(user.pk) == int(productSeller)}

        return Response(resp)


class MyBidsList(APIView):
    """
    Returns user's bids
    """

    serializer_class = BidsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        bids = Bids.objects.filter(buyer=user)
        resp = BidsSerializer(bids, many=True).data

        for bid in resp:
            status = Product.objects.filter(winningBid=bid["bidId"]).count()
            productName = Product.objects.values_list("name").get(
                productId=bid["productId"]
            )[0]
            bid["productName"] = productName
            if status:
                bid["status"] = 2  # Bid Awarded
            else:
                # Not awarded. Check if bid is ongoing
                # i.e. no winningBid and dateTime expired
                today = datetime.now()
                ongoing_products = Product.objects.filter(
                    expiration__gte=today, winningBid__isnull=True
                )
                ongoing_bids = Bids.objects.filter(
                    productId__in=ongoing_products, bidId=bid["bidId"]
                ).count()
                if ongoing_bids > 0:
                    bid["status"] = 1  # Bid ongoing
                else:
                    bid["status"] = 0  # Expired
        return Response(resp)


class Statistics(APIView):
    """
    View to display user statistics based on role

    [SELLER]
    Total number of Product Bids placed
    Total number of ongoing Product Bids
    Total number of done deals - Product Bids that has been closed
    Total amount of earnings from the done deals
    Average total amount of potential earnings from the average of the sum of all the Minimum and Maximum Bid amounts per Product Bid

    [BUYER]
    total amount left of user’s bid credits
    total amount of user’s committed bid
    total amount spent of user’s bid credit
    total number of bids placed
    total number of winning bids
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        today = datetime.today()
        if user.is_staff:
            # Products by seller
            products = Product.objects.filter(seller=user)
            done_products = Product.objects.filter(seller=user, buyer__isnull=False)
            bids = Bids.objects.filter(productId__in=products)
            num_products = products.count()
            num_bids = bids.filter(datetime__gte=today, productId__in=products).count()
            num_done_deals = done_products.count()
            successful_bids = Product.objects.filter(winningBid__isnull=False)
            num_earnings = Bids.objects.filter(bidId__in=successful_bids).aggregate(
                Sum("amount")
            )
            # Potential earnings
            """
            Average total amount of potential earnings from the 
            average of the sum of all the Minimum and Maximum Bid 
            amounts per Product Bid
            """
            avg_min = products.aggregate(Avg("minimumBid"))
            avg_max = products.aggregate(Avg("maximumBid"))
            return Response(
                {
                    "productsCount": num_products,
                    "bidsCount": num_bids,
                    "dealsClosedCount": num_done_deals,
                    "earnings": num_earnings,
                    "potentialMin": avg_min,
                    "potentialMax": avg_max,
                }
            )
        else:
            """
            [BUYER]
            total amount left of user’s bid credits
            total amount of user’s committed bid
            total amount spent of user’s bid credit
            total number of bids placed
            total number of winning bids
            """
            credits = Credits.objects.values_list("amount").get(user=user)
            activeProducts = Product.objects.filter(winningBid__isnull=True)
            committed_bid = Bids.objects.filter(
                buyer=user, amount__isnull=False, productId__in=activeProducts
            ).aggregate(Sum("amount"))
            products_won = Product.objects.filter(buyer=user)
            winning_bids = Product.objects.values_list("winningBid").filter(buyer=user)
            spent_credits = Bids.objects.filter(bidId__in=winning_bids).aggregate(
                Sum("amount")
            )
            num_bids = Bids.objects.filter(buyer=user).count()
            winning_bids = products_won.count()

            return Response(
                {
                    "credits": credits,
                    "commited": committed_bid,
                    "spent": spent_credits,
                    "bidsCount": num_bids,
                    "bidsWon": winning_bids,
                }
            )


# Create default credits
@receiver(post_save, sender=User)
def create_credits(sender, instance, created, **kwargs):
    if created:
        Credits.objects.create(user=instance)
