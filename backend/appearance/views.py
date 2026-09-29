from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import permissions
from .models import SiteSettings
from .serializers import SiteSettingsSerializer

class IsAdminOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user 
            and request.user.is_authenticated 
            and (getattr(request.user, 'role', None) == 'ADMIN' or request.user.is_staff or request.user.is_superuser)
        )

class SiteSettingsView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdminOrStaff()]

    def get(self, request, *args, **kwargs):
        settings = SiteSettings.load()
        serializer = SiteSettingsSerializer(settings, context={'request': request})
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        settings = SiteSettings.load()
        serializer = SiteSettingsSerializer(settings, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def post(self, request, *args, **kwargs):
        return self.put(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.put(request, *args, **kwargs)

