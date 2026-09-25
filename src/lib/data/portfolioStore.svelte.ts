import { skillCategories as defaultSkillCategories, type SkillCategory } from "./logos";
export type { SkillCategory };

// SVG Logos for default projects
import gitSvg from "../assets/logos/svg/git.svg";
import githubSvg from "../assets/logos/svg/github.svg";
import jenkinsWebp from "../assets/logos/webp/Jenkins_logo.svg.webp";
import dockerSvg from "../assets/logos/svg/docker.svg";
import kubernetesSvg from "../assets/logos/svg/kubernetes.svg";
import terraformSvg from "../assets/logos/svg/HashiCorp Terraform.svg";
import prometheusWebp from "../assets/logos/webp/Prometheus_software_logo.svg.webp";
import grafanaSvg from "../assets/logos/svg/grafana.svg";
import pythonSvg from "../assets/logos/svg/python-svgrepo-com.svg";
import ec2Svg from "../assets/logos/svg/EC2.svg";
import linuxSvg from "../assets/logos/svg/linux.svg";
import githubActionsSvg from "../assets/logos/svg/Github-Actions--Streamline-Svg-Logos.svg";
import cloudflareSvg from "../assets/logos/svg/cloudflare.svg";

export interface ProjectTool {
  name: string;
  icon?: string;
  invertDark?: boolean;
}

