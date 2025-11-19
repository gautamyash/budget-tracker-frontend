# Budget Tracker Frontend

A modern React frontend for the Budget Tracker application with beautiful charts and intuitive user interface.

## 🚀 Live Demo
[https://budget-tracker-frontend-puce.vercel.app](https://budget-tracker-frontend-puce.vercel.app)

## ✨ Features
- **User Authentication**: Secure login and registration system
- **Dashboard**: Interactive charts showing budget vs expenses, category breakdown, and spending trends
- **Transaction Management**: Add, edit, delete, and filter transactions
- **Budget Tracking**: Set monthly budgets and monitor spending
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Real-time Updates**: Instant data synchronization with backend

## 🛠️ Technology Stack
- **React 18** - Modern frontend framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **D3.js** - Interactive data visualizations
- **CSS3** - Custom styling with responsive design

## 📦 Installation

### Prerequisites
- Node.js 16+ installed
- Backend API running (see backend repository)

### Setup
1. Clone the repository:
```bash
git clone https://github.com/gautamyash/budget-tracker-frontend.git
cd budget-tracker-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## 🌐 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variable: `REACT_APP_API_URL` to your backend URL
4. Deploy automatically

### Environment Variables
- `REACT_APP_API_URL`: Backend API URL (required for production)

## 📊 Features Overview

### Dashboard
- **Budget vs Expenses Chart**: Visual comparison of monthly budget vs actual spending
- **Category Breakdown**: Donut chart showing expense distribution by category
- **Spending Trends**: Line chart displaying spending patterns over time
- **Quick Stats**: Total income, expenses, and remaining budget

### Transactions
- **Add Transactions**: Quick form to add income/expense transactions
- **Advanced Filtering**: Filter by type, category, date range, and amount
- **Edit/Delete**: Update or remove transactions
- **Pagination**: Handle large datasets efficiently

### Authentication
- **Secure Login**: JWT-based authentication
- **User Registration**: Create new accounts
- **Session Management**: Automatic token handling
- **Logout**: Secure session termination

## 🔧 API Integration

The frontend connects to the backend API through the `api.js` service:

```javascript
// Example API call
import api from '../services/api';

const response = await api.get('/transactions');
```

### API Endpoints Used
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/transactions` - Fetch transactions
- `POST /api/transactions` - Add transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/budget/summary` - Budget overview

## 🎨 Design System

### Color Palette
- Primary: `#5563DE` (Indigo)
- Success: `#10b981` (Green)
- Danger: `#ef4444` (Red)
- Background: `#f9fafb` (Light Gray)

### Responsive Breakpoints
- Desktop: `1024px+`
- Tablet: `768px - 1023px`
- Mobile: `320px - 767px`

## 🚀 Performance Optimizations
- Lazy loading of components
- Optimized D3 chart rendering
- Efficient state management
- Minimal bundle size
- Responsive image handling

## 🔒 Security Features
- JWT token authentication
- CORS configuration
- Secure API communication
- Input validation
- XSS protection

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License
This project is licensed under the MIT License.

## 🆘 Support
For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

---

**Backend Repository**: [budget-tracker-backend](https://github.com/gautamyash/budget-tracker-backend)

**Live App**: [https://budget-tracker-frontend-puce.vercel.app](https://budget-tracker-frontend-puce.vercel.app)
