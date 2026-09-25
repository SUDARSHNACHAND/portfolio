import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

// Determine local database file location (inside server data folder, strictly git-ignored)
const DB_DIR = path.resolve(process.cwd(), "server_data");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const DB_PATH = path.join(DB_DIR, "portfolio_private.db");

// Initialize SQLite database instance
export const db = new Database(DB_PATH);

// Enable WAL mode for high concurrency and performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

/**
 * Initializes all database tables with enterprise-grade schemas,
 * matching PostgreSQL / Supabase specification.
 */
export function initDatabase(): void {
  // 1. Admin Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'ADMIN', -- SUPER_ADMIN, ADMIN, EDITOR, VIEWER
      status TEXT NOT NULL DEFAULT 'active', -- active, disabled
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_login_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
  `);

  // 2. Admin Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON admin_sessions(session_token);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions(expires_at);
  `);

  // 3. Admin Roles & Permissions tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_roles (
      role TEXT PRIMARY KEY,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_permissions (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      permission TEXT NOT NULL,
      FOREIGN KEY (role) REFERENCES admin_roles(role) ON DELETE CASCADE
    );

    INSERT OR IGNORE INTO admin_roles (role, description) VALUES
      ('SUPER_ADMIN', 'Full unrestricted administrative access'),
      ('ADMIN', 'Manage content, messages, and analytics'),
      ('EDITOR', 'Create and edit portfolio content drafts'),
      ('VIEWER', 'Read-only access to admin panels');
  `);

  // 4. Portfolio Sections (Home & About)
  db.exec(`
    CREATE TABLE IF NOT EXISTS portfolio_home (
      id TEXT PRIMARY KEY,
      hero_label TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      typing_text TEXT NOT NULL,
      description TEXT NOT NULL,
      profile_image TEXT,
      email TEXT NOT NULL,
      resume_url TEXT NOT NULL,
      resume_file_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published', -- draft, published
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT
    );

    CREATE TABLE IF NOT EXISTS portfolio_about (
      id TEXT PRIMARY KEY,
      section_label TEXT NOT NULL,
      heading TEXT NOT NULL,
      bio_p1 TEXT NOT NULL,
      bio_p2 TEXT NOT NULL,
      bio_p3 TEXT NOT NULL,
      tech_badges TEXT NOT NULL, -- JSON array of strings
      status TEXT NOT NULL DEFAULT 'published',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT
    );
  `);

  // 5. Portfolio Education
  db.exec(`
    CREATE TABLE IF NOT EXISTS portfolio_education (
      id TEXT PRIMARY KEY,
      degree TEXT NOT NULL,
      institution TEXT NOT NULL,
      location TEXT NOT NULL,
      start_year TEXT NOT NULL,
      end_year TEXT NOT NULL,
      status_label TEXT NOT NULL,
      branch TEXT NOT NULL,
      cgpa TEXT NOT NULL,
      description TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'published',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_education_order ON portfolio_education(display_order);
  `);

  // 6. Portfolio Experience & Recognition
  db.exec(`
    CREATE TABLE IF NOT EXISTS portfolio_experience (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL, -- internship, achievement, experience
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      description TEXT NOT NULL,
      certificate_url TEXT,
      external_url TEXT,
      year TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'published',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_experience_order ON portfolio_experience(display_order);
  `);

  // 7. Portfolio Skills
  db.exec(`
    CREATE TABLE IF NOT EXISTS portfolio_skills (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL, -- FRONTEND, BACKEND, DATABASE, DEVOPS, AWS, GIT, MONITORING, ENVIRONMENT, DEVELOPER TOOLS
      name TEXT NOT NULL,
      icon_path TEXT NOT NULL,
      icon_type TEXT NOT NULL DEFAULT 'svg', -- svg, webp, png, url
      proficiency INTEGER DEFAULT 90,
      description TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'published',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_skills_cat ON portfolio_skills(category);
    CREATE INDEX IF NOT EXISTS idx_skills_order ON portfolio_skills(display_order);
  `);

  // 8. Portfolio Projects
  db.exec(`
    CREATE TABLE IF NOT EXISTS portfolio_projects (
      id TEXT PRIMARY KEY,
      project_number TEXT NOT NULL,
      tag TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      bullets TEXT NOT NULL, -- JSON array of strings
      tools TEXT NOT NULL, -- JSON array of {name, icon, invertDark}
      github_url TEXT,
      live_url TEXT,
      image_url TEXT,
      featured INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'published',
      is_deleted INTEGER NOT NULL DEFAULT 0, -- Soft delete support
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_projects_order ON portfolio_projects(display_order);
    CREATE INDEX IF NOT EXISTS idx_projects_status ON portfolio_projects(status, is_deleted);
  `);

  // 9. Portfolio Social Links
  db.exec(`
    CREATE TABLE IF NOT EXISTS portfolio_socials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT,
      enabled INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_socials_order ON portfolio_socials(display_order);
  `);

  // 10. Contact Messages
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'UNREAD', -- UNREAD, READ, REPLIED, ARCHIVED
      ip_address TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status);
    CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(created_at);
  `);

  // 11. Visitor Analytics Events
  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL, -- pageview, section_view, resume_download, click
      page_path TEXT NOT NULL,
      referrer TEXT,
      device_type TEXT, -- desktop, mobile, tablet
      browser TEXT,
      session_id TEXT,
      timestamp TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_analytics_ts ON analytics_events(timestamp);
    CREATE INDEX IF NOT EXISTS idx_analytics_path ON analytics_events(page_path);
  `);

  // 12. Security & CMS Activity Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      resource_id TEXT,
      success INTEGER NOT NULL DEFAULT 1,
      metadata TEXT, -- JSON safe metadata, NEVER sensitive keys/passcodes
      timestamp TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_activity_ts ON activity_logs(timestamp);
  `);

  // 13. Resume Metadata
  db.exec(`
    CREATE TABLE IF NOT EXISTS resume_metadata (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      is_active INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );
  `);

  // Seed default portfolio data if empty
  seedDefaultData();
}

/**
 * Seeds initial content from portfolioContent.json if tables are empty.
 */
function seedDefaultData(): void {
  const now = new Date().toISOString();

  // Seed Home
  const homeCount = db.prepare("SELECT COUNT(*) as count FROM portfolio_home").get() as { count: number };
  if (homeCount.count === 0) {
    db.prepare(`
      INSERT INTO portfolio_home (
        id, hero_label, name, role, typing_text, description, profile_image,
        email, resume_url, resume_file_name, status, created_at, updated_at, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)
    `).run(
      "home-default",
      "HI, I AM",
      "SUDARSHNA CHAND M S",
      "DevOps Engineer",
      "Building resilient CI/CD pipelines & cloud infrastructure.",
      "Final-year Computer Science student passionate about building resilient, automated CI/CD pipelines, container orchestration, and cloud infrastructure.",
      "",
      "sudarshanachand007@gmail.com",
      "/M.S.SUDARSHNA CHAND CV.pdf",
      "M.S.SUDARSHNA CHAND CV.pdf",
      now, now, now
    );
  }

  // Seed About
  const aboutCount = db.prepare("SELECT COUNT(*) as count FROM portfolio_about").get() as { count: number };
  if (aboutCount.count === 0) {
    db.prepare(`
      INSERT INTO portfolio_about (
        id, section_label, heading, bio_p1, bio_p2, bio_p3, tech_badges,
        status, created_at, updated_at, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)
    `).run(
      "about-default",
      "ABOUT ME",
      "Building, Automating, and Improving Systems.",
      "I’m a final-year Computer Science and Engineering student with a strong interest in DevOps, cloud infrastructure, automation, and continuous delivery.",
      "I enjoy building reliable and scalable systems using technologies such as Linux, Git, Docker, Jenkins, Kubernetes, Terraform, and AWS. I’m particularly interested in automating development and deployment workflows and improving system reliability through monitoring and observability.",
      "I’m continuously learning new technologies, working on practical projects, and developing my skills to become a professional DevOps Engineer.",
      JSON.stringify(["Linux", "Git", "Docker", "Jenkins", "Kubernetes", "Terraform", "AWS", "CI/CD Workflows", "Observability"]),
      now, now, now
    );
  }

  // Seed Education
  const eduCount = db.prepare("SELECT COUNT(*) as count FROM portfolio_education").get() as { count: number };
  if (eduCount.count === 0) {
    const insertEdu = db.prepare(`
      INSERT INTO portfolio_education (
        id, degree, institution, location, start_year, end_year,
        status_label, branch, cgpa, description, display_order, status, created_at, updated_at, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)
    `);

    insertEdu.run(
      "edu-1",
      "Bachelor of Engineering",
      "Alagappa Chettiar Government College of Engineering and Technology",
      "Karaikudi",
      "2023",
      "2027",
      "Pursuing",
      "Computer Science and Engineering",
      "7.44 CGPA (up to 4th Sem)",
      "Core focus on Systems Architecture, Operating Systems, Computer Networks, and Cloud Infrastructure.",
      1, now, now, now
    );

    insertEdu.run(
      "edu-2",
      "Higher Secondary Certificate (HSC) Class XII",
      "Maharishi Vidya Mandir Higher Secondary School",
      "Karaikudi",
      "2022",
      "2023",
      "Completed",
      "Computer Science with Mathematics",
      "66.6%",
      "Solid foundation in Mathematics, Physics, and foundational Computer Science.",
      2, now, now, now
    );
  }

  // Seed Experience & Recognition
  const expCount = db.prepare("SELECT COUNT(*) as count FROM portfolio_experience").get() as { count: number };
  if (expCount.count === 0) {
    const insertExp = db.prepare(`
      INSERT INTO portfolio_experience (
        id, type, title, company, location, start_date, end_date,
        description, certificate_url, external_url, year, display_order, status, created_at, updated_at, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)
    `);

    insertExp.run(
      "exp-1",
      "internship",
      "IoT / INTERNET OF THINGS",
      "Imbed Software",
      "Karaikudi",
      "01 MAR 2024",
      "08 MAR 2024",
      "Explored microcontrollers, sensor networking, edge data capture, and communication protocols.",
      "/certification/2024.jpeg",
      "",
      "2024",
      1, now, now, now
    );

    insertExp.run(
      "exp-2",
      "internship",
      "ARTIFICIAL INTELLIGENCE",
      "SD Pro Solutions",
      "Karaikudi",
      "18 JUN 2025",
      "02 JUL 2025",
      "Implemented supervised learning pipelines, data preprocessing, and model evaluation routines.",
      "/certification/2025.jpeg",
      "",
      "2025",
      2, now, now, now
    );

    insertExp.run(
      "exp-3",
      "internship",
      "DEVOPS & CLOUD AUTOMATION",
      "TechCorp Solutions",
      "Remote",
      "10 JAN 2026",
      "25 FEB 2026",
      "Configured automated GitHub Actions workflows, containerized microservices with Docker, and provisioned test environments.",
      "/certification/2026.jpeg",
      "",
      "2026",
      3, now, now, now
    );

    insertExp.run(
      "exp-4",
      "achievement",
      "SYMPOSIUM WINNER — TECH FEST",
      "ACGCET",
      "Karaikudi",
      "MAR 2024",
      "MAR 2024",
      "Secured 1st place in the Technical Project Presentation symposium covering automated cloud monitoring.",
      "/certification/ACGCET CF .pdf",
      "",
      "2024",
      4, now, now, now
    );
  }

  // Seed Projects
  const projCount = db.prepare("SELECT COUNT(*) as count FROM portfolio_projects").get() as { count: number };
  if (projCount.count === 0) {
    const insertProj = db.prepare(`
      INSERT INTO portfolio_projects (
        id, project_number, tag, title, description, bullets, tools,
        github_url, live_url, image_url, featured, display_order, status, is_deleted, created_at, updated_at, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'published', 0, ?, ?, ?)
    `);

    insertProj.run(
      "proj-1",
      "01",
      "CI/CD & CLOUD-NATIVE DEPLOYMENT",
      "End-to-End DevOps CI/CD Pipeline & Cloud-Native Deployment",
      "Comprehensive automated deployment pipeline using Jenkins, Kubernetes, and Terraform.",
      JSON.stringify([
        "Built and automated an end-to-end CI/CD pipeline for a Flask web application using GitHub, Jenkins, Docker, and Kubernetes.",
        "Automated source checkout, dependency installation, unit testing, Docker image build, Docker Hub push, and Kubernetes deployment through Jenkins.",
        "Provisioned Kubernetes infrastructure using Terraform (Infrastructure as Code) and implemented containerized application deployment with scalable replicas.",
        "Integrated Prometheus and Grafana for application metrics, monitoring, and observability; configured GitHub Webhooks for automated pipeline triggering."
      ]),
      JSON.stringify([
        { name: "Git" },
        { name: "GitHub" },
        { name: "Jenkins" },
        { name: "Docker" },
        { name: "Kubernetes" },
        { name: "Terraform" },
        { name: "Prometheus" },
        { name: "Grafana" },
        { name: "Python Flask" },
        { name: "Cloudflare Tunnel" }
      ]),
      "https://github.com/SUDARSHNACHAND",
      "",
      "",
      1, now, now, now
    );

    insertProj.run(
      "proj-2",
      "02",
      "AWS CLOUD & AUTOMATED CI/CD",
      "Automated CI/CD Deployment Using GitHub, Jenkins, Docker & AWS",
      "Cloud-native deployment pipeline targeting AWS EC2 with automated containerization.",
      JSON.stringify([
        "Pushed application code to GitHub for version control and source management.",
        "Configured Jenkins CI/CD pipeline to automatically build and test the application.",
        "Created and managed Docker images to containerize the application.",
        "Deployed the Docker container on AWS EC2 for automated application delivery."
      ]),
      JSON.stringify([
        { name: "GitHub" },
        { name: "Jenkins" },
        { name: "CI/CD" },
        { name: "Docker" },
        { name: "AWS EC2" },
        { name: "Linux" }
      ]),
      "https://github.com/SUDARSHNACHAND",
      "",
      "",
      2, now, now, now
    );
  }

  // Seed Socials
  const socialCount = db.prepare("SELECT COUNT(*) as count FROM portfolio_socials").get() as { count: number };
  if (socialCount.count === 0) {
    const insertSocial = db.prepare(`
      INSERT INTO portfolio_socials (id, name, url, icon, enabled, display_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, ?, ?, ?)
    `);

    insertSocial.run("soc-gmail", "Gmail", "mailto:sudarshanachand007@gmail.com", "gmail", 1, now, now);
    insertSocial.run("soc-linkedin", "LinkedIn", "https://www.linkedin.com/in/sudarshna-chand-m-s-8a8917291", "linkedin", 2, now, now);
    insertSocial.run("soc-github", "GitHub", "https://github.com/SUDARSHNACHAND", "github", 3, now, now);
    insertSocial.run("soc-instagram", "Instagram", "https://www.instagram.com/sudarshan__ms/", "instagram", 4, now, now);
    insertSocial.run("soc-facebook", "Facebook", "https://www.facebook.com/sudarshana.sudarshana.31508/", "facebook", 5, now, now);
  }

  // Seed Skills
  const skillCount = db.prepare("SELECT COUNT(*) as count FROM portfolio_skills").get() as { count: number };
  if (skillCount.count === 0) {
    const insertSkill = db.prepare(`
      INSERT INTO portfolio_skills (
        id, category, name, icon_path, icon_type, proficiency, description, display_order, status, created_at, updated_at, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)
    `);

    const defaultSkills = [
      // FRONTEND
      { id: "skill-html5", category: "FRONTEND", name: "HTML5", icon_path: "html5", icon_type: "webp", proficiency: 95, order: 1 },
      { id: "skill-css3", category: "FRONTEND", name: "CSS3", icon_path: "css3", icon_type: "svg", proficiency: 90, order: 2 },
      { id: "skill-react", category: "FRONTEND", name: "React", icon_path: "react", icon_type: "webp", proficiency: 85, order: 3 },
      // BACKEND
      { id: "skill-javascript", category: "BACKEND", name: "JavaScript", icon_path: "javascript", icon_type: "webp", proficiency: 90, order: 1 },
      { id: "skill-nodejs", category: "BACKEND", name: "Node.js", icon_path: "nodejs", icon_type: "svg", proficiency: 88, order: 2 },
      { id: "skill-python", category: "BACKEND", name: "Python", icon_path: "python", icon_type: "svg", proficiency: 92, order: 3 },
      { id: "skill-java", category: "BACKEND", name: "Java", icon_path: "java", icon_type: "png", proficiency: 82, order: 4 },
      // DATABASE
      { id: "skill-mongodb", category: "DATABASE", name: "MongoDB", icon_path: "mongodb", icon_type: "png", proficiency: 85, order: 1 },
      { id: "skill-mysql", category: "DATABASE", name: "MySQL", icon_path: "mysql", icon_type: "png", proficiency: 88, order: 2 },
      // DEVOPS
      { id: "skill-docker", category: "DEVOPS", name: "Docker", icon_path: "docker", icon_type: "svg", proficiency: 95, order: 1 },
      { id: "skill-kubernetes", category: "DEVOPS", name: "Kubernetes", icon_path: "kubernetes", icon_type: "svg", proficiency: 90, order: 2 },
      { id: "skill-jenkins", category: "DEVOPS", name: "Jenkins", icon_path: "jenkins", icon_type: "webp", proficiency: 92, order: 3 },
      { id: "skill-github-actions", category: "DEVOPS", name: "GitHub Actions", icon_path: "githubactions", icon_type: "svg", proficiency: 90, order: 4 },
      { id: "skill-terraform", category: "DEVOPS", name: "Terraform", icon_path: "terraform", icon_type: "svg", proficiency: 88, order: 5 },
      { id: "skill-ansible", category: "DEVOPS", name: "Ansible", icon_path: "ansible", icon_type: "webp", proficiency: 85, order: 6 },
      // AWS
      { id: "skill-aws", category: "AWS", name: "AWS Platform", icon_path: "aws", icon_type: "webp", proficiency: 92, order: 1 },
      { id: "skill-ec2", category: "AWS", name: "Amazon EC2", icon_path: "ec2", icon_type: "svg", proficiency: 95, order: 2 },
      { id: "skill-s3", category: "AWS", name: "Amazon S3", icon_path: "s3", icon_type: "svg", proficiency: 94, order: 3 },
      { id: "skill-rds", category: "AWS", name: "Amazon RDS", icon_path: "rds", icon_type: "svg", proficiency: 86, order: 4 },
      { id: "skill-cloudwatch", category: "AWS", name: "Amazon CloudWatch", icon_path: "cloudwatch", icon_type: "svg", proficiency: 88, order: 5 },
      { id: "skill-iam", category: "AWS", name: "AWS IAM", icon_path: "iam", icon_type: "svg", proficiency: 90, order: 6 },
      // GIT
      { id: "skill-git", category: "GIT", name: "Git", icon_path: "git", icon_type: "svg", proficiency: 96, order: 1 },
      { id: "skill-github", category: "GIT", name: "GitHub", icon_path: "github", icon_type: "svg", proficiency: 95, order: 2 },
      { id: "skill-gitlab", category: "GIT", name: "GitLab", icon_path: "gitlab", icon_type: "svg", proficiency: 88, order: 3 },
      // MONITORING
      { id: "skill-prometheus", category: "MONITORING", name: "Prometheus", icon_path: "prometheus", icon_type: "webp", proficiency: 90, order: 1 },
      { id: "skill-grafana", category: "MONITORING", name: "Grafana", icon_path: "grafana", icon_type: "svg", proficiency: 92, order: 2 },
      // ENVIRONMENT
      { id: "skill-linux", category: "ENVIRONMENT", name: "Linux", icon_path: "linux", icon_type: "svg", proficiency: 94, order: 1 },
      { id: "skill-ubuntu", category: "ENVIRONMENT", name: "Ubuntu", icon_path: "ubuntu", icon_type: "svg", proficiency: 92, order: 2 },
      { id: "skill-bash", category: "ENVIRONMENT", name: "GNU Bash", icon_path: "bash", icon_type: "svg", proficiency: 90, order: 3 },
      // DEVELOPER TOOLS
      { id: "skill-vscode", category: "DEVELOPER TOOLS", name: "VS Code", icon_path: "vscode", icon_type: "webp", proficiency: 98, order: 1 },
      { id: "skill-jupyter", category: "DEVELOPER TOOLS", name: "Jupyter", icon_path: "jupyter", icon_type: "webp", proficiency: 85, order: 2 }
    ];

    for (const s of defaultSkills) {
      insertSkill.run(s.id, s.category, s.name, s.icon_path, s.icon_type, s.proficiency, `${s.name} technology proficiency`, s.order, now, now, now);
    }
  }

  // Seed Resume Metadata
  const resumeCount = db.prepare("SELECT COUNT(*) as count FROM resume_metadata").get() as { count: number };
  if (resumeCount.count === 0) {
    db.prepare(`
      INSERT INTO resume_metadata (id, file_name, file_path, file_size, is_active, updated_at)
      VALUES (?, ?, ?, ?, 1, ?)
    `).run("resume-primary", "M.S.SUDARSHNA CHAND CV.pdf", "/M.S.SUDARSHNA CHAND CV.pdf", 629626, now);
  }
}

// Automatically initialize schema on import
initDatabase();
