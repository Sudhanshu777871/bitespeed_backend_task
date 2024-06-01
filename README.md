# Bitespeed Backend Task: Identity Reconciliation

## Overview
This project implements a web service that helps Bitespeed identify and keep track of a customer's identity across multiple purchases. It consolidates customer contact information to provide a personalized experience by linking orders made with different contact information.

## Features
- Identify and consolidate customer identities based on email and/or phone number.
- Create primary and secondary contact records as needed.
- Return consolidated contact details with linked primary and secondary contact information.

## Tech Stack
- **Backend Framework**: Node.js with Express
- **Database**: MySQL

## Setup and Configuration

### Prerequisites
- Node.js (v12.x or higher)
- MySQL (v5.7 or higher)

### Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/bitespeed-backend.git
cd bitespeed-backend

### 2. Install Dependencies
npm install

### 3. Set Up MySQL Database
CREATE DATABASE bitespeed;

USE bitespeed;

CREATE TABLE Contact (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phoneNumber VARCHAR(255),
    email VARCHAR(255),
    linkedId INT,
    linkPrecedence ENUM('primary', 'secondary') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL
);

### 4. Configure Database Connection
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=bitespeed

### 5.  Start the Server
node index.js

The server will start on port 3000. You can change the port by modifying the PORT variable in index.js.

#############################################################################################################

API Endpoint
Identify Customer
   URL: /identify
   Method: POST
   Request Body
{
  "email": "example@domain.com",
  "phoneNumber": "1234567890"
}
   Response
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["example@domain.com", "another@domain.com"],
    "phoneNumbers": ["1234567890", "0987654321"],
    "secondaryContactIds": [2, 3]
  }
}

#### Project Structure
bitespeed-backend/
├── node_modules/
├── .env
├── index.js
├── package.json
├── package-lock.json
└── README.md

