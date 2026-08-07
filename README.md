# RepPilot

Corporate AI resource repository to centralize, discover, and reuse AI assets across teams.

Official page: https://reppilot.gran-ser.com/

## What is RepPilot

RepPilot is an enterprise platform designed to manage AI resources in one governed workspace, including agents, skills, instructions, prompts, and MCP servers.

Its mission is to transform scattered AI knowledge into an organized, searchable, and reusable catalog for the entire organization.

## Why teams choose RepPilot

- True centralization of AI resources in a single repository.
- Fast discovery through global search, type filters, and tags.
- Faster reuse of AI assets across projects and business units.
- Guided publishing from Git repositories (GitHub and GitLab, public or private).
- AI Kit assisted generation to build project-ready AI setups.
- Role-based access control with granular permissions.
- Centralized administration for technical configuration and user management.

## Core capabilities

- Executive dashboard with key metrics and featured resources.
- Resource catalog with pagination and metadata-driven exploration.
- Resource detail pages with Markdown rendering, rating, and direct download.
- Three-step publishing workflow: scan, select, and publish.
- Conversational AI Kit flow to design and generate ready-to-use kits.
- Admin panel for Git, OpenAI, authentication, and user management.
- User profile with favorites and quick access to relevant resources.

## VS Code Extension

Rep-Pilot ships a companion VS Code extension that keeps your team's AI configuration files in sync across every developer's workspace. Instead of manually copying `.github/copilot-instructions.md`, `.cursor/rules`, or `.claude/skills` between repos, the extension handles it automatically.

**How it works:**

1. **Project detection** — the extension scans your workspace on startup for a `reppilot-conf.json` file and links it to your Rep-Pilot project.
2. **Bidirectional sync** — local edits are pushed to the server in real time via file watching; remote changes are pulled at your configured interval.
3. **Conflict resolution** — when the same file is edited on both sides, a visual diff panel opens so you can merge changes manually.

**Key features:**

- 🔄 Automatic bidirectional sync of agent prompts, workflow rules, and shared settings
- 🔍 Real-time file watching — local changes detected and pushed instantly
- ⏱ Periodic polling — remote updates pulled at configurable intervals
- ⚠️ Conflict detection with side-by-side diff panel
- 📁 Multi-folder sync — sync `.github`, `.cursor`, `.claude`, or any folder your team standardizes
- 📊 Status bar indicator showing sync state at a glance

**Commands:**

| Command                         | Description                        |
| ------------------------------- | ---------------------------------- |
| `RepPilot: Sync now`            | Trigger a full sync immediately    |
| `RepPilot: Show conflicts`      | Open the conflict resolution panel |
| `RepPilot: Configure extension` | Jump to extension settings         |

👉 **[Install from Marketplace](https://marketplace.visualstudio.com/items?itemName=GonzaloRandoSerna.rep-pilot-vscode)**

## Product vision

RepPilot is built for organizations that need to scale AI adoption with governance, traceability, and control while reducing duplicated effort and improving engineering productivity.

To explore the full product experience, screenshots, and feature overview:
https://reppilot.gran-ser.com/
