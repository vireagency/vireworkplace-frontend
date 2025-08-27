# 🚀 Vercel Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Vercel account
- Git repository connected to Vercel

## Environment Setup

### 1. Production Environment Variables

Create the following environment variables in your Vercel project:

```bash
VITE_API_URL=https://vireworkplace-backend-hpca.onrender.com/api/v1
VITE_APP_ENV=production
NODE_ENV=production
```

### 2. Build Configuration

The app is configured to:
- Use production API endpoints in production
- Use development proxy in development
- Optimize bundle size with code splitting
- Remove console logs in production

## Deployment Steps

### 1. Local Build Test

```bash
# Install dependencies
npm install

# Build for production
npm run build:prod

# Preview production build
npm run preview
```

### 2. Vercel Deployment

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Build Settings**:
   - Build Command: `npm run build:prod` (or use vercel.json)
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Framework Preset: Vite
3. **Set Environment Variables**: Add the production environment variables
4. **Deploy**: Click deploy and wait for build completion

**Note**: The `vercel.json` file is already configured with the correct build command and output directory.

### 3. Post-Deployment

- Verify all routes work correctly
- Test authentication flows
- Check API connectivity
- Monitor performance metrics

## Route Structure

### Public Routes
- `/` - Landing page
- `/otp-request` - OTP request
- `/otp-confirmation` - OTP confirmation
- `/forgot-password` - Password reset
- `/reset-password` - Password reset form
- `/welcome-user` - Welcome page
- `/role-selection` - Role selection

### Protected Routes
- `/human-resource-manager/*` - HR Dashboard routes
- `/admin` - Admin Dashboard
- `/staff` - Staff Dashboard

## API Configuration

- **Development**: Uses Vite proxy (`/api/v1`)
- **Production**: Direct API calls to backend
- **Fallback**: Graceful error handling for API failures

## Performance Optimizations

- Code splitting for vendor libraries
- Asset optimization and compression
- Cache headers for static assets
- Tree shaking for unused code

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Node.js version (18+ required)
2. **Routing Issues**: Verify vercel.json configuration
3. **API Errors**: Check environment variables
4. **Performance**: Monitor bundle size and loading times

### Debug Commands

```bash
# Check build output
npm run build:prod

# Lint code
npm run lint

# Clean build directory
npm run clean
```

## Monitoring

- Use Vercel Analytics for performance monitoring
- Monitor API response times
- Track user authentication success rates
- Monitor error rates and user experience

## Security

- All routes are properly protected
- Authentication tokens are handled securely
- API calls use HTTPS in production
- Environment variables are properly secured
