export type SkillProfile = {
  id: string
  name: string
  shortLabel: string
  summary: string
  tags: string[]
  docSlug: string
  accent: string
  orbitSlot: number
}

export const skillProfiles: SkillProfile[] = [
  {
    id: 'react',
    name: 'React',
    shortLabel: 'RE',
    summary: 'React 组件、Hooks、状态管理和应用架构。',
    tags: ['React', 'Hooks', 'UI'],
    docSlug: 'react',
    accent: '#3f7f76',
    orbitSlot: 0
  },
  {
    id: 'vue',
    name: 'Vue',
    shortLabel: 'VU',
    summary: 'Vue 3、组合式 API、路由和工程化实践。',
    tags: ['Vue', 'Router', 'Pinia'],
    docSlug: 'vue',
    accent: '#4f8f69',
    orbitSlot: 1
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    shortLabel: 'TS',
    summary: '类型建模、工程约束和可维护代码设计。',
    tags: ['TypeScript', 'Types', 'DX'],
    docSlug: 'typescript',
    accent: '#4d73a8',
    orbitSlot: 2
  },
  {
    id: 'threejs',
    name: 'Three.js',
    shortLabel: '3D',
    summary: 'Three.js 场景、空间导航、视觉叙事和交互式入口。',
    tags: ['Three.js', 'WebGL', 'Scene'],
    docSlug: 'threejs',
    accent: '#c46a3f',
    orbitSlot: 3
  },
  {
    id: 'node',
    name: 'Node.js',
    shortLabel: 'ND',
    summary: 'Node.js 服务、API 设计和后端工程基础。',
    tags: ['Node.js', 'API', 'Server'],
    docSlug: 'nodejs',
    accent: '#658a45',
    orbitSlot: 4
  },
  {
    id: 'vite',
    name: 'Vite',
    shortLabel: 'VT',
    summary: 'Vite 构建、插件、性能优化和开发体验。',
    tags: ['Vite', 'Build', 'HMR'],
    docSlug: 'vite',
    accent: '#8a6aa8',
    orbitSlot: 5
  },
  {
    id: 'frontend',
    name: '前端工程',
    shortLabel: 'FE',
    summary: 'Vue、TypeScript、组件架构和可维护的交互体验。',
    tags: ['Vue', 'TypeScript', 'Design System'],
    docSlug: 'frontend-engineering',
    accent: '#2f7f83',
    orbitSlot: 6
  },
  {
    id: 'visualization',
    name: '可视化',
    shortLabel: 'VI',
    summary: '图表、数据表达和交互式信息呈现。',
    tags: ['Chart', 'Canvas', 'Data'],
    docSlug: 'visualization',
    accent: '#b16b75',
    orbitSlot: 7
  },
  {
    id: 'delivery',
    name: '工程交付',
    shortLabel: 'CI',
    summary: '质量门、测试、构建优化、部署与持续集成。',
    tags: ['CI', 'Testing', 'Vite'],
    docSlug: 'engineering-delivery',
    accent: '#6e5f93',
    orbitSlot: 8
  },
  {
    id: 'testing',
    name: '测试体系',
    shortLabel: 'QA',
    summary: 'Vitest、Playwright、质量门和自动化回归。',
    tags: ['Vitest', 'Playwright', 'CI'],
    docSlug: 'testing',
    accent: '#5f7399',
    orbitSlot: 9
  },
  {
    id: 'ai',
    name: 'AI 应用',
    shortLabel: 'AI',
    summary: '知识库问答、检索增强、工具调用和产品化落地。',
    tags: ['RAG', 'Agent', 'API'],
    docSlug: 'ai-application',
    accent: '#b36f3f',
    orbitSlot: 10
  },
  {
    id: 'docker',
    name: 'Docker',
    shortLabel: 'DO',
    summary: '容器化、镜像构建、Nginx 和部署流程。',
    tags: ['Docker', 'Nginx', 'Deploy'],
    docSlug: 'docker',
    accent: '#45799a',
    orbitSlot: 11
  }
]
