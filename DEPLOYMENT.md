# GitHub Pages Deployment Guide

## 🚀 Quick Start

Your StaffLink Hub application is now ready for GitHub Pages deployment!

## Prerequisites

Before deploying, make sure you have:
- A GitHub repository set up
- GitHub Pages enabled in your repository settings
- The base URL configured correctly (see Configuration section)

## Deployment Options

### Option 1: Automatic Deployment (Recommended)

The GitHub Actions workflow will automatically build and deploy your application when you push to `main` or `master` branch.

**Steps:**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Configure for GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings → Pages**
   - Under "Build and deployment", select:
     - **Source:** GitHub Actions
   - Save

3. **Monitor Deployment:**
   - Go to the **Actions** tab in your repository
   - The deployment workflow will run automatically
   - Your site will be live at: `https://<username>.github.io/<repo-name>/`

### Option 2: Manual Local Build + Upload

1. **Build locally:**
   ```bash
   bun run build
   ```

2. **The `dist/` folder contains your deployable application**

3. **Upload to GitHub Pages:**
   - Use `gh-pages` package or manually create a `gh-pages` branch
   - Or use the GitHub Actions workflow (Option 1)

## Configuration

### For Project Repository (e.g., `/stafflink-hub`)

If deploying to a project repository (not user pages), update the environment variable in GitHub Actions:

In `.github/workflows/deploy.yml`, modify the build step:
```yaml
- name: Build project
  run: bun run build
  env:
    VITE_BASE_URL: "/stafflink-hub/"
```

Also update `vite.config.ts` to use the project repository name:
```typescript
base: "/stafflink-hub/",
```

### For User/Organization Repository

If deploying to `https://<username>.github.io/`, use:
```typescript
base: "/",
```

## Environment Variables

Create a `.env.local` file if needed for sensitive data (not committed to Git):

```env
VITE_API_URL=https://your-api.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Troubleshooting

### Pages not showing content

1. **Check GitHub Pages settings:**
   - Settings → Pages
   - Ensure "GitHub Actions" is selected as source

2. **Verify base URL:**
   - Check if the repository name is included in base URL
   - Compare with GitHub Pages URL structure

3. **Clear browser cache:**
   - Hard refresh (Cmd+Shift+R on Mac)
   - Check browser console for 404 errors

4. **Check Actions logs:**
   - Go to Actions tab
   - Check the deploy workflow logs for errors

### Build fails on GitHub Actions

1. Check the Actions logs for specific error messages
2. Ensure `bun` is properly installed (workflow uses `setup-bun`)
3. Verify all environment variables are set if needed
4. Try building locally: `bun run build`

### Assets return 404

This usually means the `base` URL is incorrect in `vite.config.ts`. Make sure it matches your GitHub Pages URL path.

## Performance Optimization

The build is already optimized with:
- ✅ Minified code
- ✅ Code splitting (vendor chunks)
- ✅ Production build mode
- ✅ Disabled source maps

## Next Steps

1. Commit these changes
2. Push to GitHub
3. Enable GitHub Pages in repository settings
4. Verify deployment in Actions tab
5. Access your site at the GitHub Pages URL

## Support

For more information:
- [Vite GitHub Pages Deployment](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Happy deploying! 🎉**
