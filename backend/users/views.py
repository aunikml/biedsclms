from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN)

class IsAdminOrSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        return bool(request.user.role == User.Role.ADMIN or obj == request.user)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [permissions.AllowAny]
        elif self.action in ['list', 'destroy']:
            self.permission_classes = [IsAdmin]
        elif self.action in ['retrieve', 'update', 'partial_update']:
            self.permission_classes = [IsAdminOrSelf]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        from courses.models import Course, Batch, Topic, ContentComponent, ComponentCompletion
        user = request.user
        
        # 1. Batches the user belongs to
        user_batches = user.course_batches.select_related('course', 'course__instructor').all()
        enrolled_course_ids = set(user_batches.values_list('course_id', flat=True))
        
        # 2. Courses where user has completions or active interactions
        user_completions = ComponentCompletion.objects.filter(user=user).select_related(
            'component', 'component__topic', 'component__topic__course'
        )
        completion_course_ids = set(user_completions.values_list('component__topic__course_id', flat=True))
        
        # Combine all relevant course IDs, or published courses if student has no enrollments
        all_relevant_course_ids = enrolled_course_ids.union(completion_course_ids)
        if all_relevant_course_ids:
            courses = Course.objects.filter(id__in=all_relevant_course_ids).select_related('instructor').prefetch_related('topics__components', 'batches')
        else:
            courses = Course.objects.filter(is_published=True).select_related('instructor').prefetch_related('topics__components', 'batches')

        completed_component_ids = set(user_completions.values_list('component_id', flat=True))

        courses_data = []
        total_components_overall = 0
        total_completed_overall = len(completed_component_ids)

        for course in courses:
            course_components = []
            next_component = None
            first_component = None

            for topic in course.topics.all():
                for comp in topic.components.all():
                    is_done = comp.id in completed_component_ids
                    comp_info = {
                        'id': comp.id,
                        'title': comp.title,
                        'type': comp.type,
                        'topic_name': topic.name,
                        'topic_id': topic.id,
                        'completed': is_done
                    }
                    course_components.append(comp_info)
                    if first_component is None:
                        first_component = comp_info
                    if not is_done and next_component is None:
                        next_component = comp_info

            total_comps = len(course_components)
            completed_comps = sum(1 for c in course_components if c['completed'])
            pct = round((completed_comps / total_comps * 100)) if total_comps > 0 else 0
            
            total_components_overall += total_comps

            # Batches for this course that the user is part of
            user_course_batches = [b.name for b in user_batches if b.course_id == course.id]
            is_enrolled_in_batch = len(user_course_batches) > 0

            instructor_name = f"{course.instructor.first_name} {course.instructor.last_name}".strip() or course.instructor.username

            courses_data.append({
                'id': course.id,
                'title': course.title,
                'description': course.description,
                'image_url': course.image_url,
                'instructor': {
                    'id': course.instructor.id,
                    'username': course.instructor.username,
                    'name': instructor_name,
                    'email': course.instructor.email
                },
                'batch_names': user_course_batches,
                'is_enrolled': is_enrolled_in_batch,
                'total_topics': course.topics.count(),
                'total_components': total_comps,
                'completed_components': completed_comps,
                'progress_percentage': pct,
                'is_completed': (pct == 100 and total_comps > 0),
                'next_component': next_component or first_component,
                'created_at': course.created_at
            })

        # Calculate student stats
        enrolled_count = len(courses_data)
        completed_count = sum(1 for c in courses_data if c['is_completed'])
        in_progress_count = sum(1 for c in courses_data if 0 < c['progress_percentage'] < 100)
        not_started_count = sum(1 for c in courses_data if c['progress_percentage'] == 0)
        
        avg_progress = round(
            sum(c['progress_percentage'] for c in courses_data) / enrolled_count
        ) if enrolled_count > 0 else 0

        # Recent completions
        recent_completions_list = []
        for comp in user_completions.order_by('-completed_at')[:8]:
            recent_completions_list.append({
                'id': comp.id,
                'component_id': comp.component.id,
                'component_title': comp.component.title,
                'component_type': comp.component.type,
                'topic_name': comp.component.topic.name,
                'course_id': comp.component.topic.course.id,
                'course_title': comp.component.topic.course.title,
                'completed_at': comp.completed_at
            })

        # Batches details
        batches_data = []
        for b in user_batches:
            batches_data.append({
                'id': b.id,
                'name': b.name,
                'course_id': b.course.id,
                'course_title': b.course.title,
                'instructor_name': f"{b.course.instructor.first_name} {b.course.instructor.last_name}".strip() or b.course.instructor.username,
                'student_count': b.students.count(),
                'created_at': b.created_at
            })

        response_data = {
            'student': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'role': user.role,
                'date_joined': user.date_joined,
            },
            'stats': {
                'total_enrolled': enrolled_count,
                'in_progress': in_progress_count,
                'completed': completed_count,
                'not_started': not_started_count,
                'total_lessons_completed': total_completed_overall,
                'total_lessons_available': total_components_overall,
                'average_progress': avg_progress,
                'streak_days': 4 if total_completed_overall > 0 else 1,
                'certificates_count': completed_count,
            },
            'courses': courses_data,
            'recent_completions': recent_completions_list,
            'batches': batches_data,
        }
        return Response(response_data)

