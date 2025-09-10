# 🗂️ CloudVault - Modern Cloud Storage Platform

A full-stack cloud storage platform built with Next.js 15, featuring real-time file management, user authentication, and a sleek modern interface inspired by Apple's design principles.

![Cloud Storage Platform](https://img.shields.io/badge/Next.js-15.3.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19.0+-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0+-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🌟 Features

### Core Functionality
- **🔐 Secure Authentication** - Powered by Clerk with email verification and OTP support
- **📁 File Management** - Upload, organize, star, and delete files with drag-and-drop support
- **🗂️ Folder Structure** - Create and navigate through nested folder hierarchies
- **📊 Storage Management** - 50MB per user limit with real-time usage tracking
- **🗑️ Trash System** - Soft delete with restore functionality

### User Experience
- **🎨 Modern UI** - Clean, minimal design inspired by Apple's aesthetics
- **📱 Responsive Design** - Works seamlessly across desktop, tablet, and mobile
- **⚡ Real-time Updates** - Instant feedback for all file operations
- **🎯 Smart Validation** - Pre-upload file size and type validation
- **📈 Progress Tracking** - Visual upload progress with error handling

### Technical Features
- **🏗️ Type-Safe** - Full TypeScript implementation
- **🔄 Database Integration** - PostgreSQL with Drizzle ORM
- **☁️ Cloud Storage** - ImageKit integration for file hosting
- **🚀 Performance** - Optimized with Next.js 15 and Turbopack
- **🛡️ Security** - Protected API routes with user authorization

## 📁 Project Structure

```
cloud-storage/
├── 📂 app/                    # Next.js App Router
│   ├── 📂 api/                # API Routes
│   │   ├── files/             # File operations (upload, delete, star, trash)
│   │   ├── folders/           # Folder management
│   │   └── storage/           # Storage usage tracking
│   ├── dashboard/             # Main app interface
│   ├── login/                 # Authentication pages
│   └── page.tsx               # Landing page
├── 📂 components/             # React Components
│   ├── ui/                    # shadcn/ui base components
│   ├── FileUploadForm.tsx     # Upload interface with storage limits
│   ├── FileList.tsx           # File management table
│   ├── StorageIndicator.tsx   # Storage usage display
│   └── ...                    # Other UI components
├── 📂 database/               # Database setup
│   ├── schema.ts              # File & user data models
│   └── drizzleClient.ts       # DB connection
├── 📂 lib/                    # Utilities
│   └── storageUtils.ts        # 50MB limit calculations
└── 📄 Config files            # ENV, TypeScript, Tailwind, etc.
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm
- **PostgreSQL** database
- **ImageKit** account for file storage
- **Clerk** account for authentication

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cloud-storage.git
cd cloud-storage
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Environment Setup

Copy the sample environment file and configure your variables:

```bash
cp .env.sample .env
```

Add your environment variables to `.env`:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/login"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# ImageKit Configuration
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="your_public_key"
IMAGEKIT_PRIVATE_KEY="your_private_key"
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_imagekit_id"
```

### 4. Database Setup

```bash
# Generate and run database migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 5. Start Development Server

```bash
# Using pnpm
pnpm dev

# Or using npm
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application running!

## 🛠️ Technology Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Component library
- **[Lucide React](https://lucide.dev/)** - Icon library

### Backend & Database
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database toolkit
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Neon](https://neon.tech/)** - Serverless PostgreSQL

### Authentication & Storage
- **[Clerk](https://clerk.com/)** - User authentication and management
- **[ImageKit](https://imagekit.io/)** - Cloud-based image and file storage

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Database migrations

## 📋 Available Scripts

```bash
# Development
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database
pnpm db:generate  # Generate database migrations
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Drizzle Studio (database GUI)
```

## 🏗️ Key Architecture Decisions

### Storage Management
- **50MB Limit**: Each user gets 50MB of storage space
- **Real-time Tracking**: Storage usage is calculated and displayed in real-time
- **Pre-upload Validation**: Files are validated before upload to prevent exceeding limits

### File Organization
- **Hierarchical Structure**: Support for nested folders and files
- **Soft Deletes**: Files are moved to trash before permanent deletion
- **Metadata Storage**: File information stored in PostgreSQL for fast queries

### Security
- **Route Protection**: All API routes are protected with Clerk authentication
- **User Isolation**: Users can only access their own files and folders
- **Input Validation**: All inputs are validated using Zod schemas

### Performance
- **Optimistic Updates**: UI updates immediately with server reconciliation
- **Lazy Loading**: Components and data are loaded on-demand
- **Caching**: Strategic caching for improved performance

## 🔧 API Endpoints

### File Management
- `GET /api/files` - List user files and folders
- `POST /api/files/upload` - Upload new files
- `POST /api/files/[fileId]/star` - Toggle file star status
- `POST /api/files/[fileId]/trash` - Move file to trash
- `DELETE /api/files/[fileId]/delete` - Permanently delete file
- `POST /api/files/empty-trash` - Empty trash folder

### Folder Management
- `POST /api/folders/create` - Create new folder

### Storage Management
- `GET /api/storage/usage` - Get current storage usage

### Authentication
- `GET /api/imagekit-auth` - Get ImageKit authentication token


## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.