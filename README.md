# University Room Management System - Frontend

This is the frontend component of the University Room Management System, built using **React**, **Next.js**, **TypeScript**, and **Axios**. It interacts with the Spring Boot backend to provide a user-friendly interface for managing university rooms, schedules, and users.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Technologies Used](#technologies-used)
4. [Setup Instructions](#setup-instructions)
5. [Running the Application](#running-the-application)
6. [API Integration](#api-integration)
7. [Contributing](#contributing)

## Project Overview

The frontend is designed to provide the following features:
- **User Authentication**: Login and role-based access control.
- **Class Management**: View and manage classes.
- **Schedule Management**: View and manage schedules.
- **Room Management**: View and manage rooms.
- **Responsive Design**: Optimized for desktop and mobile devices.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Technologies Used

- **React**: JavaScript library for building user interfaces.
- **Next.js**: Framework for server-side rendering and routing.
- **TypeScript**: Adds static typing to JavaScript.
- **Axios**: HTTP client for making API requests.
- **Emotion CSS**: CSS-in-JS library for styling components.
- **React Query**: For data fetching and state management.

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/university-room-management-frontend.git
   cd university-room-management-frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

   Note: The project uses `@emotion/css` as an optional peer dependency. If you plan to use Emotion CSS for styling, install it with:
   ```bash
   npm install @emotion/css@^11.0.0-rc.0
   ```

3. **Configure Environment Variables**: 
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
   ```

## Running the Application

Run the development server:
```bash
npm run dev
```

The frontend will start on port `3000`.

## API Integration

The frontend uses **Axios** to interact with the backend API. Example service:

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (userData: any) => {
  const response = await api.post('/users', userData);
  return response.data;
};
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
