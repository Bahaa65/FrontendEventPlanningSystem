# User Management System

This project is a simple user management system built with Angular, including user registration, login functionality, and a simple dashboard.

## Features

- New user registration
- Login for existing users
- Input validation
- Simple dashboard for registered users
- Route protection using Auth Guard

## System Requirements

- Node.js (version 14.0.0 or newer)
- npm (version 6.0.0 or newer)
- Angular CLI (version 17.0.0 or newer)

## Project Installation

1. Install Angular CLI globally if not already installed:
   ```
   npm install -g @angular/cli
   ```

2. Download or clone the project:
   ```
   git clone <repository-link>
   ```

3. Navigate to the project folder:
   ```
   cd event-planner-frontend
   ```

4. Install dependencies:
   ```
   npm install
   ```

## Running the Project

1. To run the project in development environment:
   ```
   ng serve
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:4200
   ```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── login/
│   │   ├── signup/
│   │   └── dashboard/
│   ├── services/
│   │   └── auth.service.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   ├── models/
│   │   └── user.model.ts
│   └── environments/
│       ├── environment.ts
│       └── environment.prod.ts
├── assets/
└── index.html
```

## Usage

1. **Register a new user**:
   - Navigate to the registration page
   - Enter username, email, and password
   - Click the "Register" button

2. **Login**:
   - Enter email and password
   - Click the "Login" button

3. **Dashboard**:
   - After logging in, you will be automatically directed to the dashboard
   - You can view your user information
   - You can log out by clicking the "Logout" button

## Notes

- This project uses a Mock API for authentication
- Data is temporarily stored in the browser's localStorage
- To use a real API, modify the `environment.ts` file and update the API address

## Contributing

We welcome your contributions! Please follow these steps:

1. Fork the project
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make the required changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request
