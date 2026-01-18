# Frontend - Next.js Web Application

Modern, responsive web interface for document tampering detection built with Next.js 14, React, and TypeScript. Provides an intuitive user experience for uploading documents, viewing analysis results, and managing user accounts.

## Overview

The frontend serves as the primary user interface for the Proofly platform, offering a clean, professional design with real-time analysis visualization and comprehensive dashboard features.

## Features

- Modern responsive UI with Tailwind CSS
- User authentication and session management
- Drag-and-drop document upload
- Real-time analysis progress tracking
- Interactive results visualization
- Analysis history dashboard
- Usage statistics tracking
- Mobile-friendly design
- Dark mode support (optional)

## Technology Stack

- Next.js 14 (React framework with App Router)
- TypeScript (Type safety)
- Tailwind CSS (Utility-first styling)
- React Hooks (State management)
- Fetch API (HTTP requests)

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── about/
│   │   └── page.tsx       # About page
│   ├── analyze/
│   │   └── page.tsx       # Upload and analysis page
│   ├── dashboard/
│   │   └── page.tsx       # User dashboard
│   ├── extension/
│   │   └── page.tsx       # Extension info page
│   ├── history/
│   │   └── page.tsx       # Analysis history
│   ├── login/
│   │   └── page.tsx       # Login page
│   └── signup/
│       └── page.tsx       # Registration page
├── components/             # Reusable React components
│   ├── Navbar.tsx         # Navigation bar
│   ├── Footer.tsx         # Page footer
│   ├── ImageUploader.tsx  # Upload component
│   ├── ResultCard.tsx     # Results display
│   └── FeatureCard.tsx    # Feature showcase
├── public/                 # Static assets
│   ├── images/
│   └── icons/
├── next.config.mjs        # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies
```

## Installation

### Prerequisites

- Node.js 16.0 or higher
- npm or yarn package manager

### Setup Steps

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Run development server:
```bash
npm run dev
# or
yarn dev
```

5. Open browser:
Navigate to `http://localhost:3000`

## Configuration

### API Configuration

Update the API endpoint in your components:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
```

### Tailwind Configuration

Customize colors, fonts, and breakpoints in `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
      },
    },
  },
};
```

## Pages

### Landing Page (/)
- Hero section with product overview
- Feature highlights
- Call-to-action buttons
- Responsive design

### Analyze Page (/analyze)
- Document upload interface
- Drag-and-drop support
- Progress indicator
- Results visualization
- Downloadable analysis report

### Dashboard (/dashboard)
- User profile information
- Usage statistics
- Recent analyses
- Tier information

### History (/history)
- List of all previous analyses
- Filtering and sorting options
- Detailed view for each analysis
- Delete functionality

### Login Page (/login)
- Username/email input
- Password field
- Remember me option
- Link to registration

### Signup Page (/signup)
- Username selection
- Email input
- Password with confirmation
- Tier selection
- Terms acceptance

### About Page (/about)
- Project information
- Technology overview
- Team information
- Contact details

## Components

### Navbar Component
```tsx
<Navbar />
```
Features:
- Logo and branding
- Navigation links
- User menu dropdown
- Authentication status
- Mobile responsive menu

### ImageUploader Component
```tsx
<ImageUploader onUpload={handleUpload} />
```
Props:
- onUpload: Callback function for file upload
- acceptedFormats: Array of allowed file types
- maxSize: Maximum file size in bytes

### ResultCard Component
```tsx
<ResultCard result={analysisResult} />
```
Props:
- result: Analysis result object
- showDetails: Boolean for detailed view
- onExport: Callback for exporting results

### Footer Component
```tsx
<Footer />
```
Features:
- Quick links
- Social media links
- Copyright information
- Newsletter signup

## State Management

Using React hooks for state management:

```typescript
// Authentication state
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [user, setUser] = useState(null);

// Upload state
const [uploading, setUploading] = useState(false);
const [progress, setProgress] = useState(0);

// Results state
const [analysisResult, setAnalysisResult] = useState(null);
```

## API Integration

### Authentication

```typescript
// Login
const login = async (username: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
};

// Logout
const logout = () => {
  localStorage.removeItem('token');
};
```

### Document Upload

```typescript
const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  return await response.json();
};
```

### Fetch Analysis History

```typescript
const getHistory = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/images`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return await response.json();
};
```

## Styling

### Tailwind CSS Classes

Common utility patterns:

```tsx
// Layout
<div className="container mx-auto px-4">

// Buttons
<button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">

// Cards
<div className="bg-white rounded-xl shadow-lg p-6">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Custom CSS

Add custom styles in `app/globals.css`:

```css
@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg;
  }
}
```

## Responsive Design

Breakpoints:
- sm: 640px (Mobile landscape)
- md: 768px (Tablet)
- lg: 1024px (Desktop)
- xl: 1280px (Large desktop)

Example usage:
```tsx
<div className="text-base md:text-lg lg:text-xl">
  Responsive text
</div>
```

## Building for Production

### Build Command

```bash
npm run build
# or
yarn build
```

### Start Production Server

```bash
npm start
# or
yarn start
```

### Static Export (Optional)

For static hosting:

```bash
# Update next.config.mjs
output: 'export'

# Build
npm run build
```

## Performance Optimization

- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- Lazy loading for heavy components
- Caching strategies with SWR or React Query
- Minification and compression

## Testing

### Unit Tests

```bash
# Install testing libraries
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run tests
npm test
```

### Example Test

```typescript
import { render, screen } from '@testing-library/react';
import Navbar from '@/components/Navbar';

test('renders navigation links', () => {
  render(<Navbar />);
  expect(screen.getByText('Analyze')).toBeInTheDocument();
});
```

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

Required variables in `.env.local`:

```env
# API endpoint
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators

## Troubleshooting

### Build Errors

Clear cache and rebuild:
```bash
rm -rf .next
npm run build
```

### Module Not Found

Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### API Connection Issues

Check CORS settings and API URL configuration.

### Styling Issues

Verify Tailwind CSS configuration and rebuild:
```bash
npm run dev
```

## Development Tips

- Use TypeScript for type safety
- Follow component composition patterns
- Keep components small and focused
- Use custom hooks for reusable logic
- Implement error boundaries
- Add loading states
- Handle edge cases

## Code Standards

- Use functional components
- Implement proper error handling
- Add PropTypes or TypeScript types
- Follow naming conventions
- Write descriptive comments
- Use ESLint and Prettier

## Contributing

When adding new features:
1. Create feature branch
2. Follow existing code structure
3. Add TypeScript types
4. Test responsive design
5. Update documentation
6. Submit pull request

## Performance Metrics

Target metrics:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

## License

Educational and research purposes.
