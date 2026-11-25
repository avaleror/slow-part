# When you are the slow part

You can have a row of agents on code and on posts. You still have one pair of eyes. They finish and wait.

That wait is the limit.

I wrote this down for the days the queue is me.

The names for the fix arrived in order. A prompt is the card for one task. Context engineering, the term Cognition pushed in June 2025 and Anthropic picked up that September, is what the agent is allowed to see.

On 11 February 2026 OpenAI called the next layer harness engineering: the tools, the checks and the files around the model. Their job for you is the one worth keeping. The OpenAI line is short: design the environment, name the intent, and build the check.

Their beta is their number, on a new product: 0 lines typed by hand, on the order of 1 million lines, about 1/10th of the time, 3 engineers and then 7. On a repo you already maintain, and on a post under your name, measure your own.

## Two gates

You touch a task twice.

Send. Fill the card. Leave the chat.

Accept. The check came back with evidence, the result matches the card, and you keep it or return it once.

If you are still in the thread while Claude or Codex works, you are the loop. The loop belongs to the agent. OpenAI's team called human time the scarce resource, and spent theirs making the app, the logs and the docs readable so a person could leave.

Same idea for a post. For a LinkedIn post or a blog, the draft, the sources and the voice rules have to be files the agent can open.

## The card

One card for a bug, a post, a deck or a research pass.

```text
Outcome: what a person can see when this is done.
Source: path, notes, or repro.
Limits: two. Files you will leave alone, or facts the draft must leave out.
Done: a command or a check. Paste the output.
Lands: branch, file, or draft. You accept there.
```

If you cannot fill Done, this session writes the spec and stops. Claude Code's current page has the pattern: the agent interviews you, writes SPEC.md, and a fresh session builds from that file so the build starts clean.

Two corrections, then a new card. Claude's docs say a third correction mostly puts the two failed attempts back in front of the model on every later turn. Clear the thread, and write one prompt that includes what you learned in that Claude session.

"Be careful" and "make it production ready" add no fact. Current Claude models already aim at the smallest change that meets the request. Name the scope you want, because "don't be lazy" tends to make them do extra.

## One writer, many tasks

One agent writes the task. Claude Code and Cursor each give it a worktree and a branch. A post gets its own doc.

A second agent can search, run the check, or review the result with a clean context. Cognition's 2026 note, ten months after they warned against writer swarms: extra agents add judgment, and writes stay single-threaded. On PRs Devin wrote, that reviewer averaged 2 bugs a PR, about 58% of them severe, because it only sees the diff.

On Claude Code, tell the reviewer to report gaps that break the outcome and to skip style. A review told to find problems will always find some, and Claude's own page warns that fixing all of them grows the task. The writer still has the card, so it drops findings outside the outcome.

Two writers on the same files will step on each other in one Cursor checkout. A git worktree, the kind Claude Code documents, only moves that fight to merge time. Merge one branch, rebase the next onto it, run the check, then merge.

Claude's default worktree starts from the remote default branch, so a second session misses the feature you have open unless you branch from local HEAD. A fresh worktree also has no dependencies and no .env until you install or copy them.

Send as many Claude or Codex tasks as you will accept today. When the accept pile grows, send nothing new.

A second model is for a different job: a read-only search, a clean-context review, or the same card on two strong models where you keep one result. Cognition tried a fast Windsurf model that was supposed to call Sonnet 4.5 when it got stuck. The fast model missed the moment to ask.

You pick the split.

## A repeated correction becomes a file

The first time, you fix the output. The second time, you write the fix where every later agent will hit it, or where a command fails.

For code, the standing file (CLAUDE.md or AGENTS.md) holds only what the agent cannot see by reading the repo:

- the exact test, typecheck and lint command, including how to run one file
- a path that is still live and must stay uncopied
- one decision the code leaves unstated

Claude loads that file on every turn and asks you to stay under 200 lines. /init drafts it, and the work is mostly deleting. Codex stops reading the chain at 32 KiB.

A giant manual crowds out the task. OpenAI tried one, watched it rot, and cut theirs to about 100 lines that point at a docs/ tree the agent opens when it needs them.

The current task stays on the card. In the standing file, every parallel agent would inherit it.

