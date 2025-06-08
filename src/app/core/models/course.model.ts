export interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: number;
  price?: number;
  imageUrl?: string;
  duration?: string; // New field
  ageRange?: string; // New field
  level?: string;    // New field
  requiredEquipment?: string; // Added for course form
  materials?: string[]; // Added for course details display
}

export interface CourseCreateData {
  title: string;
  description: string;
  teacherId: number;
  price?: number; // Keep price optional here for now, as teacher form doesn't use it
  imageUrl?: string;
  duration: string;  // New field - assuming required from teacher form
  ageRange: string;  // New field - assuming required from teacher form
  level: string;     // New field - assuming required from teacher form
  requiredEquipment?: string; // Added for course form, optional
}

export interface CourseUpdateData {
  title?: string;
  description?: string;
  teacherId?: number; // Usually teacherId is not updatable, but depends on API design
  price?: number;
  imageUrl?: string;
  duration?: string; // New field
  ageRange?: string; // New field
  level?: string;    // New field
  requiredEquipment?: string; // Added for course form
}

export interface EnrollmentData {
  userId: string;
}

// Optional: If you need a specific response type for course actions
export interface CourseApiResponse {
  message: string;
  courseId?: string; // For create operations
}