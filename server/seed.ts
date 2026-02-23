import { db } from "./db";
import { hashPassword } from "./auth";
import {
  users, institutes, schools, departments, programs, years, divisions, terms,
  courses, courseOfferings, enrollments, contentItems, conversionJobs,
  assessments, threads, messages, announcements,
} from "@shared/schema";

export async function seedDatabase() {
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database...");
  const password = await hashPassword("password123");

  const [inst] = await db.insert(institutes).values({
    id: "inst1",
    name: "National Institute of Technology",
    slug: "nit",
  }).returning();

  const [schoolEng] = await db.insert(schools).values({ id: "sch1", instituteId: "inst1", name: "School of Engineering" }).returning();
  await db.insert(schools).values({ id: "sch2", instituteId: "inst1", name: "School of Management" });
  await db.insert(schools).values({ id: "sch3", instituteId: "inst1", name: "School of Sciences" });

  const [deptCS] = await db.insert(departments).values({ id: "dept1", schoolId: "sch1", instituteId: "inst1", name: "Department of Computer Science" }).returning();
  await db.insert(departments).values({ id: "dept2", schoolId: "sch1", instituteId: "inst1", name: "Department of Electronics" });
  await db.insert(departments).values({ id: "dept3", schoolId: "sch1", instituteId: "inst1", name: "Department of Mechanical" });
  await db.insert(departments).values({ id: "dept4", schoolId: "sch2", instituteId: "inst1", name: "Department of Business Administration" });

  const [progBTech] = await db.insert(programs).values({ id: "prog1", departmentId: "dept1", schoolId: "sch1", instituteId: "inst1", name: "B.Tech Computer Science", code: "BTCS", durationYears: 4 }).returning();
  await db.insert(programs).values({ id: "prog2", departmentId: "dept1", schoolId: "sch1", instituteId: "inst1", name: "M.Tech Computer Science", code: "MTCS", durationYears: 2 });
  await db.insert(programs).values({ id: "prog3", departmentId: "dept4", schoolId: "sch2", instituteId: "inst1", name: "MBA", code: "MBA", durationYears: 2 });
  await db.insert(programs).values({ id: "prog4", departmentId: "dept4", schoolId: "sch2", instituteId: "inst1", name: "PGDM", code: "PGDM", durationYears: 1 });

  for (let y = 1; y <= 4; y++) {
    await db.insert(years).values({ id: `yr${y}`, programId: "prog1", number: y, label: `Year ${y}` });
    await db.insert(divisions).values({ id: `div${y}a`, yearId: `yr${y}`, programId: "prog1", name: "Division A", capacity: 65, studentCount: y === 3 ? 65 : 60 });
    await db.insert(divisions).values({ id: `div${y}b`, yearId: `yr${y}`, programId: "prog1", name: "Division B", capacity: 65, studentCount: y === 3 ? 65 : 57 });
  }

  await db.insert(terms).values({ id: "term1", instituteId: "inst1", name: "Spring", academicYear: "2025-2026", isActive: true });

  const studentData = [
    { id: "s1", name: "Maya Sharma", email: "maya.sharma@university.edu", disabilities: ["blind", "deaf", "adhd"], program: "B.Tech Computer Science", year: 3, division: "A", profileCompleted: true, preferences: { fontSize: 1.2, ttsSpeed: 1.0, extendedTimeMultiplier: 2.0, contrastMode: false, screenReader: "NVDA", brailleDisplay: "Focus 40" } },
    { id: "s2", name: "Arjun Krishnan", email: "arjun.k@university.edu", disabilities: ["deaf"], program: "B.Tech Computer Science", year: 3, division: "A", profileCompleted: true, preferences: { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.0, contrastMode: false } },
    { id: "s3", name: "Priya Nair", email: "priya.n@university.edu", disabilities: ["adhd", "dyslexia"], program: "B.Tech Computer Science", year: 3, division: "A", profileCompleted: true, preferences: { fontSize: 1.3, ttsSpeed: 0.8, extendedTimeMultiplier: 1.5, contrastMode: false } },
    { id: "s4", name: "Rahul Gupta", email: "rahul.g@university.edu", disabilities: ["motor"], program: "B.Tech Computer Science", year: 3, division: "B", profileCompleted: true, preferences: { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.5, contrastMode: false } },
    { id: "s5", name: "Sanya Mehta", email: "sanya.m@university.edu", disabilities: ["low_vision"], program: "B.Tech Computer Science", year: 2, division: "A", profileCompleted: true, preferences: { fontSize: 2.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.0, contrastMode: true } },
    { id: "s6", name: "Vikash Yadav", email: "vikash.y@university.edu", disabilities: ["blind", "motor"], program: "B.Tech Computer Science", year: 3, division: "A", profileCompleted: true, preferences: { fontSize: 1.0, ttsSpeed: 1.2, extendedTimeMultiplier: 2.0, contrastMode: false, screenReader: "JAWS" } },
    { id: "s7", name: "Ananya Reddy", email: "ananya.r@university.edu", disabilities: [], program: "B.Tech Computer Science", year: 3, division: "B", profileCompleted: true, preferences: { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.0, contrastMode: false } },
    { id: "s8", name: "Karthik Suresh", email: "karthik.s@university.edu", disabilities: ["autism"], program: "B.Tech Computer Science", year: 2, division: "A", status: "inactive" as const, profileCompleted: false, preferences: { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.5, contrastMode: false } },
  ];

  for (const s of studentData) {
    await db.insert(users).values({
      id: s.id, email: s.email, passwordHash: password, name: s.name, role: "student",
      status: (s as any).status || "active", program: s.program, year: s.year, division: s.division,
      disabilities: s.disabilities, preferences: s.preferences, profileCompleted: s.profileCompleted,
      instituteId: "inst1",
    });
  }

  const teacherData = [
    { id: "t1", name: "Prof. Anand Rao", email: "anand.rao@university.edu" },
    { id: "t2", name: "Dr. Meera Singh", email: "meera.singh@university.edu" },
    { id: "t3", name: "Prof. Raj Kumar", email: "raj.kumar@university.edu" },
    { id: "t4", name: "Dr. Kavita Joshi", email: "kavita.joshi@university.edu" },
    { id: "t5", name: "Prof. Vikram Mehta", email: "vikram.mehta@university.edu" },
  ];

  for (const t of teacherData) {
    await db.insert(users).values({
      id: t.id, email: t.email, passwordHash: password, name: t.name, role: "teacher",
      status: "active", disabilities: [], profileCompleted: true, instituteId: "inst1",
      preferences: { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.0, contrastMode: false },
    });
  }

  await db.insert(users).values({
    id: "a1", email: "priya.patel@university.edu", passwordHash: password, name: "Dr. Priya Patel",
    role: "admin", status: "active", disabilities: [], profileCompleted: true, instituteId: "inst1",
    preferences: { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.0, contrastMode: false },
  });

  const courseData = [
    { id: "c1", code: "CS301", name: "Machine Learning", description: "Introduction to machine learning concepts, supervised and unsupervised learning, neural networks, and practical applications.", prerequisites: ["CS201", "MATH202"] },
    { id: "c2", code: "CS302", name: "Data Engineering", description: "Data pipelines, ETL processes, data warehousing, and big data technologies.", prerequisites: ["CS201"] },
    { id: "c3", code: "CS303", name: "Computer Networks", description: "Network architectures, protocols, TCP/IP, routing, security, and modern networking.", prerequisites: ["CS101"] },
    { id: "c4", code: "CS304", name: "Software Engineering", description: "Software development lifecycle, agile methodologies, design patterns, and testing.", prerequisites: [] },
    { id: "c5", code: "CS305", name: "Artificial Intelligence", description: "Search algorithms, knowledge representation, planning, and intelligent agents.", prerequisites: ["CS301"] },
    { id: "c6", code: "MATH301", name: "Linear Algebra", description: "Vector spaces, linear transformations, eigenvalues, and matrix decompositions.", prerequisites: ["MATH101"] },
  ];

  for (const c of courseData) {
    await db.insert(courses).values({ ...c, instituteId: "inst1", departmentId: "dept1" });
  }

  const offeringData = [
    { id: "co1", courseId: "c1", term: "Spring", year: 2026, divisions: ["A", "B"], teacherIds: ["t1"], studentCount: 87, capacity: 100, enrollmentType: "admin_assigned" as const },
    { id: "co2", courseId: "c2", term: "Spring", year: 2026, divisions: ["A"], teacherIds: ["t2"], studentCount: 62, capacity: 80, enrollmentType: "admin_assigned" as const },
    { id: "co3", courseId: "c3", term: "Spring", year: 2026, divisions: ["A", "B", "C"], teacherIds: ["t3"], studentCount: 124, capacity: 150, enrollmentType: "admin_assigned" as const },
    { id: "co4", courseId: "c4", term: "Spring", year: 2026, divisions: ["A"], teacherIds: ["t1"], studentCount: 45, capacity: 60, enrollmentType: "student_selected" as const },
    { id: "co5", courseId: "c5", term: "Spring", year: 2026, divisions: ["A", "B"], teacherIds: ["t4"], studentCount: 38, capacity: 50, enrollmentType: "student_selected" as const },
    { id: "co6", courseId: "c6", term: "Spring", year: 2026, divisions: ["A"], teacherIds: ["t5"], studentCount: 95, capacity: 100, enrollmentType: "admin_assigned" as const },
  ];

  for (const co of offeringData) {
    await db.insert(courseOfferings).values({
      id: co.id, courseId: co.courseId, term: co.term, year: co.year,
      divisions: co.divisions, instituteId: "inst1", termId: "term1",
      teachers: co.teacherIds.map(tid => ({ teacherId: tid, sectionNames: co.divisions, assignedAt: new Date().toISOString() })),
      studentCount: co.studentCount, capacity: co.capacity, enrollmentType: co.enrollmentType,
    });
  }

  const enrollmentData = [
    { studentId: "s1", courseOfferingId: "co1", progress: 62 },
    { studentId: "s1", courseOfferingId: "co2", progress: 45 },
    { studentId: "s1", courseOfferingId: "co3", progress: 78 },
    { studentId: "s1", courseOfferingId: "co4", progress: 30 },
  ];

  for (const e of enrollmentData) {
    await db.insert(enrollments).values({ studentId: e.studentId, courseOfferingId: e.courseOfferingId, progress: e.progress, enrollmentType: "admin_assigned", status: "active" });
  }

  const contentData = [
    { id: "ci1", title: "Lecture 8: Introduction to Neural Networks", type: "video", courseOfferingId: "co1", formats: ["original", "audio", "captions", "transcript", "simplified", "braille"], publishStatus: "published" as const, uploadedBy: "t1", uploadedAt: "2026-02-21T14:00:00Z", updatedAt: "2026-02-21T16:30:00Z", duration: "48:32", viewCount: 67, progressCount: 12, linkedAssessments: ["a1"], conversionProgress: { tier1: "completed", tier2: "completed" } },
    { id: "ci2", title: "Chapter 5: Backpropagation Notes", type: "pdf", courseOfferingId: "co1", formats: ["original", "audio", "high_contrast", "simplified", "braille"], publishStatus: "published" as const, uploadedBy: "t1", uploadedAt: "2026-02-20T09:00:00Z", updatedAt: "2026-02-20T11:00:00Z", fileSize: "2.4 MB", viewCount: 54, progressCount: 8, linkedAssessments: [], conversionProgress: { tier1: "completed", tier2: "completed" } },
    { id: "ci3", title: "Lab 4: TensorFlow Basics", type: "document", courseOfferingId: "co1", formats: ["original", "audio", "simplified"], publishStatus: "published" as const, uploadedBy: "t1", uploadedAt: "2026-02-19T10:00:00Z", updatedAt: "2026-02-19T12:00:00Z", fileSize: "1.1 MB", viewCount: 41, progressCount: 5, linkedAssessments: [], conversionProgress: { tier1: "completed", tier2: "in_progress" } },
    { id: "ci4", title: "Lecture 9: Convolutional Neural Networks", type: "video", courseOfferingId: "co1", formats: ["original", "captions"], publishStatus: "converting" as const, uploadedBy: "t1", uploadedAt: "2026-02-23T08:00:00Z", updatedAt: "2026-02-23T08:15:00Z", duration: "52:10", viewCount: 0, progressCount: 0, linkedAssessments: [], conversionProgress: { tier1: "in_progress", tier2: "in_progress" } },
    { id: "ci5", title: "Data Pipeline Architecture", type: "presentation", courseOfferingId: "co2", formats: ["original", "audio", "transcript", "simplified", "high_contrast"], publishStatus: "published" as const, uploadedBy: "t2", uploadedAt: "2026-02-18T14:00:00Z", updatedAt: "2026-02-18T16:00:00Z", fileSize: "5.2 MB", viewCount: 48, progressCount: 6, linkedAssessments: ["a3"], conversionProgress: { tier1: "completed", tier2: "completed" } },
    { id: "ci6", title: "ETL Best Practices Guide", type: "pdf", courseOfferingId: "co2", formats: ["original", "audio", "braille", "simplified"], publishStatus: "published" as const, uploadedBy: "t2", uploadedAt: "2026-02-17T09:00:00Z", updatedAt: "2026-02-17T11:00:00Z", fileSize: "3.8 MB", viewCount: 35, progressCount: 4, linkedAssessments: [], conversionProgress: { tier1: "completed", tier2: "ready_for_review" } },
    { id: "ci7", title: "TCP/IP Protocol Suite", type: "video", courseOfferingId: "co3", formats: ["original", "audio", "captions", "transcript", "simplified", "braille", "high_contrast"], publishStatus: "published" as const, uploadedBy: "t3", uploadedAt: "2026-02-16T10:00:00Z", updatedAt: "2026-02-16T14:00:00Z", duration: "35:20", viewCount: 98, progressCount: 15, linkedAssessments: ["a4"], conversionProgress: { tier1: "completed", tier2: "completed" } },
    { id: "ci8", title: "Network Security Fundamentals", type: "pdf", courseOfferingId: "co3", formats: ["original", "audio", "simplified"], publishStatus: "review_required" as const, uploadedBy: "t3", uploadedAt: "2026-02-22T09:00:00Z", updatedAt: "2026-02-22T10:00:00Z", fileSize: "4.1 MB", viewCount: 12, progressCount: 2, linkedAssessments: [], conversionProgress: { tier1: "completed", tier2: "ready_for_review" } },
  ];

  for (const ci of contentData) {
    await db.insert(contentItems).values({
      id: ci.id, title: ci.title, type: ci.type, courseOfferingId: ci.courseOfferingId,
      formats: ci.formats, publishStatus: ci.publishStatus, uploadedBy: ci.uploadedBy,
      viewCount: ci.viewCount, progressCount: ci.progressCount, linkedAssessments: ci.linkedAssessments,
      conversionProgress: ci.conversionProgress, fileSize: ci.fileSize, duration: ci.duration,
      createdAt: new Date(ci.uploadedAt), updatedAt: new Date(ci.updatedAt),
    });
  }

  const conversionData = [
    { id: "cj1", contentTitle: "Lecture 8: Introduction to Neural Networks", contentId: "ci1", courseOfferingId: "co1", courseName: "CS301 Machine Learning", formatType: "braille" as const, status: "ready_for_review" as const, teacherName: "Prof. Anand Rao", updatedAt: "2026-02-21T16:00:00Z" },
    { id: "cj2", contentTitle: "Lecture 8: Introduction to Neural Networks", contentId: "ci1", courseOfferingId: "co1", courseName: "CS301 Machine Learning", formatType: "simplified" as const, status: "ready_for_review" as const, teacherName: "Prof. Anand Rao", updatedAt: "2026-02-21T15:30:00Z" },
    { id: "cj3", contentTitle: "Chapter 5: Backpropagation Notes", contentId: "ci2", courseOfferingId: "co1", courseName: "CS301 Machine Learning", formatType: "braille" as const, status: "completed" as const, teacherName: "Prof. Anand Rao", updatedAt: "2026-02-20T12:00:00Z" },
    { id: "cj4", contentTitle: "ETL Best Practices Guide", contentId: "ci6", courseOfferingId: "co2", courseName: "CS302 Data Engineering", formatType: "braille" as const, status: "ready_for_review" as const, teacherName: "Dr. Meera Singh", updatedAt: "2026-02-17T12:00:00Z" },
    { id: "cj5", contentTitle: "Network Security Fundamentals", contentId: "ci8", courseOfferingId: "co3", courseName: "CS303 Computer Networks", formatType: "simplified" as const, status: "ready_for_review" as const, teacherName: "Prof. Raj Kumar", updatedAt: "2026-02-22T10:30:00Z" },
    { id: "cj6", contentTitle: "Lecture 9: CNN", contentId: "ci4", courseOfferingId: "co1", courseName: "CS301 Machine Learning", formatType: "audio" as const, status: "in_progress" as const, teacherName: "Prof. Anand Rao", updatedAt: "2026-02-23T08:15:00Z" },
    { id: "cj7", contentTitle: "Lecture 9: CNN", contentId: "ci4", courseOfferingId: "co1", courseName: "CS301 Machine Learning", formatType: "captions" as const, status: "in_progress" as const, teacherName: "Prof. Anand Rao", updatedAt: "2026-02-23T08:15:00Z" },
    { id: "cj8", contentTitle: "TCP/IP Protocol Suite", contentId: "ci7", courseOfferingId: "co3", courseName: "CS303 Computer Networks", formatType: "braille" as const, status: "failed" as const, teacherName: "Prof. Raj Kumar", updatedAt: "2026-02-16T13:00:00Z", errorMessage: "Braille conversion failed: Complex table structures detected. Please simplify tables or upload manual Braille." },
  ];

  for (const cj of conversionData) {
    await db.insert(conversionJobs).values({
      id: cj.id, contentTitle: cj.contentTitle, contentId: cj.contentId,
      courseOfferingId: cj.courseOfferingId, courseName: cj.courseName,
      formatType: cj.formatType, status: cj.status, teacherName: cj.teacherName,
      errorMessage: (cj as any).errorMessage || null,
      updatedAt: new Date(cj.updatedAt),
    });
  }

  const assessmentData = [
    {
      id: "a1", title: "ML Quiz 1: Neural Networks", courseOfferingId: "co1", type: "quiz" as const, questionCount: 10, durationMinutes: 30, dueDate: "2026-02-25T23:59:00Z", maxScore: 45,
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
    { id: "a2", title: "ML Assignment 1: Linear Regression", courseOfferingId: "co1", type: "assignment" as const, questionCount: 5, durationMinutes: 120, dueDate: "2026-02-28T23:59:00Z", questions: [] },
    { id: "a3", title: "Data Engineering Midterm", courseOfferingId: "co2", type: "exam" as const, questionCount: 20, durationMinutes: 90, dueDate: "2026-03-05T14:00:00Z", questions: [] },
    { id: "a4", title: "Networks Lab Practical", courseOfferingId: "co3", type: "assignment" as const, questionCount: 8, durationMinutes: 60, dueDate: "2026-02-24T17:00:00Z", questions: [] },
    { id: "a5", title: "Networks Quiz 2", courseOfferingId: "co3", type: "quiz" as const, questionCount: 15, durationMinutes: 45, dueDate: "2026-02-15T23:59:00Z", maxScore: 45, questions: [] },
  ];

  for (const a of assessmentData) {
    await db.insert(assessments).values({
      id: a.id, title: a.title, courseOfferingId: a.courseOfferingId,
      type: a.type, questionCount: a.questionCount, durationMinutes: a.durationMinutes,
      dueDate: new Date(a.dueDate), questions: a.questions, maxScore: a.maxScore,
      publishStatus: "published",
    });
  }

  const announcementData = [
    { id: "an1", title: "Exam Schedule Change", content: "The ML midterm has been rescheduled to March 10th due to the institute holiday. Please adjust your preparation accordingly. The syllabus remains unchanged.", senderName: "Prof. Anand Rao", senderRole: "teacher", courseOfferingId: "co1", courseName: "CS301 Machine Learning", timestamp: "2026-02-23T07:00:00Z", urgent: true, scope: "CS301 - All Sections" },
    { id: "an2", title: "New Lab Resources Available", content: "TensorFlow notebooks for Lab 4 and Lab 5 are now available in the Content section. Please download them before the next lab session.", senderName: "Prof. Anand Rao", senderRole: "teacher", courseOfferingId: "co1", courseName: "CS301 Machine Learning", timestamp: "2026-02-22T15:00:00Z", urgent: false, scope: "CS301 - Div A, B" },
    { id: "an3", title: "Library Accessibility Hours Extended", content: "The campus library has extended its accessibility services hours to 8 AM - 10 PM on weekdays. Screen reader workstations are now available on the 3rd floor.", senderName: "Dr. Priya Patel", senderRole: "admin", timestamp: "2026-02-21T10:00:00Z", urgent: false, scope: "Institute-wide" },
    { id: "an4", title: "Data Engineering Project Teams", content: "Project teams for the Data Engineering course have been finalized. Please check the course page for your team assignment.", senderName: "Dr. Meera Singh", senderRole: "teacher", courseOfferingId: "co2", courseName: "CS302 Data Engineering", timestamp: "2026-02-20T14:00:00Z", urgent: false, scope: "CS302 - Div A" },
  ];

  for (const an of announcementData) {
    await db.insert(announcements).values({
      id: an.id, title: an.title, content: an.content, senderName: an.senderName,
      senderRole: an.senderRole, courseOfferingId: an.courseOfferingId,
      courseName: an.courseName, urgent: an.urgent, scope: an.scope,
      authorId: an.senderRole === "admin" ? "a1" : "t1",
      instituteId: "inst1", publishedAt: new Date(an.timestamp),
      createdAt: new Date(an.timestamp),
    });
  }

  const threadData = [
    { id: "mt1", courseOfferingId: "co1", courseName: "CS301 Machine Learning", participants: [{ id: "t1", name: "Prof. Anand Rao", role: "teacher" }, { id: "s1", name: "Maya Sharma", role: "student" }], lastMessage: "Your exam has been rescheduled to March 10th.", lastMessageTime: "2026-02-23T07:15:00Z", unreadCount: 2 },
    { id: "mt2", courseOfferingId: "co2", courseName: "CS302 Data Engineering", participants: [{ id: "t2", name: "Dr. Meera Singh", role: "teacher" }, { id: "s1", name: "Maya Sharma", role: "student" }], lastMessage: "Thank you for the clarification on the project requirements.", lastMessageTime: "2026-02-22T16:30:00Z", unreadCount: 0 },
    { id: "mt3", courseOfferingId: "co3", courseName: "CS303 Computer Networks", participants: [{ id: "t3", name: "Prof. Raj Kumar", role: "teacher" }, { id: "s1", name: "Maya Sharma", role: "student" }], lastMessage: "The lab submission deadline has been extended by 2 days.", lastMessageTime: "2026-02-21T11:00:00Z", unreadCount: 1 },
  ];

  for (const t of threadData) {
    await db.insert(threads).values({
      id: t.id, courseOfferingId: t.courseOfferingId, courseName: t.courseName,
      participants: t.participants, lastMessage: t.lastMessage,
      lastMessageTime: new Date(t.lastMessageTime), unreadCount: t.unreadCount,
      scope: "course_offering", instituteId: "inst1",
    });
  }

  const messageData = [
    { id: "m1", threadId: "mt1", senderId: "t1", senderName: "Prof. Anand Rao", senderRole: "teacher", content: "Hi Maya, I wanted to let you know that the ML midterm exam has been rescheduled.", timestamp: "2026-02-23T07:10:00Z", read: true },
    { id: "m2", threadId: "mt1", senderId: "t1", senderName: "Prof. Anand Rao", senderRole: "teacher", content: "Your exam has been rescheduled to March 10th. The syllabus remains the same. Please let me know if you have any questions about the accommodations.", timestamp: "2026-02-23T07:15:00Z", read: false },
    { id: "m3", threadId: "mt2", senderId: "s1", senderName: "Maya Sharma", senderRole: "student", content: "Dr. Singh, could you please clarify the project requirements for the ETL pipeline assignment?", timestamp: "2026-02-22T15:00:00Z", read: true },
    { id: "m4", threadId: "mt2", senderId: "t2", senderName: "Dr. Meera Singh", senderRole: "teacher", content: "Of course! The project should include at least 3 data sources and demonstrate both batch and stream processing. I have uploaded detailed requirements in the Content section.", timestamp: "2026-02-22T16:00:00Z", read: true },
    { id: "m5", threadId: "mt2", senderId: "s1", senderName: "Maya Sharma", senderRole: "student", content: "Thank you for the clarification on the project requirements.", timestamp: "2026-02-22T16:30:00Z", read: true },
    { id: "m6", threadId: "mt3", senderId: "t3", senderName: "Prof. Raj Kumar", senderRole: "teacher", content: "The lab submission deadline has been extended by 2 days. New deadline: February 26th.", timestamp: "2026-02-21T11:00:00Z", read: false },
  ];

  for (const m of messageData) {
    await db.insert(messages).values({
      id: m.id, threadId: m.threadId, senderId: m.senderId, senderName: m.senderName,
      senderRole: m.senderRole, content: m.content, read: m.read, type: "text",
      createdAt: new Date(m.timestamp),
    });
  }

  console.log("Database seeded successfully!");
}
