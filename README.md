# ExpenceXpert - Personal Finance Manager

A comprehensive personal finance tracker with modern dark theme UI built with Next.js, Express.js, and MongoDB. Track your income, expenses, and visualize your financial data with beautiful charts and analytics.

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

2. **Set up the backend**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   Create `.env` file in the server directory:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   DB_NAME=ExpenceXpert

   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d

   # Server
   PORT=5000
   NODE_ENV=development
   ```

4. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   ```

5. **Configure frontend environment**
   Create `.env.local` file in the client directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on http://localhost:5000

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   Frontend will run on http://localhost:3000

3. **Access the application**
   Open your browser and navigate to http://localhost:3000

## 📱 Usage

### User Registration
1. Navigate to the registration page
2. Fill in your details (name, email, password)
3. Password must contain uppercase, lowercase, and numbers
4. Click "Create Account" to register

### Dashboard Overview
- **Total Balance**: Current financial balance
- **Total Income**: Sum of all income transactions
- **Total Expenses**: Sum of all expense transactions
- **Savings Rate**: Percentage of income saved
- **Recent Transactions**: Latest financial activities
- **Quick Actions**: Common tasks and shortcuts

### Navigation
- **Dashboard**: Financial overview and stats
- **Transactions**: Manage income and expenses
- **Analytics**: Charts and spending insights
- **Settings**: Account and app preferences

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get financial summary

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/dashboard-stats` - Get dashboard statistics

## 🎨 UI Components

Built with shadcn/ui components:
- **Forms**: Input, Button, Label, Textarea
- **Layout**: Card, Sheet, Separator
- **Navigation**: Dropdown Menu, Breadcrumb
- **Feedback**: Toast, Alert, Badge, Skeleton
- **Data Display**: Table, Avatar, Progress

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: Middleware for route protection
- **Input Validation**: Server-side validation with express-validator
- **CORS Configuration**: Cross-origin request handling
- **Helmet**: Security headers and protection

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Configure build and start commands
4. Deploy with automatic SSL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [MongoDB](https://www.mongodb.com/) for the database
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Recharts](https://recharts.org/) for the charting library
- [Lucide](https://lucide.dev/) for the icon set
