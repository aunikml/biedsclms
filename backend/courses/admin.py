from django.contrib import admin
from .models import Course, Topic, ContentComponent, ComponentCompletion, HeroSlide, Batch

@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ('title', 'badge_text', 'button_text', 'order', 'is_active')
    list_editable = ('order', 'is_active')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'is_published', 'created_at')
    list_filter = ('is_published',)

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'created_at')
    list_filter = ('course',)
    search_fields = ('name', 'course__title')
    filter_horizontal = ('students',)

admin.site.register(Topic)
admin.site.register(ContentComponent)
admin.site.register(ComponentCompletion)
