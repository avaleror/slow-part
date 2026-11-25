# When you are the slow part

Draw the task. Put a harness under it. Touch the work twice.

You can have a row of agents on code and on posts. You still have one pair of eyes. They finish and wait.

That wait is the limit.

The speed comes from staying out of the middle. OpenAI's line, from the 11 February 2026 harness post, is the job: design the environment, name the intent, and build the check.

## Build the harness once

The harness is five boxes. The model is the part you can swap. Claude, Codex or another writer can sit in the loop box without a new method.

```text
Map -> Place -> Loop -> Sensor -> Gate
```

The map holds AGENTS.md or CLAUDE.md: commands, one landmine, one decision. Claude asks for under 200 lines, and Codex stops at 32 KiB.

The place is one git worktree or one doc per writer. Branch from local HEAD when the next task must see your branch. Install dependencies there.

The loop is one writer. It reads TASK.md and runs until the sensor passes. A second agent may search or review, and it leaves those files alone.

The sensor is a command whose output comes back, the kind of check Claude's page asks you to paste. Use a test for code, or a voice checker plus a fact list for a post.

The gate is you. Send, then accept. Merge and publish stay here, and so do spend and delete, when a mistake is expensive.

Keep the current task off the map, or every parallel Claude session inherits it. OpenAI tried one giant AGENTS.md, watched it rot, and cut theirs to about 100 lines that point at a docs/ tree.

Cognition's 2026 note, ten months after they warned against writer swarms: extra agents add judgment, and writes stay single-threaded. On PRs Devin wrote, the reviewer averaged 2 bugs a PR, about 58% of them severe, because it only saw the diff.

## Draw the task

Put the task in TASK.md, in the worktree or next to the draft. The agent can read a file. It cannot read a picture that lives only in your head.

```text
Outcome: what a person can see when this is done.
Owns: files or the draft this writer may change.
Leave alone: two limits. Public API, secrets, or facts the draft must leave out.
Sensor: the command or checker. Paste the output.
Lands: branch, file, or draft.
Depends on: none, or the task name that must be accepted first.
```

The diagram is the same file, read top to bottom. Outcome, then Owns, then Leave alone, then Sensor, then the gate. Depends on is the arrow from another task. Empty means this task may start now.

If you cannot fill Sensor, this session only writes TASK.md. A fresh session does the work. Claude Code's page uses that split so the build starts from the file, with the brainstorm left behind.

Two corrections, then a new TASK.md. Claude's docs say a third correction mostly puts the two failed attempts back in front of the model on every later turn.

## Run one, then many

1. Commit or save TASK.md. Start one writer in that place and point it at the file.
2. Leave the chat. The loop belongs to the agent.
3. Read three things: the sensor output, the diff or the draft, and the outcome line.
4. Accept, or return it once with the miss written into TASK.md.

Skip the tool log unless the summary cites a file you doubt. "All tests pass" tells you little. Claude's own team says that if you invest in one test, make it end to end, because a unit test can pass while the feature is broken.

And the patch must be unable to edit the rule that judges it, so Claude's team reads REVIEW.md from the base branch.

Which tasks may run together:

```text
Task A  owns src/api      depends on none   -> sensor -> gate
Task B  owns the draft    depends on none   -> sensor -> gate
Task C  owns src/api too  depends on A      -> waits
```

Start every task whose Depends on is empty and whose Owns list shares no path with a task already running. Accept A, rebase C onto that result, then start C. One branch at a time.

Claude's default worktree starts from the remote default branch, so a second session misses your feature unless you branch from local HEAD.

A second model is another box, with a different job. A read-only search. A review of the diff in a clean context, told to skip style. Or the same TASK.md on two strong models, and you keep one result.

Cognition tried a fast Windsurf model that was supposed to call Sonnet 4.5 when it got stuck. The fast model missed the moment to ask. You pick the split.

## Make the next run cheaper

The first miss, you fix the output. The second time you see that miss, you add a sensor or a line on the map. That is the whole gain, because the next Claude run hits the check before you do.

A real never goes in CI, a deny rule, or a linter whose message contains the fix. A sentence in the prompt fails open. Claude's page says a Stop hook that exits non-zero is what blocks the turn.

For a post, the sensor is the checker and the fact list. A missing number stays missing. A public sentence stays with you. A wrong patch on OpenAI's internal product is cheap for them to follow up, and a wrong claim under your name is yours to accept.

## How you know it got faster

Count accepts today, and corrections you had to type twice. If the second number stays flat, the harness is still waiting on you.

METR timed 16 maintainers in early 2025, on repositories they already knew. With Cursor and Claude 3.5 or 3.7 Sonnet they took 19% longer, and afterward still believed they had been 20% faster. The extra time went to prompting and reviewing, plus the wait for the model.

Their February 2026 follow-up could not settle it. People refused the week with AI turned off, between 30% and 50% held tasks back, and the time logs broke once several agents ran at once. METR calls that evidence weak.

OpenAI estimated about 1/10th of the time on a new product: 0 lines typed by hand, on the order of 1 million lines, 3 engineers and then 7. That number is theirs. On a repo you already maintain, use the two counts above.

## This week

1. Write the map for one repo, or one content folder. Commands, one landmine, one decision.
2. Add one sensor the work cannot satisfy by editing the sensor.
3. Draw the next task as TASK.md. Start it in its own worktree or doc. Leave the chat.
4. Accept with the three looks. Output, diff or draft, outcome.
5. Turn the correction you would type again tomorrow into a sensor or a map line.

## Sources

- OpenAI, 11 February 2026, harness engineering: https://openai.com/index/harness-engineering/
- OpenAI, 23 January 2026, the Codex agent loop: https://openai.com/index/unrolling-the-codex-agent-loop/
- Claude Code best practices: https://code.claude.com/docs/en/best-practices.md
- Cognition, 12 June 2025, and the 2026 follow-up: https://cognition.ai/blog/dont-build-multi-agents and https://cognition.com/blog/multi-agents-working
- METR, 10 July 2025, and the 24 February 2026 note: https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ and https://metr.org/blog/2026-02-24-uplift-update/
- Codex AGENTS.md, 32 KiB default: https://learn.chatgpt.com/docs/agent-configuration/agents-md.md
