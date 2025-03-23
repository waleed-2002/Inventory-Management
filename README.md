# Inventory Management System

A complete inventory management system with a React frontend and FastAPI backend.

## Features

- **Browse Items**: View available items, stock levels, and prices
- **Order Items**: Add items to cart and place orders
- **Apply Offers**: View and automatically apply available discounts
- **Manage Inventory**: Admin interface for adding, updating, and removing items
- **Manage Offers**: Admin interface for creating and managing promotional offers

## Project Structure

The project is divided into two main parts:

### Backend (FastAPI)

- RESTful API endpoints for items, orders, and offers management
- In-memory database for data storage (can be replaced with a real database)
- Automatic offer application based on conditions

### Frontend (React + Tailwind CSS)

- Modern UI with responsive design
- Shopping cart functionality
- Admin interfaces for inventory and offer management
- Automatic discount display

## Getting Started

### Prerequisites

- Python 3.7+
- Node.js 14+
- npm or yarn

### Setup

1. Clone the repository
2. Start the backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

3. Start the frontend:

```bash
cd frontend
npm install
npm start
```

## API Endpoints

- GET `/items`: Browse available items
- POST `/orders`: Place orders
- GET `/offers`: View available offers
- POST `/items-management`: Add/Update items (admin)
- DELETE `/items-management/{item_id}`: Remove items (admin)
- POST `/offers-management`: Add/Update offers (admin)
- DELETE `/offers-management/{offer_id}`: Remove offers (admin)

## Implementation Details

- The backend uses FastAPI for efficient API development
- The frontend uses React with Tailwind CSS for modern UI
- In-memory storage is used (data will be lost when the server restarts)
- Authentication is not implemented (out of scope for this project)

## Admin Mode

In the frontend, you can toggle "Admin Mode" to access item and offer management interfaces.
