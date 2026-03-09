# Development & Deployment Setup Guide

## 📋 Project Information

- **Name:** StaffLink Hub
- **Type:** Vite + React + TypeScript + TailwindCSS + Shadcn
- **Package Manager:** Bun
- **Deployment:** GitHub Pages

## 🛠️ Local Development Setup

### Prerequisites

- **Node.js:** v18+ (recommended v20+)
- **Bun:** Latest version
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/stafflink-hub.git
   cd stafflink-hub
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Start development server:**
   ```bash
   bun run dev
   ```
   The app will be available at `http://localhost:8080`

## 📦 Build & Deploy

### Local Build

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

### GitHub Pages Deployment

The repository includes automated GitHub Actions workflow that:
- ✅ Builds the application automatically on push
- ✅ Deploys to GitHub Pages automatically
- ✅ Handles the base URL configuration
- ✅ Optimizes for production

**No manual deployment needed!** Just push to `main` or `master` branch.

## ⚙️ Configuration

### GitHub Pages URL Configuration

The application supports two GitHub Pages deployment scenarios:

#### Scenario 1: User/Organization Pages
URL: `https://username.github.io`

**Configuration:**
```typescript
// vite.config.ts
base: "/"
```

#### Scenario 2: Project Repository
URL: `https://username.github.io/stafflink-hub`

**Configuration:**
```typescript
// vite.config.ts
base: "/stafflink-hub/"
```

Also update in `.github/workflows/deploy.yml`:
```yaml
- name: Build project
  run: bun run build
  env:
    VITE_BASE_URL: "/stafflink-hub/"
```

### Environment Variables

Create `.env.local` for local development (Git-ignored):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API Configuration
VITE_API_URL=https://api.example.com

# Application
VITE_BASE_URL=/
```

## 🧪 Testing

```bash
# Run tests
bun run test

# Watch mode
bun run test:watch
```

## 🎨 Code Quality

```bash
# Run linter
bun run lint

# Fix linting issues
bun run lint --fix
```

## 📁 Project Structure

```
stafflink-hub/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Shadcn/ui components
│   │   ├── AppLayout.tsx
│   │   └── AppSidebar.tsx
│   ├── pages/           # Page components
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities & helpers
│   ├── types/           # TypeScript types
│   ├── integrations/    # External services (Supabase)
│   └── App.tsx          # Main app component
├── public/              # Static assets
├── supabase/            # Supabase configuration
├── .github/
│   └── workflows/       # GitHub Actions workflows
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies & scripts
```

## 🔒 Security Best Practices

1. **Never commit secrets:**
   - Use `.env.local` for sensitive data (Git-ignored)
   - Use GitHub Secrets for CI/CD sensitive data

2. **Environment variables:**
   - Client-side: Prefix with `VITE_`
   - Server-side: No prefix (not available to build)

3. **Build time safety:**
   - Only `VITE_*` variables are embedded in build
   - Other secrets remain safe on CI/CD

## 🚨 Common Issues & Solutions

### Issue: Content not showing on GitHub Pages

**Solution:**
1. Verify base URL matches repository structure
2. Check GitHub Actions workflow logs
3. Clear browser cache
4. Verify GitHub Pages settings use "GitHub Actions" as source

### Issue: Routing not working

**Solution:**
- App automatically uses `import.meta.env.BASE_URL`
- Ensure vite.config.ts has correct base URL
- Check browser console for 404 errors

### Issue: Assets returning 404

**Solution:**
1. Check vite.config.ts base URL
2. Ensure build output is in dist/
3. Verify index.html is in dist/ after build

### Issue: Styles not loading

**Solution:**
- Vite handles CSS automatically
- Ensure Tailwind config is correct
- Check for CSS import errors in console

## 📚 Useful Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vite GitHub Pages Deployment](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally: `bun run build && bun run preview`
4. Commit and push
5. GitHub Actions will automatically deploy

## 📝 Deployment Checklist

Before pushing to production:

- [ ] `bun run build` succeeds without errors
- [ ] `bun run preview` works correctly
- [ ] `bun run lint` passes
- [ ] `bun run test` passes
- [ ] Environment variables are configured in GitHub Secrets (if needed)
- [ ] GitHub Pages settings point to "GitHub Actions"
- [ ] Base URL is correct for your deployment scenario

## 🎉 You're Ready!

Your application is now fully configured for GitHub Pages deployment. Simply push to the main branch and your changes will be live within minutes!

---

**Need help?** Check the DEPLOYMENT.md file for more detailed deployment instructions.
