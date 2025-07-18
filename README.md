# 📦 Inventory Management System

A comprehensive full-stack inventory management system built with modern web technologies for efficient business operations and reporting.

## 🚀 Features

### 📊 Dashboard & Analytics
- Real-time inventory statistics and metrics
- Low stock alerts and notifications
- Business performance overview
- Interactive charts and graphs

### 📦 Product Management
- Add, edit, and delete products
- SKU management and tracking
- Category-based organization
- Stock quantity monitoring
- Price and cost tracking
- Low stock threshold alerts

### 🏷️ Category Management
- Create and manage product categories
- Hierarchical category structure
- Category-based filtering and reporting

### 👥 Customer Management
- Customer database management
- Contact information tracking
- Customer order history
- Customer analytics and insights

### 🧾 Invoice & Billing
- Create professional invoices
- Automated invoice generation
- Payment tracking
- Invoice history and management

### 📈 Advanced Reporting
- **PDF Reports** - Professional formatted documents
- **Excel Reports** - Detailed spreadsheets with data analysis
- **CSV Reports** - Raw data export for external analysis
- **Date Range Filtering** - Generate reports for specific periods
- **Category Filtering** - Focus on specific product categories
- **Inventory Reports** - Stock levels, values, and analytics
- **Sales Reports** - Revenue and sales performance
- **Tax Reports** - Tax calculations and summaries
- **Profit & Loss Reports** - Financial performance analysis

### 🔐 Authentication & Security
- User registration and login
- JWT-based authentication
- Protected routes and API endpoints
- Role-based access control

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI components
- **TanStack Query** - Data fetching and caching
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Prisma** - Database ORM
- **SQLite** - Lightweight database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Report Generation
- **jsPDF** - PDF document generation
- **XLSX** - Excel file creation
- **File-saver** - Client-side file downloads

## 📁 Project Structure

```
inventory-management-system/
├── client/                     # Frontend Next.js application
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   │   ├── api/           # API routes
│   │   │   ├── categories/    # Category management
│   │   │   ├── customers/     # Customer management
│   │   │   ├── products/      # Product management
│   │   │   ├── invoices/      # Invoice management
│   │   │   ├── reports/       # Reports dashboard
│   │   │   └── settings/      # Application settings
│   │   ├── components/        # Reusable React components
│   │   │   ├── ui/           # UI component library
│   │   │   └── auth/         # Authentication components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions and configurations
│   │   └── types/            # TypeScript type definitions
│   ├── public/               # Static assets
│   └── package.json          # Frontend dependencies
├── server/                    # Backend Express.js application
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── middleware/       # Express middlewares
│   │   ├── models/           # Database models
│   │   └── utils/            # Server utilities
│   ├── prisma/               # Database schema and migrations
│   └── package.json          # Backend dependencies
├── .gitignore               # Git ignore rules
└── README.md               # Project documentation
```

## 🚦 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-management-system
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Set up environment variables**

   **Frontend (.env.local in client/)**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

   **Backend (.env in server/)**
   ```env
   PORT=5000
   JWT_SECRET=your-secret-key-here
   DATABASE_URL="file:./dev.db"
   ```

5. **Set up the database**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```

6. **Start the development servers**

   **Terminal 1 - Backend Server:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Frontend Server:**
   ```bash
   cd client
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📖 Usage Guide

### 🔐 Authentication
1. Register a new account or login with existing credentials
2. All features require authentication to access

### 📦 Managing Products
1. Navigate to **Products** page
2. Click **"Add Product"** to create new items
3. Fill in product details (name, SKU, price, stock, category)
4. Set low stock thresholds for automatic alerts
5. Edit or delete products as needed

### 🏷️ Managing Categories
1. Go to **Categories** section
2. Create categories to organize your products
3. Assign products to appropriate categories

### 👥 Managing Customers
1. Access **Customers** page
2. Add customer information and contact details
3. Track customer order history and interactions

### 📊 Generating Reports
1. Navigate to **Reports** dashboard
2. Select report type (Inventory, Sales, Tax, etc.)
3. Choose output format (PDF, Excel, CSV)
4. **Set date range** (both start and end dates required)
5. Optional: Filter by category
6. Click **"Generate & Download Report"**
7. Report will be automatically downloaded to your computer

### 🧾 Creating Invoices
1. Go to **Invoices** section
2. Create new invoices for customers
3. Add products and calculate totals
4. Generate professional invoice documents

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

## 📊 Report Types

### 📦 Inventory Report
- Current stock levels
- Product values and costs
- Low stock alerts
- Category breakdowns

### 💰 Sales Report
- Revenue analysis
- Sales performance metrics
- Product sales rankings
- Period comparisons

### 🧾 Tax Report
- Tax calculations
- Taxable transactions
- Tax summaries by period

### 📈 Profit & Loss Report
- Revenue vs costs
- Profit margins
- Financial performance
- Business analytics

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically

### Backend (Railway/Heroku)
1. Create new app on platform
2. Connect GitHub repository
3. Set environment variables
4. Configure database
5. Deploy application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or need support:

1. Check existing [Issues](../../issues)
2. Create a new issue with detailed description
3. Include steps to reproduce the problem
4. Provide environment details

## 🔮 Future Enhancements

- [ ] Multi-location inventory support
- [ ] Barcode scanning integration
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Mobile application
- [ ] Integration with accounting software
- [ ] Supplier management
- [ ] Purchase order system
- [ ] Automated reordering
- [ ] Multi-currency support

## 👨‍💻 Developer

Built with ❤️ by [Your Name]

---

## 📞 Contact

For questions or support, please reach out:

- **Email**: your.email@example.com
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **LinkedIn**: [Your Profile](https://linkedin.com/in/yourprofile)

---

**⭐ If this project helped you, please give it a star!**
