export interface Lesson {
  id: string;
  title: string;
  content: string;
  courseId: string;
}

export interface LessonCreateData {
  title: string;
  content: string;
  // courseId is part of the URL, not the request body for lesson creation
}

export interface LessonUpdateData {
  title?: string;
  content?: string;
}