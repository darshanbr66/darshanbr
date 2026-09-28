// Defaults for any field the API / snapshot leaves empty, so the hero,
// navigation and footer never render blank. Real, editable content comes from
// the API (MongoDB) and is managed in the Admin CMS; see ./snapshot.js.
export const fallbackProfile = {
  name: 'Darshan B R',
  role: 'Software Engineer',
  title: 'Full-Stack MERN Developer',
  headline: 'Full-Stack MERN Developer',
  description: 'Building practical web applications with modern technologies.',
  location: 'Bengaluru',
  email: 'darshanbr36@gmail.com',
  availability: '',
  socialLinks: [
    { id: 'github', label: 'GitHub', url: 'https://github.com/darshanbr66' },
    { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/darshan-b-r-94ab92269/' },
    { id: 'email', label: 'Email', url: 'mailto:darshanbr36@gmail.com' },
  ],
}

export const fallbackContent = {
  hero: {
    titleLine1: 'I BUILD DIGITAL',
    titleLine2: 'EXPERIENCES.',
    exploreWorkLabel: 'Explore My Work',
    contactLabel: "Let's Connect",
    scrollLabel: 'Scroll to explore',
  },
  about: { heading: 'About', principles: [] },
  skills: { heading: 'Technology' },
  experience: { heading: 'Experience' },
  projects: { heading: 'Selected Work' },
  contact: { heading: "Let's Build Something." },
  footer: {
    eyebrow: "Let's build something",
    heading: "Have an idea?\nLet's talk.",
    buttonLabel: 'Start a conversation',
  },
}
