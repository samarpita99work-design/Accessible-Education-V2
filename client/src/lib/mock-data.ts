export type UserRole = "student" | "teacher" | "admin";

export type DisabilityType =
  | "blind"
  | "low_vision"
  | "deaf"
  | "hard_of_hearing"
  | "mute"
  | "speech_impaired"
  | "adhd"
  | "dyslexia"
  | "autism"
  | "cognitive"
  | "motor"
  | "other";

export const DISABILITY_LABELS: Record<DisabilityType, string> = {
  blind: "Blind",
  low_vision: "Low Vision",
  deaf: "Deaf",
  hard_of_hearing: "Hard of Hearing",
  mute: "Mute",
  speech_impaired: "Speech Impaired",
  adhd: "ADHD",
  dyslexia: "Dyslexia",
  autism: "Autism",
  cognitive: "Cognitive",
  motor: "Motor / Physical",
  other: "Other",
};

export const FRIENDLY_CHIP_LABELS: Record<DisabilityType, string> = {
  blind: "Screen Reader User",
  low_vision: "Large Text",
  deaf: "Captions Needed",
  hard_of_hearing: "Captions Needed",
  mute: "Text-Based Communication",
  speech_impaired: "Text-Based Communication",
  adhd: "Extended Time",
  dyslexia: "Dyslexia Support",
  autism: "Simplified UI",
  cognitive: "Simplified Content",
  motor: "Keyboard Navigation",
  other: "Accessibility Support",
};

export type ContentFormat = "original" | "audio" | "captions" | "transcript" | "simplified" | "high_contrast" | "braille";

export type PublishStatus = "published" | "draft" | "converting" | "review_required" | "soft_deleted";
export type EnrollmentType = "admin_assigned" | "student_selected";
export type ConversionStatus = "completed" | "in_progress" | "failed" | "ready_for_review";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  disabilities: DisabilityType[];
  program?: string;
  year?: number;
  division?: string;
  status: "active" | "inactive";
  profileCompleted: boolean;
  preferences: {
    fontSize: number;
    ttsSpeed: number;
    extendedTimeMultiplier: number;
    contrastMode: boolean;
    screenReader?: string;
    brailleDisplay?: string;
  };
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  prerequisites: string[];
}

export interface CourseOffering {
  id: string;
  courseId: string;
  course: Course;
  term: string;
  year: number;
  divisions: string[];
  teachers: User[];
  studentCount: number;
  capacity: number;
  enrollmentType: EnrollmentType;
}

export interface ContentItem {
  id: string;
  title: string;
  type: "pdf" | "video" | "audio" | "document" | "presentation" | "image" | "url";
  courseOfferingId: string;
  formats: ContentFormat[];
  publishStatus: PublishStatus;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
  fileSize?: string;
  duration?: string;
  viewCount: number;
  progressCount: number;
  linkedAssessments: string[];
  conversionProgress: {
    tier1: ConversionStatus;
    tier2: ConversionStatus;
  };
}

