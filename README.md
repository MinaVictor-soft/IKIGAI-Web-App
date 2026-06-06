# IKIGAI Quest - Web App

A responsive web application for IKIGAI Quest with full Arabic and English support.

## Features

- 🌍 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌐 **Multi-language** - Full Arabic and English support with RTL support
- 🎯 **Quiz System** - Take interactive quizzes and track scores
- 🏆 **Leaderboards** - Compete with other users
- 📱 **Event Management** - Attend events and sessions
- 📚 **Publications Library** - Access educational content
- ⚽ **Sports Module** - Track football matches
- 🔐 **Authentication** - Secure login and registration
- 🎨 **Modern UI** - Built with Tailwind CSS and Lucide icons

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
cd web-app
npm install
```

### Development

```bash
npm run dev
```

The app will open at `http://localhost:5174`

### Environment Variables

Create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:3000/api
```

### Build for Production

```bash
npm run build
```

### Deploy to Replit

1. Connect your Replit project to this repository
2. Create `.env` file with appropriate API URL
3. Run `npm install && npm run build`
4. Use the Replit web server to serve the `dist` folder

## Project Structure

```
src/
├── components/        # Reusable UI components
├── contexts/         # React contexts (Auth, Language)
├── i18n/            # i18n configuration and translations
├── layouts/         # Layout components
├── lib/             # API and utility functions
├── pages/           # Page components
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Technologies

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query** - Data fetching
- **i18next** - Internationalization
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## API Integration

The app connects to the IKIGAI Quest backend API. Make sure the backend is running on `http://localhost:3000`.

Endpoints used:
- `/api/auth/*` - Authentication
- `/api/quiz/*` - Quiz management
- `/api/sports/*` - Sports module
- `/api/attendance/*` - Sessions and attendance
- `/api/publications/*` - Publications
- `/api/xp/*` - XP and leaderboards
- `/api/profile/*` - User profile

## Language Support

The app supports Arabic and English with automatic RTL support for Arabic. Switch languages in the header.

## License

MIT
