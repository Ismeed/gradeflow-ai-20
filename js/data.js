// GradeFlow Database Layer - localStorage-backed
const DB_VERSION = "1.0.0";

const DEFAULT_USERS = [
  { id: "std-001", name: "Sarah Jenkins", email: "sarah.j@fudmas.edu.ng", role: "student", department: "Computer Science", regNo: "FUD/CS/22/1004" },
  { id: "std-002", name: "David Alao", email: "david.a@fudmas.edu.ng", role: "student", department: "Software Engineering", regNo: "FUD/SE/22/2045" },
  { id: "std-003", name: "Fatima Yusuf", email: "fatima.y@fudmas.edu.ng", role: "student", department: "Computer Science", regNo: "FUD/CS/22/1109" },
  { id: "sup-001", name: "Dr. Akinleye Johnson", email: "akinleye.j@fudmas.edu.ng", role: "supervisor", department: "Computer Science" },
  { id: "sup-002", name: "Prof. Grace Mbah", email: "grace.m@fudmas.edu.ng", role: "supervisor", department: "Software Engineering" },
  { id: "adm-001", name: "Registrar Admin", email: "admin@fudmas.edu.ng", role: "admin", department: "Academic Registry" }
];

const DEFAULT_PROJECTS = [
  {
    id: "proj-001",
    studentId: "std-001",
    studentName: "Sarah Jenkins",
    regNo: "FUD/CS/22/1004",
    department: "Computer Science",
    projectTitle: "Automated Student Project Assessment System with Live Grading Analytics",
    supervisorId: "sup-001",
    supervisorName: "Dr. Akinleye Johnson",
    abstract: "This project outlines a digital system to manage, review, and evaluate student academic research projects using responsive layouts and serverless presets. It eliminates paper-based workflow delays and provides real-time analytics dashboards for administrators.",
    fileUrl: "#",
    fileName: "automated_assessment_system_v2.pdf",
    submissionDate: "2026-05-18",
    status: "graded"
  },
  {
    id: "proj-002",
    studentId: "std-002",
    studentName: "David Alao",
    regNo: "FUD/SE/22/2045",
    department: "Software Engineering",
    projectTitle: "Microservices-Based Decentralized Voting Platform Using Zero-Knowledge Proofs",
    supervisorId: "sup-002",
    supervisorName: "Prof. Grace Mbah",
    abstract: "A highly secure and verifiable electronic voting protocol built with microservices to deliver scalable public audits. It preserves voter confidentiality while ensuring absolute counting precision at election centers.",
    fileUrl: "#",
    fileName: "decentralized_voting_zkp.pdf",
    submissionDate: "2026-05-19",
    status: "pending"
  },
  {
    id: "proj-003",
    studentId: "std-003",
    studentName: "Fatima Yusuf",
    regNo: "FUD/CS/22/1109",
    department: "Computer Science",
    projectTitle: "Deep Convolutional Neural Networks for Early Detection of Crop Diseases",
    supervisorId: "sup-001",
    supervisorName: "Dr. Akinleye Johnson",
    abstract: "An AI-powered computer vision model that analyzes agricultural leaf scans to identify fungal pathogens. Implemented on edge platforms to support rural farmers with prompt agricultural treatment recommendations.",
    fileUrl: "#",
    fileName: "crop_disease_cnn.pdf",
    submissionDate: "2026-05-17",
    status: "revision"
  }
];

const DEFAULT_GRADES = [
  {
    id: "grd-001",
    projectId: "proj-001",
    scores: {
      problemDefinition: 9,   // Max 10
      literatureReview: 12,   // Max 15
      methodology: 17,       // Max 20
      systemDesign: 13,       // Max 15
      implementation: 18,     // Max 20
      documentation: 9,      // Max 10
      presentation: 9        // Max 10
    },
    totalScore: 87,           // Sum = 87 (Grade A)
    grade: "A",
    recommendation: "Excellent work! Highly recommended for commercial deployment and publication.",
    supervisorFeedback: "The student demonstrated outstanding research competence and detailed execution. The live analytics component is visually exceptional.",
    gradedAt: "2026-05-19"
  },
  {
    id: "grd-003",
    projectId: "proj-003",
    scores: {
      problemDefinition: 6,
      literatureReview: 7,
      methodology: 10,
      systemDesign: 8,
      implementation: 9,
      documentation: 5,
      presentation: 6
    },
    totalScore: 51,
    grade: "D",
    recommendation: "Requires Revision: Re-evaluate literature review scope and update CNN implementation metrics.",
    supervisorFeedback: "The dataset utilized is too narrow. Please expand the image repository and perform robust cross-validation before final defense.",
    gradedAt: "2026-05-18"
  }
];