export interface Assessment {
  id: string;
  title: string;
  courseOfferingId: string;
  type: "quiz" | "assignment" | "exam" | "project";
  questionCount: number;
  durationMinutes: number;
  dueDate: string;
  status: "upcoming" | "in_progress" | "completed" | "graded";
  score?: number;
  maxScore?: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: "multiple_choice" | "short_answer" | "essay" | "file_upload";
  options?: { id: string; text: string }[];
  selectedAnswer?: string;
  answered: boolean;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface MessageThread {
  id: string;
  courseOfferingId?: string;
  courseName?: string;
  participants: { id: string; name: string; role: UserRole }[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  senderName: string;
  senderRole: UserRole;
  courseOfferingId?: string;
  courseName?: string;
  timestamp: string;
  urgent: boolean;
  scope: string;
}

export interface ConversionJob {
  id: string;
  contentTitle: string;
  contentId: string;
  courseOfferingId: string;
  courseName: string;
  formatType: ContentFormat;
  status: ConversionStatus;
  teacherName: string;
  updatedAt: string;
  errorMessage?: string;
}

export interface HierarchyNode {
  id: string;
  name: string;
  type: "institute" | "school" | "department" | "program" | "year" | "division";
  children: HierarchyNode[];
  studentCount: number;
  expanded?: boolean;
}

export const currentStudent: User = {
  id: "s1",
  name: "Maya Sharma",
  email: "maya.sharma@university.edu",
  role: "student",
  disabilities: ["blind", "deaf", "adhd"],
  program: "B.Tech Computer Science",
  year: 3,
  division: "A",
  status: "active",
  profileCompleted: true,
  preferences: {
    fontSize: 1.2,
    ttsSpeed: 1.0,
    extendedTimeMultiplier: 2.0,
    contrastMode: false,
    screenReader: "NVDA",
    brailleDisplay: "Focus 40",
  },
};

export const currentTeacher: User = {
  id: "t1",
  name: "Prof. Anand Rao",
  email: "anand.rao@university.edu",
  role: "teacher",
  disabilities: [],
  status: "active",
  profileCompleted: true,
  preferences: { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.0, contrastMode: false },
};

export const currentAdmin: User = {
  id: "a1",
  name: "Dr. Priya Patel",
  email: "priya.patel@university.edu",
  role: "admin",
  disabilities: [],
  status: "active",
  profileCompleted: true,
  preferences: { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.0, contrastMode: false },
};

export const courses: Course[] = [
  { id: "c1", code: "CS301", name: "Machine Learning", description: "Introduction to machine learning concepts, supervised and unsupervised learning, neural networks, and practical applications.", prerequisites: ["CS201", "MATH202"] },
  { id: "c2", code: "CS302", name: "Data Engineering", description: "Data pipelines, ETL processes, data warehousing, and big data technologies.", prerequisites: ["CS201"] },
  { id: "c3", code: "CS303", name: "Computer Networks", description: "Network architectures, protocols, TCP/IP, routing, security, and modern networking.", prerequisites: ["CS101"] },
  { id: "c4", code: "CS304", name: "Software Engineering", description: "Software development lifecycle, agile methodologies, design patterns, and testing.", prerequisites: [] },
  { id: "c5", code: "CS305", name: "Artificial Intelligence", description: "Search algorithms, knowledge representation, planning, and intelligent agents.", prerequisites: ["CS301"] },
  { id: "c6", code: "MATH301", name: "Linear Algebra", description: "Vector spaces, linear transformations, eigenvalues, and matrix decompositions.", prerequisites: ["MATH101"] },
];

export const courseOfferings: CourseOffering[] = [
  { id: "co1", courseId: "c1", course: courses[0], term: "Spring", year: 2026, divisions: ["A", "B"], teachers: [currentTeacher], studentCount: 87, capacity: 100, enrollmentType: "admin_assigned" },
  { id: "co2", courseId: "c2", course: courses[1], term: "Spring", year: 2026, divisions: ["A"], teachers: [{ ...currentTeacher, id: "t2", name: "Dr. Meera Singh", email: "meera.singh@university.edu" }], studentCount: 62, capacity: 80, enrollmentType: "admin_assigned" },
  { id: "co3", courseId: "c3", course: courses[2], term: "Spring", year: 2026, divisions: ["A", "B", "C"], teachers: [{ ...currentTeacher, id: "t3", name: "Prof. Raj Kumar", email: "raj.kumar@university.edu" }], studentCount: 124, capacity: 150, enrollmentType: "admin_assigned" },
  { id: "co4", courseId: "c4", course: courses[3], term: "Spring", year: 2026, divisions: ["A"], teachers: [currentTeacher], studentCount: 45, capacity: 60, enrollmentType: "student_selected" },
  { id: "co5", courseId: "c5", course: courses[4], term: "Spring", year: 2026, divisions: ["A", "B"], teachers: [{ ...currentTeacher, id: "t4", name: "Dr. Kavita Joshi", email: "kavita.joshi@university.edu" }], studentCount: 38, capacity: 50, enrollmentType: "student_selected" },
  { id: "co6", courseId: "c6", course: courses[5], term: "Spring", year: 2026, divisions: ["A"], teachers: [{ ...currentTeacher, id: "t5", name: "Prof. Vikram Mehta", email: "vikram.mehta@university.edu" }], studentCount: 95, capacity: 100, enrollmentType: "admin_assigned" },
];

export const studentEnrollments = ["co1", "co2", "co3", "co4"];
export const studentProgress: Record<string, number> = { co1: 62, co2: 45, co3: 78, co4: 30 };
export const unreadContent: Record<string, number> = { co1: 3, co2: 1, co3: 0, co4: 2 };

export const contentItems: ContentItem[] = [
  { id: "ci1", title: "Lecture 8: Introduction to Neural Networks", type: "video", courseOfferingId: "co1", formats: ["original", "audio", "captions", "transcript", "simplified", "braille"], publishStatus: "published", uploadedBy: "t1", uploadedAt: "2026-02-21T14:00:00Z", updatedAt: "2026-02-21T16:30:00Z", duration: "48:32", viewCount: 67, progressCount: 12, linkedAssessments: ["a1"], conversionProgress: { tier1: "completed", tier2: "completed" } },
  { id: "ci2", title: "Chapter 5: Backpropagation Notes", type: "pdf", courseOfferingId: "co1", formats: ["original", "audio", "high_contrast", "simplified", "braille"], publishStatus: "published", uploadedBy: "t1", uploadedAt: "2026-02-20T09:00:00Z", updatedAt: "2026-02-20T11:00:00Z", fileSize: "2.4 MB", viewCount: 54, progressCount: 8, linkedAssessments: [], conversionProgress: { tier1: "completed", tier2: "completed" } },
  { id: "ci3", title: "Lab 4: TensorFlow Basics", type: "document", courseOfferingId: "co1", formats: ["original", "audio", "simplified"], publishStatus: "published", uploadedBy: "t1", uploadedAt: "2026-02-19T10:00:00Z", updatedAt: "2026-02-19T12:00:00Z", fileSize: "1.1 MB", viewCount: 41, progressCount: 5, linkedAssessments: [], conversionProgress: { tier1: "completed", tier2: "in_progress" } },
  { id: "ci4", title: "Lecture 9: Convolutional Neural Networks", type: "video", courseOfferingId: "co1", formats: ["original", "captions"], publishStatus: "converting", uploadedBy: "t1", uploadedAt: "2026-02-23T08:00:00Z", updatedAt: "2026-02-23T08:15:00Z", duration: "52:10", viewCount: 0, progressCount: 0, linkedAssessments: [], conversionProgress: { tier1: "in_progress", tier2: "in_progress" } },
  { id: "ci5", title: "Data Pipeline Architecture", type: "presentation", courseOfferingId: "co2", formats: ["original", "audio", "transcript", "simplified", "high_contrast"], publishStatus: "published", uploadedBy: "t2", uploadedAt: "2026-02-18T14:00:00Z", updatedAt: "2026-02-18T16:00:00Z", fileSize: "5.2 MB", viewCount: 48, progressCount: 6, linkedAssessments: ["a3"], conversionProgress: { tier1: "completed", tier2: "completed" } },
  { id: "ci6", title: "ETL Best Practices Guide", type: "pdf", courseOfferingId: "co2", formats: ["original", "audio", "braille", "simplified"], publishStatus: "published", uploadedBy: "t2", uploadedAt: "2026-02-17T09:00:00Z", updatedAt: "2026-02-17T11:00:00Z", fileSize: "3.8 MB", viewCount: 35, progressCount: 4, linkedAssessments: [], conversionProgress: { tier1: "completed", tier2: "ready_for_review" } },
  { id: "ci7", title: "TCP/IP Protocol Suite", type: "video", courseOfferingId: "co3", formats: ["original", "audio", "captions", "transcript", "simplified", "braille", "high_contrast"], publishStatus: "published", uploadedBy: "t3", uploadedAt: "2026-02-16T10:00:00Z", updatedAt: "2026-02-16T14:00:00Z", duration: "35:20", viewCount: 98, progressCount: 15, linkedAssessments: ["a4"], conversionProgress: { tier1: "completed", tier2: "completed" } },
  { id: "ci8", title: "Network Security Fundamentals", type: "pdf", courseOfferingId: "co3", formats: ["original", "audio", "simplified"], publishStatus: "review_required", uploadedBy: "t3", uploadedAt: "2026-02-22T09:00:00Z", updatedAt: "2026-02-22T10:00:00Z", fileSize: "4.1 MB", viewCount: 12, progressCount: 2, linkedAssessments: [], conversionProgress: { tier1: "completed", tier2: "ready_for_review" } },
];

export const assessments: Assessment[] = [
  {
    id: "a1", title: "ML Quiz 1: Neural Networks", courseOfferingId: "co1", type: "quiz", questionCount: 10, durationMinutes: 30, dueDate: "2026-02-25T23:59:00Z", status: "upcoming",
    questions: [
      { id: "q1", text: "Which of the following is NOT a type of neural network?", type: "multiple_choice", options: [{ id: "o1", text: "Convolutional Neural Network (CNN)" }, { id: "o2", text: "Recurrent Neural Network (RNN)" }, { id: "o3", text: "Sequential Decision Network (SDN)" }, { id: "o4", text: "Generative Adversarial Network (GAN)" }], answered: false },
      { id: "q2", text: "What is the primary purpose of the activation function in a neural network?", type: "multiple_choice", options: [{ id: "o5", text: "To normalize the input data" }, { id: "o6", text: "To introduce non-linearity into the model" }, { id: "o7", text: "To reduce the number of parameters" }, { id: "o8", text: "To increase training speed" }], answered: false },
      { id: "q3", text: "Explain the vanishing gradient problem and how modern architectures address it.", type: "essay", answered: false },
      { id: "q4", text: "What is the role of a loss function in training a neural network?", type: "short_answer", answered: false },
      { id: "q5", text: "Which optimizer is commonly used for training deep neural networks?", type: "multiple_choice", options: [{ id: "o9", text: "Gradient Descent" }, { id: "o10", text: "Adam" }, { id: "o11", text: "Newton's Method" }, { id: "o12", text: "Linear Regression" }], answered: false },
      { id: "q6", text: "Describe the architecture of a Convolutional Neural Network.", type: "essay", answered: false },
      { id: "q7", text: "What is dropout and why is it used?", type: "short_answer", answered: false },
      { id: "q8", text: "Which of the following is a regularization technique?", type: "multiple_choice", options: [{ id: "o13", text: "Batch normalization" }, { id: "o14", text: "L2 regularization" }, { id: "o15", text: "Data augmentation" }, { id: "o16", text: "All of the above" }], answered: false },
      { id: "q9", text: "Upload your neural network diagram for the assignment.", type: "file_upload", answered: false },
      { id: "q10", text: "What is transfer learning?", type: "short_answer", answered: false },
    ],
  },
  { id: "a2", title: "ML Assignment 1: Linear Regression", courseOfferingId: "co1", type: "assignment", questionCount: 5, durationMinutes: 120, dueDate: "2026-02-28T23:59:00Z", status: "upcoming", questions: [] },
  { id: "a3", title: "Data Engineering Midterm", courseOfferingId: "co2", type: "exam", questionCount: 20, durationMinutes: 90, dueDate: "2026-03-05T14:00:00Z", status: "upcoming", questions: [] },
  { id: "a4", title: "Networks Lab Practical", courseOfferingId: "co3", type: "assignment", questionCount: 8, durationMinutes: 60, dueDate: "2026-02-24T17:00:00Z", status: "in_progress", score: undefined, questions: [] },
  { id: "a5", title: "Networks Quiz 2", courseOfferingId: "co3", type: "quiz", questionCount: 15, durationMinutes: 45, dueDate: "2026-02-15T23:59:00Z", status: "graded", score: 38, maxScore: 45, questions: [] },
];

export const announcements: Announcement[] = [
  { id: "an1", title: "Exam Schedule Change", content: "The ML midterm has been rescheduled to March 10th due to the institute holiday. Please adjust your preparation accordingly. The syllabus remains unchanged.", senderName: "Prof. Anand Rao", senderRole: "teacher", courseOfferingId: "co1", courseName: "CS301 Machine Learning", timestamp: "2026-02-23T07:00:00Z", urgent: true, scope: "CS301 - All Sections" },
  { id: "an2", title: "New Lab Resources Available", content: "TensorFlow notebooks for Lab 4 and Lab 5 are now available in the Content section. Please download them before the next lab session.", senderName: "Prof. Anand Rao", senderRole: "teacher", courseOfferingId: "co1", courseName: "CS301 Machine Learning", timestamp: "2026-02-22T15:00:00Z", urgent: false, scope: "CS301 - Div A, B" },
  { id: "an3", title: "Library Accessibility Hours Extended", content: "The campus library has extended its accessibility services hours to 8 AM - 10 PM on weekdays. Screen reader workstations are now available on the 3rd floor.", senderName: "Dr. Priya Patel", senderRole: "admin", timestamp: "2026-02-21T10:00:00Z", urgent: false, scope: "Institute-wide" },
  { id: "an4", title: "Data Engineering Project Teams", content: "Project teams for the Data Engineering course have been finalized. Please check the course page for your team assignment.", senderName: "Dr. Meera Singh", senderRole: "teacher", courseOfferingId: "co2", courseName: "CS302 Data Engineering", timestamp: "2026-02-20T14:00:00Z", urgent: false, scope: "CS302 - Div A" },
];

export const messageThreads: MessageThread[] = [
  { id: "mt1", courseOfferingId: "co1", courseName: "CS301 Machine Learning", participants: [{ id: "t1", name: "Prof. Anand Rao", role: "teacher" }, { id: "s1", name: "Maya Sharma", role: "student" }], lastMessage: "Your exam has been rescheduled to March 10th.", lastMessageTime: "2026-02-23T07:15:00Z", unreadCount: 2 },
  { id: "mt2", courseOfferingId: "co2", courseName: "CS302 Data Engineering", participants: [{ id: "t2", name: "Dr. Meera Singh", role: "teacher" }, { id: "s1", name: "Maya Sharma", role: "student" }], lastMessage: "Thank you for the clarification on the project requirements.", lastMessageTime: "2026-02-22T16:30:00Z", unreadCount: 0 },
  { id: "mt3", courseOfferingId: "co3", courseName: "CS303 Computer Networks", participants: [{ id: "t3", name: "Prof. Raj Kumar", role: "teacher" }, { id: "s1", name: "Maya Sharma", role: "student" }], lastMessage: "The lab submission deadline has been extended by 2 days.", lastMessageTime: "2026-02-21T11:00:00Z", unreadCount: 1 },
];

export const messages: Message[] = [
  { id: "m1", threadId: "mt1", senderId: "t1", senderName: "Prof. Anand Rao", senderRole: "teacher", content: "Hi Maya, I wanted to let you know that the ML midterm exam has been rescheduled.", timestamp: "2026-02-23T07:10:00Z", read: true },
  { id: "m2", threadId: "mt1", senderId: "t1", senderName: "Prof. Anand Rao", senderRole: "teacher", content: "Your exam has been rescheduled to March 10th. The syllabus remains the same. Please let me know if you have any questions about the accommodations.", timestamp: "2026-02-23T07:15:00Z", read: false },
  { id: "m3", threadId: "mt2", senderId: "s1", senderName: "Maya Sharma", senderRole: "student", content: "Dr. Singh, could you please clarify the project requirements for the ETL pipeline assignment?", timestamp: "2026-02-22T15:00:00Z", read: true },
  { id: "m4", threadId: "mt2", senderId: "t2", senderName: "Dr. Meera Singh", senderRole: "teacher", content: "Of course! The project should include at least 3 data sources and demonstrate both batch and stream processing. I have uploaded detailed requirements in the Content section.", timestamp: "2026-02-22T16:00:00Z", read: true },
  { id: "m5", threadId: "mt2", senderId: "s1", senderName: "Maya Sharma", senderRole: "student", content: "Thank you for the clarification on the project requirements.", timestamp: "2026-02-22T16:30:00Z", read: true },
  { id: "m6", threadId: "mt3", senderId: "t3", senderName: "Prof. Raj Kumar", senderRole: "teacher", content: "The lab submission deadline has been extended by 2 days. New deadline: February 26th.", timestamp: "2026-02-21T11:00:00Z", read: false },
];

export const conversionJobs: ConversionJob[] = [
  { id: "cj1", contentTitle: "Lecture 8: Introduction to Neural Networks", contentId: "ci1", courseOfferingId: "co1", courseName: "CS301 Machine Learning", formatType: "braille", status: "ready_for_review", teacherName: "Prof. Anand Rao", updatedAt: "2026-02-21T16:00:00Z" },
  { id: "cj2", contentTitle: "Lecture 8: Introduction to Neural Networks", contentId: "ci1", courseOfferingId: "co1", courseName: "CS301 Machine Learning", formatType: "simplified", status: "ready_for_review", teacherName: "Prof. Anand Rao", updatedAt: "2026-02-21T15:30:00Z" },
  { id: "cj3", contentTitle: "Chapter 5: Backpropagation Notes", contentId: "ci2", courseOfferingId: "co1", courseName: "CS301 Machine Learning", formatType: "braille", status: "completed", teacherName: "Prof. Anand Rao", updatedAt: "2026-02-20T12:00:00Z" },
  { id: "cj4", contentTitle: "ETL Best Practices Guide", contentId: "ci6", courseOfferingId: "co2", courseName: "CS302 Data Engineering", formatType: "braille", status: "ready_for_review", teacherName: "Dr. Meera Singh", updatedAt: "2026-02-17T12:00:00Z" },
  { id: "cj5", contentTitle: "Network Security Fundamentals", contentId: "ci8", courseOfferingId: "co3", courseName: "CS303 Computer Networks", formatType: "simplified", status: "ready_for_review", teacherName: "Prof. Raj Kumar", updatedAt: "2026-02-22T10:30:00Z" },
  { id: "cj6", contentTitle: "Lecture 9: CNN", contentId: "ci4", courseOfferingId: "co1", courseName: "CS301 Machine Learning", formatType: "audio", status: "in_progress", teacherName: "Prof. Anand Rao", updatedAt: "2026-02-23T08:15:00Z" },
  { id: "cj7", contentTitle: "Lecture 9: CNN", contentId: "ci4", courseOfferingId: "co1", courseName: "CS301 Machine Learning", formatType: "captions", status: "in_progress", teacherName: "Prof. Anand Rao", updatedAt: "2026-02-23T08:15:00Z" },
  { id: "cj8", contentTitle: "TCP/IP Protocol Suite", contentId: "ci7", courseOfferingId: "co3", courseName: "CS303 Computer Networks", formatType: "braille", status: "failed", teacherName: "Prof. Raj Kumar", updatedAt: "2026-02-16T13:00:00Z", errorMessage: "Braille conversion failed: Complex table structures detected. Please simplify tables or upload manual Braille." },
];

export const allUsers: User[] = [
  currentStudent,
  { id: "s2", name: "Arjun Krishnan", email: "arjun.k@university.edu", role: "student", disabilities: ["deaf"], program: "B.Tech Computer Science", year: 3, division: "A", status: "active", profileCompleted: true, preferences: { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.0, contrastMode: false } },
  { id: "s3", name: "Priya Nair", email: "priya.n@university.edu", role: "student", disabilities: ["adhd", "dyslexia"], program: "B.Tech Computer Science", year: 3, division: "A", status: "active", profileCompleted: true, preferences: { fontSize: 1.3, ttsSpeed: 0.8, extendedTimeMultiplier: 1.5, contrastMode: false } },
  { id: "s4", name: "Rahul Gupta", email: "rahul.g@university.edu", role: "student", disabilities: ["motor"], program: "B.Tech Computer Science", year: 3, division: "B", status: "active", profileCompleted: true, preferences: { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.5, contrastMode: false } },
  { id: "s5", name: "Sanya Mehta", email: "sanya.m@university.edu", role: "student", disabilities: ["low_vision"], program: "B.Tech Computer Science", year: 2, division: "A", status: "active", profileCompleted: true, preferences: { fontSize: 2.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.0, contrastMode: true } },
  { id: "s6", name: "Vikash Yadav", email: "vikash.y@university.edu", role: "student", disabilities: ["blind", "motor"], program: "B.Tech Computer Science", year: 3, division: "A", status: "active", profileCompleted: true, preferences: { fontSize: 1.0, ttsSpeed: 1.2, extendedTimeMultiplier: 2.0, contrastMode: false, screenReader: "JAWS" } },
  { id: "s7", name: "Ananya Reddy", email: "ananya.r@university.edu", role: "student", disabilities: [], program: "B.Tech Computer Science", year: 3, division: "B", status: "active", profileCompleted: true, preferences: { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.0, contrastMode: false } },
  { id: "s8", name: "Karthik Suresh", email: "karthik.s@university.edu", role: "student", disabilities: ["autism"], program: "B.Tech Computer Science", year: 2, division: "A", status: "inactive", profileCompleted: false, preferences: { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.5, contrastMode: false } },
  currentTeacher,
  { id: "t2", name: "Dr. Meera Singh", email: "meera.singh@university.edu", role: "teacher", disabilities: [], status: "active", profileCompleted: true, preferences: { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.0, contrastMode: false } },
  { id: "t3", name: "Prof. Raj Kumar", email: "raj.kumar@university.edu", role: "teacher", disabilities: [], status: "active", profileCompleted: true, preferences: { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.0, contrastMode: false } },
  { id: "t4", name: "Dr. Kavita Joshi", email: "kavita.joshi@university.edu", role: "teacher", disabilities: [], status: "active", profileCompleted: true, preferences: { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.0, contrastMode: false } },
  { id: "t5", name: "Prof. Vikram Mehta", email: "vikram.mehta@university.edu", role: "teacher", disabilities: [], status: "active", profileCompleted: true, preferences: { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.0, contrastMode: false } },
  currentAdmin,
];

export const hierarchyTree: HierarchyNode = {
  id: "h1", name: "National Institute of Technology", type: "institute", studentCount: 2847,
  children: [
    {
      id: "h2", name: "School of Engineering", type: "school", studentCount: 1856,
      children: [
        {
          id: "h3", name: "Department of Computer Science", type: "department", studentCount: 620,
          children: [
            {
              id: "h4", name: "B.Tech Computer Science", type: "program", studentCount: 480,
              children: [
                { id: "h5", name: "Year 1", type: "year", studentCount: 120, children: [{ id: "h9", name: "Division A", type: "division", studentCount: 60, children: [] }, { id: "h10", name: "Division B", type: "division", studentCount: 60, children: [] }] },
                { id: "h6", name: "Year 2", type: "year", studentCount: 115, children: [{ id: "h11", name: "Division A", type: "division", studentCount: 58, children: [] }, { id: "h12", name: "Division B", type: "division", studentCount: 57, children: [] }] },
                { id: "h7", name: "Year 3", type: "year", studentCount: 130, children: [{ id: "h13", name: "Division A", type: "division", studentCount: 65, children: [] }, { id: "h14", name: "Division B", type: "division", studentCount: 65, children: [] }] },
                { id: "h8", name: "Year 4", type: "year", studentCount: 115, children: [{ id: "h15", name: "Division A", type: "division", studentCount: 58, children: [] }, { id: "h16", name: "Division B", type: "division", studentCount: 57, children: [] }] },
              ],
            },
            { id: "h17", name: "M.Tech Computer Science", type: "program", studentCount: 140, children: [] },
          ],
        },
        { id: "h18", name: "Department of Electronics", type: "department", studentCount: 520, children: [] },
        { id: "h19", name: "Department of Mechanical", type: "department", studentCount: 716, children: [] },
      ],
    },
    {
      id: "h20", name: "School of Management", type: "school", studentCount: 540,
      children: [{ id: "h21", name: "Department of Business Administration", type: "department", studentCount: 540, children: [{ id: "h22", name: "MBA", type: "program", studentCount: 320, children: [] }, { id: "h23", name: "PGDM", type: "program", studentCount: 220, children: [] }] }],
    },
    { id: "h24", name: "School of Sciences", type: "school", studentCount: 451, children: [] },
  ],
};

export const adminStats = {
  totalStudents: 2847,
  studentsWithDisabilities: 312,
  totalTeachers: 48,
  contentItems: 1247,
  accessibilityCoverage: 87,
  conversionFailureRate: 2.4,
  disabilityBreakdown: [
    { name: "Blind/Low Vision", count: 100, percentage: 32 },
    { name: "Deaf/HoH", count: 75, percentage: 24 },
    { name: "ADHD/Cognitive", count: 140, percentage: 45 },
    { name: "Mute/Speech", count: 28, percentage: 9 },
    { name: "Motor", count: 22, percentage: 7 },
  ],
  formatUsage: [
    { format: "Audio", usage: 78 },
    { format: "Captions", usage: 92 },
    { format: "Transcript", usage: 65 },
    { format: "Simplified", usage: 54 },
    { format: "Braille", usage: 34 },
    { format: "High Contrast", usage: 41 },
  ],
  monthlyConversions: [
    { month: "Sep", successful: 180, failed: 5 },
    { month: "Oct", successful: 220, failed: 8 },
    { month: "Nov", successful: 195, failed: 3 },
    { month: "Dec", successful: 160, failed: 6 },
    { month: "Jan", successful: 240, failed: 4 },
    { month: "Feb", successful: 210, failed: 7 },
  ],
};

export function formatTimeAgo(dateString: string): string {
  const now = new Date("2026-02-23T12:00:00Z");
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getDaysUntil(dateString: string): number {
  const now = new Date("2026-02-23T12:00:00Z");
  const date = new Date(dateString);
  return Math.ceil((date.getTime() - now.getTime()) / 86400000);
}
