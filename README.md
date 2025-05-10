# Electric Vehicle Charging Station Management System [Ampora]

A comprehensive web application for managing and booking electric vehicle charging stations. This system provides a seamless experience for both station administrators and EV users to manage charging operations efficiently.

## 🌟 Features

### For Users
- **User Authentication**
  - Secure email/password login
  - OTP-based email verification
  - Social login integration (Google)
  - Password reset functionality
  - Profile management

- **Station Management**
  - Interactive Google Maps integration
  - Real-time station availability
  - Station details and specifications
  - Filter stations by:
    - Distance
    - Availability
    - Charging speed
    - Price range
    - Amenities

- **Booking System**
  - Real-time slot booking
  - Advance booking (up to 7 days)
  - Booking modification
  - Cancellation with refund
  - Booking history
  - Receipt generation

- **Payment System**
  - Multiple payment methods
    - Credit/Debit cards
    - UPI
    - Digital wallets
  - Secure payment processing
  - Automatic billing
  - Payment history
  - Refund management

- **Charging Session**
  - Real-time charging status
  - Session monitoring
  - Automatic session end
  - Cost calculation
  - Session history

### For Administrators
- **Dashboard**
  - Real-time analytics
  - Revenue tracking
  - User statistics
  - Station performance
  - Booking analytics

- **Station Management**
  - Add/Edit/Delete stations
  - Configure charging rates
  - Set operating hours
  - Manage amenities
  - Monitor station status

- **User Management**
  - User list and details
  - User activity tracking
  - Account management
  - Support ticket system

- **Booking Management**
  - View all bookings
  - Modify bookings
  - Handle cancellations
  - Generate reports

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **API Client**: Axios
- **Form Handling**: Formik with Yup validation
- **Maps**: Google Maps JavaScript API
- **Charts**: Recharts
- **Notifications**: React-Toastify

### Backend
- **Platform**: Firebase
  - Authentication
  - Cloud Firestore
  - Cloud Storage
  - Cloud Functions
  - Hosting

### Third-Party Services
- **Email Service**: EmailJS
- **Payment Gateway**: Stripe
- **Maps**: Google Maps API
- **Analytics**: Google Analytics

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   ├── admin/          # Admin-specific components
│   └── user/           # User-specific components
├── pages/              # Page components
├── config/             # Configuration files
├── hooks/              # Custom React hooks
├── services/           # Firebase and API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── context/            # React context providers
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Google Maps API key
- EmailJS account
- Stripe account (for payments)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/electric-vehicle-bunk.git
   cd electric-vehicle-bunk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id

   # Google Maps Configuration
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # EmailJS Configuration
   REACT_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id
   REACT_APP_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   REACT_APP_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

   # Stripe Configuration
   REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

4. Start the development server:
   ```bash
   npm start
   ```

### Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication (Email/Password, Google)
3. Set up Firestore Database
4. Configure Storage
5. Set up Cloud Functions
6. Configure Hosting

### Google Maps Setup
1. Create a Google Cloud Project
2. Enable Maps JavaScript API
3. Create API key with appropriate restrictions
4. Enable billing

### EmailJS Setup
1. Create an EmailJS account
2. Create an email service
3. Create email templates
4. Get service ID, template ID, and public key

### Stripe Setup
1. Create a Stripe account
2. Get API keys
3. Configure webhook endpoints
4. Set up payment methods

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👥 Authors

- Krishna Sevak

## 🙏 Acknowledgments

- Material-UI for the component library
- Firebase for backend services
- Google Maps for location services
- EmailJS for email services
- Stripe for payment processing

## 📞 Support

For support, email krishna.8.sevak@gmail.com or create an issue in the repository.

## 🔄 Updates

- Latest update: [Current Date]
- Version: 1.0.0

## 🔒 Security

- All API keys and sensitive information are stored in environment variables
- Firebase security rules are configured for data protection
- HTTPS is enforced for all communications
- Regular security audits are performed
- User data is encrypted at rest and in transit

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices
- Different screen sizes and orientations

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## 🧪 Testing

- Unit tests with Jest
- Integration tests with React Testing Library
- End-to-end tests with Cypress
- Performance testing with Lighthouse

## 📊 Performance

- Optimized bundle size
- Lazy loading of components
- Image optimization
- Caching strategies
- CDN integration

## 🔍 SEO

- Meta tags optimization
- Sitemap generation
- robots.txt configuration
- Open Graph tags
- Schema markup

## 📈 Analytics

- User behavior tracking
- Conversion tracking
- Error tracking
- Performance monitoring
- Custom event tracking