const DEFAULT_NOTIFICATIONS = [
  { id: "not-001", userId: "std-001", message: "Your project submission has been graded by Dr. Akinleye Johnson. Final Grade: A.", createdAt: "2026-05-19 09:30" },
  { id: "not-002", userId: "sup-001", message: "New project submission received from David Alao: 'Microservices-Based Decentralized Voting Platform'.", createdAt: "2026-05-19 08:15" },
  { id: "not-003", userId: "std-003", message: "Your project status has been updated to 'Requires Revision' by Dr. Akinleye Johnson.", createdAt: "2026-05-18 16:45" }
];

// Database Utilities
const GFDb = {
  init() {
    if (!localStorage.getItem("gf_initialized")) {
      localStorage.setItem("gf_users", JSON.stringify(DEFAULT_USERS));
      localStorage.setItem("gf_projects", JSON.stringify(DEFAULT_PROJECTS));
      localStorage.setItem("gf_grades", JSON.stringify(DEFAULT_GRADES));
      localStorage.setItem("gf_notifications", JSON.stringify(DEFAULT_NOTIFICATIONS));
      localStorage.setItem("gf_initialized", "true");
    }
  },

  getUsers() {
    return JSON.parse(localStorage.getItem("gf_users") || "[]");
  },

  getProjects() {
    return JSON.parse(localStorage.getItem("gf_projects") || "[]");
  },

  getGrades() {
    return JSON.parse(localStorage.getItem("gf_grades") || "[]");
  },

  getNotifications() {
    return JSON.parse(localStorage.getItem("gf_notifications") || "[]");
  },

  saveProjects(projects) {
    localStorage.setItem("gf_projects", JSON.stringify(projects));
  },

  saveGrades(grades) {
    localStorage.setItem("gf_grades", JSON.stringify(grades));
  },

  saveNotifications(notifications) {
    localStorage.setItem("gf_notifications", JSON.stringify(notifications));
  },

  addProject(project) {
    const projects = this.getProjects();
    projects.unshift(project);
    this.saveProjects(projects);

    // Trigger notification to supervisor
    this.addNotification({
      id: "not-" + Date.now(),
      userId: project.supervisorId,
      message: `New project submission received from ${project.studentName}: '${project.projectTitle}'.`,
      createdAt: new Date().toLocaleString()
    });
  },

  addGrade(grade) {
    const grades = this.getGrades();
    grades.unshift(grade);
    this.saveGrades(grades);

    // Update project status
    const projects = this.getProjects();
    const projectIndex = projects.findIndex(p => p.id === grade.projectId);
    if (projectIndex !== -1) {
      projects[projectIndex].status = grade.grade === "F" ? "revision" : (grade.recommendation.toLowerCase().includes("revision") ? "revision" : "graded");
      this.saveProjects(projects);

      // Notify student
      this.addNotification({
        id: "not-" + Date.now(),
        userId: projects[projectIndex].studentId,
        message: `Your project has been graded by ${projects[projectIndex].supervisorName}. Final Grade: ${grade.grade}.`,
        createdAt: new Date().toLocaleString()
      });
    }
  },

  addNotification(notification) {
    const notifications = this.getNotifications();
    notifications.unshift(notification);
    this.saveNotifications(notifications);
  },

  clearNotifications(userId) {
    let notifications = this.getNotifications();
    notifications = notifications.filter(n => n.userId !== userId);
    this.saveNotifications(notifications);
  }
};

GFDb.init();
