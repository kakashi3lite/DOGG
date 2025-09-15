<<<<<<< HEAD
# DOGG
 dog training and wellness platform called DOGG that helps dog owners track their pet's training progress, health metrics, and connect with other dog owners through an integrated community feature
=======
# 🐕 DoggieGrowl - Your Dog's Digital Companion

**DoggieGrowl** is a comprehensive platform designed for dog owners who want to track their furry friend's health, training progress, and connect with a vibrant community of fellow dog lovers. Whether you're a new puppy parent or a seasoned dog owner, DoggieGrowl helps you give your dog the best care possible.

## ✨ Features

### 🏥 Health Tracking

- Monitor your dog's health records and vaccination schedules
- Track vet visits and medical history
- Set reminders for important health milestones

### 📚 Training & Progress

- Access structured training lessons for dogs of all ages
- Track your dog's learning progress with our gamified system
- Earn achievements and XP as your dog masters new skills

### 👥 Community & Social

- Connect with other dog owners in your area
- Share photos and stories in our community forum
- Get advice and support from experienced dog parents

### 🏆 Gamification

- Level up your dog's profile as they learn and grow
- Compete on leaderboards with other dogs
- Unlock badges and achievements for milestones

### 💬 Real-time Features

- Live chat with other community members
- Real-time notifications for important events
- Instant updates on your dog's progress

## 🚀 Quick Start

### Prerequisites

Before you begin, make sure you have:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **pnpm** (version 8 or higher) - [Install guide](https://pnpm.io/installation)
- **Docker** (for local database) - [Download here](https://docker.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kakashi3lite/DOGG.git
   cd DOGG
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start the database**

   ```bash
   docker-compose up -d
   ```

4. **Set up environment variables**

   ```bash
   # Copy environment files
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   📝 **Note:** Edit the `.env` files with your specific configuration values.

5. **Seed the database (optional)**

   ```bash
   pnpm seed
   ```

6. **Start the development servers**
   ```bash
   pnpm dev
   ```

🎉 **You're all set!**

- Web app: http://localhost:3000
- API server: http://localhost:3001

## 🏗️ Project Architecture

This is a modern monorepo built with the latest technologies:

### 📱 Frontend (`apps/web`)

- **Next.js 14** with App Router for optimal performance
- **Tailwind CSS** + **shadcn/ui** for beautiful, responsive design
- **React Query** for efficient data fetching and caching
- **TypeScript** for type safety

### 🔧 Backend (`apps/api`)

- **Express.js** API with robust middleware
- **MongoDB** with **Mongoose** for data persistence
- **Socket.IO** for real-time features
- **Zod** for request validation
- **JWT** authentication with **bcrypt** password hashing

### 📦 Shared Packages

- `packages/ui` - Reusable UI components
- `packages/types` - Shared TypeScript types and schemas
- `packages/config` - ESLint and TypeScript configurations
- `packages/gamification` - XP, streaks, and achievement logic
- `packages/db-seed` - Database seeding utilities

## 🛠️ Available Commands

| Command         | Description                           |
| --------------- | ------------------------------------- |
| `pnpm dev`      | Start all development servers         |
| `pnpm build`    | Build all applications for production |
| `pnpm start`    | Start production servers              |
| `pnpm lint`     | Run linting across all packages       |
| `pnpm format`   | Format code with Prettier             |
| `pnpm test`     | Run all tests                         |
| `pnpm test:e2e` | Run end-to-end tests                  |
| `pnpm seed`     | Populate database with sample data    |

## 🌐 Deployment

### Local Production Build

```bash
pnpm build
pnpm start
```

### Cloud Deployment

DoggieGrowl is configured for easy deployment on **Render** using the included `render.yaml` configuration file. Simply connect your repository to Render for automated deployments.

## 🔒 Security

We take security seriously. Please review our [Security Policy](SECURITY.md) for guidelines on:

- Reporting security vulnerabilities
- Best practices for contributors
- Security considerations for deployment

## 📖 API Documentation

Explore our comprehensive API documentation:

- **OpenAPI Spec:** [`docs/specs/openapi.yaml`](docs/specs/openapi.yaml)
- **Database Models:** [`docs/models/erd.md`](docs/models/erd.md)
- **Operations Guide:** [`docs/OPERATIONS.md`](docs/OPERATIONS.md)

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, every contribution matters.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `pnpm test`
5. Lint your code: `pnpm lint`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to your branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Quality

- We use **ESLint** and **Prettier** for code consistency
- **Husky** and **lint-staged** ensure quality on every commit
- **Conventional Commits** for clear commit messages

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🐕 Made with ❤️ for Dog Lovers

DoggieGrowl is more than just an app - it's a community dedicated to helping dogs live their happiest, healthiest lives. Join us in making the world a better place for our four-legged friends!

---

**Questions or need help?** Open an issue or reach out to our community on the platform!
>>>>>>> 1d068a0 (🔒 feat: Comprehensive security & testing implementation)
