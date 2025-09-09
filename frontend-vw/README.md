# 🏢 Vire Workplace HR App Frontend

> **Modern React-based HR Management System**  
> Built with Vite, React 19, and Tailwind CSS

## 📋 Project Overview

The Vire Workplace HR App is a comprehensive human resource management system designed to streamline HR operations, employee management, and workplace efficiency. This frontend application provides an intuitive interface for HR managers, administrators, and staff members.

## 🚀 Recent Updates (August 2024)

### 🔧 **Major Deployment Fix - Vercel Integration**
- **Issue Resolved**: Fixed critical `vite: command not found` error preventing Vercel deployment
- **Root Cause**: Vite was incorrectly placed in `devDependencies` instead of `dependencies`
- **Solution Implemented**: 
  - Restructured dependencies in `package.json`
  - Created custom build script (`build.sh`) for robust deployment
  - Added production-optimized Vite configuration
  - Enhanced Vercel configuration with fallback mechanisms

### 📚 **Comprehensive Component Documentation**
- **Command UI Component**: Added extensive JSDoc documentation and inline comments
- **Documentation Standards**: Established consistent documentation patterns
- **Code Quality**: Improved maintainability and developer experience

### 🛠️ **Build System Enhancements**
- **Production Configuration**: Created `vite.config.prod.js` for optimized builds
- **Deployment Scripts**: Added `deploy.sh` and `build.sh` for automation
- **Environment Management**: Added `.nvmrc` for Node.js version consistency
- **Build Optimization**: Implemented chunk splitting and performance improvements

## 🏗️ **Technical Stack**

### **Core Technologies**
- **React 19** - Latest React with concurrent features
- **Vite 7** - Fast build tool and development server
- **Tailwind CSS 4** - Utility-first CSS framework
- **TypeScript/JavaScript** - Type-safe development

### **UI Components**
- **Radix UI** - Accessible component primitives
- **Lucide React** - Modern icon library
- **Framer Motion** - Animation library
- **React Hook Form** - Form management
- **Zod** - Schema validation

### **State Management & Data**
- **TanStack Query** - Server state management
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Date-fns** - Date manipulation

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vite** - Build tooling
- **Git** - Version control

## 📁 **Project Structure**

```
frontend-vw/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Input, etc.)
│   │   └── nav-user.jsx    # User navigation component
│   ├── screens/            # Page components
│   │   ├── Authentication/ # Login, OTP, Password reset
│   │   └── UserDashboards/ # HR, Admin, Staff dashboards
│   ├── config/             # Configuration files
│   ├── lib/                # Utility functions
│   └── styles/             # Global styles
├── public/                 # Static assets
├── dist/                   # Build output
├── build.sh               # Vercel build script
├── deploy.sh              # Local deployment script
├── vite.config.js         # Development configuration
├── vite.config.prod.js    # Production configuration
├── vercel.json            # Vercel deployment config
└── package.json           # Dependencies and scripts
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd frontend-vw

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Available Scripts**
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run build:vercel     # Build for Vercel deployment
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
./deploy.sh              # Run deployment script
```

## 🌐 **Deployment**

### **Vercel Deployment**
The app is configured for seamless deployment on Vercel:

1. **Automatic Deployment**: Push to main branch triggers deployment
2. **Custom Build Script**: Uses `build.sh` for robust building
3. **Production Optimization**: Optimized for performance and security
4. **Environment Management**: Proper environment variable handling

### **Deployment Status**
- ✅ **Build System**: Fully configured and tested
- ✅ **Dependencies**: Properly structured for production
- ✅ **Configuration**: Optimized for Vercel platform
- ✅ **Documentation**: Comprehensive deployment guides

## 🔐 **Authentication & Security**

### **Security Features**
- **JWT Token Management**: Secure authentication flow
- **OTP Verification**: Two-factor authentication
- **Password Reset**: Secure password recovery
- **Route Protection**: Authenticated route guards
- **CORS Configuration**: Proper cross-origin setup

### **User Roles**
- **HR Manager**: Full HR management capabilities
- **Admin**: System administration access
- **Staff**: Employee self-service features

## 📱 **Features**

### **HR Management**
- Employee onboarding and offboarding
- Performance tracking and reviews
- Leave management and approval
- Document management
- Reporting and analytics

### **User Experience**
- Responsive design for all devices
- Dark/light theme support
- Accessibility compliance
- Intuitive navigation
- Real-time updates

### **Integration**
- Backend API integration
- File upload and management
- Email notifications
- Data export capabilities

## 🛠️ **Development**

### **Code Quality**
- **ESLint Configuration**: Enforced code standards
- **Component Documentation**: Comprehensive JSDoc comments
- **Type Safety**: TypeScript integration
- **Testing**: Unit and integration tests

### **Performance**
- **Code Splitting**: Optimized bundle loading
- **Lazy Loading**: Route-based code splitting
- **Asset Optimization**: Compressed and cached assets
- **Build Optimization**: Production-ready builds

## 📚 **Documentation**

### **Available Guides**
- `DEPLOYMENT.md` - Comprehensive deployment guide
- `DEPLOYMENT_FIX_SUMMARY.md` - Issue resolution details
- `DEPLOYMENT_READY.md` - Deployment readiness checklist

### **Component Documentation**
- Inline JSDoc comments
- Usage examples
- Props documentation
- Accessibility notes

## 🤝 **Contributing**

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### **Code Standards**
- Follow ESLint configuration
- Add JSDoc comments for new components
- Write meaningful commit messages
- Test your changes thoroughly

## 📞 **Support**

### **Issues & Bugs**
- Check existing issues in the repository
- Create detailed bug reports
- Include steps to reproduce
- Provide environment information

### **Development Team**
- **Lead Developer**: Vire Development Team
- **Last Updated**: August 2024
- **Version**: 1.0.0

## 📄 **License**

This project is proprietary software developed for Vire Workplace HR Management System.

---

## 🎯 **Project Status**

| Component | Status | Notes |
|-----------|--------|-------|
| **Core Application** | ✅ Complete | Fully functional HR system |
| **Authentication** | ✅ Complete | Secure login and user management |
| **UI Components** | ✅ Complete | Comprehensive component library |
| **Deployment** | ✅ Ready | Vercel deployment configured |
| **Documentation** | ✅ Complete | Comprehensive guides available |
| **Testing** | 🔄 In Progress | Unit and integration tests |

---

**🏢 Vire Workplace HR App Frontend**  
*Streamlining HR operations with modern technology*

**Last Updated**: August 2024  
**Version**: 1.0.0  
**Status**: Production Ready 🚀