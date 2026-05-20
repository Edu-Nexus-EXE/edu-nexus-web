# Installing Edu Nexus Codex Skills

This repo keeps Codex skills in `.codex/skills/` so they can be versioned with
the project. Codex native skill discovery scans `~/.agents/skills/` at startup,
so create a symlink or junction from your global skills folder to this repo.

## Windows PowerShell

From the repo root:

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.agents\skills"
cmd /c mklink /J "$env:USERPROFILE\.agents\skills\edu-nexus-web" "%cd%\.codex\skills"
```

Restart Codex after creating the junction.

## macOS / Linux / WSL

From the repo root:

```bash
mkdir -p ~/.agents/skills
ln -s "$(pwd)/.codex/skills" ~/.agents/skills/edu-nexus-web
```

Restart Codex after creating the symlink.

## Verify

```bash
ls ~/.agents/skills/edu-nexus-web
```

You should see directories such as `edu-nexus-workflow` and
`edu-nexus-feature`, each containing a `SKILL.md`.

## Uninstall

Windows PowerShell:

```powershell
Remove-Item "$env:USERPROFILE\.agents\skills\edu-nexus-web"
```

macOS / Linux / WSL:

```bash
rm ~/.agents/skills/edu-nexus-web
```
