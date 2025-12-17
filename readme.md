This project focuses on real‑world backend concepts like authentication, data validation, MongoDB aggregation, and dashboard‑ready APIs.
 Features
 User Management

* User Signup & Signin
* Password hashing using bcrypt
* JWT‑based authentication

#Expense Management

* Add income or expense
* Get all expenses for a user
* Update & delete expenses
* Category‑wise filtering

#Analytics & Reports

* Category‑wise expense summary
* Monthly income / expense / balance
* Full analytics report:

  * Overall balance
  * Monthly trend (last N months)
  * Category‑wise breakdown

#Tech Stack

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT for authentication
* bcrypt for password hashing
* Zod for input validation
# Authentication Flow

1. User signs up → password is hashed
2. User signs in → JWT token is generated
3. Token is sent in headers for protected routes

# API Endpoints
# User Routes
# Signup
POST /user/signup
*Body
json
{
  "email": "test@gmail.com",
  "password": "123456",
  "name": "Test User"
}

# Signin
POST /user/signin
Response
json
{
  "token": "JWT_TOKEN"
}
 
#Expense Routes (Protected)

#Create Expense / Income
POST /expense
json
{
  "amount": 500,
  "category": "Food",
  "description": "Pizza",
  "date": "2025-09-10",
  "type": "expense"
}
#Get All Expenses
GET /expense


#Update Expense
PUT /expense/:id
#Delete Expense
DELETE /expense/:id
#Analytics APIs

#Category‑Wise Expense Summary
GET /expense/category?q=Food
### Monthly Summary
GET /expense/date?month=2025-09

Response
json
{
  "month": "2025-09",
  "income": 20000,
  "expense": 12000,
  "balance": 8000
}

#Full Analytics Report
GET /expense/report?month=6
Response
json
{
  "overall": {
    "income": 50000,
    "expense": 32000,
    "balance": 18000
  },
  "monthlyReport": [
    { "month": "2025-8", "income": 20000, "expense": 15000 },
    { "month": "2025-9", "income": 18000, "expense": 12000 }
  ],
  "categoryBreakdown": [
    { "_id": "Food", "total": 12000 },
    { "_id": "Rent", "total": 20000 }
  ]
}

#Environment Variables
Create a `.env` file:
MONGO_URL=your_mongodb_url
JWT_USER=your_jwt_secret
PORT=3000
#How to Run
npm install
npm start
Server runs on:
http://localhost:3000
#Learning Outcomes

* JWT authentication & middleware
* MongoDB aggregation pipelines
* Date‑based analytics
* Secure backend architecture
* Dashboard‑ready API design
#Future Improvements

* Pagination & sorting
* Yearly analytics
* Role‑based access (Admin / User)
* Frontend dashboard (React)

