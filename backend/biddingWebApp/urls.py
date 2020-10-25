from django.urls import include, path
from rest_framework import routers
from bidding import views
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_jwt.views import obtain_jwt_token
from django.contrib import admin

router = routers.DefaultRouter()
router.register(r"users", views.UserViewSet)
router.register(r"groups", views.GroupViewSet)
router.register(r"products", views.ProductsViewSet)
# router.register(r"^products/(?P<productId>.+)/$", views.ProductList.as_view()),
router.register(r"bids", views.BidsViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path("", include(router.urls)),
    path("admin/", admin.site.urls),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    path("token-auth/", obtain_jwt_token),
    path("statistics/", views.Statistics.as_view(), name="statistics"),
    path("mybids/", views.MyBidsList.as_view(), name="mybids"),
    path(
        "productPermission/",
        views.ProductPermission.as_view(),
        name="productPermission",
    ),
    path("awardBid/", views.SelectBidWinner.as_view(), name="awardBid",),
    path("role/", views.RoleView.as_view(), name="role"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
