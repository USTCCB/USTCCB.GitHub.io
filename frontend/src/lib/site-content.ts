export type BlogPost = {
  id: number;
  title: string;
  summary: string;
  category: string;
  readTime: string;
  publishedAt: string;
  tags: string[];
};

export type AlbumShot = {
  id: number;
  title: string;
  location: string;
  season: string;
  description: string;
  accent: string;
};

export type DiaryEntry = {
  id: number;
  title: string;
  mood: string;
  weather: string;
  createdAt: string;
  excerpt: string;
};

export const siteStats = [
  { label: '发布文章', value: '12+' },
  { label: '项目实验', value: '8' },
  { label: '影像收藏', value: '64' },
  { label: '持续记录', value: '320 天' },
];

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: '把个人网站做成一个长期能生长的数字基地',
    summary: '从展示型页面切换到内容与工具并存的结构，让博客、相册、日记和 AI 工具真正形成协同。',
    category: 'Product',
    readTime: '6 min',
    publishedAt: '2026-04-12',
    tags: ['Website', 'Architecture', 'UX'],
  },
  {
    id: 2,
    title: '前后端解耦后，怎么保持个人站依然轻快',
    summary: '总结在 Vercel 前端与 API 路由共存时，如何兼顾速度、结构清晰度和后续可维护性。',
    category: 'Engineering',
    readTime: '8 min',
    publishedAt: '2026-04-09',
    tags: ['Next.js', 'API', 'Deploy'],
  },
  {
    id: 3,
    title: '我想保留生活感，而不是把个人主页做成空洞简历',
    summary: '视觉上更精致并不意味着冰冷，把日常、研究、创作和一点点玩心混在一起，网站才会更像“自己”。',
    category: 'Writing',
    readTime: '4 min',
    publishedAt: '2026-04-05',
    tags: ['Narrative', 'Portfolio', 'Design'],
  },
];

export const albumShots: AlbumShot[] = [
  {
    id: 1,
    title: '凌晨图书馆的蓝色安静',
    location: '合肥',
    season: 'Spring',
    description: '灯带、木纹和低噪音，把长时间专注变成一种空间体验。',
    accent: 'from-[#bfd7ea] to-[#6d9dc5]',
  },
  {
    id: 2,
    title: '雨后球场的反光',
    location: '校园',
    season: 'Summer',
    description: '不完整的镜像会让普通场景突然拥有电影感。',
    accent: 'from-[#f7b267] to-[#f4845f]',
  },
  {
    id: 3,
    title: '晚风吹过实验楼外墙',
    location: '中区',
    season: 'Autumn',
    description: '砖面、玻璃和天空交叠时，冷暖色会自己对话。',
    accent: 'from-[#8ac926] to-[#1982c4]',
  },
  {
    id: 4,
    title: '冬夜食堂门口的暖光',
    location: '校园',
    season: 'Winter',
    description: '很短暂的一束灯，但足够让回宿舍的路有一点被照顾到的感觉。',
    accent: 'from-[#ffca3a] to-[#ff595e]',
  },
];

export const diaryEntries: DiaryEntry[] = [
  {
    id: 1,
    title: '把混乱的任务重新排布之后，心里也安静了',
    mood: 'steady',
    weather: '晴',
    createdAt: '2026-04-16',
    excerpt: '今天没有追求做很多事，而是把重要的三件事一件件做完。完成感比忙碌感更可靠。',
  },
  {
    id: 2,
    title: '重新打磨个人站，像是在重新整理自己',
    mood: 'focused',
    weather: '多云',
    createdAt: '2026-04-11',
    excerpt: '删掉了很多“看起来应该有”的东西，留下真正愿意长期维护的内容模块。',
  },
  {
    id: 3,
    title: '和 AI 工具协作，关键不是神奇，而是顺手',
    mood: 'curious',
    weather: '小雨',
    createdAt: '2026-04-03',
    excerpt: '当它能自然地进入写作、整理、查询和草拟流程时，才真的算帮上忙。',
  },
];

export const capabilityCards = [
  {
    eyebrow: 'Content',
    title: '博客、相册、日记共用一套内容层',
    description: '不是分散的独立页面，而是统一的信息结构，方便继续扩展评论、搜索、标签和归档。',
  },
  {
    eyebrow: 'Runtime',
    title: '前端和接口一起部署',
    description: '页面、接口、状态数据都从同一个 Next.js 项目里输出，减少旧静态页和真实业务代码脱节的问题。',
  },
  {
    eyebrow: 'Design',
    title: '更克制也更有记忆点的视觉语言',
    description: '保留个人站该有的温度，同时把层级、留白、配色和动效做得更像现代产品页面。',
  },
];
