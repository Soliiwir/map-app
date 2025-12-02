# Campus Navigation Application Specification

## 1. Introduction
This document details the requirements and functionality of a simple mobile-based "Campus Navigation Application". Users will be able to search campus facilities, view building information and  get directions.

## 2. Core Features

### 2.1 Search management
- **Search Buildings:** Users can search for campus building or facilities using a search bar.
- **Select Destination:** Users can select a buildings  from search results to view building or start navigation.

### 2.2 Navigation and Direction
- **Start Navigation:** Users can initiate navigation to the selected destination.
- **ETA and Distance:** The app displays estimated arrival time (ETA) and travel distance.
- **Route Display:** The app shows path on the map to guide the users from current location to destination.
- **End Navigation:** The user can stop navigation at any time.

### 2.3 Building Information and Location
- **Marker Details:** When a user taps on the building marker, a popup displays building details such as name and description (Gym: This building...).
- **User Marker:** There is a dynamic marker on the map showing the users current location.
- ** Visited Location:** Recently visited locations are saved for quick access.

## 3. user Flow
1. User opens the application.
2. User allows the application to access location.
3. User searches for a specific building.
4. User selects location and taps "Start."
5. The app displays routes ETA and travel distance.
6. User taps "End" to stop navigation.
7. User can view previously visited locations.
8. When marker is tapped, the app shows building details.

## 4. Technical considerations

### 4.1 Design, Wireframing and Prototyping
- **Design, Wireframing and Prototyping:** Figma is used to create wireframes and prototyping for user interface design. 

### 4.2 Frontend
- **Map Integration:** The app uses Mapbox SDK to display the campus map, markers and routes.
- **Framework:** React Native is used to build a cross-platform mobile application with JavaScript as the programing language.

### Backend
- **Framework:** Node.js to handle application logic and APIs.
- **API:** calculate shortest path, ETA and travel distance from users location to destination.

### Data Storage
- **Firebase:** It will be used to store real-time data management of campus buildings.

### Infrastructure  as Codem (IaC)
- **Terraform, Ansible  :** Will use both to provision  and manage infrastructure.

### Continuous  Integration/Continuous Delivery (CI/CD)
- **GitHub Action:** Use it to automate testing, integration and deployment of all changes made.