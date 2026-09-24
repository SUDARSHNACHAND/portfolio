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
import { saveContentToSupabase, loadContentFromSupabase } from "../supabaseClient";

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
  greeting: "Hello, I'm",
  name: "Sudarshan Chand",
  role: "DevOps & Cloud Engineer",
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

class PortfolioStore {
  hero = $state<HeroData>({ ...initialHero });
  about = $state<AboutData>({ ...initialAbout });
  projects = $state<ProjectItem[]>([...initialProjects]);
  skills = $state<SkillCategory[]>([...defaultSkillCategories]);
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
        if (parsed.projects) {
          // Merge tools with default icons if icon missing
          this.projects = parsed.projects;
        }
        if (parsed.skills) this.skills = parsed.skills;
        if (parsed.theme) this.theme = { ...initialTheme, ...parsed.theme };
        if (parsed.inquiries) this.inquiries = parsed.inquiries;
      }
    } catch (e) {
      console.error("Failed to load portfolio CMS state from storage:", e);
    }
    this.isLoaded = true;
    this.fetchBackendSync();
  }

  save() {
    if (typeof window === "undefined") return;
    try {
      const data = {
        hero: this.hero,
        about: this.about,
        projects: this.projects,
        skills: this.skills,
        theme: this.theme,
        inquiries: this.inquiries
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.syncToBackend(data);
    } catch (e) {
      console.error("Failed to save portfolio CMS state to storage:", e);
    }
  }

  private async fetchBackendSync() {
    try {
      const res = await fetch("/api/admin/content");
      if (res.ok) {
        const data = await res.json();
        if (data.hero) this.hero = { ...this.hero, ...data.hero };
        if (data.about) this.about = { ...this.about, ...data.about };
        if (data.projects && Array.isArray(data.projects)) this.projects = data.projects;
        if (data.skills && Array.isArray(data.skills)) this.skills = data.skills;
        if (data.theme) this.theme = { ...this.theme, ...data.theme };
        if (data.inquiries && Array.isArray(data.inquiries)) this.inquiries = data.inquiries;
        return;
      }
    } catch {
      // Local dev server unavailable
    }

    try {
      const cloudData = await loadContentFromSupabase("main");
      if (cloudData) {
        if (cloudData.hero) this.hero = { ...this.hero, ...(cloudData.hero as any) };
        if (cloudData.about) this.about = { ...this.about, ...(cloudData.about as any) };
        if (cloudData.projects && Array.isArray(cloudData.projects)) this.projects = cloudData.projects as any;
        if (cloudData.skills && Array.isArray(cloudData.skills)) this.skills = cloudData.skills as any;
        if (cloudData.theme) this.theme = { ...this.theme, ...(cloudData.theme as any) };
      }
    } catch {
      // Offline fallback
    }
  }

  private async syncToBackend(data: any) {
    try {
      const token = localStorage.getItem("admin_token");
      await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(data)
      });
    } catch {
      // Offline
    }

    try {
      await saveContentToSupabase("main", data);
    } catch {
      // Supabase unconfigured or offline
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
    this.projects = [...this.projects, newProject];
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
