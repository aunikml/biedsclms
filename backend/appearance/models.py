from django.db import models

class SiteSettings(models.Model):
    # Identity
    site_title = models.CharField(max_length=255, default='ThunderBolt LMS')
    logo = models.ImageField(upload_to='site/', null=True, blank=True)
    favicon = models.ImageField(upload_to='site/', null=True, blank=True)
    
    # Login Page
    login_image = models.ImageField(upload_to='site/', null=True, blank=True)
    login_welcome_title = models.CharField(max_length=255, default='Sign In')
    login_welcome_subtitle = models.CharField(max_length=255, default='Enter your credentials to access your account')
    
    # Colors
    primary_color = models.CharField(max_length=7, default='#4F46E5')
    accent_color = models.CharField(max_length=7, default='#EC1818')
    
    # Typography
    font_family = models.CharField(max_length=100, default='Roboto, Rubik, sans-serif')
    base_font_size = models.IntegerField(default=16)
    
    # Layout & Theme
    sidebar_style = models.CharField(max_length=20, choices=[('fixed', 'Fixed'), ('collapsible', 'Collapsible')], default='fixed')
    theme_mode = models.CharField(max_length=20, choices=[('light', 'Light'), ('dark', 'Dark'), ('system', 'System Default')], default='light')
    
    # Advanced
    custom_css = models.TextField(blank=True, default='')

    def save(self, *args, **kwargs):
        self.pk = 1
        super(SiteSettings, self).save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Site Settings"
