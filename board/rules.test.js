import assert from "node:assert/strict"
import { plan, pathsOverlap } from "./rules.js"
import { filesFor, zipStore } from "./pack.js"

const sample = [
  task("a", "Api fix", "src/api", "", "draft"),
  task("b", "Post draft", "posts/note.md", "", "draft"),
  task("c", "Api follow-up", "src/api", "Api fix", "draft"),
]

function task(id, name, owns, depends, status, extra = {}) {
  return {
    id,
    name,
    outcome: "A person can see the change.",
    owns,
    leave: "Public API stays stable.",
    sensor: "pytest -q",
    lands: "branch " + id,
    depends,
    status,
    miss: "",
    missCount: 0,
    ...extra,
  }
}

assert.equal(pathsOverlap("src/api", "src/api/routes.py"), true)
assert.equal(pathsOverlap("src/api", "src/api2"), false)
assert.equal(pathsOverlap("src/api", "posts/note.md"), false)

let result = plan(sample)
assert.deepEqual(result.start.map((item) => item.name), ["Api fix", "Post draft"])
assert.equal(result.waiting[0].name, "Api follow-up")
assert.equal(result.blocked.length, 0)

result = plan(sample.map((item) => item.id === "a" ? { ...item, status: "accepted" } : item))
assert.deepEqual(result.start.map((item) => item.name), ["Post draft", "Api follow-up"])

result = plan([
  task("a", "Api fix", "src/api", "", "running"),
  task("b", "Other api", "src/api/routes.py", "", "draft"),
])
assert.equal(result.blocked.length, 2)
assert.equal(result.start.length, 0)

result = plan([
  task("a", "Api fix", "src/api", "Loop", "draft"),
  task("b", "Loop", "docs", "Api fix", "draft"),
])
assert.ok(result.blocked.some((item) => item.reason.includes("loops")))

result = plan([task("a", "Spec", "src/api", "", "draft", { sensor: "" })])
assert.equal(result.start.length, 0)
assert.ok(result.blocked.some((item) => item.reason.includes("sensor")))

const packed = filesFor({
  commands: "pytest -q",
  landmine: "legacy/ is live",
  decision: "Public API stays stable.",
  tasks: sample.map((item) => item.id === "b" ? { ...item, miss: "Paste the command output.", missCount: 2 } : item),
})
const byName = Object.fromEntries(packed.map((file) => [file.name, file.text]))
assert.match(byName["AGENTS.md"], /pytest -q/)
assert.match(byName["AGENTS.md"], /Paste the command output/)
assert.equal(byName["AGENTS.md"], byName["CLAUDE.md"])
assert.match(byName["tasks/api-fix/TASK.md"], /Owns: src\/api/)
assert.match(byName["tasks/api-follow-up/TASK.md"], /Depends on: Api fix/)
assert.match(byName["CONTROL.md"], /Api follow-up/)
assert.match(byName["CONTROL.md"], /Start now/)

const zipped = zipStore(packed)
const { execFileSync } = await import("node:child_process")
const { writeFileSync, mkdtempSync, readFileSync } = await import("node:fs")
const { tmpdir } = await import("node:os")
const { join } = await import("node:path")
const dir = mkdtempSync(join(tmpdir(), "slow-pack-"))
const zipPath = join(dir, "pack.zip")
writeFileSync(zipPath, zipped)
execFileSync("unzip", ["-qq", zipPath, "-d", dir])
assert.match(readFileSync(join(dir, "CLAUDE.md"), "utf8"), /pytest -q/)
assert.match(readFileSync(join(dir, "tasks/post-draft/TASK.md"), "utf8"), /posts\/note.md/)
console.log("ok")
