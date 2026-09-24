// SVG Logos
import dockerSvg from '../assets/logos/svg/docker.svg';
import gitSvg from '../assets/logos/svg/git.svg';
import githubActionsSvg from '../assets/logos/svg/Github-Actions--Streamline-Svg-Logos.svg';
import githubSvg from '../assets/logos/svg/github.svg';
import gitlabSvg from '../assets/logos/svg/gitlab.svg';
import bashSvg from '../assets/logos/svg/gnu_bash-official.svg';
import grafanaSvg from '../assets/logos/svg/grafana.svg';
import kubernetesSvg from '../assets/logos/svg/kubernetes.svg';
import linuxSvg from '../assets/logos/svg/linux.svg';
import ubuntuSvg from '../assets/logos/svg/ubuntu.svg';
import cssSvg from '../assets/logos/svg/w3_css-official.svg';
import cloudWatchSvg from '../assets/logos/svg/CloudWatch.svg';
import ec2Svg from '../assets/logos/svg/EC2.svg';
import terraformSvg from '../assets/logos/svg/HashiCorp Terraform.svg';
import iamSvg from '../assets/logos/svg/IAM Identity Center.svg';
import rdsSvg from '../assets/logos/svg/RDS.svg';
import s3Svg from '../assets/logos/svg/Simple Storage Service.svg';
import nodejsSvg from '../assets/logos/svg/nodejs-icon-svgrepo-com.svg';

// WebP Logos
import awsWebp from '../assets/logos/webp/Amazon_Web_Services_Logo.svg.webp';
import ansibleWebp from '../assets/logos/webp/Ansible_logo.svg.webp';
import html5Webp from '../assets/logos/webp/HTML5_logo_and_wordmark.svg.webp';
import jenkinsWebp from '../assets/logos/webp/Jenkins_logo.svg.webp';
import jupyterWebp from '../assets/logos/webp/Jupyter_logo.svg.webp';
import prometheusWebp from '../assets/logos/webp/Prometheus_software_logo.svg.webp';
import reactWebp from '../assets/logos/webp/React-icon.svg.webp';
import jsWebp from '../assets/logos/webp/Unofficial_JavaScript_logo_2.svg.webp';
import vscodeWebp from '../assets/logos/webp/Visual_Studio_Code_1.35_icon.svg.webp';
import pythonSvg from '../assets/logos/svg/python-svgrepo-com.svg';
import javaPng from '../assets/logos/Java.png';
import mongoDbPng from '../assets/logos/MongoDB.png';
import mysqlPng from '../assets/logos/MySQL.png';

export interface SkillItem {
  id: string;
  name: string;
  src: string;
  alt: string;
  invertDark?: boolean;
}

export interface SkillCategory {
  id: string;
  title: string;
  items: SkillItem[];
}

export const skillCategories: SkillCategory[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    items: [
      { id: 'html5', name: 'HTML5', src: html5Webp, alt: 'HTML5' },
      { id: 'css3', name: 'CSS3', src: cssSvg, alt: 'CSS3' },
      { id: 'react', name: 'React', src: reactWebp, alt: 'React' }
    ]
  },
  {
    id: 'backend',
    title: 'Backend',
    items: [
      { id: 'javascript', name: 'JavaScript', src: jsWebp, alt: 'JavaScript' },
      { id: 'nodejs', name: 'Node.js', src: nodejsSvg, alt: 'Node.js' },
      { id: 'python', name: 'Python', src: pythonSvg, alt: 'Python' },
      { id: 'java', name: 'Java', src: javaPng, alt: 'Java' }
    ]
  },
  {
    id: 'database',
    title: 'Database',
    items: [
      { id: 'mongodb', name: 'MongoDB', src: mongoDbPng, alt: 'MongoDB' },
      { id: 'mysql', name: 'MySQL', src: mysqlPng, alt: 'MySQL' }
    ]
  },
  {
    id: 'devops',
    title: 'DevOps',
    items: [
      { id: 'docker', name: 'Docker', src: dockerSvg, alt: 'Docker' },
      { id: 'kubernetes', name: 'Kubernetes', src: kubernetesSvg, alt: 'Kubernetes' },
      { id: 'jenkins', name: 'Jenkins', src: jenkinsWebp, alt: 'Jenkins' },
      { id: 'github-actions', name: 'GitHub Actions', src: githubActionsSvg, alt: 'GitHub Actions' },
      { id: 'terraform', name: 'Terraform', src: terraformSvg, alt: 'Terraform' },
      { id: 'ansible', name: 'Ansible', src: ansibleWebp, alt: 'Ansible', invertDark: true }
    ]
  },
  {
    id: 'aws',
    title: 'AWS',
    items: [
      { id: 'aws-platform', name: 'AWS', src: awsWebp, alt: 'AWS', invertDark: true },
      { id: 'aws-ec2', name: 'Amazon EC2', src: ec2Svg, alt: 'Amazon EC2' },
      { id: 'aws-s3', name: 'Amazon S3', src: s3Svg, alt: 'Amazon S3' },
      { id: 'aws-rds', name: 'Amazon RDS', src: rdsSvg, alt: 'Amazon RDS' },
      { id: 'aws-cloudwatch', name: 'Amazon CloudWatch', src: cloudWatchSvg, alt: 'Amazon CloudWatch' },
      { id: 'aws-iam', name: 'AWS IAM', src: iamSvg, alt: 'AWS IAM Identity Center' }
    ]
  },
  {
    id: 'git',
    title: 'Git',
    items: [
      { id: 'git', name: 'Git', src: gitSvg, alt: 'Git' },
      { id: 'github', name: 'GitHub', src: githubSvg, alt: 'GitHub', invertDark: true },
      { id: 'gitlab', name: 'GitLab', src: gitlabSvg, alt: 'GitLab' }
    ]
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    items: [
      { id: 'prometheus', name: 'Prometheus', src: prometheusWebp, alt: 'Prometheus' },
      { id: 'grafana', name: 'Grafana', src: grafanaSvg, alt: 'Grafana' }
    ]
  },
  {
    id: 'environment',
    title: 'Environment',
    items: [
      { id: 'linux', name: 'Linux', src: linuxSvg, alt: 'Linux' },
      { id: 'ubuntu', name: 'Ubuntu', src: ubuntuSvg, alt: 'Ubuntu' },
      { id: 'bash', name: 'GNU Bash', src: bashSvg, alt: 'GNU Bash' }
    ]
  },
  {
    id: 'developer-tools',
    title: 'Developer Tools',
    items: [
      { id: 'vscode', name: 'VS Code', src: vscodeWebp, alt: 'VS Code' },
      { id: 'jupyter', name: 'Jupyter', src: jupyterWebp, alt: 'Jupyter Notebook' }
    ]
  }
];

// Backwards-compatible export
export const categorizedLogos = skillCategories.map(cat => ({
  category: cat.title.toUpperCase(),
  items: cat.items.map(item => ({
    src: item.src,
    alt: item.name,
    title: item.name
  }))
}));
