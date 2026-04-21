# AI Plan

Date: April 20, 2026

## Goal

Use AI to help build a significantly improved slot machine game while documenting how AI helps, where it fails, and whether it is useful in our software engineering process.

## AI Tool / Harness

We will use one approved AI coding assistant consistently for this warm-up:

- OpenAI Codex: GPT-5.3-Codex

We will keep using the same harness throughout the project as required by the assignment.

## Why We Chose This Tool

We chose Codex because it is designed for code generation, editing, and debugging in a development workflow. It can help with implementation, refactoring, tests, and documentation while still letting the team review and control the final code.

## Initial Strategy

Our strategy for using AI is:

1. Build a rough draft version of the game first so we quickly get a playable baseline.
2. Once the baseline works, improve the game one feature at a time with focused prompts.
3. Review generated code after each prompt to confirm behavior.
4. Run tests/linting as we go (when available for the current codebase).
5. Log every important AI interaction in `ai-use-log.md`.
6. If AI fails to fix something, retry with a clearer prompt before hand-editing.

## Development Workflow

We are following a two-phase workflow:

1. Phase 1: Rough playable baseline
- Use AI to generate a simple but working version of the slot machine.
- Prioritize core functionality over polish.
- Confirm the game loop works (spin, balance update, win/loss messaging).

2. Phase 2: Feature-by-feature refinement
- Improve one feature at a time (for example: spin behavior, theme/styling, light/dark mode, lever/button interactions).
- Keep prompts narrow so each change is isolated and easier to verify.
- Prefer iterative fixes over large rewrites once the base game is stable.

## How We Plan To Use AI

We expect to use AI for:

- generating the initial baseline implementation
- revising small pieces of code after the baseline works
- helping write tests
- improving documentation
- fixing bugs
- refactoring code for readability

## Hand-Editing Rule

We may read and evaluate the code at any time. If a correction is needed, we will first try to fix it through AI prompting. Only after that fails will we hand-edit the code, and we will record that in `ai-use-log.md`.

## Documentation Plan

We will document our process in two places:

- `ai-plan.md`: our planned AI strategy
- `ai-use-log.md`: what we did, what happened, and what we learned as we go

If our strategy changes during development, we will update this plan and explain the change in the log.
