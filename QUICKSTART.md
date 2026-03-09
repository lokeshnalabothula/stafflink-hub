# 🚀 Quick Start Guide - StaffLink Hub

Welcome to StaffLink Hub! This guide will get you up and running in minutes.

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies
```bash
bun install
```

### Step 2: Start Development Server
```bash
bun run dev
```

Open http://localhost:8080 in your browser. You're ready to go! 🎉

## 📋 What's Included

- ✅ Modern React 18 with TypeScript
- ✅ Beautiful UI with Tailwind CSS & Shadcn/ui
- ✅ Production-ready Vite build setup
- ✅ GitHub Pages deployment ready
- ✅ Supabase integration for authentication
- ✅ Automatic GitHub Actions deployment

## 🎯 Key Sections

### 👔 Admin Pages
- **Dashboard** - Overview and analytics
- **Employees** - Manage employee records
- **Attendance** - Track attendance
- **Leaves** - Manage leave requests
- **Payroll** - Manage salaries and payments
- **Reports** - Generate business reports
- **Orders** - Manage orders
- **Customers** - Manage customer information
- **Profile** - User profile management

## 🔧 Available Commands

```bash
# Development
bun run dev          # Start dev server

# Production
bun run build        # Build for production
bun run preview      # Preview production build

# Quality
bun run lint         # Run linter
bun run test         # Run tests
bun run test:watch   # Tests in watch mode
```

## 🛠️ Configuration

### Environment Setup
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```

### GitHub Pages Deployment
1. Push to GitHub
2. Enable GitHub Pages in repository settings
3. That's it! Automatic deployment via GitHub Actions

## 📚 Next Steps

1. **Read SETUP.md** - Detailed development setup
2. **Read DEPLOYMENT.md** - Deployment instructions
3. **Explore components/** - Reusable UI components
4. **Check pages/** - Page components

## 🎨 Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── contexts/      # React context providers
├── hooks/         # Custom React hooks
├── lib/           # Utilities
├── types/         # TypeScript types
└── integrations/  # External services (Supabase)
```

## 🚀 Deploy to Production

### Automatic (Recommended)
```bash
git add .
git commit -m "Ready for production"
git push origin main
```
GitHub Actions will automatically build and deploy!

### Manual
```bash
bun run build
# Upload dist/ folder to GitHub Pages
```

## 🐛 Troubleshooting

### Port 8080 already in use
```bash
# Kill process or use different port
bun run dev -- --port 3000
```

### Dependencies issue
```bash
# Clear and reinstall
rm -rf node_modules bun.lockb
bun install
```

### GitHub Pages not showing
1. Check repository settings → Pages
2. Verify "GitHub Actions" is selected
3. Hard refresh browser (Cmd+Shift+R)
4. Check Actions tab for build errors

## 📖 Documentation

- [SETUP.md](./SETUP.md) - Full development guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [Tailwind Docs](https://tailwindcss.com/)
- [Shadcn/ui Components](https://ui.shadcn.com/)

## 💡 Tips

- Use `bun` instead of npm/yarn for faster installation
- Press `e` in dev server to open in editor
- Use TypeScript for better development experience
- Check browser console for helpful debugging

## 🎓 Learning Resources

- [React Fundamentals](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

## ❓ Need Help?

1. Check the other documentation files
2. Look at similar components for patterns
3. Check GitHub Actions logs for deployment issues
4. Review browser console for errors

## 🎉 You're All Set!

Start developing with:
```bash
bun run dev
```

Happy coding! 🚀

---

**Pro Tip:** Star the repository and share with your team!
