import { Loader } from '@googlemaps/js-api-loader';

// Maximum number of retries for loading the maps script
const MAX_RETRIES = 3;
let retryCount = 0;
let isLoaded = false;
let loadingPromise: Promise<void> | null = null;

// Get the API key from environment variables
const MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Create a singleton loader instance with all required libraries
export const mapsLoader = new Loader({
  apiKey: MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places', 'geometry'],
});

// Default center location (India)
export const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

// Function to validate API key
const validateApiKey = () => {
  if (!MAPS_API_KEY) {
    console.error('Google Maps API key is not configured. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your environment variables.');
    return false;
  }
  return true;
};

// Function to load maps with retry mechanism
export const loadMapsWithRetry = async (): Promise<void> => {
  // Validate API key first
  if (!validateApiKey()) {
    throw new Error('Google Maps API key is not configured');
  }

  // If already loading, return the existing promise
  if (loadingPromise) {
    return loadingPromise;
  }

  // If already loaded successfully, return immediately
  if (isLoaded && window.google?.maps) {
    return Promise.resolve();
  }

  loadingPromise = new Promise(async (resolve, reject) => {
    try {
      console.log('Starting Google Maps load attempt...');
      await mapsLoader.load();
      console.log('Google Maps loaded successfully');
      isLoaded = true;
      retryCount = 0;
      resolve();
    } catch (error: unknown) {
      console.error('Error loading Google Maps:', error);
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retrying Google Maps load (attempt ${retryCount}/${MAX_RETRIES})...`);
        const delay = 1000 * Math.pow(2, retryCount - 1); // Exponential backoff
        setTimeout(async () => {
          try {
            loadingPromise = null; // Reset loading promise for retry
            await loadMapsWithRetry();
            resolve();
          } catch (retryError) {
            reject(retryError);
          }
        }, delay);
      } else {
        const finalError = new Error(`Failed to load Google Maps after ${MAX_RETRIES} attempts. Please check your API key and internet connection.`);
        console.error(finalError);
        reject(finalError);
      }
    } finally {
      if (isLoaded) {
        loadingPromise = null;
      }
    }
  });

  return loadingPromise;
};

// Export a function to check if Maps is loaded
export const isMapsLoaded = () => isLoaded && window.google?.maps;

// Export a function to reset the loading state
export const resetMapsLoader = () => {
  isLoaded = false;
  loadingPromise = null;
  retryCount = 0;
};

// Don't initialize maps loading here, let components do it when needed
// This prevents unnecessary loading and potential race conditions 