# CargoLink — Static demo

This is a simple frontend-only demo (HTML, CSS, vanilla JS) for the CargoLink hackathon project.

This repository is ready to publish on GitHub Pages. Below are quick instructions to create a repo and publish the site.

Quick local preview

Use Python (no Node required):

```bash
cd /path/to/project
python3 -m http.server 8000
# open http://localhost:8000
```

Publish on GitHub Pages (recommended for sharing)

1. Create a new repository on GitHub (e.g. `cargolink-demo`).
2. Push this folder to the new repo:

```bash
git init
git add .
git commit -m "Initial CargoLink demo"
git branch -M main
git remote add origin git@github.com:YOUR_USER/YOUR_REPO.git
git push -u origin main
```

3. This repository contains a GitHub Actions workflow that will automatically publish the repository root to GitHub Pages whenever you push to `main`.

Using the GitHub CLI (alternative — creates repo and publishes):

```bash
gh repo create YOUR_USER/YOUR_REPO --public --source=. --remote=origin
git push -u origin main
```

After the first push, go to the repository Settings → Pages to confirm the site URL, or wait a couple minutes for Actions to finish the deployment. Your site will be available at `https://YOUR_USER.github.io/YOUR_REPO/`.

If you want me to run the local git commands for you (and you have your Git credentials set up here), say so and I can run them in a terminal.
