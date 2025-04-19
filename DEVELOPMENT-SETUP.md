# VibeWell Development Environment Setup Guide

This guide provides step-by-step instructions for setting up a development environment for the VibeWell platform.

## System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+ recommended)
- **Node.js**: Version 16.x or higher
- **NPM**: Version 8.x or higher
- **Git**: Latest version recommended
- **Storage**: At least 10GB free disk space
- **Memory**: Minimum 8GB RAM (16GB recommended)

## Local Development Environment Setup

### 1. Install Required Software

#### Node.js and NPM

Install Node.js which includes NPM:

- **Windows/macOS**: Download and install from [nodejs.org](https://nodejs.org/)
- **Linux (Ubuntu)**:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

Verify installation:
```bash
node -v
npm -v
```

#### Git

- **Windows**: Download and install from [git-scm.com](https://git-scm.com/download/win)
- **macOS**: Install using Homebrew `brew install git` or download from [git-scm.com](https://git-scm.com/download/mac)
- **Linux (Ubuntu)**:
  ```bash
  sudo apt-get update
  sudo apt-get install git
  ```

Verify installation:
```bash
git --version
```

#### Code Editor

We recommend using Visual Studio Code:
- Download from [code.visualstudio.com](https://code.visualstudio.com/)

Recommended VS Code extensions for VibeWell development:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- DotENV
- GitLens

### 2. Clone the Repository

```bash
git clone https://github.com/your-org/vibewell.git
cd vibewell
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```
# Base URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/vibewell-dev

# Auth0
AUTH0_SECRET=use-any-secret-for-dev
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://yourtenant.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret

# AWS S3 (for local development, you can use MinIO or LocalStack)
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=vibewell-local
S3_ENDPOINT=http://localhost:9000

# Stripe (use test keys)
STRIPE_SECRET_KEY=sk_test_yourtestkey
STRIPE_WEBHOOK_SECRET=whsec_yourtestwebhooksecret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_yourtestkey

# Other
NEXTAUTH_SECRET=your-nextauth-secret-for-dev
```

### 4. Local Dependencies Setup

#### PostgreSQL Database

**Option 1: Install locally**

- **Windows**: Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: Use Homebrew `brew install postgresql`
- **Linux (Ubuntu)**:
  ```bash
  sudo apt update
  sudo apt install postgresql postgresql-contrib
  ```

Create a new database:
```bash
sudo -u postgres psql
CREATE DATABASE "vibewell-dev";
CREATE USER postgres WITH ENCRYPTED PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE "vibewell-dev" TO postgres;
\q
```

**Option 2: Use Docker**

If you have Docker installed:
```bash
docker run --name vibewell-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=vibewell-dev -p 5432:5432 -d postgres
```

#### MinIO (S3 Alternative for Local Development)

**Using Docker**:
```bash
docker run -p 9000:9000 -p 9001:9001 --name vibewell-minio -e "MINIO_ROOT_USER=minioadmin" -e "MINIO_ROOT_PASSWORD=minioadmin" minio/minio server /data --console-address ":9001"
```

After starting MinIO:
1. Access the MinIO console at http://localhost:9001
2. Login with minioadmin/minioadmin
3. Create a new bucket named "vibewell-local"
4. Set the bucket policy to "public" for development purposes

#### Stripe CLI (for Webhook Testing)

Install the Stripe CLI:
- **Windows/macOS/Linux**: Follow instructions at [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

For webhook forwarding:
```bash
stripe login
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

### 5. Application Setup

#### Install Dependencies

```bash
npm install
```

#### Database Setup

Initialize the database with Prisma:
```bash
npx prisma migrate dev
```

This command will:
1. Create the database tables
2. Apply all migrations
3. Generate the Prisma client

To seed the database with initial data:
```bash
npm run seed
```

### 6. Start the Development Server

```bash
npm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Auth0 Setup for Development

1. Create a free Auth0 account at [auth0.com](https://auth0.com/)
2. Create a new Application (Regular Web Application)
3. Configure the following URLs:
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback/auth0`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`
4. Get your Client ID and Client Secret from the Settings tab
5. Update your `.env.local` file with these values

## Stripe Setup for Development

1. Create a free Stripe account at [stripe.com](https://stripe.com/)
2. Make sure you're in Test mode
3. Get your API keys from the Developers > API keys section
4. Create products and prices in the Stripe dashboard for testing
5. Update your `.env.local` file with your Stripe test keys

## Development Workflow

### Code Style and Linting

We use ESLint and Prettier for code formatting. Run linting with:
```bash
npm run lint
```

Fix linting issues automatically:
```bash
npm run lint:fix
```

### Testing

Run tests with:
```bash
npm test
```

For watching tests:
```bash
npm run test:watch
```

### Building for Production

To create a production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm start
```

### Git Workflow

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. Push to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub for review

### Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code changes that neither fix a bug nor add a feature
- `perf:` - Performance improvements
- `test:` - Adding or correcting tests
- `chore:` - Changes to the build process or tools

## Troubleshooting

### Common Issues

#### Next.js Hot Reload Not Working
- Check if your antivirus is blocking file watching
- Increase system file watch limits on Linux
- Make sure you're not editing files outside your editor

#### Database Connection Issues
- Verify PostgreSQL is running
- Check your DATABASE_URL in `.env.local`
- Make sure the database exists and the user has proper permissions

#### Auth0 Login Issues
- Verify callback URLs are correctly configured
- Make sure AUTH0_BASE_URL matches your local server URL
- Check Auth0 logs for specific error messages

#### S3/MinIO Connection Issues
- Verify MinIO is running
- Check S3 endpoint and credentials in `.env.local`
- Make sure the bucket exists and has proper permissions

## Helpful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Auth0 Next.js SDK](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Stripe Documentation](https://stripe.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

For any additional help, please contact the development team or refer to our internal documentation. 