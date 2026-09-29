from rest_framework import serializers
from .models import SiteSettings

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'site_title', 'logo', 'favicon', 
            'login_image', 'login_welcome_title', 'login_welcome_subtitle',
            'primary_color', 'accent_color',
            'font_family', 'base_font_size',
            'sidebar_style', 'theme_mode',
            'custom_css'
        ]
        extra_kwargs = {
            'site_title': {'required': False, 'allow_blank': True},
            'login_welcome_title': {'required': False, 'allow_blank': True},
            'login_welcome_subtitle': {'required': False, 'allow_blank': True},
            'primary_color': {'required': False, 'allow_blank': True},
            'accent_color': {'required': False, 'allow_blank': True},
            'font_family': {'required': False, 'allow_blank': True},
            'custom_css': {'required': False, 'allow_blank': True},
            'logo': {'required': False, 'allow_null': True},
            'favicon': {'required': False, 'allow_null': True},
            'login_image': {'required': False, 'allow_null': True},
        }
