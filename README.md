# Campus Navigation Application

The Campus Navigation Applicaiton is a mobile app designed to help users navigate a campus environment efficeintly. Users can search for buildings or facilities, view building details, and get turn-by-turn directions to their chosen destination.

Features

Search Management

 * Search campus buildings or facilities using a search bar.
 * Select a destination from search results to view details or start navigation.
 * Navigation & Directions
 * Start in-app navigation to the selected destination.
 * View estimated travel time (ETA) and distance.
 * Display routes on the map.
 * Stop navigation at any time.

Building Information & Location
 * Tap a building marker to see its name and description.
 * Dynamic marker showing user's current location.

User Flow
* Open the app and allow location access.
* Search for a building.
* Select a destination and choose:
      Start in-app navigation or
      Open in Google Maps
* View the route and follow navigation.
* Tap End Navigation to stop.
* Tap building markers to view details.

Technology Stack

Frontend
* React Native for cross-platform mobile development.
* Mapbox SDK for maps, markers, and routing.
  
Data Storage
* Firebase for real-time campus building data storage
  
Infrastructure & Deployment
* Terraform for infrastructure provisioning and management.
* GitHub Actions for CI/CD workflows, automating testing, integration, and deployment.

Installation
1. Clone the repository:
   git clone <repository-url>
   cd Map-app
2. Install dependencies:
   npm install
   or
   yarn install
3. Run the app:
   npx expo start
4. Open the app on an emulator or a physical device:
   Press i to open in iOS Simulator (Mac only)
   Press a to open in Android Emulator
   Scan the QR code in Expo Go on a real device