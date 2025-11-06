export const sampleResume = {
  basics: {
    avatar: "",
    name: "Vinh Tran",
    title: "Senior Frontend Engineer",
    email: "kkiras.xd@gmail.com",
    location: "Ho Chi Minh city, Vietnam",
    phone: "+84 903 546 538",
    employ: "Available"
  },
  sections: [
    {
      id: "projects",
      kind: "projects",
      title: "Projects",
      items: [
        {
          id: "time-001",
          name: "TikTok Creator Platform",
          role: "Frontend Lead",
          link: "",
          period: "2022/6 - 2023/12",
          description: [
            "React-based analytics and content management platform serving millions of creators",
            "Includes data analytics, content management, and revenue management subsystems",
            "Implemented Redux for state management, enabling efficient handling of complex data flows",
            "Used Ant Design component library to ensure UI consistency and user experience",
            "Implemented code splitting and lazy loading strategies to optimize loading performance"
          ]
        },
        {
          id: "time-003",
          name: "Real-Time Collaboration Tool",
          role: "Frontend Engineer",
          link: "",
          period: "2020/3 - 2020/11",
          description: [
            "Developed a real-time collaborative document editor similar to Google Docs using React and WebSocket",
            "Used CRDTs for conflict-free concurrent editing and implemented autosave functionality",
            "Optimized DOM rendering using virtualized lists and memoization for large documents",
            "Conducted usability testing and implemented accessibility improvements"
          ]
        }
      ]
    },
    {
      id: "education",
      kind: "education",
      title: "Education",
      items: [
        {
          id: "edu-001",
          schoolName: "Stanford University",
          major: "Computer Science",
          degree: "",
          GPA: "",
          start: "9/1/2013",
          end: "6/1/2017",
          description: [
            "Core courses: Data Structures, Algorithms, Operating Systems, Computer Networks, Web Development",
            "Top 5% of class, received Dean's List honors for three consecutive years",
            "Served as Technical Director of the Computer Science Association, organized multiple tech workshops",
            "Contributed to open-source projects, earned GitHub Campus Expert certification"
          ]
        },
        {
          id: "edu-003",
          schoolName: "University of California, Berkeley",
          major: "Software Engineering",
          degree: "Master of Engineering",
          GPA: "3.85/4.0",
          start: "8/1/2018",
          end: "5/1/2020",
          description: [
            "Specialized in frontend performance optimization and UX engineering",
            "Thesis on 'Scalable Design Systems for Web Applications' received departmental distinction",
            "Worked as graduate teaching assistant for Human-Computer Interaction course",
            "Interned at Airbnb, contributing to their internal design system"
          ]
        }
      ]
    },
    {
      id: "experience",
      kind: "experience",
      title: "Experience",
      items: [
        {
          id: "exp-001",
          company: "ByteDance",
          position: "Senior Frontend Engineer",
          period: "2021/7 - Present",
          jobResponsibilities: [
            "Responsible for development and maintenance of TikTok Creator Platform, leading technical solution design for core features",
            "Optimized build configuration, reducing build time from 8 minutes to 2 minutes, improving team development efficiency",
            "Designed and implemented component library, increasing code reuse by 70%, significantly reducing development time",
            "Led performance optimization project, reducing platform first-screen loading time by 50%, integrated APM monitoring system",
            "Mentored junior engineers, organized technical sharing sessions to improve overall team technical capabilities"
          ]
        },
        {
          id: "exp-002",
          company: "Google",
          position: "Frontend Engineer",
          period: "2019/3 - 2021/6",
          jobResponsibilities: [
            "Developed and maintained internal tools for Google Ads team, improving ad performance tracking workflows",
            "Collaborated with backend engineers to build efficient data pipelines and visualizations using React and D3.js",
            "Refactored legacy frontend codebase, reducing technical debt and improving maintainability by 60%",
            "Improved accessibility and compliance with WCAG standards across major UIs",
            "Contributed to design system components used by multiple teams across the company"
          ]
        }
      ]
    },
    {
      id: "skills",
      kind: "skills",
      title: "Skills",
      items: [
        "Frontend Frameworks: React, Vue.js, Next.js, Nuxt.js and other SSR frameworks",
        "Languages: TypeScript, JavaScript(ES6+), HTML5, CSS3",
        "UI/Styling: TailwindCSS, Sass/Less, CSS Modules, Styled-components",
        "State Management: Redux, Vuex, Zustand, Jotai, React Query",
        "Build Tools: Webpack, Vite, Rollup, Babel, ESLint",
        "Testing: Jest, React Testing Library, Cypress",
        "Performance: Browser rendering principles, performance metrics monitoring, code splitting, lazy loading",
        "Version Control: Git, SVN",
        "Technical Leadership: Team management experience, led technology selection and architecture design for large projects"
      ]
    }
  ],
  styles: {
    textColor: "#111827",
    contentFontSize: "16px",
    titleFontSize: "20px",
    subTitleFontSize: "16px",
    lineHeight: 1.5
  },
  __v: 0,
  visibility: "private"
};
