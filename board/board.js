import { plan } from "./rules.js"
import { filesFor, zipStore } from "./pack.js"

let seq = 3

function blank(id) {
  return {
    id,
    name: "",
    outcome: "",
    owns: "",
    leave: "",
    sensor: "",
    lands: "",
    depends: "",
    status: "draft",
    miss: "",
    missCount: 0,
  }
}

function example() {
  return {
    commands: "pytest -q\npython3 scripts/slop-lint.py --quick posts/note.md",
    landmine: "legacy/ is still imported. New code copies src/ instead.",
    decision: "The public API stays stable.",
    tasks: [
      {
        id: "a",
        name: "Api fix",
        outcome: "A bad password gets 401.",
        owns: "src/api",
        leave: "Do not change the public response shape.",
        sensor: "pytest -q tests/test_api.py",
        lands: "branch api-fix",
        depends: "",
        status: "draft",
        miss: "",
        missCount: 0,
      },
      {
        id: "b",
        name: "Post draft",
        outcome: "A draft that states the login bug in plain words.",
        owns: "posts/note.md",
        leave: "Use only facts from the notes.",
        sensor: "python3 scripts/slop-lint.py --quick posts/note.md",
        lands: "posts/note.md",
        depends: "",
        status: "draft",
        miss: "",
        missCount: 0,
      },
      {
        id: "c",
        name: "Api follow-up",
        outcome: "The login path logs the failure without a token.",
        owns: "src/api",
        leave: "Do not change the public response shape.",
        sensor: "pytest -q tests/test_api.py",
        lands: "branch api-followup",
        depends: "Api fix",
        status: "draft",
        miss: "",
        missCount: 0,
      },
    ],
  }
}

let state = example()

function el(tag, attrs, children) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs || {})) {
    if (key === "class") node.className = value
    else if (key === "text") node.textContent = value
    else node.setAttribute(key, value)
  }
  for (const child of children || []) node.append(child)
  return node
}

function field(label, task, key, area) {
  const input = area ? document.createElement("textarea") : document.createElement("input")
  input.value = task[key]
  input.dataset.id = task.id
  input.dataset.key = key
  return el("label", null, [el("span", { text: label }), input])
}

function renderTasks() {
  const root = document.querySelector("#tasks")
  root.replaceChildren()
  state.tasks.forEach((task, index) => {
    const card = el("article", { class: "task" })
    const title = el("strong", { text: task.name.trim() || "Task " + (index + 1) })
    const remove = el("button", { type: "button", text: "Remove", "data-remove": task.id })
    const modes = el("div", { class: "modes" })
    for (const [value, label, extra] of [
      ["draft", "Draft", ""],
      ["running", "In flight", "loop"],
      ["accepted", "Accepted", ""],
    ]) {
      const button = el("button", {
        type: "button",
        text: label,
        class: extra,
        "data-status": value,
        "data-id": task.id,
        "aria-pressed": task.status === value ? "true" : "false",
      })
      modes.append(button)
    }
    card.append(el("header", null, [title, remove]), modes)
    card.append(
      field("Name", task, "name", false),
      field("What a person can see", task, "outcome", true),
      field("Owns", task, "owns", false),
      field("Leave alone", task, "leave", false),
      field("Sensor", task, "sensor", false),
      field("Lands", task, "lands", false),
      field("Depends on", task, "depends", false),
      field("Miss, if you had to correct it", task, "miss", false),
    )
    const count = el("label", null, [
      el("span", { text: "Times corrected" }),
    ])
    const number = document.createElement("input")
    number.type = "number"
    number.min = "0"
    number.value = String(task.missCount)
    number.dataset.id = task.id
    number.dataset.key = "missCount"
    count.append(number)
    card.append(count)
    root.append(card)
  })
}

function line(text, warn) {
  return el("li", { class: warn ? "warn" : "", text })
}

function renderQueue() {
  const result = plan(state.tasks)
  const root = document.querySelector("#queue")
  const group = (title, rows) => {
    const box = el("div", null, [el("p", { class: "k", text: title })])
    const list = el("ul")
    if (!rows.length) list.append(line("None."))
    else rows.forEach((row) => list.append(row))
    box.append(list)
    return box
  }
  root.replaceChildren(
    group("Start now", result.start.map((item) => line(item.name))),
    group("In flight", result.running.map((item) => line(item.name))),
    group("Waiting", result.waiting.map((item) => line(item.name + ". " + item.reason))),
    group("Blocked", result.blocked.map((item) => {
      const name = state.tasks.find((task) => task.id === item.id)?.name.trim() || "Task"
      return line(name + ". " + item.reason, true)
    })),
    group("Accepted", result.accepted.map((item) => line(item.name))),
  )
}

function fillMap() {
  document.querySelector("#commands").value = state.commands
  document.querySelector("#landmine").value = state.landmine
  document.querySelector("#decision").value = state.decision
}

function paint() {
  fillMap()
  renderTasks()
  renderQueue()
}

document.querySelector("#commands").addEventListener("input", (event) => {
  state.commands = event.target.value
})
document.querySelector("#landmine").addEventListener("input", (event) => {
  state.landmine = event.target.value
})
document.querySelector("#decision").addEventListener("input", (event) => {
  state.decision = event.target.value
})

document.querySelector("#tasks").addEventListener("input", (event) => {
  const task = state.tasks.find((item) => item.id === event.target.dataset.id)
  if (!task) return
  const key = event.target.dataset.key
  task[key] = key === "missCount" ? Number(event.target.value) || 0 : event.target.value
  if (key === "name") {
    const title = event.target.closest(".task").querySelector("strong")
    title.textContent = task.name.trim() || "Task"
  }
  renderQueue()
})

document.querySelector("#tasks").addEventListener("click", (event) => {
  const status = event.target.dataset.status
  const remove = event.target.dataset.remove
  if (status) {
    const task = state.tasks.find((item) => item.id === event.target.dataset.id)
    task.status = status
    renderTasks()
    renderQueue()
  }
  if (remove) {
    state.tasks = state.tasks.filter((item) => item.id !== remove)
    if (!state.tasks.length) state.tasks.push(blank("t" + seq++))
    renderTasks()
    renderQueue()
  }
})

document.querySelector("#new-task").addEventListener("click", () => {
  state.tasks.push(blank("t" + seq++))
  renderTasks()
  renderQueue()
})

document.querySelector("#example").addEventListener("click", () => {
  state = example()
  paint()
})

document.querySelector("#download").addEventListener("click", () => {
  const bytes = zipStore(filesFor(state))
  const blob = new Blob([bytes], { type: "application/zip" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = "slow-part-control.zip"
  link.click()
  URL.revokeObjectURL(link.href)
})

paint()
