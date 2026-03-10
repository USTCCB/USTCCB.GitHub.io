import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center mb-20">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          欢迎来到我的个人平台
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          这是一个基于 Next.js 14 + Nest.js + PostgreSQL + Redis 构建的全栈应用
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/blog"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            浏览博客
          </Link>
          <Link
            href="/album"
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            查看相册
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8 mb-20">
        <FeatureCard
          icon="📝"
          title="博客系统"
          description="Markdown 编辑器、评论、点赞、标签分类"
        />
        <FeatureCard
          icon="📸"
          title="相册管理"
          description="照片上传、分类、标签、相册管理"
        />
        <FeatureCard
          icon="📔"
          title="私密日记"
          description="记录生活点滴、心情天气、隐私保护"
        />
        <FeatureCard
          icon="🤖"
          title="AI 聊天"
          description="智能对话、历史记录、多模型支持"
        />
        <FeatureCard
          icon="🎮"
          title="小游戏"
          description="休闲娱乐、积分系统、排行榜"
        />
        <FeatureCard
          icon="📊"
          title="数据统计"
          description="访问分析、用户行为、可视化图表"
        />
      </section>

      {/* Tech Stack */}
      <section className="bg-gray-50 rounded-2xl p-12">
        <h2 className="text-3xl font-bold text-center mb-8">技术栈</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-blue-600">前端</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Next.js 14 (App Router)</li>
              <li>✓ React 18 + TypeScript</li>
              <li>✓ Tailwind CSS</li>
              <li>✓ Zustand (状态管理)</li>
              <li>✓ Axios (HTTP 客户端)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4 text-purple-600">后端</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Node.js + Express</li>
              <li>✓ PostgreSQL (数据库)</li>
              <li>✓ Redis (缓存)</li>
              <li>✓ JWT (认证)</li>
              <li>✓ Docker (容器化)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
