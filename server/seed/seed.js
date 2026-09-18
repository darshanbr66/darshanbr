require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const Project = require('../models/Project')
const SkillCategory = require('../models/Skill')
const Experience = require('../models/Experience')

const projects = [
  {
    slug: 'patent-claim-formatter',
    number: '01',
    title: 'Patent Claim Formatter',
    category: 'Full-Stack Tool',
    year: '2025',
    description:
      'A tool for structuring and formatting patent claims according to standard drafting conventions, reducing manual formatting effort.',
    problem:
      'Patent drafting requires strict, repetitive formatting of claim hierarchies that is tedious and error-prone when done manually.',
    solution:
      'Built a MERN application that parses claim text, applies consistent numbering and indentation rules, and lets users edit and export structured claims.',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    features: [
      'Automatic claim numbering and dependency detection',
      'Structured editing interface for claim hierarchies',
      'Exportable, consistently formatted output',
    ],
    architecture: ['React Client', 'Express REST API', 'Node.js Service Layer', 'MongoDB'],
    image: '/projects/patent-claim-formatter.svg',
    featured: true,
  },
  {
    slug: 'ai-recruitment-platform',
    number: '02',
    title: 'AI Recruitment Platform',
    category: 'Full-Stack Application',
    year: '2025',
    description:
      'A recruitment platform that streamlines candidate screening and matching workflows for hiring teams.',
    problem: 'Manual resume screening is slow and inconsistent across large candidate pools.',
    solution:
      'Developed a MERN-based platform with structured candidate profiles, role-based access, and a workflow for reviewing and shortlisting applicants.',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
    features: [
      'Role-based authentication for recruiters and admins',
      'Structured candidate profile and job data models',
      'Searchable, filterable candidate pipelines',
    ],
    architecture: ['React Client', 'Express REST API', 'JWT Auth Middleware', 'MongoDB'],
    image: '/projects/ai-recruitment-platform.svg',
    featured: true,
  },
  {
    slug: 'medical-image-dashboard',
    number: '03',
    title: 'Medical Image Prediction Dashboard',
    category: 'Full-Stack Dashboard',
    year: '2024',
    description:
      'A dashboard for uploading medical images and reviewing model-generated predictions in a structured clinical workflow view.',
    problem:
      'Reviewing prediction outputs alongside source images needed a clear, centralized interface for clinical staff.',
    solution:
      'Built a MERN dashboard that handles image upload, stores prediction metadata in MongoDB, and visualizes results with clear status indicators.',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Python'],
    features: [
      'Image upload and metadata storage pipeline',
      'Prediction result visualization',
      'Status tracking across review stages',
    ],
    architecture: ['React Client', 'Express REST API', 'Python Prediction Service', 'MongoDB'],
    image: '/projects/medical-image-dashboard.svg',
    featured: true,
  },
  {
    slug: 'productivity-suite',
    number: '04',
    title: 'Team Productivity Application',
    category: 'Full-Stack Application',
    year: '2024',
    description:
      'A task and project tracking application built to help small teams coordinate work and track progress.',
    problem: 'Small teams needed a lightweight, focused tool without the overhead of large project management platforms.',
    solution:
      'Created a MERN application with boards, tasks, and real-time-feeling updates backed by a clean REST API and MongoDB data models.',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'React Router'],
    features: [
      'Board and task management with drag interactions',
      'Persistent state via REST API and MongoDB',
      'Responsive layout for desktop and mobile use',
    ],
    architecture: ['React Client', 'Express REST API', 'MongoDB'],
    image: '/projects/productivity-suite.svg',
    featured: false,
  },
]

const skillCategories = [
  { categoryId: 'frontend', label: 'Frontend', order: 1, skills: ['React.js', 'JavaScript', 'Tailwind CSS', 'React Router'] },
  { categoryId: 'backend', label: 'Backend', order: 2, skills: ['Node.js', 'Express.js', 'REST APIs', 'JWT Authentication'] },
  { categoryId: 'database', label: 'Database', order: 3, skills: ['MongoDB'] },
  { categoryId: 'tooling', label: 'Tooling & Practice', order: 4, skills: ['Git', 'GitHub', 'CI/CD', 'Scrum'] },
  {
    categoryId: 'foundations',
    label: 'Foundations',
    order: 5,
    skills: ['Data Structures & Algorithms', 'Cloud Fundamentals', 'Python', 'WordPress'],
  },
]

const experience = [
  {
    role: 'Software Engineer',
    company: 'Sigvitas Private Limited',
    location: 'Bengaluru, Karnataka',
    period: 'November 2024 — Present',
    current: true,
    order: 1,
    summary:
      'Building and maintaining full-stack web applications using the MERN stack within an agile engineering team.',
    responsibilities: [
      'Developing responsive front-end interfaces with React.js and Tailwind CSS',
      'Building and maintaining REST APIs with Node.js and Express.js',
      'Designing and managing MongoDB data models for application features',
      'Implementing authentication flows using JWT',
      'Collaborating in Scrum ceremonies — sprint planning, standups and reviews',
      'Participating in code reviews and CI/CD driven deployments',
    ],
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'JWT', 'Git'],
  },
]

async function seed() {
  await connectDB()

  await Promise.all([Project.deleteMany({}), SkillCategory.deleteMany({}), Experience.deleteMany({})])

  await Project.insertMany(projects)
  await SkillCategory.insertMany(skillCategories)
  await Experience.insertMany(experience)

  console.log('Seed complete:', {
    projects: projects.length,
    skillCategories: skillCategories.length,
    experience: experience.length,
  })

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
