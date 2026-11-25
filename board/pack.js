import { plan, splitList } from "./rules.js"

export function slug(name, used) {
  const base = String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "task"
  let next = base
  let n = 2
  while (used.has(next)) {
    next = base + "-" + n
    n += 1
  }
  used.add(next)
  return next
}

function taskFile(task) {
  const depends = splitList(task.depends).filter((name) => !["none", "no", "n/a", "-"].includes(name.toLowerCase()))
  return [
    "Outcome: " + task.outcome.trim(),
    "Owns: " + task.owns.trim(),
    "Leave alone: " + task.leave.trim(),
    "Sensor: " + task.sensor.trim(),
    "Lands: " + task.lands.trim(),
    "Depends on: " + (depends.length ? depends.join(", ") : "none"),
    "",
    "Run until the sensor passes. Paste the command and the last lines of output.",
    "Do not merge, publish, spend or delete.",
    "",
  ].join("\n")
}

function mapFile(state, learned) {
  const lines = [
    "# Commands",
    state.commands.trim() || "(add the test, typecheck and lint commands)",
    "",
    "# Landmine",
    state.landmine.trim() || "(name the path that looks unused and is still live)",
    "",
    "# Decision",
    state.decision.trim() || "(name the decision the repo leaves unstated)",
    "",
    "# Tasks",
    "Each writer reads one file under tasks/. Do not copy a task into this file.",
    "",
    "# Gate",
    "Stop when the sensor in that TASK.md passes. Paste the command and the last lines of output.",
    "Merge, publish, spend and delete stay with the person.",
    "",
  ]
  if (learned.length) {
    lines.push("# Learned", ...learned, "")
  }
  return lines.join("\n")
}

function queueFile(tasks, result) {
  const nameOf = (id) => tasks.find((task) => task.id === id)?.name.trim() || id
  const block = (title, rows) => {
    if (!rows.length) return ["## " + title, "- none", ""]
    return ["## " + title, ...rows, ""]
  }
  return [
    "# Queue",
    "",
    "This is the queue at the moment of download. Each writer reads only its own tasks folder.",
    "A task under Waiting or Blocked stays on disk until the reason is gone.",
    "",
    ...block("Start now", result.start.map((item) => "- " + item.name)),
    ...block("In flight", result.running.map((item) => "- " + item.name)),
    ...block("Waiting", result.waiting.map((item) => "- " + item.name + ". " + item.reason)),
    ...block("Blocked", result.blocked.map((item) => "- " + nameOf(item.id) + ". " + item.reason)),
    ...block("Accepted", result.accepted.map((item) => "- " + item.name)),
    "## Gate",
    "Accept one result at a time. Then rebase the next branch and run its sensor.",
    "Merge, publish, spend and delete stay with you.",
    "",
  ].join("\n")
}

export function filesFor(state) {
  const result = plan(state.tasks)
  const learned = state.tasks
    .filter((task) => Number(task.missCount) >= 2 && task.miss.trim())
    .map((task) => "- " + task.name.trim() + ": " + task.miss.trim())
  const map = mapFile(state, learned)
  const used = new Set()
  const files = [
    { name: "AGENTS.md", text: map },
    { name: "CLAUDE.md", text: map },
    { name: "CONTROL.md", text: queueFile(state.tasks, result) },
  ]
  for (const task of state.tasks) {
    if (!task.name.trim()) continue
    files.push({ name: "tasks/" + slug(task.name, used) + "/TASK.md", text: taskFile(task) })
  }
  return files
}

const CRC = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    table[i] = c >>> 0
  }
  return table
})()

function crc32(bytes) {
  let c = 0xffffffff
  for (const byte of bytes) c = CRC[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function bytesOf(parts) {
  const size = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(size)
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

function le16(n) {
  return Uint8Array.of(n & 255, (n >>> 8) & 255)
}

function le32(n) {
  return Uint8Array.of(n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255)
}

export function zipStore(entries) {
  const encoder = new TextEncoder()
  const locals = []
  const central = []
  let offset = 0
  for (const entry of entries) {
    const name = encoder.encode(entry.name)
    const data = encoder.encode(entry.text)
    const crc = crc32(data)
    const local = bytesOf([
      le32(0x04034b50),
      le16(20),
      le16(0x0800),
      le16(0),
      le16(0),
      le16(0),
      le32(crc),
      le32(data.length),
      le32(data.length),
      le16(name.length),
      le16(0),
      name,
      data,
    ])
    locals.push(local)
    central.push(bytesOf([
      le32(0x02014b50),
      le16(20),
      le16(20),
      le16(0x0800),
      le16(0),
      le16(0),
      le16(0),
      le32(crc),
      le32(data.length),
      le32(data.length),
      le16(name.length),
      le16(0),
      le16(0),
      le16(0),
      le16(0),
      le32(0),
      le32(offset),
      name,
    ]))
    offset += local.length
  }
  const centralBytes = bytesOf(central)
  const end = bytesOf([
    le32(0x06054b50),
    le16(0),
    le16(0),
    le16(entries.length),
    le16(entries.length),
    le32(centralBytes.length),
    le32(offset),
    le16(0),
  ])
  return bytesOf([...locals, centralBytes, end])
}
