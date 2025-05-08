# Ampora

A modern web application for managing and booking electric vehicle charging stations.

## Features

- User Authentication (Admin/User roles)
- Real-time charging slot availability
- Google Maps integration for station location
- Admin dashboard for managing stations and slots
- User interface for booking and monitoring charging sessions

## Tech Stack

- React with TypeScript
- Firebase (Authentication, Firestore, Storage)
- Material-UI for components
- React Router for navigation
- Google Maps API

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── config/        # Configuration files
├── hooks/         # Custom React hooks
├── services/      # Firebase and API services
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── context/       # React context providers
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your Firebase configuration:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
