from rest_framework import serializers
from .models import Course, Topic, ContentComponent, ComponentCompletion, HeroSlide, Batch
from users.serializers import UserSerializer
from users.models import User

class BatchStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'date_joined')

class BatchSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    student_count = serializers.IntegerField(source='students.count', read_only=True)
    students = BatchStudentSerializer(many=True, read_only=True)

    class Meta:
        model = Batch
        fields = ('id', 'course', 'course_title', 'name', 'student_count', 'students', 'created_at')
        read_only_fields = ('created_at', 'student_count')

class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = ('id', 'title', 'subtitle', 'badge_text', 'image_url', 'button_text', 'button_link', 'order', 'is_active')

class ContentComponentSerializer(serializers.ModelSerializer):
    completed = serializers.SerializerMethodField()

    class Meta:
        model = ContentComponent
        fields = ('id', 'topic', 'type', 'title', 'url', 'order', 'strict_completion', 'sequential_lock', 'completed')

    def get_completed(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.completions.filter(user=request.user).exists()
        return False

class TopicSerializer(serializers.ModelSerializer):
    components = ContentComponentSerializer(many=True, read_only=True)

    class Meta:
        model = Topic
        fields = ('id', 'course', 'name', 'order', 'sequential_lock', 'components')

class CourseSerializer(serializers.ModelSerializer):
    instructor_details = UserSerializer(source='instructor', read_only=True)
    topics = TopicSerializer(many=True, read_only=True)
    batches = BatchSerializer(many=True, read_only=True)
    instructor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False
    )

    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'image_url', 'instructor', 'instructor_details', 'created_at', 'is_published', 'topics', 'batches')
        read_only_fields = ('created_at',)
