import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const sampleChargingStations = [
  {
    name: "EV Bunk Central",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    latitude: 40.7128,
    longitude: -74.0060,
    contactNumber: "+1-212-555-0123",
    operatingHours: {
      open: "06:00",
      close: "22:00"
    },
    totalSlots: 10,
    availableSlots: 10,
    rates: {
      perHour: 2.50,
      currency: "USD"
    },
    amenities: [
      "Restrooms",
      "Coffee Shop",
      "Wi-Fi",
      "Covered Parking"
    ],
    connectorTypes: [
      "Type 2",
      "CCS",
      "CHAdeMO"
    ],
    status: "active"
  },
  {
    name: "Green Energy Hub",
    address: "456 Market Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94103",
    latitude: 37.7749,
    longitude: -122.4194,
    contactNumber: "+1-415-555-0124",
    operatingHours: {
      open: "00:00",
      close: "23:59"
    },
    totalSlots: 15,
    availableSlots: 15,
    rates: {
      perHour: 3.00,
      currency: "USD"
    },
    amenities: [
      "24/7 Access",
      "Security",
      "Restrooms",
      "Vending Machines"
    ],
    connectorTypes: [
      "Type 2",
      "CCS",
      "Tesla Supercharger"
    ],
    status: "active"
  },
  {
    name: "EcoCharge Station",
    address: "789 Lake View Drive",
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    latitude: 41.8781,
    longitude: -87.6298,
    contactNumber: "+1-312-555-0125",
    operatingHours: {
      open: "07:00",
      close: "21:00"
    },
    totalSlots: 8,
    availableSlots: 8,
    rates: {
      perHour: 2.75,
      currency: "USD"
    },
    amenities: [
      "Restrooms",
      "Cafe",
      "Wi-Fi",
      "Waiting Area"
    ],
    connectorTypes: [
      "Type 2",
      "CCS"
    ],
    status: "active"
  }
];

export const addSampleStations = async () => {
  try {
    const stationsCollection = collection(db, 'chargingStations');
    for (const station of sampleChargingStations) {
      await addDoc(stationsCollection, {
        ...station,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log('Sample stations added successfully');
  } catch (error) {
    console.error('Error adding sample stations:', error);
    throw error;
  }
}; 