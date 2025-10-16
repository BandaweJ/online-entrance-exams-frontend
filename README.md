# Online Entrance Exams - Frontend

An Angular-based frontend application for managing school entrance examinations.

## Features

- **Student Dashboard**: View available exams, take exams, and view results
- **Admin Dashboard**: Manage exams, students, questions, and view statistics
- **Exam Taking Interface**: Real-time exam taking with timer and auto-save
- **Results Management**: View and publish exam results
- **User Management**: Admin and student account management
- **Responsive Design**: Mobile-friendly interface using Angular Material

## Tech Stack

- **Framework**: Angular 20
- **UI Library**: Angular Material
- **State Management**: NgRx
- **HTTP Client**: Angular HttpClient
- **Styling**: SCSS
- **Build Tool**: Angular CLI

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## Installation

1. Install dependencies:
```bash
npm install
```

2. Update the API URL in `src/environments/environment.ts` to point to your backend:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api' // Update this URL
};
```

## Development

```bash
# Start development server
npm start

# Build for development
npm run build

# Build for production
npm run build:prod

# Run tests
npm test
```

The application will be available at `http://localhost:4200`.

## Production Build

For production deployment:

```bash
# Build the application
npm run build:prod

# The built files will be in dist/frontend/
```

## Environment Configuration

### Development Environment
- File: `src/environments/environment.ts`
- API URL: `http://localhost:3000/api`

### Production Environment
- File: `src/environments/environment.prod.ts`
- API URL: `https://your-backend-app-name.onrender.com/api`

## Deployment

This application is configured for deployment on Render.com:

1. **Build Command**: `npm run render:build`
2. **Start Command**: `npm run render:start`
3. **Node Version**: 18.x or higher

### Render Configuration

1. Connect your GitHub repository
2. Set the build command: `npm run render:build`
3. Set the start command: `npm run render:start`
4. Set the publish directory: `dist/frontend`

## Project Structure

```
src/
├── app/
│   ├── admin/                 # Admin-specific components
│   ├── student/               # Student-specific components
│   ├── core/                  # Core services and models
│   │   ├── services/          # API services
│   │   ├── models/            # Data models
│   │   └── store/             # NgRx store
│   ├── shared/                # Shared components
│   └── app.component.*        # Root component
├── environments/              # Environment configurations
└── styles.scss               # Global styles
```

## API Integration

The frontend communicates with the backend API through the following services:

- **AuthService**: Authentication and user management
- **ExamService**: Exam management
- **StudentService**: Student management
- **AttemptsService**: Exam attempt management
- **ResultsService**: Results and statistics
- **AnswersService**: Answer management
- **UserService**: User management

## Key Features

### Student Features
- View available exams
- Take exams with timer
- View personal results
- Update profile

### Admin Features
- Create and manage exams
- Add questions and sections
- Manage students
- View comprehensive statistics
- Publish results

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT# Trigger deployment
