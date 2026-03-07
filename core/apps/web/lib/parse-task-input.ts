export interface ParsedTask {
  title: string
  dueDate?: Date
  priority?: 1 | 2 | 3 | 4
  projectName?: string
  labels?: string[]
}

export function parseTaskInput(input: string): ParsedTask {
  let remaining = input
  const result: ParsedTask = { title: '' }

  // Priority: p1, p2, p3, p4
  const priorityMatch = remaining.match(/\bp([1-4])\b/i)
  if (priorityMatch) {
    result.priority = parseInt(priorityMatch[1]) as 1|2|3|4
    remaining = remaining.replace(priorityMatch[0], '').trim()
  }

  // Project: #ProjectName
  const projectMatch = remaining.match(/#(\w+)/)
  if (projectMatch) {
    result.projectName = projectMatch[1]
    remaining = remaining.replace(projectMatch[0], '').trim()
  }

  // Labels: @label
  const labelMatches = [...remaining.matchAll(/@(\w+)/g)]
  if (labelMatches.length) {
    result.labels = labelMatches.map(m => m[1])
    remaining = remaining.replace(/@\w+/g, '').trim()
  }

  // Due dates: today, tomorrow, next monday, next week, in X days
  const now = new Date()
  if (/\btoday\b/i.test(remaining)) {
    result.dueDate = now
    remaining = remaining.replace(/\btoday\b/i, '').trim()
  } else if (/\btomorrow\b/i.test(remaining)) {
    const d = new Date(now); d.setDate(d.getDate() + 1)
    result.dueDate = d
    remaining = remaining.replace(/\btomorrow\b/i, '').trim()
  } else if (/\bnext week\b/i.test(remaining)) {
    const d = new Date(now); d.setDate(d.getDate() + 7)
    result.dueDate = d
    remaining = remaining.replace(/\bnext week\b/i, '').trim()
  } else if (/\bnext (\w+)\b/i.test(remaining)) {
    const dayMatch = remaining.match(/\bnext (\w+)\b/i)
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
    const targetDay = days.indexOf(dayMatch![1].toLowerCase())
    if (targetDay !== -1) {
      const d = new Date(now)
      const diff = (targetDay - d.getDay() + 7) % 7 || 7
      d.setDate(d.getDate() + diff)
      result.dueDate = d
      remaining = remaining.replace(dayMatch![0], '').trim()
    }
  } else if (/\bin (\d+) days?\b/i.test(remaining)) {
    const m = remaining.match(/\bin (\d+) days?\b/i)!
    const d = new Date(now); d.setDate(d.getDate() + parseInt(m[1]))
    result.dueDate = d
    remaining = remaining.replace(m[0], '').trim()
  }

  result.title = remaining.replace(/\s+/g, ' ').trim()
  return result
}
