# Setup Git Authentication for Push

## Option 1: Personal Access Token (Recommended)

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `repo` scope
3. Copy the token
4. When pushing, use the token as password:
   ```bash
   git push origin HEAD
   # Username: your-github-username
   # Password: paste-your-token-here
   ```

## Option 2: SSH Key

1. Generate SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
2. Add to GitHub: Settings → SSH and GPG keys → New SSH key
3. Test connection:
   ```bash
   ssh -T git@github.com
   ```
4. Change remote to SSH:
   ```bash
   git remote set-url origin git@github.com:yourusername/yourrepo.git
   ```

## Option 3: GitHub CLI

```bash
# Install GitHub CLI
# Then authenticate
gh auth login

# Push will work automatically
git push origin HEAD
```

## Option 4: Credential Helper (Windows)

```bash
# Store credentials
git config --global credential.helper wincred

# Then push (will prompt once, then remember)
git push origin HEAD
```

## Quick Push Command

After setting up authentication, just run:

```bash
cd c:\Rodistaa\Rodistaa-V2
git push origin HEAD
```
