from django.db import models
from django.conf import settings

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    image_url = models.TextField(blank=True, default='')
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses_taught')
    created_at = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class Topic(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=255)
    order = models.IntegerField(default=0)
    sequential_lock = models.BooleanField(default=False)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.name}"

class ContentComponent(models.Model):
    class ComponentType(models.TextChoices):
        YOUTUBE = 'YOUTUBE', 'YouTube Video'
        GOOGLE_DRIVE = 'GOOGLE_DRIVE', 'Google Drive Video'
        VIDEO = 'VIDEO', 'Custom Video URL'
        AUDIO = 'AUDIO', 'Custom Audio URL'
        PDF = 'PDF', 'PDF Document'
        DOCX = 'DOCX', 'Word Document (DOCX)'
        LINK = 'LINK', 'External Web Link'
        GOOGLE_SLIDES = 'GOOGLE_SLIDES', 'Google Slides (Embed)'
        POWERPOINT = 'POWERPOINT', 'PowerPoint Presentation'
        ASSIGNMENT = 'ASSIGNMENT', 'Assignment Activity'
        QUIZ = 'QUIZ', 'Quiz Activity'

    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='components')
    type = models.CharField(max_length=20, choices=ComponentType.choices, default=ComponentType.YOUTUBE)
    title = models.CharField(max_length=255)
    url = models.TextField()  # Stores the link or iframe code
    order = models.IntegerField(default=0)
    strict_completion = models.BooleanField(default=False)
    sequential_lock = models.BooleanField(default=False)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.topic.name} - {self.title} ({self.type})"

class ComponentCompletion(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='completions')
    component = models.ForeignKey(ContentComponent, on_delete=models.CASCADE, related_name='completions')
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'component')

    def __str__(self):
        return f"{self.user.username} - {self.component.title} (Completed)"

class HeroSlide(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.TextField(blank=True, default='')
    badge_text = models.CharField(max_length=100, blank=True, default='FEATURED')
    image_url = models.TextField(blank=True, default='')
    button_text = models.CharField(max_length=100, default='Explore Course')
    button_link = models.CharField(max_length=255, default='/')
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

class Batch(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='batches')
    name = models.CharField(max_length=255)
    students = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='course_batches', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.course.title} - {self.name}"
