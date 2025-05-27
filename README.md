# ExpenceXpert - Personal Finance Manager

A modern, responsive personal finance management application built with Next.js, TypeScript, MongoDB, and NextAuth. Track your income, expenses, budgets, and financial goals with an intuitive and beautiful interface featuring secure Google authentication.

## 🚀 Features

- **Secure Authentication**: Google OAuth integration with NextAuth
- **Dashboard Overview**: Get a comprehensive view of your financial health
- **Transaction Management**: Add, edit, and categorize income and expenses
- **Budget Planning**: Set and track budgets for different categories
- **Financial Goals**: Set and monitor your savings and financial objectives
- **Bill Reminders**: Never miss a payment with smart notifications
- **Expense Analytics**: Visualize your spending patterns with charts
- **Profile Management**: Customize your account settings
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Data Persistence**: MongoDB database for secure data storage

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Frontend**: React 18, TypeScript
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner for toast notifications
- **Date Handling**: date-fns

## 📦 Installation

### Prerequisites

- Node.js 
- npm, yarn, pnpm, or bun
- MongoDB database (local or cloud)
- Google OAuth credentials

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ExpenceXpert
   ```

2. **Install dependencies**
   
   Using npm:
   ```bash
   npm install
   ```
   
   Using yarn:
   ```bash
   yarn install
   ```
   
   Using pnpm:
   ```bash
   pnpm install
   ```
   
   Using bun:
   ```bash
   bun install
   ```

3. **Environment Setup**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```bash
   # Database
   MONGODB_URI=mongodb://localhost:27017/expencexpert
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expencexpert
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   
   # Google OAuth (Get from Google Cloud Console)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Google OAuth Setup**
   
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

5. **Database Setup**
   
   For local MongoDB:
   ```bash
   # Install MongoDB locally or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```
   
   For MongoDB Atlas:
   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a cluster and get connection string
   - Add your IP to whitelist

6. **Start the development server**
   
   Using npm:
   ```bash
   npm run dev
   ```
   
   Using yarn:
   ```bash
   yarn dev
   ```
   
   Using pnpm:
   ```bash
   pnpm dev
   ```
   
   Using bun:
   ```bash
   bun dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:3000` to see the application running.

## 🏗️ Project Structure

```
expence-xpert/
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   │   ├── auth/     # NextAuth configuration
│   │   │   ├── transactions/ # Transaction CRUD
│   │   │   └── budgets/  # Budget CRUD
│   │   ├── login/        # Login page
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── DashboardPage.tsx
│   │   ├── TransactionList.tsx
│   │   ├── BudgetPlanner.tsx
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   │   ├── useTransactions.ts
│   │   └── useBudgets.ts
│   ├── lib/              # Utility functions and configurations
│   │   ├── auth.ts       # NextAuth configuration
│   │   ├── mongodb.ts    # Database connection
│   │   ├── utils.ts      # General utilities
│   │   └── types.ts      # TypeScript type definitions
│   ├── models/           # Database models
│   │   ├── User.ts       # User schema
│   │   ├── Transaction.ts # Transaction schema
│   │   └── Budget.ts     # Budget schema
│   └── middleware.ts     # Next.js middleware for auth
├── .env.example          # Environment variables template
├── .env.local            # Local environment variables (create this)
├── components.json       # shadcn/ui configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── next.config.js        # Next.js configuration
└── package.json          # Project dependencies and scripts
```

## 🔐 Authentication Flow

1. User visits the application
2. Middleware redirects unauthenticated users to `/login`
3. User clicks "Continue with Google"
4. Google OAuth flow completes
5. NextAuth creates/updates user in MongoDB
6. User is redirected to dashboard with session

## 🗄️ Database Schema

### User Model
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  image?: string,
  emailVerified?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  amount: number,
  type: 'income' | 'expense',
  category: string,
  description: string,
  date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Budget Model
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  category: string,
  amount: number,
  spent: number,
  period: 'monthly' | 'weekly' | 'yearly',
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Customization

### Theme Configuration

The application supports both light and dark themes. You can customize the color scheme by modifying the CSS variables in `src/app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... other color variables */
}
```

### Adding New API Routes

1. Create new route in `src/app/api/`
2. Implement GET, POST, PUT, DELETE methods as needed
3. Add authentication checks using `getServerSession`
4. Follow RESTful conventions

### Extending Database Models

1. Update model files in `src/models/`
2. Create corresponding API routes
3. Update TypeScript interfaces
4. Create custom hooks for data fetching

## 🚀 Deployment

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

### Deployment Options

#### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

#### Other Platforms
- **Netlify**: Configure build settings for Next.js
- **Railway**: Connect MongoDB and deploy
- **DigitalOcean App Platform**: Configure environment variables

### Environment Variables for Production

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expencexpert

# NextAuth Configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🔧 API Endpoints

### Authentication
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Budgets
- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/[id]` - Update budget
- `DELETE /api/budgets/[id]` - Delete budget

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [MongoDB](https://www.mongodb.com/) for the database
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Recharts](https://recharts.org/) for the charting library
- [Lucide](https://lucide.dev/) for the icon set