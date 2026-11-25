const NONE = new Set(["", "none", "no", "n/a", "-"])

export function splitList(value) {
  if (!value) return []
  return String(value)
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function normPath(value) {
  return String(value).replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+$/, "")
}

export function pathsOverlap(left, right) {
  const a = normPath(left)
  const b = normPath(right)
  if (!a || !b) return false
  if (a === b) return true
  return b.startsWith(a + "/") || a.startsWith(b + "/")
}

export function sharedPaths(leftOwns, rightOwns) {
  const hits = []
  for (const left of leftOwns) {
    for (const right of rightOwns) {
      if (pathsOverlap(left, right)) hits.push(normPath(left).length >= normPath(right).length ? left : right)
    }
  }
  return [...new Set(hits.map(normPath))]
}

function depNames(task) {
  return splitList(task.depends).filter((name) => !NONE.has(name.toLowerCase()))
}

function ownsOf(task) {
  return splitList(task.owns).map(normPath).filter(Boolean)
}

function findCycles(tasks) {
  const byName = new Map(tasks.map((task) => [task.name.trim(), task]))
  const seen = new Set()
  const stack = new Set()
  const cycles = []

  function walk(name, trail) {
    if (stack.has(name)) {
      cycles.push(trail.slice(trail.indexOf(name)).concat(name))
      return
    }
    if (seen.has(name) || !byName.has(name)) return
    stack.add(name)
    trail.push(name)
    for (const next of depNames(byName.get(name))) walk(next, trail)
    trail.pop()
    stack.delete(name)
    seen.add(name)
  }

  for (const task of tasks) walk(task.name.trim(), [])
  return cycles
}

function reaches(tasks, from, target) {
  const byName = new Map(tasks.map((task) => [task.name.trim(), task]))
  const seen = new Set()
  const pile = [from]
  while (pile.length) {
    const name = pile.pop()
    if (seen.has(name)) continue
    seen.add(name)
    const task = byName.get(name)
    if (!task) continue
    for (const next of depNames(task)) {
      if (next === target) return true
      pile.push(next)
    }
  }
  return false
}

export function plan(tasks) {
  const start = []
  const waiting = []
  const blocked = []
  const running = []
  const accepted = []
  const names = new Map()

  for (const task of tasks) {
    const name = task.name.trim()
    if (!name) {
      blocked.push({ id: task.id, reason: "Name the task." })
      continue
    }
    if (names.has(name)) blocked.push({ id: task.id, reason: "Two tasks share this name." })
    names.set(name, task)
  }

  const cycles = findCycles(tasks.filter((task) => task.name.trim()))
  const cyclic = new Set(cycles.flat())

  for (const task of tasks) {
    const name = task.name.trim()
    if (!name) continue
    if (task.status === "accepted") {
      accepted.push({ id: task.id, name })
      continue
    }
    if (task.status === "running") running.push({ id: task.id, name })
    if (cyclic.has(name)) {
      blocked.push({ id: task.id, reason: "Depends on loops back. A task graph has to end." })
    }
    for (const dep of depNames(task)) {
      if (!names.has(dep)) blocked.push({ id: task.id, reason: "Depends on a missing task: " + dep + "." })
    }
    if (!splitList(task.sensor).length) {
      blocked.push({ id: task.id, reason: "No sensor. This file is a spec until the check has a command." })
    }
    if (!ownsOf(task).length) {
      blocked.push({ id: task.id, reason: "Owns is empty. Name the files, or the draft." })
    }
  }

  const blockedIds = new Set(blocked.map((item) => item.id))

  for (let i = 0; i < tasks.length; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      const left = tasks[i]
      const right = tasks[j]
      if (left.status === "accepted" || right.status === "accepted") continue
      const shared = sharedPaths(ownsOf(left), ownsOf(right))
      if (!shared.length) continue
      const leftName = left.name.trim()
      const rightName = right.name.trim()
      const leftWaits = leftName && reaches(tasks, leftName, rightName)
      const rightWaits = rightName && reaches(tasks, rightName, leftName)
      if (leftWaits || rightWaits) continue
      const reason = "Both own " + shared[0] + ". Set Depends on so one waits."
      blocked.push({ id: left.id, reason })
      blocked.push({ id: right.id, reason })
      blockedIds.add(left.id)
      blockedIds.add(right.id)
    }
  }

  for (const task of tasks) {
    if (task.status !== "draft") continue
    if (blockedIds.has(task.id)) continue
    const unmet = depNames(task).filter((dep) => {
      const other = tasks.find((item) => item.name.trim() === dep)
      return !other || other.status !== "accepted"
    })
    if (unmet.length) {
      waiting.push({ id: task.id, name: task.name.trim(), reason: "Waits until " + unmet.join(", ") + " is accepted." })
      continue
    }
    const clash = tasks.find((other) => {
      if (other.id === task.id || other.status !== "running") return false
      return sharedPaths(ownsOf(task), ownsOf(other)).length > 0
    })
    if (clash) {
      waiting.push({
        id: task.id,
        name: task.name.trim(),
        reason: "Waits. " + clash.name.trim() + " is still writing a shared path.",
      })
      continue
    }
    start.push({ id: task.id, name: task.name.trim() })
  }

  return { start, waiting, blocked, running, accepted }
}
