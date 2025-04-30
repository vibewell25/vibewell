# Vibewell AR & Skin Analysis

A modern web application for virtual try-on and skin analysis using augmented reality and machine learning.

## Features

### AR Try-On
- Real-time facial tracking and mesh generation
- 3D model overlay with accurate positioning
- Product visualization with customizable transformations
- Support for makeup and accessories

### Skin Analysis
- Advanced skin condition detection
- Personalized recommendations
- Progress tracking
- Detailed analytics

## Technology Stack

- **Frontend**: Next.js 14, React 18, Three.js
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **AR/ML**: TensorFlow.js, Face-API.js
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel

## Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL 14.0 or higher
- Modern browser with WebGL and camera support
- Device with gyroscope (for mobile AR features)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/vibewell.git
   cd vibewell
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in the required environment variables in `.env`

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Development

### Code Structure
```
src/
├── app/              # Next.js 14 App Router
├── components/       # React components
│   ├── ar/          # AR-related components
│   └── ui/          # Common UI components
├── contexts/        # React contexts
├── hooks/           # Custom hooks
├── lib/             # Utility functions
├── types/           # TypeScript types
└── tests/           # Test files
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Linting
```bash
# Run ESLint
npm run lint
```

## Performance Optimization

- Lazy loading of AR and ML models
- WebGL context management
- Asset optimization
- Caching strategies
- Rate limiting

## Security Measures

- HTTPS enforcement
- CSP headers
- Rate limiting
- Input validation
- Authentication checks
- CORS configuration

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

Mobile browsers:
- iOS Safari
- Chrome for Android

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

### Environment Variables

Required environment variables for production:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_BUCKET_NAME`
- `REDIS_URL`

### Database Migration

```bash
npx prisma migrate deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact:
- Email: support@vibewell.com
- Discord: [Vibewell Community](https://discord.gg/vibewell)
- Twitter: [@vibewell](https://twitter.com/vibewell)
