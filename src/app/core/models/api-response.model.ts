export interface ApiResponse {
  message: string;
}

export interface CourseCreateResponse extends ApiResponse {
  courseId: number;
}

export interface LessonCreateResponse extends ApiResponse {
  lessonId: number;
}