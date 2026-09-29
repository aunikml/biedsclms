from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.views import UserViewSet
from courses.views import CourseViewSet, TopicViewSet, ContentComponentViewSet, HeroSlideViewSet, BatchViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'topics', TopicViewSet, basename='topic')
router.register(r'components', ContentComponentViewSet, basename='component')
router.register(r'hero-slides', HeroSlideViewSet, basename='hero-slide')
router.register(r'batches', BatchViewSet, basename='batch')

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/appearance/', include('appearance.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