A real never (leave generated code alone, leave secrets alone, run this formatter) goes in CI, a deny rule, or a linter whose message contains the fix. A sentence fails open. Claude's page says prose holds most of the time, and a Stop hook that exits non-zero is what blocks the turn.

For a post or a deck, same move.

- Voice rules and a checker. A slop linter is the content version of the test command.
- A list of facts from your notes. A missing number stays missing.
- A skill for raw notes to a draft, and another for one accepted piece into the other formats. The body loads when the task matches. It stays out of the window while you are in Cursor on code.

Anything that lives only in your head, a Slack thread, or a note the agent cannot open is invisible on that run. OpenAI drew it as a hard boundary: what Codex cannot see, it works around. Paste the fact into the card or into the repo.

## Code and content use the same accept

Look at three things. The check output. The diff or the draft. Whether it matches the outcome.

Skip the tool log unless the summary cites a file you doubt.

For a bug, Done is a failing test that then passes, plus the command and the last lines of output. "All tests pass" tells you little. Claude's own team says that if you invest in one test, make it end to end, because a unit test can pass while the feature is broken.

And the patch must be unable to edit the rule that judges it. They read REVIEW.md from the base branch for that reason.

For a post or a deck, Done is the checker output plus the sources the draft used. You still accept it. A public sentence stays with you, while OpenAI lets agents merge a lot of an internal product because a wrong patch there is cheap to follow up.

Auto-accept only where a wrong result is cheap to undo and the check is mechanical. A lab that can spend money, a delete, a merge to the shared branch of a tool other people run, and anything you publish stay on you.

## The day

Morning. Accept what finished. Send the next batch.

Then go do the thing that still needs you in the room: a call, a lab only you can break, a decision you have yet to write down.

Later, one more accept pass. Same three looks.

Before you close the laptop, any correction you typed twice today becomes a line, a test or a skill. OpenAI's team used to spend Fridays cleaning agent output by hand. That failed to scale, so they encoded the taste into linters and a cleanup job, and they say most of those pulls take under a minute.

The Friday is the smell. The file is the fix.

## What stays yours

1. Pick the outcome. The feature, the post, or the deck.
2. Supply a fact only you have.
3. Press send, merge, spend or delete when a mistake is expensive.
4. Do a kind of task for the first time. The second time, encode it.

## The feeling of speed lies

METR timed this. In early 2025, 16 maintainers who already knew their repositories took 19% longer with Cursor and Claude 3.5 or 3.7 Sonnet. Before the tasks they expected to be 24% faster. Afterward they still believed they had been 20% faster.

Screen time moved from typing code to prompting and reviewing, plus the wait for the model. The slowdown was larger on issues they knew well, where the model edited the wrong place and missed rules nobody had written down.

Their February 2026 follow-up could not settle it. People refused the week with AI turned off, between 30% and 50% held back tasks they would skip by hand, and the time logs broke once several agents ran at once. METR calls the evidence weak.

Count two things, and ignore how busy the agents look. How many results you accepted today. How many corrections you had to type twice.

If that second number stays flat, the setup is still waiting on you.

## Put it in this week

1. Write the short standing file. Commands, one landmine, one decision. Delete the architecture tour.
2. Add one check the work cannot satisfy by editing the check. A test for code. The voice checker plus a fact list for a post.
3. Move one procedure you keep retyping into a skill.
4. Put the next task in its own worktree or doc, fill the card, and leave the chat.
5. Accept with the three looks. Write down the correction you would otherwise type again tomorrow.

More agents help when the tasks do not share files, which is the Claude Code worktree rule, and each one has a check. Another sentence in the prompt helps once, on the card. After that, the speed is in the files the next agent already has.

## Sources

- METR, 10 July 2025, early-2025 maintainer study, and the 24 February 2026 note that the follow-up design broke: https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ and https://metr.org/blog/2026-02-24-uplift-update/
- Claude Code best practices (task card, 200-line CLAUDE.md, two corrections, checks): https://code.claude.com/docs/en/best-practices.md
- OpenAI, 11 February 2026, harness engineering: https://openai.com/index/harness-engineering/
- Cognition, 12 June 2025, and the follow-up about ten months later: https://cognition.ai/blog/dont-build-multi-agents and https://cognition.com/blog/multi-agents-working
- Codex AGENTS.md size cap, 32 KiB default: https://learn.chatgpt.com/docs/agent-configuration/agents-md.md
