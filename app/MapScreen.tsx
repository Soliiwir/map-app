

import { Fontisto } from '@expo/vector-icons';
import MapboxGL from "@rnmapbox/maps";
import * as Location from "expo-location";
import { addDoc, collection } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Linking, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "./firebaseConfig";
import SearchBar from "./SearchBar";

MapboxGL.setAccessToken("pk.eyJ1Ijoic29saWl3aXIiLCJhIjoiY21pbWlyd3I1MWk1NDNrcHdsMGdmOGJsOSJ9.GswElTdqTx40EhCSmqt0Dg");

// types for buildings
type Building = {
  name: string;
  latitude: number;
  longitude: number;
  iconName: string;
  description: string;
};

// list of campus buildings
const campusBuildings: Building[] = [
  {
    name: "Scarborough Library",
    latitude: 39.432961,
    longitude: -77.804428,
    iconName: "map-marker",
    description: "The Scarborough library holds much more than books...",
  },
  {
    name: "Snyder Hall",
    latitude: 39.432398,
    longitude: -77.804750,
    iconName: "map-marker",
    description: "Snyder Hall is home to the Department of Computer Science...",
  },
];

// Main MapScreen component
const MapScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [showNavButtons, setShowNavButtons] = useState(false);
  const mapCamera = useRef<MapboxGL.Camera>(null);

  // Modal for building details
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);


  // Fetch current location and save to Firebase
  const fetchAndSaveLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return; // Permission denied

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    setLocation(loc); // Set current location

    await addDoc(collection(db, "locations"), {// Save to Firebase
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      timestamp: new Date(),
    });
  };

  useEffect(() => { // On mount
    fetchAndSaveLocation(); //
    uploadBuildingsToFirebase(); 
  }, []);

  // Upload buildings to Firebase 
  const uploadBuildingsToFirebase = async () => {
    try {
      for (let building of campusBuildings) {
        await addDoc(collection(db, "buildings"), building);
      }
      console.log("Buildings uploaded to Firebase!"); 
    } catch (err) { // Error handling
      console.log("Error uploading buildings:", err);
    }
  };

  // searched location from SearchBar
  const handleSearchedLocation = async (coords: { lat: number; lng: number }) => {
    const dest: [number, number] = [coords.lng, coords.lat];
    setDestination(dest);
    mapCamera.current?.flyTo(dest, 1000); // Move camera to destination
    setShowNavButtons(true);

    if (location) {
      fetchRoute([location.coords.longitude, location.coords.latitude], dest);// Fetch route
    }
  };

  const fetchRoute = async (origin: [number, number], dest: [number, number]) => { // Fetch route for navigation
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${dest[0]},${dest[1]}?geometries=geojson&access_token=YOUR_MAPBOX_TOKEN`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        setRouteCoords(data.routes[0].geometry.coordinates);
      }
    } catch (err) {
      console.log("Error fetching route:", err);
    }
  };

  const startInAppNavigation = () => { // Start in-app navigation by animating camera along route
    if (!routeCoords.length) return;

    let i = 0; // Index for route coordinates
    const interval = setInterval(() => {// Move camera 
      if (i >= routeCoords.length) {// End of route
        clearInterval(interval);
        return;
      }
      mapCamera.current?.flyTo(routeCoords[i], 500);// Move to next coordinate
      i++;
    }, 500);
  };

  // google maps or apple maps navigation
  const startExternalNavigation = () => {
    if (!location || !destination) return;

    const origin = `${location.coords.latitude},${location.coords.longitude}`;
    const dest = `${destination[1]},${destination[0]}`;
    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?saddr=${origin}&daddr=${dest}`
        : `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
    Linking.openURL(url);
  };

  const onMarkerPress = (building: Building) => { // Show building details modal
    setSelectedBuilding(building);
    setModalVisible(true);
  };

  if (!location) return <View style={styles.center}><Text>Fetching location...</Text></View>;//

  return (
    <View style={styles.container}>
      <SearchBar 
      // Search bar component
        currentLocation={location}
        setRouteCoords={setRouteCoords}
        setDestinationCoords={handleSearchedLocation}
      />

      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
        // Camera settings
          ref={mapCamera}
          zoomLevel={16}
          centerCoordinate={[location.coords.longitude, location.coords.latitude]}
          animationMode="flyTo"
          animationDuration={2000}
        />
        // Current location marker
        <MapboxGL.PointAnnotation id="current" coordinate={[location.coords.longitude, location.coords.latitude]}>
          <View style={styles.currentMarker}><Text>📍</Text></View>
        </MapboxGL.PointAnnotation>

        
        {destination && (
          // Destination marker
          <MapboxGL.PointAnnotation id="dest" coordinate={destination}>
            <View style={styles.destMarker}><Text>🏁</Text></View>
          </MapboxGL.PointAnnotation>
        )}

        {routeCoords.length > 0 && (
          // Route line on map
          <MapboxGL.ShapeSource
            id="routeSource"
            shape={{
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: routeCoords
              }
            }}
          >
            <MapboxGL.LineLayer
            // Line layer for route
              id="routeLine"
              style={{
                lineColor: "blue",
                lineWidth: 4,
                lineJoin: "round",
                lineCap: "round"
              }}
            />
          </MapboxGL.ShapeSource>
        )}


      
        {campusBuildings.map((b) => (
          // Building markers
          <MapboxGL.PointAnnotation
            key={b.name}
            id={b.name}
            coordinate={[b.longitude, b.latitude]}
            onSelected={() => onMarkerPress(b)}
          >
            <View style={styles.buildingMarker}>
              <Fontisto name={b.iconName as any} size={20} color="black" />
            </View>
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>

      {showNavButtons && (
        // Navigation buttons
        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.navButton} onPress={startInAppNavigation}>
            <Text style={styles.navText}>Start In-App Navigation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={startExternalNavigation}>
            <Text style={styles.navText}>Open in Google Maps</Text>
          </TouchableOpacity>
        </View>
      )}

      // Building details modal
      <Modal visible={modalVisible} animationType="none" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>close</Text>
            </TouchableOpacity>

            {selectedBuilding && (
              <>
                <Text style={styles.modalTitle}>{selectedBuilding.name}</Text>
                <Text style={styles.modalDescription}>{selectedBuilding.description}</Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  currentMarker: { backgroundColor: "blue", padding: 6, borderRadius: 20, alignItems: "center" },
  destMarker: { backgroundColor: "red", padding: 6, borderRadius: 20, alignItems: "center" },
  buildingMarker: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  navButtons: { position: "absolute", bottom: 50, width: "90%", alignSelf: "center" },
  navButton: { backgroundColor: "#007bff", padding: 12, borderRadius: 8, marginBottom: 10, alignItems: "center" },
  navText: { color: "white", fontWeight: "bold" },
  modalContainer: {
    backgroundColor: "rgba(59,57,57,0.9)",
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 20,
    elevation: 5,
    width: Dimensions.get("window").width - 40,
    alignSelf: "center",
    marginTop: 150,
  },
  modalContent: { backgroundColor: "rgba(63,61,61,1)", justifyContent: "center", alignItems: "center", padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "white" },
  modalDescription: { fontSize: 14, marginVertical: 10, color: "white" },
  closeButton: { backgroundColor: "black", position: "absolute", bottom: 1, right: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  closeButtonText: { color: "white", fontSize: 18 },
});






// import { MAPBOX_TOKEN } from '@env';
// import { Fontisto } from '@expo/vector-icons';


// import MapboxGL from "@rnmapbox/maps";
// import * as Location from "expo-location";
// import { addDoc, collection } from "firebase/firestore";
// import React, { useEffect, useRef, useState } from "react";
// import { Dimensions, Linking, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import { db } from "./firebaseConfig";
// import SearchBar from "./SearchBar";

// MapboxGL.setAccessToken(MAPBOX_TOKEN);

// // types for buildings
// type Building = {
//   name: string;
//   latitude: number;
//   longitude: number;
//   iconName: string;
//   description: string;
// };

// // list of campus buildings
// const campusBuildings: Building[] = [
//   {
//     name: "Scarborough Library",
//     latitude: 39.432961,
//     longitude: -77.804428,
//     iconName: "map-marker",
//     description: "The Scarborough library holds much more than books...",
//   },
//   {
//     name: "Snyder Hall",
//     latitude: 39.432398,
//     longitude: -77.804750,
//     iconName: "map-marker",
//     description: "Snyder Hall is home to the Department of Computer Science...",
//   },
// ];

// // Main MapScreen component
// const MapScreen = () => {
//   const [location, setLocation] = useState<Location.LocationObject | null>(null);
//   const [destination, setDestination] = useState<[number, number] | null>(null);
//   const [routeCoords, setRouteCoords] = useState<any[]>([]);
//   const [showNavButtons, setShowNavButtons] = useState(false);
//   const mapCamera = useRef<MapboxGL.Camera>(null);

//   // Modal for building details
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);


//   // Fetch current location and save to Firebase
//   const fetchAndSaveLocation = async () => {
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== "granted") return; // Permission denied

//     const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
//     setLocation(loc); // Set current location

//     await addDoc(collection(db, "locations"), {// Save to Firebase
//       latitude: loc.coords.latitude,
//       longitude: loc.coords.longitude,
//       timestamp: new Date(),
//     });
//   };

//   useEffect(() => { // On mount
//     fetchAndSaveLocation(); //
//     uploadBuildingsToFirebase(); 
//   }, []);

//   // Upload buildings to Firebase 
//   const uploadBuildingsToFirebase = async () => {
//     try {
//       for (let building of campusBuildings) {
//         await addDoc(collection(db, "buildings"), building);
//       }
//       console.log("Buildings uploaded to Firebase!"); 
//     } catch (err) { // Error handling
//       console.log("Error uploading buildings:", err);
//     }
//   };

//   // searched location from SearchBar
//   const handleSearchedLocation = async (coords: { lat: number; lng: number }) => {
//     const dest: [number, number] = [coords.lng, coords.lat];
//     setDestination(dest);
//     mapCamera.current?.flyTo(dest, 1000); // Move camera to destination
//     setShowNavButtons(true);

//     if (location) {
//       fetchRoute([location.coords.longitude, location.coords.latitude], dest);// Fetch route
//     }
//   };

//   const fetchRoute = async (origin: [number, number], dest: [number, number]) => { // Fetch route for navigation
//     const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${dest[0]},${dest[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
//     try {
//       const res = await fetch(url);
//       const data = await res.json();
//       if (data.routes && data.routes.length > 0) {
//         setRouteCoords(data.routes[0].geometry.coordinates);
//       }
//     } catch (err) {
//       console.log("Error fetching route:", err);
//     }
//   };

//   const startInAppNavigation = () => { // Start in-app navigation by animating camera along route
//     if (!routeCoords.length) return;

//     let i = 0; // Index for route coordinates
//     const interval = setInterval(() => {// Move camera 
//       if (i >= routeCoords.length) {// End of route
//         clearInterval(interval);
//         return;
//       }
//       mapCamera.current?.flyTo(routeCoords[i], 500);// Move to next coordinate
//       i++;
//     }, 500);
//   };

//   // google maps or apple maps navigation
//   const startExternalNavigation = () => {
//     if (!location || !destination) return;

//     const origin = `${location.coords.latitude},${location.coords.longitude}`;
//     const dest = `${destination[1]},${destination[0]}`;
//     const url =
//       Platform.OS === "ios"
//         ? `http://maps.apple.com/?saddr=${origin}&daddr=${dest}`
//         : `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
//     Linking.openURL(url);
//   };

//   const onMarkerPress = (building: Building) => { // Show building details modal
//     setSelectedBuilding(building);
//     setModalVisible(true);
//   };

//   if (!location) return ( // Loading or permission denied
//   <View style={styles.center}>
//     <Text>Location permission denied or fetching...</Text>
//   </View>
// );


//   return (
//     <View style={styles.container}>
//       <SearchBar 
//       // Search bar component
//         currentLocation={location}
//         setRouteCoords={setRouteCoords}
//         setDestinationCoords={handleSearchedLocation}
//       />

//       <MapboxGL.MapView style={styles.map}>
//         <MapboxGL.Camera
//         // Camera settings
//           ref={mapCamera}
//           zoomLevel={16}
//           centerCoordinate={[location.coords.longitude, location.coords.latitude]}
//           animationMode="flyTo"
//           animationDuration={2000}
//         />
//         // Current location marker
//         <MapboxGL.PointAnnotation id="current" coordinate={[location.coords.longitude, location.coords.latitude]}>
//           <View style={styles.currentMarker}><Text>📍</Text></View>
//         </MapboxGL.PointAnnotation>

        
//         {destination && (
//           // Destination marker
//           <MapboxGL.PointAnnotation id="dest" coordinate={destination}>
//             <View style={styles.destMarker}><Text>🏁</Text></View>
//           </MapboxGL.PointAnnotation>
//         )}

//         {routeCoords.length > 0 && (
//           // Route line on map
//           <MapboxGL.ShapeSource
//             id="routeSource"
//             shape={{
//               type: "Feature",
//               properties: {},
//               geometry: {
//                 type: "LineString",
//                 coordinates: routeCoords
//               }
//             }}
//           >
//             <MapboxGL.LineLayer
//             // Line layer for route
//               id="routeLine"
//               style={{
//                 lineColor: "blue",
//                 lineWidth: 4,
//                 lineJoin: "round",
//                 lineCap: "round"
//               }}
//             />
//           </MapboxGL.ShapeSource>
//         )}


      
//         {campusBuildings.map((b) => (
//           // Building markers
//           <MapboxGL.PointAnnotation
//             key={b.name}
//             id={b.name}
//             coordinate={[b.longitude, b.latitude]}
//             onSelected={() => onMarkerPress(b)}
//           >
//             <View style={styles.buildingMarker}>
//               <Fontisto name={b.iconName as any} size={20} color="black" />
//             </View>
//           </MapboxGL.PointAnnotation>
//         ))}
//       </MapboxGL.MapView>

//       {showNavButtons && (
//         // Navigation buttons
//         <View style={styles.navButtons}>
//           <TouchableOpacity style={styles.navButton} onPress={startInAppNavigation}>
//             <Text style={styles.navText}>Start In-App Navigation</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.navButton} onPress={startExternalNavigation}>
//             <Text style={styles.navText}>Open in Google Maps</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       // Building details modal
//       <Modal visible={modalVisible} animationType="none" transparent>
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
//               <Text style={styles.closeButtonText}>close</Text>
//             </TouchableOpacity>

//             {selectedBuilding && (
//               <>
//                 <Text style={styles.modalTitle}>{selectedBuilding.name}</Text>
//                 <Text style={styles.modalDescription}>{selectedBuilding.description}</Text>
//               </>
//             )}
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// export default MapScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { flex: 1 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   currentMarker: { backgroundColor: "blue", padding: 6, borderRadius: 20, alignItems: "center" },
//   destMarker: { backgroundColor: "red", padding: 6, borderRadius: 20, alignItems: "center" },
//   buildingMarker: {
//     width: 40,
//     height: 40,
//     backgroundColor: "rgba(255,255,255,0.8)",
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   navButtons: { position: "absolute", bottom: 50, width: "90%", alignSelf: "center" },
//   navButton: { backgroundColor: "#007bff", padding: 12, borderRadius: 8, marginBottom: 10, alignItems: "center" },
//   navText: { color: "white", fontWeight: "bold" },
//   modalContainer: {
//     backgroundColor: "rgba(59,57,57,0.9)",
//     borderRadius: 16,
//     marginHorizontal: 20,
//     padding: 20,
//     elevation: 5,
//     width: Dimensions.get("window").width - 40,
//     alignSelf: "center",
//     marginTop: 150,
//   },
//   modalContent: { backgroundColor: "rgba(63,61,61,1)", justifyContent: "center", alignItems: "center", padding: 20, borderRadius: 12 },
//   modalTitle: { fontSize: 18, fontWeight: "bold", color: "white" },
//   modalDescription: { fontSize: 14, marginVertical: 10, color: "white" },
//   closeButton: { backgroundColor: "black", position: "absolute", bottom: 1, right: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
//   closeButtonText: { color: "white", fontSize: 18 },
// });





