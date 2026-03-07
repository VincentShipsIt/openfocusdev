import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Layers, Calendar, Zap, Smartphone, BarChart2 } from 'lucide-react'

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/today')

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-blue-500" size={22} />
          <span className="font-semibold text-lg">TaskFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-gray-400 hover:text-gray-100 text-sm">Sign in</Link>
          <Link href="/sign-up" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-6">
          <Zap size={14} />
          Open source · Free forever
        </div>
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          The task manager<br />
          <span className="text-blue-500">that gets out of your way</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          TaskFlow is a Todoist-style task manager built for developers.
          Projects, subtasks, ⌘K quick-add, drag-to-reorder — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/sign-up" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl text-base font-medium transition-colors">
            Get started free
          </Link>
          <Link href="https://github.com/VincentShipsIt/todo" target="_blank" className="border border-gray-700 hover:border-gray-600 text-gray-300 px-8 py-3.5 rounded-xl text-base transition-colors">
            View on GitHub
          </Link>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Layers, title: 'Projects & Subtasks', desc: 'Organize work into projects. Break tasks into subtasks with progress tracking.' },
            { icon: Calendar, title: 'Today & Upcoming', desc: 'Focus on what matters today. Schedule tasks and see your week at a glance.' },
            { icon: Zap, title: '⌘K Quick Add', desc: 'Add tasks from anywhere with natural language — due dates, priority, project in one line.' },
            { icon: CheckCircle2, title: 'Drag to Reorder', desc: 'Arrange tasks exactly how you want with smooth drag-and-drop.' },
            { icon: BarChart2, title: 'Productivity Stats', desc: 'Track your streak, completion rate, and most productive days.' },
            { icon: Smartphone, title: 'Mobile App', desc: 'Native iOS app built with Expo. Your tasks, everywhere.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <Icon className="text-blue-500 mb-3" size={22} />
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">Simple pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <div className="text-2xl font-bold mb-1">Free</div>
            <div className="text-gray-400 text-sm mb-6">Forever. Open source.</div>
            <ul className="space-y-3 text-sm text-gray-300 mb-8">
              {['Unlimited tasks', 'Unlimited projects', 'Mobile app', '⌘K quick-add', 'Subtasks', 'Productivity stats'].map(f => (
                <li key={f} className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" />{f}</li>
              ))}
            </ul>
            <Link href="/sign-up" className="block text-center bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm transition-colors">Get started</Link>
          </div>
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-8 relative">
            <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">Coming soon</div>
            <div className="text-2xl font-bold mb-1">Pro <span className="text-blue-400">$4.99</span><span className="text-gray-400 text-base font-normal">/mo</span></div>
            <div className="text-gray-400 text-sm mb-6">For power users and teams.</div>
            <ul className="space-y-3 text-sm text-gray-300 mb-8">
              {['Everything in Free', 'Team workspaces', 'Google Calendar sync', 'Slack integration', 'Priority support', 'Advanced filters'].map(f => (
                <li key={f} className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-400" />{f}</li>
              ))}
            </ul>
            <button disabled className="w-full bg-blue-600/40 text-blue-300 py-2.5 rounded-lg text-sm cursor-not-allowed">Coming soon</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-gray-600 text-sm">
        <p>TaskFlow by <a href="https://shipshit.dev" className="hover:text-gray-400">shipshit.dev</a> · Open source on <a href="https://github.com/VincentShipsIt/todo" className="hover:text-gray-400">GitHub</a></p>
      </footer>
    </div>
  )
}
