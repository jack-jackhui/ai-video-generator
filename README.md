# AI-Powered Video Generator App Frontend

[![CI](https://github.com/jack-jackhui/ai-video-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/jack-jackhui/ai-video-generator/actions/workflows/ci.yml)
[![Docker Build & Deploy](https://github.com/jack-jackhui/ai-video-generator/actions/workflows/docker-deploy.yml/badge.svg)](https://github.com/jack-jackhui/ai-video-generator/actions/workflows/docker-deploy.yml)

Transform your scripts into captivating videos in minutes with our AI-powered Video Generator App. This tool is designed to streamline video production, offering high-quality outputs with minimal input and effort.

**Live Site:** [ai-video.jackhui.com.au](https://ai-video.jackhui.com.au)

## Key Features

- **Fast Video Creation**: Generate videos quickly, turning scripts into finished products in minutes.
- **User-Friendly Interface**: Our straightforward UI makes it easy for anyone to create videos, with powerful AI assistance.
- **High-Quality Video Content**: Access over 3 million video clips to ensure professional-grade video quality.
- **Crystal Clear Narration**: Choose between using your own voice or high-quality AI-generated narration.
- **Cloud-Based**: Enjoy the flexibility of a cloud-based application that works seamlessly across all computers.
- **OpenAI Sora Integration**: Generate AI videos using OpenAI Sora video model.

## Tech Stack

- **Framework**: Next.js 14
- **UI**: NextUI + Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions → Docker → Azure VM
- **Auth**: Django REST Framework + OAuth (Google, GitHub, Microsoft)

## Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/jack-jackhui/ai-video-generator.git
   cd ai-video-generator
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests in watch mode |
| `npm run test:ci` | Run tests once (CI) |

## Deployment

This project uses automated CI/CD:

1. **Push to main** triggers GitHub Actions
2. **CI** runs lint, tests, and build
3. **Docker Build** creates image and pushes to GHCR
4. **Deploy** pulls latest image on Azure VM and restarts container

### Required Secrets

Set these in GitHub repository settings → Secrets:

| Secret | Description |
|--------|-------------|
| `AZURE_VM_HOST` | Azure VM IP address |
| `AZURE_VM_USER` | SSH username |
| `AZURE_VM_SSH_KEY` | Private SSH key |
| `NEXT_PUBLIC_MICROSOFT_CLIENT_ID` | Microsoft OAuth client ID |
| `NEXT_PUBLIC_MICROSOFT_REDIRECT_URL` | Microsoft OAuth redirect URL |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `NEXT_PUBLIC_GITHUB_REDIRECT_URL` | GitHub OAuth redirect URL |

## Project Structure

```
src/
├── app/
│   ├── api/              # API clients (Auth, Video, ImageGen)
│   ├── components/       # React components
│   │   ├── auth/         # Auth modal, login form, social buttons
│   │   └── layout/       # Shared layouts
│   ├── context/          # React contexts (Auth)
│   ├── hooks/            # Custom hooks (OAuth, polling)
│   ├── dashboard/        # Dashboard page
│   ├── videoGen/         # Video generator page
│   ├── faceSwap/         # Face swap page
│   ├── imageGen/         # Image generation page
│   └── photoFaceSwap/    # Photo face swap page
├── lib/
│   ├── auth/             # Token storage utilities
│   └── constants/        # App constants
└── __tests__/            # Test files
```

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

See [LICENSE](LICENSE) for details.
