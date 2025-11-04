export const sampleResume = {
	basics: {
		avatar: "",
		name: "Tran Thanh Vinh",
		title: "Senior Frontend Engineer",
		email: "kkiras.xd@gmail.com",
		location: "Ho Chi Minh city, Vietnam",
		phone: "+84 903 546 538",
		employ: "Available",
	},
  	sections: [
		{ id:"education", kind:"education", title:"Education", items:[
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
					"Contributed to open-source projects, earned GitHub Campus Expert certification",					
				],
			},
			{
				id: "edu-002",
				schoolName: "Massachusetts Institute of Technology (MIT)",
				major: "Electrical Engineering and Computer Science",
				degree: "Bachelor of Science",
				GPA: "3.9/4.0",
				start: "9/1/2010",
				end: "6/1/2014",
				description: [
					"Focused on machine learning, embedded systems, and distributed computing",
					"Graduated with High Honors, awarded MIT Undergraduate Research Opportunities Program (UROP) scholarship",
					"Built a distributed file system as a senior thesis project",
					"Co-founded a campus coding club that grew to 200+ active members"
				],
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
				],
			},
  		]},

		{ id:"skills", kind:"skills", title:"Skills", items:[
			"Frontend Frameworks: React, Vue.js, Next.js, Nuxt.js and other SSR frameworks",
			"Languages: TypeScript, JavaScript(ES6+), HTML5, CSS3",
			"UI/Styling: TailwindCSS, Sass/Less, CSS Modules, Styled-components",
			"State Management: Redux, Vuex, Zustand, Jotai, React Query",
			"Build Tools: Webpack, Vite, Rollup, Babel, ESLint",
			"Testing: Jest, React Testing Library, Cypress",
			"Performance: Browser rendering principles, performance metrics monitoring, code splitting, lazy loading",
			"Version Control: Git, SVN",
			"Technical Leadership: Team management experience, led technology selection and architecture design for large projects",
			
		]},

		{ id:"experience", kind:"experience", title:"Experience", items:[
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
			},
			{
				id: "exp-003",
				company: "Amazon",
				position: "Software Development Engineer II",
				period: "2016/9 - 2019/2",
				jobResponsibilities: [
					"Built and maintained UI components for Amazon Prime Video web application",
					"Improved user interaction performance by implementing lazy loading and code splitting techniques",
					"Led migration from AngularJS to React, improving performance and developer experience",
					"Worked closely with product and UX teams to deliver high-impact features on tight deadlines",
					"Implemented unit and integration tests using Jest and React Testing Library to ensure reliability"
				]
			}
			
			
		]},

		{ id:"projects", kind:"projects", title:"Projects", items:[
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
				id: "time-002",
				name: "Developer Dashboard",
				role: "Full Stack Developer",
				link: "",
				period: "2021/1 - 2021/12",
				description: [
					"Built an internal dashboard for managing developer productivity metrics using MERN stack",
					"Integrated GitHub and Jira APIs to visualize commit trends, issue burndown, and sprint velocity",
					"Implemented role-based access control (RBAC) and JWT authentication for secure access",
					"Deployed on AWS EC2 with CI/CD via GitHub Actions and Docker"
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
			},
			{
				id: "time-004",
				name: "API Performance Monitoring Platform",
				role: "Software Engineer",
				link: "",
				period: "2019/5 - 2019/12",
				description: [
					"Built a tool to monitor API response times, error rates, and throughput in real time",
					"Backend built with Node.js and Express; frontend with React and Chart.js for data visualization",
					"Implemented alerting system integrated with Slack and email",
					"Designed scalable architecture using microservices and message queues (RabbitMQ)"
				]
			}
    	]},
 	]
};
