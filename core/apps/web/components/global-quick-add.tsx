'use client'
import { useState, useEffect, useRef } from 'react'
import { parseTaskInput } from '@/lib/parse-task-input'
import { X, Zap } from 'lucide-react'

export function GlobalQuickAdd() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<ReturnType<typeof parseTaskInput> | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'q' && !['INPUT','TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) { setInput(''); setParsed(null); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  useEffect(() => {
    if (input.trim()) setParsed(parseTaskInput(input))
    else setParsed(null)
  }, [input])

  const handleSubmit = async () => {
    if (!input.trim() || submitting) return
    setSubmitting(true)
    const p = parseTaskInput(input)
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: p.title,
        dueDate: p.dueDate,
        priority: p.priority ?? 4,
        projectName: p.projectName,
        labels: p.labels,
      })
    })
    setSubmitting(false)
    setOpen(false)
    // Trigger revalidation
    window.dispatchEvent(new CustomEvent('task-added'))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <Zap size={16} className="text-blue-500" />
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
            placeholder="Add task… 'Buy milk tomorrow p1 #Work @urgent'"
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 outline-none text-sm"
          />
          <button onClick={() => setOpen(false)}><X size={16} className="text-gray-500" /></button>
        </div>
        {parsed && parsed.title && (
          <div className="flex flex-wrap gap-2 text-xs">
            {parsed.dueDate && <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">📅 {parsed.dueDate.toLocaleDateString()}</span>}
            {parsed.priority && <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded">P{parsed.priority}</span>}
            {parsed.projectName && <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">#{parsed.projectName}</span>}
            {parsed.labels?.map(l => <span key={l} className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded">@{l}</span>)}
          </div>
        )}
        <div className="mt-3 flex justify-between items-center text-xs text-gray-600">
          <span>⌘K to toggle · Enter to save · Esc to close</span>
          <button onClick={handleSubmit} disabled={!input.trim() || submitting} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-1 rounded text-xs">
            {submitting ? 'Adding…' : 'Add task'}
          </button>
        </div>
      </div>
    </div>
  )
}
