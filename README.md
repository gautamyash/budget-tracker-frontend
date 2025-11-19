# Budget Tracker

A MERN stack application for tracking personal expenses and managing budgets.

## Quick Start

1. **Start Backend**
   ```bash
   cd budget-tracker-backend
   npm start
   ```

2. **Start Frontend**
   ```bash
   cd budget-tracker-frontend
   npm start
   ```

3. **Register & Login**
   - Go to `http://localhost:3000/register`
   - Create a new account
   - Login with your credentials

## Features

- User authentication
- Transaction management
- Budget tracking
- Dashboard with visualizations

## Tech Stack

- **Frontend:** React, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
- **Authentication:** JWT

## Environment Variables

Backend `.env`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Frontend `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
