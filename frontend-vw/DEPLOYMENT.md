# 🚀 Vercel Deployment Guide for Vire Workplace HR App

## Overview
This guide helps resolve common deployment issues when deploying the Vire Workplace HR App to Vercel.

## ✅ Pre-Deployment Checklist

### 1. Dependencies Check
- [ ] Vite is in `dependencies` (not `devDependencies`)
- [ ] `@vitejs/plugin-react` is in `dependencies`
- [ ] All required packages are properly installed

### 2. Build Scripts
- [ ] `build:vercel` script exists and works locally
- [ ] `prebuild` script cleans the dist directory
- [ ] Build command uses production mode

### 3. Configuration Files
- [ ] `vercel.json` is properly configured
- [ ] `.nvmrc` specifies Node.js version (18+)
- [ ] `.vercelignore` excludes unnecessary files

## 🔧 Common Issues & Solutions

### Issue: "vite: command not found"
**Cause**: Vite is in `devDependencies` instead of `dependencies`

**Solution**: 
```bash
# Move vite to dependencies
npm install vite @vitejs/plugin-react
npm uninstall vite @vitejs/plugin-react --save-dev
```

### Issue: Build fails with exit code 127
**Cause**: Missing dependencies or incorrect Node.js version

**Solution**:
1. Check Node.js version: `node --version` (should be 18+)
2. Clear cache: `npm cache clean --force`
3. Delete node_modules: `rm -rf node_modules package-lock.json`
4. Reinstall: `npm install`

### Issue: Environment variables not available
**Cause**: Missing environment configuration

**Solution**:
1. Set environment variables in Vercel dashboard
2. Use `VITE_` prefix for client-side variables
3. Ensure `.env` files are not in `.vercelignore`

## 🚀 Deployment Steps

### 1. Local Build Test
```bash
# Test build locally first
npm run build:vercel

# Verify dist folder is created
ls -la dist/
```

### 2. Vercel CLI Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. GitHub Integration
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build:vercel`
3. Set output directory: `dist`
4. Set Node.js version: 18.x

## 📁 File Structure
```
frontend-vw/
├── package.json          # Dependencies and scripts
├── vercel.json          # Vercel configuration
├── .nvmrc              # Node.js version
├── .vercelignore       # Excluded files
├── vite.config.js      # Vite configuration
└── src/                # Source code
```

## 🔍 Troubleshooting

### Check Build Logs
1. Go to Vercel dashboard
2. Select your project
3. Click on the latest deployment
4. Check build logs for specific errors

### Common Error Messages
- **"vite: command not found"** → Move vite to dependencies
- **"Exit code 127"** → Check Node.js version and dependencies
- **"Module not found"** → Check import paths and dependencies
- **"Build timeout"** → Optimize build process or increase timeout

### Performance Optimization
1. Enable build caching in Vercel
2. Use `npm ci` for faster installs
3. Optimize bundle size with code splitting
4. Enable compression and caching headers

## 📞 Support
If issues persist:
1. Check Vercel status page
2. Review build logs for specific errors
3. Test build locally with `npm run build:vercel`
4. Verify all dependencies are properly installed

## 🔄 Rollback
If deployment fails:
1. Go to Vercel dashboard
2. Select previous successful deployment
3. Click "Promote to Production"
4. Investigate and fix the issue
5. Redeploy when ready

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Vire Development Team
