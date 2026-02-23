import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateToken, hashPassword, comparePassword, requireAuth, requireRole } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
});

function sanitizeUser(user: any) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", services: { db: "connected", storage: "local" } });
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name, role } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, password, and name are required" });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({
        email,
        passwordHash,
        name,
        role: role || "student",
      });

      const token = generateToken({ userId: user.id, email: user.email, role: user.role });
      res.status(201).json({ user: sanitizeUser(user), token });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const valid = await comparePassword(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      await storage.updateUser(user.id, { lastLoginAt: new Date() });
      const token = generateToken({ userId: user.id, email: user.email, role: user.role });
      res.json({ user: sanitizeUser(user), token });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (_req: Request, res: Response) => {
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(sanitizeUser(user));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users", requireAuth, async (req: Request, res: Response) => {
    try {
      const { role, search, status } = req.query;
      const userList = await storage.listUsers({
        role: role as string,
        search: search as string,
        status: status as string,
      });
      res.json(userList.map(sanitizeUser));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(sanitizeUser(user));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(sanitizeUser(user));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/users/:id/accessibility-profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const { disabilities, preferences, activeModules } = req.body;
      const user = await storage.updateUser(req.params.id, {
        disabilities,
        preferences,
        activeModules,
        profileCompleted: true,
        profileSetupCompletedAt: new Date(),
      });
      if (!user) return res.status(404).json({ message: "User not found" });

      await storage.createAuditLog({
        actorId: req.user!.userId,
        actorRole: req.user!.role,
        action: "UPDATE_ACCESSIBILITY_PROFILE",
        targetId: req.params.id,
        targetType: "user",
        ipAddress: req.ip,
      });

      res.json(sanitizeUser(user));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/me/accessibility-profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      await storage.createAuditLog({
        actorId: req.user!.userId,
        actorRole: req.user!.role,
        action: "READ_ACCESSIBILITY_PROFILE",
        targetId: user.id,
        targetType: "user",
        ipAddress: req.ip,
      });

      res.json({
        disabilities: user.disabilities,
        preferences: user.preferences,
        activeModules: user.activeModules,
        profileCompleted: user.profileCompleted,
        profileSetupCompletedAt: user.profileSetupCompletedAt,
        firstLoginRequired: !user.profileCompleted,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/users", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const { email, password, name, role, program, year, division, disabilities, preferences } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, password, and name are required" });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({
        email,
        passwordHash,
        name,
        role: role || "student",
        program,
        year,
        division,
        disabilities: disabilities || [],
        preferences: preferences || { fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.0, contrastMode: false },
      });

      res.status(201).json(sanitizeUser(user));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/users/:id/deactivate", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const user = await storage.updateUser(req.params.id, { status: "inactive" });
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(sanitizeUser(user));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/users/:id/activate", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const user = await storage.updateUser(req.params.id, { status: "active" });
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(sanitizeUser(user));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/users/:id/reset-password", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const newPassword = req.body.password || "TempPass123!";
      const passwordHash = await hashPassword(newPassword);
      const user = await storage.updateUser(req.params.id, { passwordHash });
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ message: "Password reset successful" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/institutes", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const inst = await storage.createInstitute(req.body);
      res.status(201).json(inst);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/institutes", requireAuth, async (_req: Request, res: Response) => {
    try {
      const list = await storage.listInstitutes();
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/institutes/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const inst = await storage.getInstitute(req.params.id);
      if (!inst) return res.status(404).json({ message: "Institute not found" });
      res.json(inst);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/institutes/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const inst = await storage.updateInstitute(req.params.id, req.body);
      if (!inst) return res.status(404).json({ message: "Institute not found" });
      res.json(inst);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/institutes/:id/hierarchy", requireAuth, async (req: Request, res: Response) => {
    try {
      const tree = await storage.getHierarchyTree(req.params.id);
      if (!tree) return res.status(404).json({ message: "Institute not found" });
      res.json(tree);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hierarchy", requireAuth, async (_req: Request, res: Response) => {
    try {
      const insts = await storage.listInstitutes();
      if (insts.length === 0) return res.json(null);
      const tree = await storage.getHierarchyTree(insts[0].id);
      res.json(tree);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/institutes/:id/schools", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const school = await storage.createSchool({ ...req.body, instituteId: req.params.id });
      res.status(201).json(school);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/schools/:instituteId", requireAuth, async (req: Request, res: Response) => {
    try {
      res.json(await storage.listSchools(req.params.instituteId));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/schools/:id/departments", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const school = await storage.getSchool(req.params.id);
      if (!school) return res.status(404).json({ message: "School not found" });
      const dept = await storage.createDepartment({ ...req.body, schoolId: req.params.id, instituteId: school.instituteId });
      res.status(201).json(dept);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/departments/:id/programs", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const dept = await storage.getDepartment(req.params.id);
      if (!dept) return res.status(404).json({ message: "Department not found" });
      const prog = await storage.createProgram({ ...req.body, departmentId: req.params.id, schoolId: dept.schoolId, instituteId: dept.instituteId });
      res.status(201).json(prog);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/programs/:id/years", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const yr = await storage.createYear({ ...req.body, programId: req.params.id });
      res.status(201).json(yr);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/years/:id/divisions", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const yr = await storage.getYear(req.params.id);
      if (!yr) return res.status(404).json({ message: "Year not found" });
      const div = await storage.createDivision({ ...req.body, yearId: req.params.id, programId: yr.programId });
      res.status(201).json(div);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/institutes/:id/terms", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const term = await storage.createTerm({ ...req.body, instituteId: req.params.id });
      res.status(201).json(term);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/terms/:instituteId", requireAuth, async (req: Request, res: Response) => {
    try {
      res.json(await storage.listTerms(req.params.instituteId));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/courses", requireAuth, requireRole("admin", "teacher"), async (req: Request, res: Response) => {
    try {
      const course = await storage.createCourse(req.body);
      res.status(201).json(course);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/courses", requireAuth, async (req: Request, res: Response) => {
    try {
      const { instituteId, departmentId } = req.query;
      const list = await storage.listCourses({
        instituteId: instituteId as string,
        departmentId: departmentId as string,
      });
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/courses/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) return res.status(404).json({ message: "Course not found" });
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/courses/:id", requireAuth, requireRole("admin", "teacher"), async (req: Request, res: Response) => {
    try {
      const course = await storage.updateCourse(req.params.id, req.body);
      if (!course) return res.status(404).json({ message: "Course not found" });
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/courses/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      await storage.deleteCourse(req.params.id);
      res.json({ message: "Course deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/course-offerings", requireAuth, requireRole("admin", "teacher"), async (req: Request, res: Response) => {
    try {
      const offering = await storage.createCourseOffering(req.body);
      res.status(201).json(offering);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/course-offerings", requireAuth, async (req: Request, res: Response) => {
    try {
      const { courseId, termId, instituteId } = req.query;
      const list = await storage.listCourseOfferings({
        courseId: courseId as string,
        termId: termId as string,
        instituteId: instituteId as string,
      });

      const enriched = await Promise.all(list.map(async (co) => {
        const course = await storage.getCourse(co.courseId);
        const teacherIds = (co.teachers as any[] || []).map((t: any) => t.teacherId);
        const teacherUsers = await Promise.all(teacherIds.map((tid: string) => storage.getUser(tid)));
        return {
          ...co,
          course: course || { id: co.courseId, code: "", name: "Unknown Course", description: "", prerequisites: [] },
          teachers: teacherUsers.filter(Boolean).map(sanitizeUser),
        };
      }));

      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/course-offerings/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const co = await storage.getCourseOffering(req.params.id);
      if (!co) return res.status(404).json({ message: "Course offering not found" });

      const course = await storage.getCourse(co.courseId);
      const teacherIds = (co.teachers as any[] || []).map((t: any) => t.teacherId);
      const teacherUsers = await Promise.all(teacherIds.map((tid: string) => storage.getUser(tid)));

      res.json({
        ...co,
        course: course || { id: co.courseId, code: "", name: "Unknown Course", description: "", prerequisites: [] },
        teachers: teacherUsers.filter(Boolean).map(sanitizeUser),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/course-offerings/:id", requireAuth, requireRole("admin", "teacher"), async (req: Request, res: Response) => {
    try {
      const co = await storage.updateCourseOffering(req.params.id, req.body);
      if (!co) return res.status(404).json({ message: "Course offering not found" });
      res.json(co);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/courses/:offeringId/teachers", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const co = await storage.getCourseOffering(req.params.offeringId);
      if (!co) return res.status(404).json({ message: "Course offering not found" });
      const { teacherId, sectionNames } = req.body;
      const currentTeachers = (co.teachers as any[]) || [];
      currentTeachers.push({ teacherId, sectionNames: sectionNames || [], assignedAt: new Date().toISOString() });
      const updated = await storage.updateCourseOffering(req.params.offeringId, { teachers: currentTeachers });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/courses/:offeringId/teachers/:teacherId", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const co = await storage.getCourseOffering(req.params.offeringId);
      if (!co) return res.status(404).json({ message: "Course offering not found" });
      const currentTeachers = ((co.teachers as any[]) || []).filter((t: any) => t.teacherId !== req.params.teacherId);
      const updated = await storage.updateCourseOffering(req.params.offeringId, { teachers: currentTeachers });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/enrollments", requireAuth, async (req: Request, res: Response) => {
    try {
      const enrollment = await storage.createEnrollment(req.body);
      res.status(201).json(enrollment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/enrollments", requireAuth, async (req: Request, res: Response) => {
    try {
      const { studentId, courseOfferingId } = req.query;
      const list = await storage.listEnrollments({
        studentId: studentId as string,
        courseOfferingId: courseOfferingId as string,
      });
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/enrollment/bulk", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const { studentIds, courseOfferingId, sectionName } = req.body;
      const results = [];
      for (const studentId of studentIds) {
        const enrollment = await storage.createEnrollment({
          studentId,
          courseOfferingId,
          sectionName,
          enrollmentType: "admin_assigned",
          status: "active",
        });
        results.push(enrollment);
      }
      res.status(201).json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/me/enroll", requireAuth, async (req: Request, res: Response) => {
    try {
      const { courseOfferingId, sectionName } = req.body;
      const co = await storage.getCourseOffering(courseOfferingId);
      if (!co) return res.status(404).json({ message: "Course offering not found" });

      const enrollment = await storage.createEnrollment({
        studentId: req.user!.userId,
        courseOfferingId,
        sectionName,
        enrollmentType: "student_selected",
        status: (co.studentCount || 0) >= (co.capacity || 100) ? "waitlisted" : "active",
      });

      await storage.updateCourseOffering(courseOfferingId, {
        studentCount: (co.studentCount || 0) + 1,
      });

      res.status(enrollment.status === "waitlisted" ? 202 : 200).json(enrollment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/me/enroll/:enrollmentId", requireAuth, async (req: Request, res: Response) => {
    try {
      const enrollment = await storage.getEnrollment(req.params.enrollmentId);
      if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
      if (enrollment.studentId !== req.user!.userId) return res.status(403).json({ message: "Not your enrollment" });
      if (enrollment.enrollmentType !== "student_selected") return res.status(400).json({ message: "Cannot unenroll from admin-assigned courses" });

      await storage.updateEnrollment(req.params.enrollmentId, { status: "withdrawn" });
      res.json({ message: "Unenrolled successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/enrollment/:id", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      await storage.deleteEnrollment(req.params.id);

      await storage.createAuditLog({
        actorId: req.user!.userId,
        actorRole: req.user!.role,
        action: "DELETE_ENROLLMENT",
        targetId: req.params.id,
        targetType: "enrollment",
        ipAddress: req.ip,
        metadata: { reason: req.body.reason },
      });

      res.json({ message: "Enrollment removed" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/me/courses", requireAuth, async (req: Request, res: Response) => {
    try {
      const myEnrollments = await storage.listEnrollments({ studentId: req.user!.userId });
      const activeEnrollments = myEnrollments.filter(e => e.status === "active");

      const result = await Promise.all(activeEnrollments.map(async (enrollment) => {
        const co = await storage.getCourseOffering(enrollment.courseOfferingId);
        if (!co) return null;
        const course = await storage.getCourse(co.courseId);
        const teacherIds = (co.teachers as any[] || []).map((t: any) => t.teacherId);
        const teacherUsers = await Promise.all(teacherIds.map((tid: string) => storage.getUser(tid)));

        return {
          ...co,
          course: course || { id: co.courseId, code: "", name: "Unknown", description: "", prerequisites: [] },
          teachers: teacherUsers.filter(Boolean).map(sanitizeUser),
          enrollmentId: enrollment.id,
          progress: enrollment.progress || 0,
        };
      }));

      res.json(result.filter(Boolean));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/content", requireAuth, requireRole("teacher", "admin"), upload.single("file"), async (req: Request, res: Response) => {
    try {
      const { title, courseOfferingId, description, contentType, type, tags } = req.body;

      const contentItem = await storage.createContentItem({
        title,
        courseOfferingId,
        description,
        type: type || contentType || "document",
        tags: tags ? JSON.parse(tags) : [],
        ownerTeacherId: req.user!.userId,
        uploadedBy: req.user!.userId,
        originalFilePath: req.file?.path,
        originalMimeType: req.file?.mimetype,
        originalSizeBytes: req.file?.size,
        originalFilename: req.file?.originalname,
        fileSize: req.file ? `${(req.file.size / (1024 * 1024)).toFixed(1)} MB` : undefined,
        publishStatus: "draft",
        formats: ["original"],
        conversionProgress: { tier1: "in_progress", tier2: "in_progress" },
      });

      res.status(201).json(contentItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/content", requireAuth, async (req: Request, res: Response) => {
    try {
      const { courseOfferingId, publishStatus, uploadedBy } = req.query;
      const list = await storage.listContentItems({
        courseOfferingId: courseOfferingId as string,
        publishStatus: publishStatus as string,
        uploadedBy: uploadedBy as string,
      });
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/content/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const item = await storage.getContentItem(req.params.id);
      if (!item) return res.status(404).json({ message: "Content item not found" });
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/content/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const item = await storage.updateContentItem(req.params.id, req.body);
      if (!item) return res.status(404).json({ message: "Content item not found" });
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/content/:id/publish", requireAuth, requireRole("teacher", "admin"), async (req: Request, res: Response) => {
    try {
      const item = await storage.updateContentItem(req.params.id, { publishStatus: "published" });
      if (!item) return res.status(404).json({ message: "Content item not found" });
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/content/:id/soft-delete", requireAuth, requireRole("teacher", "admin"), async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const deleteDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const item = await storage.updateContentItem(req.params.id, {
        publishStatus: "soft_deleted",
        deletedAt: now,
        deletedByTeacherId: req.user!.userId,
        permanentDeleteScheduledAt: deleteDate,
      });
      if (!item) return res.status(404).json({ message: "Content item not found" });
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/content/:id/restore", requireAuth, requireRole("teacher", "admin"), async (req: Request, res: Response) => {
    try {
      const item = await storage.updateContentItem(req.params.id, {
        publishStatus: "draft",
        deletedAt: null,
        deletedByTeacherId: null,
        permanentDeleteScheduledAt: null,
      });
      if (!item) return res.status(404).json({ message: "Content item not found" });
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/content/:id/permanent", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      await storage.deleteContentItem(req.params.id);

      await storage.createAuditLog({
        actorId: req.user!.userId,
        actorRole: req.user!.role,
        action: "PERMANENT_DELETE_CONTENT",
        targetId: req.params.id,
        targetType: "contentItem",
        ipAddress: req.ip,
      });

      res.json({ message: "Content permanently deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/content/:id/delete-impact", requireAuth, async (req: Request, res: Response) => {
    try {
      const item = await storage.getContentItem(req.params.id);
      if (!item) return res.status(404).json({ message: "Content item not found" });

      res.json({
        viewCount: item.viewCount || 0,
        studentsWithProgressRecord: item.progressCount || 0,
        linkedAssessments: (item.linkedAssessments as string[]).map(id => ({ id, title: "Assessment" })),
        activeViewersLast24h: 0,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/content/trash", requireAuth, async (req: Request, res: Response) => {
    try {
      const list = await storage.listContentItems({ publishStatus: "soft_deleted" });
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/student/content", requireAuth, async (req: Request, res: Response) => {
    try {
      const { courseOfferingId } = req.query;
      const list = await storage.listContentItems({
        courseOfferingId: courseOfferingId as string,
        publishStatus: "published",
      });
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/conversion-jobs", requireAuth, async (req: Request, res: Response) => {
    try {
      const { contentId, courseOfferingId, status } = req.query;
      const list = await storage.listConversionJobs({
        contentId: contentId as string,
        courseOfferingId: courseOfferingId as string,
        status: status as string,
      });
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/conversions/my-queue", requireAuth, async (req: Request, res: Response) => {
    try {
      const list = await storage.listConversionJobs({ status: "ready_for_review" });
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/conversions/:jobId/approve", requireAuth, requireRole("teacher", "admin"), async (req: Request, res: Response) => {
    try {
      const job = await storage.updateConversionJob(req.params.jobId, {
        status: "approved",
        reviewedByTeacherId: req.user!.userId,
        reviewedAt: new Date(),
      });
      if (!job) return res.status(404).json({ message: "Conversion job not found" });
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/conversions/:jobId/reject", requireAuth, requireRole("teacher", "admin"), async (req: Request, res: Response) => {
    try {
      const job = await storage.updateConversionJob(req.params.jobId, {
        status: "rejected",
        reviewedByTeacherId: req.user!.userId,
        reviewedAt: new Date(),
      });
      if (!job) return res.status(404).json({ message: "Conversion job not found" });
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/conversions/:jobId/retry", requireAuth, requireRole("teacher", "admin"), async (req: Request, res: Response) => {
    try {
      const job = await storage.getConversionJob(req.params.jobId);
      if (!job) return res.status(404).json({ message: "Conversion job not found" });
      const updated = await storage.updateConversionJob(req.params.jobId, {
        status: "pending",
        retryCount: (job.retryCount || 0) + 1,
        errorMessage: null,
      });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/conversions", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      const list = await storage.listConversionJobs({ status: status as string });
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/assessments", requireAuth, requireRole("teacher", "admin"), async (req: Request, res: Response) => {
    try {
      const assessment = await storage.createAssessment({
        ...req.body,
        ownerTeacherId: req.user!.userId,
        questionCount: req.body.questions?.length || 0,
      });
      res.status(201).json(assessment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/assessments", requireAuth, async (req: Request, res: Response) => {
    try {
      const { courseOfferingId } = req.query;
      const list = await storage.listAssessments({
        courseOfferingId: courseOfferingId as string,
      });

      if (req.user!.role === "student") {
        const enriched = await Promise.all(list.map(async (a) => {
          const sub = await storage.getSubmissionByStudentAndAssessment(req.user!.userId, a.id);
          return {
            ...a,
            status: sub ? (sub.status === "graded" ? "graded" : sub.status === "submitted" ? "completed" : sub.status) : "upcoming",
            score: sub?.totalScore,
          };
        }));
        return res.json(enriched);
      }

      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/assessments/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) return res.status(404).json({ message: "Assessment not found" });

      if (req.user!.role === "student") {
        const sub = await storage.getSubmissionByStudentAndAssessment(req.user!.userId, assessment.id);
        return res.json({
          ...assessment,
          status: sub ? (sub.status === "graded" ? "graded" : sub.status === "submitted" ? "completed" : sub.status) : "upcoming",
          score: sub?.totalScore,
          submission: sub,
        });
      }

      res.json(assessment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/assessments/:id", requireAuth, requireRole("teacher", "admin"), async (req: Request, res: Response) => {
    try {
      const assessment = await storage.updateAssessment(req.params.id, req.body);
      if (!assessment) return res.status(404).json({ message: "Assessment not found" });
      res.json(assessment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/assessments/:id", requireAuth, requireRole("teacher", "admin"), async (req: Request, res: Response) => {
    try {
      await storage.deleteAssessment(req.params.id);
      res.json({ message: "Assessment deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/assessments/:id/start", requireAuth, async (req: Request, res: Response) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) return res.status(404).json({ message: "Assessment not found" });

      const existing = await storage.getSubmissionByStudentAndAssessment(req.user!.userId, req.params.id);
      if (existing && existing.status !== "paused") {
        return res.json(existing);
      }

      const user = await storage.getUser(req.user!.userId);
      const multiplier = (user?.preferences as any)?.extendedTimeMultiplier || 1.0;

      if (existing && existing.status === "paused") {
        const updated = await storage.updateSubmission(existing.id, {
          status: "in_progress",
          pausedAt: null,
        });
        return res.json(updated);
      }

      const submission = await storage.createSubmission({
        assessmentId: req.params.id,
        studentId: req.user!.userId,
        courseOfferingId: assessment.courseOfferingId,
        status: "in_progress",
        appliedTimeMultiplier: multiplier,
        timeStartedAt: new Date(),
        responses: [],
      });

      res.status(201).json(submission);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/assessments/:id/answer", requireAuth, async (req: Request, res: Response) => {
    try {
      const existing = await storage.getSubmissionByStudentAndAssessment(req.user!.userId, req.params.id);
      if (!existing) return res.status(404).json({ message: "No active submission found" });

      const { questionId, responseType, textAnswer, filePath } = req.body;
      const responses = (existing.responses as any[]) || [];
      const idx = responses.findIndex((r: any) => r.questionId === questionId);
      const response = { questionId, responseType, textAnswer, filePath };

      if (idx >= 0) responses[idx] = response;
      else responses.push(response);

      const updated = await storage.updateSubmission(existing.id, { responses });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/assessments/:id/save-exit", requireAuth, async (req: Request, res: Response) => {
    try {
      const existing = await storage.getSubmissionByStudentAndAssessment(req.user!.userId, req.params.id);
      if (!existing) return res.status(404).json({ message: "No active submission found" });

      const updated = await storage.updateSubmission(existing.id, {
        status: "paused",
        pausedAt: new Date(),
        remainingSeconds: req.body.remainingSeconds,
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/assessments/:id/resume", requireAuth, async (req: Request, res: Response) => {
    try {
      const existing = await storage.getSubmissionByStudentAndAssessment(req.user!.userId, req.params.id);
      if (!existing) return res.status(404).json({ message: "No submission found" });
      if (existing.status !== "paused") return res.status(400).json({ message: "Submission is not paused" });

      const updated = await storage.updateSubmission(existing.id, {
        status: "in_progress",
        pausedAt: null,
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/assessments/:id/submit", requireAuth, async (req: Request, res: Response) => {
    try {
      const existing = await storage.getSubmissionByStudentAndAssessment(req.user!.userId, req.params.id);
      if (!existing) return res.status(404).json({ message: "No active submission found" });

      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) return res.status(404).json({ message: "Assessment not found" });

      let totalScore = 0;
      const responses = (existing.responses as any[]) || [];
      const questions = (assessment.questions as any[]) || [];

      responses.forEach((resp: any) => {
        const q = questions.find((q: any) => q.id === resp.questionId);
        if (q && (q.type === "multiple_choice" || q.type === "multi_select") && q.correctAnswers) {
          const selectedIdx = q.options?.findIndex((o: any) => o.id === resp.textAnswer);
          if (q.correctAnswers.includes(selectedIdx)) {
            resp.score = q.marks || 1;
            totalScore += resp.score;
          } else {
            resp.score = 0;
          }
        }
      });

      const updated = await storage.updateSubmission(existing.id, {
        status: "submitted",
        timeSubmittedAt: new Date(),
        responses,
        totalScore,
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/threads", requireAuth, async (req: Request, res: Response) => {
    try {
      const thread = await storage.createThread(req.body);
      res.status(201).json(thread);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/threads", requireAuth, async (req: Request, res: Response) => {
    try {
      const { courseOfferingId } = req.query;
      const list = await storage.listThreads({
        courseOfferingId: courseOfferingId as string,
      });
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/threads/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const thread = await storage.getThread(req.params.id);
      if (!thread) return res.status(404).json({ message: "Thread not found" });
      res.json(thread);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/threads/:id/messages", requireAuth, async (req: Request, res: Response) => {
    try {
      const list = await storage.listMessages(req.params.id);
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/threads/:id/messages", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      const message = await storage.createMessage({
        threadId: req.params.id,
        senderId: req.user!.userId,
        senderName: user?.name || "Unknown",
        senderRole: req.user!.role,
        content: req.body.content,
        type: req.body.type || "text",
      });

      await storage.updateThread(req.params.id, {
        lastMessage: req.body.content,
        lastMessageTime: new Date(),
      });

      res.status(201).json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/messages", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      const message = await storage.createMessage({
        ...req.body,
        senderId: req.user!.userId,
        senderName: user?.name || "Unknown",
        senderRole: req.user!.role,
      });

      if (req.body.threadId) {
        await storage.updateThread(req.body.threadId, {
          lastMessage: req.body.content,
          lastMessageTime: new Date(),
        });
      }

      res.status(201).json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/announcements", requireAuth, requireRole("teacher", "admin"), async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      const announcement = await storage.createAnnouncement({
        ...req.body,
        authorId: req.user!.userId,
        senderName: user?.name || "Unknown",
        senderRole: req.user!.role,
        urgent: req.body.urgent || req.body.isUrgent || false,
        publishedAt: new Date(),
      });
      res.status(201).json(announcement);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/announcements", requireAuth, async (req: Request, res: Response) => {
    try {
      const { courseOfferingId } = req.query;
      const list = await storage.listAnnouncements({
        courseOfferingId: courseOfferingId as string,
      });
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/announcements/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const announcement = await storage.getAnnouncement(req.params.id);
      if (!announcement) return res.status(404).json({ message: "Announcement not found" });
      res.json(announcement);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/announcements/:id", requireAuth, requireRole("teacher", "admin"), async (req: Request, res: Response) => {
    try {
      const announcement = await storage.updateAnnouncement(req.params.id, req.body);
      if (!announcement) return res.status(404).json({ message: "Announcement not found" });
      res.json(announcement);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/announcements/:id", requireAuth, requireRole("teacher", "admin"), async (req: Request, res: Response) => {
    try {
      await storage.deleteAnnouncement(req.params.id);
      res.json({ message: "Announcement deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/dashboard/stats", requireAuth, requireRole("admin"), async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/dashboard/alerts", requireAuth, requireRole("admin"), async (_req: Request, res: Response) => {
    try {
      const failedJobs = await storage.listConversionJobs({ status: "failed" });
      res.json({
        alerts: failedJobs.map(j => ({
          type: "conversion_failure",
          message: `Conversion failed: ${j.contentTitle} - ${j.formatType}`,
          jobId: j.id,
          errorMessage: j.errorMessage,
        })),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/users", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const { role, search, status } = req.query;
      const userList = await storage.listUsers({
        role: role as string,
        search: search as string,
        status: status as string,
      });
      res.json(userList.map(sanitizeUser));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/users/:id/workload", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const allOfferings = await storage.listCourseOfferings();
      const teacherOfferings = allOfferings.filter(co =>
        (co.teachers as any[] || []).some((t: any) => t.teacherId === req.params.id)
      );
      const pendingJobs = await storage.listConversionJobs({ status: "ready_for_review" });

      res.json({
        assignedOfferings: teacherOfferings.length,
        pendingReviews: pendingJobs.length,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/audit-logs", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const { actorId, action } = req.query;
      const logs = await storage.listAuditLogs({
        actorId: actorId as string,
        action: action as string,
      });
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/settings", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const insts = await storage.listInstitutes();
      if (insts.length === 0) return res.json(null);
      const settings = await storage.getPlatformSettings(insts[0].id);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/settings/:section", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    try {
      const insts = await storage.listInstitutes();
      if (insts.length === 0) return res.status(404).json({ message: "No institute found" });

      const updateData: any = {};
      updateData[req.params.section] = req.body;

      const settings = await storage.upsertPlatformSettings(insts[0].id, updateData);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/student/dashboard", requireAuth, async (req: Request, res: Response) => {
    try {
      const myEnrollments = await storage.listEnrollments({ studentId: req.user!.userId });
      const activeEnrollments = myEnrollments.filter(e => e.status === "active");

      const coursesData = await Promise.all(activeEnrollments.map(async (enrollment) => {
        const co = await storage.getCourseOffering(enrollment.courseOfferingId);
        if (!co) return null;
        const course = await storage.getCourse(co.courseId);
        return {
          ...co,
          course: course || { id: co.courseId, code: "", name: "Unknown", description: "", prerequisites: [] },
          progress: enrollment.progress || 0,
        };
      }));

      const allContent = [];
      for (const enrollment of activeEnrollments) {
        const items = await storage.listContentItems({
          courseOfferingId: enrollment.courseOfferingId,
          publishStatus: "published",
        });
        allContent.push(...items);
      }

      const allAssessments = [];
      for (const enrollment of activeEnrollments) {
        const items = await storage.listAssessments({
          courseOfferingId: enrollment.courseOfferingId,
        });
        allAssessments.push(...items);
      }

      const recentAnnouncements = await storage.listAnnouncements();

      res.json({
        courses: coursesData.filter(Boolean),
        recentContent: allContent.slice(0, 5),
        upcomingAssessments: allAssessments.slice(0, 5),
        announcements: recentAnnouncements.slice(0, 5),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/teacher/dashboard", requireAuth, async (req: Request, res: Response) => {
    try {
      const allOfferings = await storage.listCourseOfferings();
      const myOfferings = allOfferings.filter(co =>
        (co.teachers as any[] || []).some((t: any) => t.teacherId === req.user!.userId)
      );

      const coursesData = await Promise.all(myOfferings.map(async (co) => {
        const course = await storage.getCourse(co.courseId);
        const content = await storage.listContentItems({ courseOfferingId: co.id });
        return {
          ...co,
          course: course || { id: co.courseId, code: "", name: "Unknown", description: "", prerequisites: [] },
          contentCount: content.length,
          publishedCount: content.filter(c => c.publishStatus === "published").length,
        };
      }));

      const pendingReviews = await storage.listConversionJobs({ status: "ready_for_review" });

      res.json({
        courses: coursesData,
        pendingReviews: pendingReviews.length,
        conversionQueue: pendingReviews.slice(0, 10),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/analytics/events", requireAuth, async (req: Request, res: Response) => {
    try {
      const event = await storage.createAnalyticsEvent({
        userId: req.user!.userId,
        ...req.body,
      });
      res.status(201).json(event);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/analytics", requireAuth, requireRole("admin"), async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
