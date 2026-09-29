export interface ContentComponent {
  id: number;
  topic: number;
  type: 'YOUTUBE' | 'GOOGLE_DRIVE' | 'VIDEO' | 'AUDIO' | 'PDF' | 'DOCX' | 'LINK' | 'GOOGLE_SLIDES' | 'POWERPOINT' | 'ASSIGNMENT' | 'QUIZ';
  title: string;
  url: string;
  order: number;
  strict_completion: boolean;
  sequential_lock?: boolean;
  completed?: boolean;
}

export interface Topic {
  id: number;
  course: number;
  name: string;
  order: number;
  sequential_lock?: boolean;
  components: ContentComponent[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: number;
  instructor_details?: {
    username: string;
    first_name: string;
    last_name: string;
  };
  topics: Topic[];
  batches?: any[];
}

export interface DiscussionPost {
  id: string;
  author: string;
  role: string;
  text: string;
  time: string;
  unitId?: number;
  unitTitle?: string;
}

export interface StudentNote {
  id: string;
  compId: number;
  unitTitle: string;
  timestampSeconds: number;
  timestampText: string;
  noteText: string;
  createdAt: string;
}
