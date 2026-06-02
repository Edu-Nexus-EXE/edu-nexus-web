/**
 * Mock data for Sprint 2 features.
 *
 * These match the UI types defined in sprint2-api.ts (GapAnalysisSkillView,
 * RoadmapView, CareerTrackView, etc.) and are used by:
 *  1. MSW handlers  — so API calls return realistic data during dev
 *  2. Feature lib fallback — in case MSW is not active
 *
 * ⚠️  When the real swagger spec is available, re-run `npm run orval` and
 *     these handlers will be auto-generated with Faker data.  Until then,
 *     this file keeps Sprint 2 UI pages functional.
 */

export const MOCK_GAP_ANALYSIS_SKILLS = [
  {
    id: 'docker',
    name: 'Docker',
    icon: 'token',
    status: 'missing',
    current: 'None',
    required: 'Intermediate',
    priorityScore: 8,
    hasPriority: true,
    reason: 'Containerization experience is required for this role. No evidence found in your CV.',
    tags: ['Containerization', 'Microservices'],
  },
  {
    id: 'cicd',
    name: 'CI/CD',
    icon: 'alt_route',
    status: 'missing',
    current: 'None',
    required: 'Basic',
    priorityScore: 7,
    hasPriority: true,
    reason: 'CI/CD pipeline experience is essential for DevOps roles.',
    tags: ['GitHub Actions', 'Jenkins'],
  },
  {
    id: 'sql',
    name: 'SQL',
    icon: 'database',
    status: 'upgrade',
    current: 'Basic',
    required: 'Intermediate',
    priorityScore: 6,
    hasPriority: true,
    reason: 'You have SQL knowledge but need to reach intermediate level with query tuning.',
    tags: ['PostgreSQL', 'Query Tuning'],
  },
  {
    id: 'java_oop',
    name: 'Java OOP',
    icon: 'code',
    status: 'have',
    current: 'Intermediate',
    required: 'Intermediate',
    priorityScore: 0,
    hasPriority: false,
    reason: 'Your Java OOP skills match the job requirement. Well done!',
    tags: ['Inheritance', 'Design Patterns'],
  },
]

export const MOCK_ROADMAP_NODES = [
  { id: 'node_1', nameKey: 'roadmap.nodes.javaCore', icon: 'check_circle', status: 'completed' },
  { id: 'node_2', nameKey: 'roadmap.nodes.sqlDb', icon: 'check_circle', status: 'completed' },
  { id: 'node_3', nameKey: 'roadmap.nodes.springBoot', subKey: 'roadmap.nodes.springBootSub', icon: 'bolt', status: 'active' },
  { id: 'node_4', nameKey: 'roadmap.nodes.microservices', icon: 'cloud_done', status: 'future' },
]

export const MOCK_ROADMAP_RESOURCES = [
  { titleKey: 'roadmap.youtubeTitle', descKey: 'roadmap.youtubeDesc', icon: 'play_circle', iconBg: 'bg-destructive/10', iconColor: 'text-destructive' },
  { titleKey: 'roadmap.docsTitle', descKey: 'roadmap.docsDesc', icon: 'description', iconBg: 'bg-info/10', iconColor: 'text-info' },
  { titleKey: 'roadmap.udemyTitle', descKey: 'roadmap.udemyDesc', icon: 'school', iconBg: 'bg-primary/10', iconColor: 'text-primary', sponsored: true },
]

export const MOCK_ROADMAPS = [
  {
    id: 'roadmap_1',
    title: 'Full-Stack Java Developer',
    progress: 45,
    isOutdated: false,
    activeNodeId: 'node_3',
    nodes: MOCK_ROADMAP_NODES,
    resources: MOCK_ROADMAP_RESOURCES,
  },
]

export const MOCK_CAREER_TRACK = {
  id: 'track_1',
  name: 'Java Backend Engineer',
  description: 'Track for becoming a professional Java backend developer',
  jdCount: 3,
  progress: 40,
  jds: [
    { id: 'jd_1', title: 'Senior Java Developer @ TechCorp' },
    { id: 'jd_2', title: 'Backend Engineer @ StartupXYZ' },
    { id: 'jd_3', title: 'Full Stack Developer @ InnovateLab' },
  ],
}

export const MOCK_CAREER_TRACKS = [
  { id: 'track_1', name: 'Java Backend Engineer', description: 'Track for becoming a professional Java backend developer', jdCount: 3, progress: 40 },
  { id: 'track_2', name: 'DevOps Specialist', description: 'Master CI/CD and cloud infrastructure', jdCount: 2, progress: 15 },
]
