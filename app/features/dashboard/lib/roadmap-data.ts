export interface RoadmapNodeData {
  id: string
  nameKey: string
  subKey?: string
  icon: string
  status: 'completed' | 'active' | 'future'
}

export interface RoadmapResource {
  titleKey: string
  descKey: string
  icon: string
  iconBg: string
  iconColor: string
  sponsored?: boolean
}

export const roadmapNodes: RoadmapNodeData[] = [
  { id: 'java_core', nameKey: 'roadmap.nodes.javaCore', icon: 'check_circle', status: 'completed' },
  { id: 'sql_db', nameKey: 'roadmap.nodes.sqlDb', icon: 'check_circle', status: 'completed' },
  {
    id: 'spring_boot',
    nameKey: 'roadmap.nodes.springBoot',
    subKey: 'roadmap.nodes.springBootSub',
    icon: 'bolt',
    status: 'active'
  },
  { id: 'microservices', nameKey: 'roadmap.nodes.microservices', icon: 'cloud_done', status: 'future' }
]

export const roadmapResources: RoadmapResource[] = [
  {
    titleKey: 'roadmap.youtubeTitle',
    descKey: 'roadmap.youtubeDesc',
    icon: 'play_circle',
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive'
  },
  {
    titleKey: 'roadmap.docsTitle',
    descKey: 'roadmap.docsDesc',
    icon: 'description',
    iconBg: 'bg-info/10',
    iconColor: 'text-info'
  },
  {
    titleKey: 'roadmap.udemyTitle',
    descKey: 'roadmap.udemyDesc',
    icon: 'school',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    sponsored: true
  }
]
