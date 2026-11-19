---
name: github-push-workflow
description: Commit and push this repo to GitHub. Use when the user asks to submit code to GitHub, push to a remote, or create the first push for this project. Do not use for general git knowledge questions.
---

# GitHub Push Workflow

This skill documents the safe commit-and-push flow for the current project (`zhangxue-zhihu` → `github.com/zl250/zhangxue.git`) on Windows / PowerShell 5. Follow the steps in order. Stop and surface the blocker if a step fails — do not chain to the next step on failure.

## Prerequisites

- Git installed (test: `git --version`)
- Network reachable to github.com on **HTTPS (443)** or **SSH (22 or 443)**
- A public/private key pair at `$HOME\.ssh\id_ed25519` (or `id_rsa`) already registered in the GitHub account `zl250`
- Or a GitHub Personal Access Token with `repo` scope

## 1. Snapshot current state

Run these first. Do not skip.

```powershell
git status --short
git branch --show-current
git log --oneline -1
git remote -v
```

- `git status --short` must be empty before push. If there are uncommitted changes, ask the user first — do **not** auto-commit without a message from them.
- Record the current branch name. If it is not `main`, confirm whether to rename it or push as-is.

## 2. Add or update the remote

Only set the remote URL if it is missing or points to the wrong repo.

```powershell
git remote remove origin 2>$null
git remote add origin https://github.com/zl250/zhangxue.git
git remote -v
```

SSH variant (preferred, only when SSH works):

```powershell
git remote set-url origin git@github.com:zl250/zhangxue.git
```

## 3. Test connectivity **before** pushing

This catches auth / cert / network issues cheaply.

```powershell
git ls-remote origin HEAD
```

Expected output: one line `SHA_REF HEAD`. Anything else means fail — diagnose below.

### Troubleshooting matrix

| Symptom | Likely cause | Safe fix |
| --- | --- | --- |
| `fatal: unable to access ... SSL certificate OpenSSL verify result: unable to get local issuer certificate` | Corp/school SSL interception, or Git's OpenSSL backend missing the local CA chain | **Use schannel backend locally** — this uses Windows Certificate Store which usually has the corp CA. Do NOT set it globally. Run once with env var: `$env:GIT_SSL_BACKEND='schannel'; git ls-remote origin HEAD`. If that works, write it to local repo only: `git config http.sslBackend schannel` (no `--global`). |
| `fatal: unable to access ... SSL certificate problem: self signed certificate` | Same as above | Same schannel fix. |
| `ssh: connect to host github.com port 22: Connection refused` | Port 22 blocked by firewall, common on campus / in China | Try port 443 via env var: `$env:GIT_SSH_COMMAND='ssh -p 443'; git ls-remote git@github.com:zl250/zhangxue.git HEAD`. If it works, persist in local repo only via `.git/config` Host entry, not `~/.ssh/config`. |
| `Permission denied (publickey)` | Key not registered, wrong key, or agent not running | Show the user the public key (`Get-Content $HOME\.ssh\id_ed25519.pub`) so they can verify it in GitHub → Settings → SSH and GPG keys. |
| Repository not found | Repo URL wrong, or repo is private and auth missing | Have user confirm the URL and auth. |

**Global config changes (`--global`) are forbidden** in this skill — they affect every repo. Only set values in the current repo (`git config` without flags, or edit `.git/config` directly).

## 4. Push

Working tree clean + connectivity OK → push.

```powershell
# First push sets upstream
git push -u origin main
```

If the current branch is not `main`, push the actual branch name.

On force-push: **never** run `git push --force` or `git push --force-with-lease` unless the user explicitly asks AND you have verified the remote history is disposable (e.g., empty repo, your own project).

## 5. Verify (mandatory)

After `git push` succeeds, emit these three facts verbatim so the user can cross-check:

```powershell
git remote get-url origin
git branch -vv | Select-Object -First 1
git log --oneline -1
```

Then compose a reply with:

1. **Remote URL**
2. **Branch name + upstream tracking**
3. **Latest commit hash (short) + subject**
4. **Clickable link to the commit on GitHub** — format: `https://github.com/zl250/zhangxue/commit/<full-sha>`

Without these four items the user cannot confirm the push actually landed. Past runs of this workflow failed to produce trust because the agent only said "push done" without evidence.

## 6. Record (if required by project rules)

If the project has a `Cheney_prompt.md`, append the push action per its rules. Otherwise skip.

## Anti-patterns this skill explicitly forbids

- `git config --global` for SSL backend, proxy, or credential helper — ever.
- Running `git push --force` or resetting remote refs without an explicit, approved request.
- Auto-committing unrelated working-tree changes.
- Claiming success without printing remote URL, branch, and the latest commit SHA.
- Deleting `.git` to "fix" state.
- Modifying `~/.ssh/config` or `~/.gitconfig`.