export interface ProjectItem {
  id: string;
  number: string;
  tag: string;
  title: string;
  bullets: string[];
  tools: ProjectTool[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface HeroData {
  greeting: string;
  name: string;
  role: string;
  subtitle: string;
  availability: string;
  resumeUrl: string;
  resumeFileName: string;
}

export interface AboutData {
  sectionLabel: string;
  headingText: string;
  p1Text: string;
  p2Text: string;
  p3Text: string;
  techBadges: string[];
}

export interface ExperienceRecord {
  id: string;
  type: "internship" | "achievement";
  year: string;
  number: string;
  title: string;
  organization: string;
  duration?: string;
  category?: string;
  project?: string;
  description?: string;
  date?: string;
  certName: string;
  certFile: string;
  fileType: "image" | "pdf";
}

export interface EducationRecord {
  id: string;
  degree: string;
  institution: string;
  location: string;
  start_year: string;
  end_year: string;
  status_label: string;
  branch: string;
  cgpa: string;
  description: string;
  display_order: number;
}

export interface InquiryItem {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

export interface ThemeSettings {
  silkColor: string;
  silkSpeed: number;
  silkScale: number;
  silkNoise: number;
  silkRotation: number;
  accentColor: string;
}

const STORAGE_KEY = "portfolio_cms_data_v1";

const initialHero: HeroData = {
  greeting: "HI, I AM",
  name: "SUDARSHNA CHAND M S",
  role: "DevOps Engineer",
  subtitle: "Final-year Computer Science student passionate about building resilient, automated CI/CD pipelines, container orchestration, and cloud infrastructure.",
  availability: "Available for DevOps & SRE Opportunities",
  resumeUrl: "/M.S.SUDARSHNA CHAND CV.pdf",
  resumeFileName: "M.S.SUDARSHNA CHAND CV.pdf"
};

const initialAbout: AboutData = {
  sectionLabel: "ABOUT ME",
  headingText: "Building, Automating, and Improving Systems.",
  p1Text: "I’m a final-year Computer Science and Engineering student with a strong interest in DevOps, cloud infrastructure, automation, and continuous delivery.",
  p2Text: "I enjoy building reliable and scalable systems using technologies such as Linux, Git, Docker, Jenkins, Kubernetes, Terraform, and AWS. I’m particularly interested in automating development and deployment workflows and improving system reliability through monitoring and observability.",
  p3Text: "I’m continuously learning new technologies, working on practical projects, and developing my skills to become a professional DevOps Engineer.",
  techBadges: [
    "Linux",
    "Git",
    "Docker",
    "Jenkins",
    "Kubernetes",
    "Terraform",
    "AWS",
    "CI/CD Workflows",
    "Observability"
  ]
};

const initialProjects: ProjectItem[] = [
  {
    id: "project-1",
    number: "01",
    tag: "CI/CD & CLOUD-NATIVE DEPLOYMENT",
    title: "End-to-End DevOps CI/CD Pipeline & Cloud-Native Deployment",
    bullets: [
      "Built and automated an end-to-end CI/CD pipeline for a Flask web application using GitHub, Jenkins, Docker, and Kubernetes.",
      "Automated source checkout, dependency installation, unit testing, Docker image build, Docker Hub push, and Kubernetes deployment through Jenkins.",
      "Provisioned Kubernetes infrastructure using Terraform (Infrastructure as Code) and implemented containerized application deployment with scalable replicas.",
      "Integrated Prometheus and Grafana for application metrics, monitoring, and observability; configured GitHub Webhooks for automated pipeline triggering."
    ],
    tools: [
      { name: "Git", icon: gitSvg },
      { name: "GitHub", icon: githubSvg, invertDark: true },
      { name: "Jenkins", icon: jenkinsWebp },
      { name: "Docker", icon: dockerSvg },
      { name: "Docker Hub", icon: dockerSvg },
      { name: "Kubernetes", icon: kubernetesSvg },
      { name: "Terraform", icon: terraformSvg },
      { name: "Prometheus", icon: prometheusWebp },
      { name: "Grafana", icon: grafanaSvg },
      { name: "Python Flask", icon: pythonSvg },
      { name: "Cloudflare Tunnel", icon: cloudflareSvg }
    ],
    githubUrl: "https://github.com/SUDARSHNACHAND",
    liveUrl: ""
  },
  {
    id: "project-2",
    number: "02",
    tag: "AWS CLOUD & AUTOMATED CI/CD",
    title: "Automated CI/CD Deployment Using GitHub, Jenkins, Docker & AWS",
    bullets: [
      "Pushed application code to GitHub for version control and source management.",
      "Configured Jenkins CI/CD pipeline to automatically build and test the application.",
      "Created and managed Docker images to containerize the application.",
      "Deployed the Docker container on AWS EC2 for automated application delivery."
    ],
    tools: [
      { name: "GitHub", icon: githubSvg, invertDark: true },
      { name: "Jenkins", icon: jenkinsWebp },
      { name: "CI/CD", icon: githubActionsSvg },
      { name: "Docker", icon: dockerSvg },
      { name: "AWS EC2", icon: ec2Svg },
      { name: "Linux", icon: linuxSvg }
    ],
    githubUrl: "https://github.com/SUDARSHNACHAND",
    liveUrl: ""
  }
];

export const toolIconsMap: Record<string, { icon: string; invertDark?: boolean }> = {
  git: { icon: gitSvg },
  github: { icon: githubSvg, invertDark: true },
  jenkins: { icon: jenkinsWebp },
  docker: { icon: dockerSvg },
  "docker hub": { icon: dockerSvg },
  kubernetes: { icon: kubernetesSvg },
  k8s: { icon: kubernetesSvg },
  terraform: { icon: terraformSvg },
  prometheus: { icon: prometheusWebp },
  grafana: { icon: grafanaSvg },
  python: { icon: pythonSvg },
  "python flask": { icon: pythonSvg },
  flask: { icon: pythonSvg },
  cloudflare: { icon: cloudflareSvg },
  "cloudflare tunnel": { icon: cloudflareSvg },
  "aws ec2": { icon: ec2Svg },
  ec2: { icon: ec2Svg },
  aws: { icon: ec2Svg },
  linux: { icon: linuxSvg },
  "ci/cd": { icon: githubActionsSvg },
  "github actions": { icon: githubActionsSvg }
};

export function enrichProjectTools(projectsList: ProjectItem[]): ProjectItem[] {
  return projectsList.map((project) => ({
    ...project,
    tools: (project.tools || []).map((tool) => {
      const key = tool.name.toLowerCase().trim();
      const meta = toolIconsMap[key];
      return {
        ...tool,
        icon: (tool.icon && tool.icon.length > 5 && !tool.icon.includes("undefined"))
          ? tool.icon
          : (meta?.icon || gitSvg),
        invertDark: typeof tool.invertDark === "boolean" ? tool.invertDark : (meta?.invertDark ?? false)
      };
    })
  }));
}

const initialTheme: ThemeSettings = {
  silkColor: "#FF8A4C",
  silkSpeed: 5,
  silkScale: 1.1,
  silkNoise: 1.5,
  silkRotation: 0.2,
  accentColor: "#00f0ff"
};

const initialInquiries: InquiryItem[] = [
  {
    id: "inq-1",
    name: "Alex Rivera",
    email: "alex.rivera@techcloud.io",
    message: "Hi Sudarshan, I was impressed by your Kubernetes & Terraform CI/CD setup. We are looking for a DevOps Junior Engineer. Are you available for a brief discussion?",
    timestamp: "2026-09-23 16:45",
    read: false
  }
];

const defaultExperiences: ExperienceRecord[] = [
  {
    id: "exp-1",
    type: "internship",
    year: "2024",
    number: "01",
    title: "IoT / INTERNET OF THINGS",
    organization: "Imbed Software · Karaikudi",
    duration: "01 MAR — 08 MAR 2024",
    category: "Internet of Things",
    description: "Internship Training",
    certName: "IoT / Internet of Things Certification — Imbed Software",
    certFile: "/certification/2024.jpeg",
    fileType: "image"
  },
  {
    id: "exp-2",
    type: "internship",
    year: "2025",
    number: "02",
    title: "ARTIFICIAL INTELLIGENCE",
    organization: "SD Pro Solutions",
    duration: "18 JUN — 02 JUL 2025",
    category: "Artificial Intelligence",
    description: "Internship Training Program",
    certName: "Artificial Intelligence Internship Certification — SD Pro Solutions",
    certFile: "/certification/2025.jpeg",
    fileType: "image"
  },
  {
    id: "exp-3",
    type: "internship",
    year: "2026",
    number: "03",
    title: "UI / UX DESIGN",
    organization: "Approtech R&D Solutions Pvt. Ltd.",
    duration: "05 JUN — 06 JUL 2026",
    category: "UI / UX Design",
    project: "SkyLink — Smart Airport Experience",
    description: "Internship Program",
    certName: "UI/UX Design Certification: SkyLink Smart Airport Experience — Approtech R&D",
    certFile: "/certification/2026.jpeg",
    fileType: "image"
  },
  {
    id: "exp-4",
    type: "achievement",
    year: "2024",
    number: "02",
    title: "SECOND PRIZE",
    organization: "INNOVITA 2K24",
    category: "Paper Presentation",
    description: "State Level Symposium",
    project: "Alagappa Chettiar Government College of Engineering and Technology",
    date: "12 JUN 2024",
    certName: "Second Prize in Paper Presentation — INNOVITA 2K24, ACGCET Karaikudi",
    certFile: "/certification/acgcet-cf.pdf",
    fileType: "pdf"
  }
];

const defaultEducation: EducationRecord[] = [
  {
    id: "edu-1",
    degree: "B.E. Computer Science & Engineering",
    institution: "Mount Zion College of Engineering and Technology",
    location: "Pudukkottai",
    start_year: "2023",
    end_year: "2027",
    status_label: "Pursuing",
    branch: "CSE",
    cgpa: "7.40 / 10",
    description: "Focused on Cloud Computing, Operating Systems, Computer Networks, and Distributed Systems.",
    display_order: 1
  },
  {
    id: "edu-2",
    degree: "Higher Secondary Certificate (Class XII)",
    institution: "Maharishi Vidya Mandir Higher Secondary School",
    location: "Karaikudi",
    start_year: "2021",
    end_year: "2023",
    status_label: "Completed",
    branch: "Bio-Maths / Science",
    cgpa: "63.67%",
    description: "Completed higher secondary education with strong foundations in Mathematics and Physical Sciences.",
    display_order: 2
  }
];

class PortfolioStore {
  hero = $state<HeroData>({ ...initialHero });
  about = $state<AboutData>({ ...initialAbout });
  projects = $state<ProjectItem[]>([...initialProjects]);
  skills = $state<SkillCategory[]>([...defaultSkillCategories]);
  experience = $state<ExperienceRecord[]>([...defaultExperiences]);
  education = $state<EducationRecord[]>([...defaultEducation]);
  theme = $state<ThemeSettings>({ ...initialTheme });
  inquiries = $state<InquiryItem[]>([...initialInquiries]);
  isLoaded = $state(false);

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.hero) this.hero = parsed.hero;
        if (parsed.about) this.about = parsed.about;
        if (parsed.projects && Array.isArray(parsed.projects)) {
          this.projects = enrichProjectTools(parsed.projects);
        }
        if (parsed.skills) this.skills = parsed.skills;
        if (parsed.experience && Array.isArray(parsed.experience)) {
          this.experience = parsed.experience;
        }
        if (parsed.education && Array.isArray(parsed.education)) {
          this.education = parsed.education;
        }
        if (parsed.theme) this.theme = { ...initialTheme, ...parsed.theme };
        if (parsed.inquiries) this.inquiries = parsed.inquiries;
      }
    } catch (e) {
      console.error("Failed to load portfolio state from storage:", e);
    }
    this.isLoaded = true;
    this.syncWithPublishedContent();
  }

  async syncWithPublishedContent() {
    if (typeof window === "undefined") return;
    try {
      const res = await fetch("/api/content/published");
      if (res.ok) {
        const data = await res.json();
        if (data.home) {
          this.hero = {
            ...this.hero,
            greeting: data.home.hero_label || this.hero.greeting,
            name: data.home.name || this.hero.name,
            role: data.home.role || this.hero.role,
            subtitle: data.home.description || this.hero.subtitle,
            resumeUrl: data.home.resume_url || this.hero.resumeUrl,
            resumeFileName: data.home.resume_file_name || this.hero.resumeFileName
          };
        }
        if (data.about) {
          this.about = {
            ...this.about,
            sectionLabel: data.about.section_label || this.about.sectionLabel,
            headingText: data.about.heading || this.about.headingText,
            p1Text: data.about.bio_p1 || this.about.p1Text,
            p2Text: data.about.bio_p2 || this.about.p2Text,
            p3Text: data.about.bio_p3 || this.about.p3Text,
            techBadges: Array.isArray(data.about.tech_badges) ? data.about.tech_badges : this.about.techBadges
          };
        }
        if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
          this.projects = enrichProjectTools(
            data.projects.map((p: Record<string, unknown>) => ({
              id: String(p.id),
              number: String(p.project_number || "01"),
              tag: String(p.tag || ""),
              title: String(p.title || ""),
              bullets: Array.isArray(p.bullets) ? p.bullets : [],
              tools: Array.isArray(p.tools) ? p.tools : [],
              githubUrl: String(p.github_url || ""),
              liveUrl: String(p.live_url || "")
            }))
          );
        }
        if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
          this.experience = data.experience.map((e: Record<string, unknown>, idx: number) => {
            const certUrl = (e.certificate_url as string) || "";
            const isPdf = certUrl.toLowerCase().endsWith(".pdf");
            const duration = e.start_date && e.end_date
              ? `${e.start_date} — ${e.end_date}`
              : (e.start_date || e.end_date || (e.year ? String(e.year) : ""));
            return {
              id: String(e.id || `exp-${idx}`),
              type: (e.type === "achievement" ? "achievement" : "internship") as "internship" | "achievement",
              year: String(e.year || "2024"),
              number: String(idx + 1).padStart(2, "0"),
              title: String(e.title || ""),
              organization: String(e.company || ""),
              duration: duration,
              category: String(e.type === "achievement" ? (e.description || "Achievement") : (e.title || "Internship")),
              description: String(e.description || ""),
              certName: `${e.title || "Experience"} Certification`,
              certFile: certUrl,
              fileType: isPdf ? ("pdf" as const) : ("image" as const)
            };
          });
        }
        if (data.education && Array.isArray(data.education) && data.education.length > 0) {
          this.education = data.education.map((edu: Record<string, unknown>) => ({
            id: String(edu.id),
            degree: String(edu.degree || ""),
            institution: String(edu.institution || ""),
            location: String(edu.location || ""),
            start_year: String(edu.start_year || ""),
            end_year: String(edu.end_year || ""),
            status_label: String(edu.status_label || ""),
            branch: String(edu.branch || ""),
            cgpa: String(edu.cgpa || ""),
            description: String(edu.description || ""),
            display_order: Number(edu.display_order || 0)
          }));
        }
      }
    } catch (e) {
      console.warn("Could not sync with published backend content:", e);
    }
  }

  save() {
    if (typeof window === "undefined") return;
    try {
      const data = {
        hero: this.hero,
        about: this.about,
        projects: this.projects,
        skills: this.skills,
        experience: this.experience,
        education: this.education,
        theme: this.theme,
        inquiries: this.inquiries
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save portfolio state to storage:", e);
    }
  }

  // --- HERO METHODS ---
  updateHero(partial: Partial<HeroData>) {
    this.hero = { ...this.hero, ...partial };
    this.save();
  }

  // --- ABOUT METHODS ---
  updateAbout(partial: Partial<AboutData>) {
    this.about = { ...this.about, ...partial };
    this.save();
  }

  addTechBadge(badge: string) {
    const clean = badge.trim();
    if (!clean || this.about.techBadges.includes(clean)) return;
    this.about.techBadges = [...this.about.techBadges, clean];
    this.save();
  }

  removeTechBadge(badge: string) {
    this.about.techBadges = this.about.techBadges.filter((b) => b !== badge);
    this.save();
  }

  // --- PROJECT METHODS (Add, Delete, Update) ---
  addProject(project: Omit<ProjectItem, "id" | "number">) {
    const nextNumber = String(this.projects.length + 1).padStart(2, "0");
    const newProject: ProjectItem = {
      ...project,
      id: `project-${Date.now()}`,
      number: nextNumber
    };
    this.projects = enrichProjectTools([...this.projects, newProject]);
    this.save();
    return newProject;
  }

  updateProject(id: string, updated: Partial<ProjectItem>) {
    this.projects = this.projects.map((p) => {
      if (p.id === id) {
        return { ...p, ...updated };
      }
      return p;
    });
    this.projects = enrichProjectTools(this.projects);
    this.save();
  }

  deleteProject(id: string) {
    this.projects = this.projects
      .filter((p) => p.id !== id)
      .map((p, idx) => ({
        ...p,
        number: String(idx + 1).padStart(2, "0")
      }));
    this.save();
  }

  // --- SKILL METHODS (Add, Delete, Update) ---
  addSkillToCategory(categoryId: string, name: string) {
    const cleanName = name.trim();
    if (!cleanName) return;
    const item = {
      id: `skill-${Date.now()}`,
      name: cleanName,
      src: "",
      alt: cleanName
    };
    this.skills = this.skills.map((cat) => {
      if (cat.id === categoryId) {
        return { ...cat, items: [...cat.items, item] };
      }
      return cat;
    });
    this.save();
  }

  removeSkillFromCategory(categoryId: string, skillId: string) {
    this.skills = this.skills.map((cat) => {
      if (cat.id === categoryId) {
        return { ...cat, items: cat.items.filter((s) => s.id !== skillId) };
      }
      return cat;
    });
    this.save();
  }

  addSkillCategory(title: string) {
    const clean = title.trim();
    if (!clean) return;
    const newCat: SkillCategory = {
      id: `cat-${Date.now()}`,
      title: clean,
      items: []
    };
    this.skills = [...this.skills, newCat];
    this.save();
  }

  deleteSkillCategory(categoryId: string) {
    this.skills = this.skills.filter((cat) => cat.id !== categoryId);
    this.save();
  }

  // --- INQUIRIES METHODS ---
  addInquiry(item: Omit<InquiryItem, "id" | "timestamp" | "read">) {
    const newInquiry: InquiryItem = {
      ...item,
      id: `inq-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      read: false
    };
    this.inquiries = [newInquiry, ...this.inquiries];
    this.save();
  }

  deleteInquiry(id: string) {
    this.inquiries = this.inquiries.filter((inq) => inq.id !== id);
    this.save();
  }

  markInquiryRead(id: string) {
    this.inquiries = this.inquiries.map((inq) =>
      inq.id === id ? { ...inq, read: true } : inq
    );
    this.save();
  }

  // --- THEME SETTINGS ---
  updateTheme(partial: Partial<ThemeSettings>) {
    this.theme = { ...this.theme, ...partial };
    this.save();
  }

  resetToDefaults() {
    this.hero = { ...initialHero };
    this.about = { ...initialAbout };
    this.projects = [...initialProjects];
    this.skills = [...defaultSkillCategories];
    this.theme = { ...initialTheme };
    this.save();
  }
}

export const portfolioStore = new PortfolioStore();
