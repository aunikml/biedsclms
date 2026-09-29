from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from users.models import User
from courses.models import Course, Topic, ContentComponent, ComponentCompletion, Batch

class Command(BaseCommand):
    help = 'Seeds sample student accounts, batches, and course completions for testing the student dashboard'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("Seeding students and course test data..."))

        # 1. Ensure an instructor/teacher exists
        instructor, _ = User.objects.get_or_create(
            username='instructor.sarah',
            defaults={
                'email': 'sarah.instructor@example.com',
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'role': User.Role.TEACHER,
                'is_staff': True
            }
        )
        instructor.set_password('password123')
        instructor.save()

        # 2. Ensure sample courses exist
        course1, _ = Course.objects.get_or_create(
            title='Full-Stack Web Development Mastery',
            defaults={
                'description': 'Master modern web applications from frontend React to Django REST APIs and cloud deployment.',
                'image_url': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
                'instructor': instructor,
                'is_published': True
            }
        )

        course2, _ = Course.objects.get_or_create(
            title='UI/UX Design Systems & Figma Architecture',
            defaults={
                'description': 'Learn advanced product design, design tokens, accessible color palettes, and Figma component libraries.',
                'image_url': 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
                'instructor': instructor,
                'is_published': True
            }
        )

        course3, _ = Course.objects.get_or_create(
            title='Data Science & Applied Machine Learning',
            defaults={
                'description': 'Practical Python data analysis, statistical modeling, machine learning pipelines, and predictive algorithms.',
                'image_url': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
                'instructor': instructor,
                'is_published': True
            }
        )

        # 3. Create Topics & Components for Course 1
        t1, _ = Topic.objects.get_or_create(course=course1, name='Module 1: Modern JavaScript & TypeScript Foundations', defaults={'order': 1})
        c1_1, _ = ContentComponent.objects.get_or_create(topic=t1, title='Introduction to TypeScript Types & Interfaces', defaults={'type': ContentComponent.ComponentType.YOUTUBE, 'url': 'https://www.youtube.com/watch?v=BwuLxPH8IDs', 'order': 1})
        c1_2, _ = ContentComponent.objects.get_or_create(topic=t1, title='Hands-on Lab: Refactoring JS to Strict TS', defaults={'type': ContentComponent.ComponentType.ASSIGNMENT, 'url': 'https://example.com/lab-1', 'order': 2})
        c1_3, _ = ContentComponent.objects.get_or_create(topic=t1, title='Knowledge Check: TypeScript Generics Quiz', defaults={'type': ContentComponent.ComponentType.QUIZ, 'url': 'https://example.com/quiz-1', 'order': 3})

        t2, _ = Topic.objects.get_or_create(course=course1, name='Module 2: React State & Custom Hooks Architecture', defaults={'order': 2})
        c1_4, _ = ContentComponent.objects.get_or_create(topic=t2, title='Deep Dive: useContext & useReducer Patterns', defaults={'type': ContentComponent.ComponentType.YOUTUBE, 'url': 'https://www.youtube.com/watch?v=BwuLxPH8IDs', 'order': 1})
        c1_5, _ = ContentComponent.objects.get_or_create(topic=t2, title='Architecture Guide: Scalable React Folders (PDF)', defaults={'type': ContentComponent.ComponentType.PDF, 'url': 'https://example.com/guide.pdf', 'order': 2})
        c1_6, _ = ContentComponent.objects.get_or_create(topic=t2, title='Project Milestone: Dashboard State Store', defaults={'type': ContentComponent.ComponentType.ASSIGNMENT, 'url': 'https://example.com/project-1', 'order': 3})

        # Topics & Components for Course 2
        t3, _ = Topic.objects.get_or_create(course=course2, name='Module 1: Design Tokens & Typography Systems', defaults={'order': 1})
        c2_1, _ = ContentComponent.objects.get_or_create(topic=t3, title='Color Harmony & Contrast in HSL Spaces', defaults={'type': ContentComponent.ComponentType.YOUTUBE, 'url': 'https://www.youtube.com/watch?v=BwuLxPH8IDs', 'order': 1})
        c2_2, _ = ContentComponent.objects.get_or_create(topic=t3, title='Design System Token Guide (PDF)', defaults={'type': ContentComponent.ComponentType.PDF, 'url': 'https://example.com/tokens.pdf', 'order': 2})

        t4, _ = Topic.objects.get_or_create(course=course2, name='Module 2: Component Variants & Auto-Layout', defaults={'order': 2})
        c2_3, _ = ContentComponent.objects.get_or_create(topic=t4, title='Mastering Figma Nested Auto-Layouts', defaults={'type': ContentComponent.ComponentType.YOUTUBE, 'url': 'https://www.youtube.com/watch?v=BwuLxPH8IDs', 'order': 1})
        c2_4, _ = ContentComponent.objects.get_or_create(topic=t4, title='Design Submission: Design System UI Kit', defaults={'type': ContentComponent.ComponentType.ASSIGNMENT, 'url': 'https://example.com/design-lab', 'order': 2})

        # Topics & Components for Course 3
        t5, _ = Topic.objects.get_or_create(course=course3, name='Module 1: Exploratory Data Analysis with Pandas', defaults={'order': 1})
        c3_1, _ = ContentComponent.objects.get_or_create(topic=t5, title='Data Cleaning & Aggregations in Python', defaults={'type': ContentComponent.ComponentType.YOUTUBE, 'url': 'https://www.youtube.com/watch?v=BwuLxPH8IDs', 'order': 1})
        c3_2, _ = ContentComponent.objects.get_or_create(topic=t5, title='Jupyter Notebook Lab 1: Dataset Insights', defaults={'type': ContentComponent.ComponentType.ASSIGNMENT, 'url': 'https://example.com/ds-lab-1', 'order': 2})

        # 4. Create Batches
        batch1, _ = Batch.objects.get_or_create(course=course1, name='Batch 2026 - Alpha Web Cohort')
        batch2, _ = Batch.objects.get_or_create(course=course2, name='Batch 2026 - Spring UI/UX Cohort')
        batch3, _ = Batch.objects.get_or_create(course=course3, name='Batch 2026 - Data Science Intensive')

        # 5. Create Students
        students_info = [
            {
                'username': 'alice.student',
                'email': 'alice.student@example.com',
                'first_name': 'Alice',
                'last_name': 'Rahman',
                'batches': [batch1, batch2],
                # 100% on course1 (all 6 components), 50% on course2 (c2_1, c2_2)
                'completions': [c1_1, c1_2, c1_3, c1_4, c1_5, c1_6, c2_1, c2_2]
            },
            {
                'username': 'bob.student',
                'email': 'bob.student@example.com',
                'first_name': 'Bob',
                'last_name': 'Ahmed',
                'batches': [batch1],
                # 50% on course1 (c1_1, c1_2, c1_3)
                'completions': [c1_1, c1_2, c1_3]
            },
            {
                'username': 'clara.student',
                'email': 'clara.student@example.com',
                'first_name': 'Clara',
                'last_name': 'Chowdhury',
                'batches': [batch2, batch3],
                # 25% on course2 (c2_1)
                'completions': [c2_1]
            },
            {
                'username': 'david.student',
                'email': 'david.student@example.com',
                'first_name': 'David',
                'last_name': 'Khan',
                'batches': [batch3],
                # 0% completion (newly enrolled)
                'completions': []
            },
        ]

        now = timezone.now()

        for s_info in students_info:
            user, created = User.objects.get_or_create(
                username=s_info['username'],
                defaults={
                    'email': s_info['email'],
                    'first_name': s_info['first_name'],
                    'last_name': s_info['last_name'],
                    'role': User.Role.STUDENT
                }
            )
            user.set_password('password123')
            user.first_name = s_info['first_name']
            user.last_name = s_info['last_name']
            user.email = s_info['email']
            user.role = User.Role.STUDENT
            user.save()

            # Assign batches
            for batch in s_info['batches']:
                batch.students.add(user)

            # Assign completions
            ComponentCompletion.objects.filter(user=user).delete()
            for idx, comp in enumerate(s_info['completions']):
                completion_time = now - timedelta(days=idx, hours=idx*2)
                completion = ComponentCompletion.objects.create(user=user, component=comp)
                ComponentCompletion.objects.filter(id=completion.id).update(completed_at=completion_time)

            status_str = "Created" if created else "Updated"
            self.stdout.write(self.style.SUCCESS(f"  [+] {status_str} student: {user.username} ({user.email}) - {len(s_info['completions'])} completed lessons"))

        self.stdout.write(self.style.SUCCESS("\nSuccessfully seeded students and test data!"))
        self.stdout.write(self.style.NOTICE("Test Credentials (all passwords: 'password123'):"))
        self.stdout.write("  - alice.student (100% completed Web Dev, 50% UI/UX - has Certificate!)")
        self.stdout.write("  - bob.student   (50% completed Web Dev)")
        self.stdout.write("  - clara.student (25% completed UI/UX, 0% Data Science)")
        self.stdout.write("  - david.student (New student, 0% completed)")
