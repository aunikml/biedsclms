import csv
import io
from django.http import HttpResponse
from rest_framework import viewsets, permissions, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Course, Topic, ContentComponent, ComponentCompletion, HeroSlide, Batch
from .serializers import (
    CourseSerializer, TopicSerializer, ContentComponentSerializer, 
    HeroSlideSerializer, BatchSerializer
)
from users.models import User

class HeroSlideViewSet(viewsets.ModelViewSet):
    serializer_class = HeroSlideSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role in [User.Role.ADMIN, User.Role.MANAGER]:
            return HeroSlide.objects.all().order_by('order')
        return HeroSlide.objects.filter(is_active=True).order_by('order')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in [User.Role.ADMIN, User.Role.MANAGER]:
            raise exceptions.PermissionDenied("You do not have permission to create hero slides.")
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        if user.role not in [User.Role.ADMIN, User.Role.MANAGER]:
            raise exceptions.PermissionDenied("You do not have permission to modify hero slides.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role not in [User.Role.ADMIN, User.Role.MANAGER]:
            raise exceptions.PermissionDenied("You do not have permission to delete hero slides.")
        instance.delete()

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Course.objects.filter(is_published=True)
        
        if user.role in [User.Role.ADMIN, User.Role.MANAGER]:
            return Course.objects.all()
        elif user.role == User.Role.TEACHER:
            return Course.objects.filter(instructor=user)
        else:
            return Course.objects.filter(is_published=True)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in [User.Role.ADMIN, User.Role.MANAGER]:
            raise exceptions.PermissionDenied("You do not have permission to create a course.")
        if 'instructor' not in serializer.validated_data:
            serializer.save(instructor=user)
        else:
            serializer.save()

class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data['course']
        if user.role not in [User.Role.ADMIN, User.Role.MANAGER] and course.instructor != user:
            raise exceptions.PermissionDenied("You do not have permission to modify this course outline.")
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        topic = self.get_object()
        if user.role not in [User.Role.ADMIN, User.Role.MANAGER] and topic.course.instructor != user:
            raise exceptions.PermissionDenied("You do not have permission to modify this course outline.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role not in [User.Role.ADMIN, User.Role.MANAGER] and instance.course.instructor != user:
            raise exceptions.PermissionDenied("You do not have permission to modify this course outline.")
        instance.delete()

class ContentComponentViewSet(viewsets.ModelViewSet):
    queryset = ContentComponent.objects.all()
    serializer_class = ContentComponentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user
        topic = serializer.validated_data['topic']
        if user.role not in [User.Role.ADMIN, User.Role.MANAGER] and topic.course.instructor != user:
            raise exceptions.PermissionDenied("You do not have permission to add content to this course.")
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        component = self.get_object()
        if user.role not in [User.Role.ADMIN, User.Role.MANAGER] and component.topic.course.instructor != user:
            raise exceptions.PermissionDenied("You do not have permission to edit content in this course.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role not in [User.Role.ADMIN, User.Role.MANAGER] and instance.topic.course.instructor != user:
            raise exceptions.PermissionDenied("You do not have permission to delete content in this course.")
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_complete(self, request, pk=None):
        component = self.get_object()
        user = request.user
        completion = ComponentCompletion.objects.filter(user=user, component=component).first()
        if completion:
            completion.delete()
            return Response({'completed': False})
        else:
            ComponentCompletion.objects.create(user=user, component=component)
            return Response({'completed': True})

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def upload_file(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file was provided.'}, status=400)

        import os
        from django.conf import settings
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile

        # Ensure directory exists
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)

        # Build path and save
        file_path = os.path.join('uploads', file_obj.name)
        
        # Avoid duplicate name collision by letting default_storage handle it
        saved_path = default_storage.save(file_path, ContentFile(file_obj.read()))
        
        # Build full URL
        file_url = request.build_absolute_uri(settings.MEDIA_URL + saved_path)

        return Response({'url': file_url})


class BatchViewSet(viewsets.ModelViewSet):
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Batch.objects.all().select_related('course').prefetch_related('students')
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        if user.role in [User.Role.ADMIN, User.Role.MANAGER]:
            return queryset
        elif user.role == User.Role.TEACHER:
            return queryset.filter(course__instructor=user)
        else:
            return queryset.filter(students=user)

    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data['course']
        if user.role not in [User.Role.ADMIN, User.Role.MANAGER] and course.instructor != user:
            raise exceptions.PermissionDenied("You do not have permission to create batches for this course.")
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        batch = self.get_object()
        if user.role not in [User.Role.ADMIN, User.Role.MANAGER] and batch.course.instructor != user:
            raise exceptions.PermissionDenied("You do not have permission to modify this batch.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role not in [User.Role.ADMIN, User.Role.MANAGER] and instance.course.instructor != user:
            raise exceptions.PermissionDenied("You do not have permission to delete this batch.")
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def upload_csv(self, request, pk=None):
        batch = self.get_object()
        user = request.user
        if user.role not in [User.Role.ADMIN, User.Role.MANAGER] and batch.course.instructor != user:
            raise exceptions.PermissionDenied("You do not have permission to add students to this batch.")

        file_obj = request.FILES.get('file')
        csv_text = request.data.get('csv_text')

        if not file_obj and not csv_text:
            return Response({'error': 'Please provide a CSV file or CSV text content.'}, status=400)

        if file_obj:
            try:
                raw_bytes = file_obj.read()
                try:
                    decoded_file = raw_bytes.decode('utf-8-sig')
                except UnicodeDecodeError:
                    decoded_file = raw_bytes.decode('latin-1')
                file_io = io.StringIO(decoded_file)
            except Exception as e:
                return Response({'error': f'Failed to read file: {str(e)}'}, status=400)
        else:
            file_io = io.StringIO(csv_text)

        reader = csv.reader(file_io)
        rows = list(reader)
        if not rows:
            return Response({'error': 'CSV is empty.'}, status=400)

        raw_header = [col.strip().lower().replace('_', '').replace(' ', '').replace('-', '') for col in rows[0]]
        
        first_name_idx = None
        last_name_idx = None
        email_idx = None

        for idx, col_name in enumerate(raw_header):
            if col_name in ['firstname', 'fname', 'first']:
                first_name_idx = idx
            elif col_name in ['lastname', 'lname', 'last', 'surname']:
                last_name_idx = idx
            elif col_name in ['email', 'emailaddress', 'mail', 'username']:
                email_idx = idx

        if email_idx is None:
            for idx, cell in enumerate(rows[0]):
                if '@' in cell:
                    email_idx = idx
                    first_name_idx = 0 if idx != 0 else 1
                    last_name_idx = 1 if idx != 1 and first_name_idx != 1 else 2
                    data_rows = rows
                    break
            else:
                return Response({
                    'error': "CSV must include headers for 'firstname', 'lastname', and 'email'."
                }, status=400)
            data_rows = rows
        else:
            data_rows = rows[1:]

        created_count = 0
        existing_count = 0
        errors = []
        added_students = []

        for row_num, row in enumerate(data_rows, start=2):
            if not row or not any(cell.strip() for cell in row):
                continue

            try:
                first_name = row[first_name_idx].strip() if first_name_idx is not None and first_name_idx < len(row) else ''
                last_name = row[last_name_idx].strip() if last_name_idx is not None and last_name_idx < len(row) else ''
                email = row[email_idx].strip() if email_idx is not None and email_idx < len(row) else ''

                if not email or '@' not in email:
                    errors.append({
                        'row': row_num,
                        'email': email,
                        'error': 'Missing or invalid email address.'
                    })
                    continue

                username = email.lower()
                clean_email = email.lower()

                existing_user = User.objects.filter(username__iexact=username).first() or User.objects.filter(email__iexact=clean_email).first()

                if existing_user:
                    batch.students.add(existing_user)
                    if not existing_user.first_name and first_name:
                        existing_user.first_name = first_name
                    if not existing_user.last_name and last_name:
                        existing_user.last_name = last_name
                    existing_user.save()

                    existing_count += 1
                    added_students.append({
                        'id': existing_user.id,
                        'username': existing_user.username,
                        'email': existing_user.email,
                        'first_name': existing_user.first_name,
                        'last_name': existing_user.last_name,
                        'status': 'enrolled_existing'
                    })
                else:
                    new_user = User.objects.create_user(
                        username=username,
                        email=clean_email,
                        first_name=first_name,
                        last_name=last_name,
                        role=User.Role.STUDENT,
                        password=clean_email
                    )
                    batch.students.add(new_user)
                    created_count += 1
                    added_students.append({
                        'id': new_user.id,
                        'username': new_user.username,
                        'email': new_user.email,
                        'first_name': new_user.first_name,
                        'last_name': new_user.last_name,
                        'status': 'created_and_enrolled'
                    })

            except Exception as e:
                errors.append({
                    'row': row_num,
                    'row_data': row,
                    'error': str(e)
                })

        total_processed = created_count + existing_count

        return Response({
            'success': True,
            'message': f"Batch upload complete: {created_count} new student account(s) created (with email as password), {existing_count} existing account(s) enrolled.",
            'batch_id': batch.id,
            'batch_name': batch.name,
            'total_processed': total_processed,
            'created_count': created_count,
            'existing_count': existing_count,
            'total_students_in_batch': batch.students.count(),
            'errors': errors,
            'students': added_students
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_student(self, request, pk=None):
        batch = self.get_object()
        user = request.user
        if user.role not in [User.Role.ADMIN, User.Role.MANAGER] and batch.course.instructor != user:
            raise exceptions.PermissionDenied("You do not have permission to add students to this batch.")

        email = request.data.get('email', '').strip().lower()
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()

        if not email or '@' not in email:
            return Response({'error': 'A valid email is required.'}, status=400)

        existing_user = User.objects.filter(username__iexact=email).first() or User.objects.filter(email__iexact=email).first()

        if existing_user:
            batch.students.add(existing_user)
            return Response({
                'success': True,
                'message': f"Existing student {existing_user.username} enrolled into batch.",
                'created': False,
                'student': {
                    'id': existing_user.id,
                    'username': existing_user.username,
                    'email': existing_user.email,
                    'first_name': existing_user.first_name,
                    'last_name': existing_user.last_name
                }
            })
        else:
            new_user = User.objects.create_user(
                username=email,
                email=email,
                first_name=first_name,
                last_name=last_name,
                role=User.Role.STUDENT,
                password=email
            )
            batch.students.add(new_user)
            return Response({
                'success': True,
                'message': f"New account created for {email} (password set to email) and enrolled into batch.",
                'created': True,
                'student': {
                    'id': new_user.id,
                    'username': new_user.username,
                    'email': new_user.email,
                    'first_name': new_user.first_name,
                    'last_name': new_user.last_name
                }
            })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def remove_student(self, request, pk=None):
        batch = self.get_object()
        user = request.user
        if user.role not in [User.Role.ADMIN, User.Role.MANAGER] and batch.course.instructor != user:
            raise exceptions.PermissionDenied("You do not have permission to remove students from this batch.")

        student_id = request.data.get('student_id')
        if not student_id:
            return Response({'error': 'student_id is required.'}, status=400)

        student = batch.students.filter(id=student_id).first()
        if not student:
            return Response({'error': 'Student is not in this batch.'}, status=404)

        batch.students.remove(student)
        return Response({'success': True, 'message': f"Student {student.username} removed from batch."})

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def sample_csv(self, request):
        csv_content = "firstname,lastname,email\nJohn,Doe,john.doe@example.com\nJane,Smith,jane.smith@example.com\nAlex,Wong,alex.wong@example.com\n"
        response = HttpResponse(csv_content, content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="student_batch_template.csv"'
        return response

