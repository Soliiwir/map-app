

import { Fontisto } from '@expo/vector-icons';
import MapboxGL from "@rnmapbox/maps";
import * as Location from "expo-location";
import { addDoc, collection } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Linking, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "./firebaseConfig";
import SearchBar from "./SearchBar";

MapboxGL.setAccessToken("pk.eyJ1Ijoic29saWl3aXIiLCJhIjoiY21pbWlyd3I1MWk1NDNrcHdsMGdmOGJsOSJ9.GswElTdqTx40EhCSmqt0Dg");

type Building = {
  name: string;
  latitude: number;
  longitude: number;
  iconName: string;
  description: string;
};

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

const MapScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [showNavButtons, setShowNavButtons] = useState(false);
  const mapCamera = useRef<MapboxGL.Camera>(null);

  // Modal for building details
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  const fetchAndSaveLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    setLocation(loc);

    await addDoc(collection(db, "locations"), {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      timestamp: new Date(),
    });
  };

  useEffect(() => {
    fetchAndSaveLocation();
    uploadBuildingsToFirebase(); // optional: only run once
  }, []);

  // Upload buildings to Firebase (optional, only run once)
  const uploadBuildingsToFirebase = async () => {
    try {
      for (let building of campusBuildings) {
        await addDoc(collection(db, "buildings"), building);
      }
      console.log("Buildings uploaded to Firebase!");
    } catch (err) {
      console.log("Error uploading buildings:", err);
    }
  };

  const handleSearchedLocation = async (coords: { lat: number; lng: number }) => {
    const dest: [number, number] = [coords.lng, coords.lat];
    setDestination(dest);
    mapCamera.current?.flyTo(dest, 1000);
    setShowNavButtons(true);

    if (location) {
      fetchRoute([location.coords.longitude, location.coords.latitude], dest);
    }
  };

  const fetchRoute = async (origin: [number, number], dest: [number, number]) => {
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

  const startInAppNavigation = () => {
    if (!routeCoords.length) return;

    let i = 0;
    const interval = setInterval(() => {
      if (i >= routeCoords.length) {
        clearInterval(interval);
        return;
      }
      mapCamera.current?.flyTo(routeCoords[i], 500);
      i++;
    }, 500);
  };

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

  const onMarkerPress = (building: Building) => {
    setSelectedBuilding(building);
    setModalVisible(true);
  };

  if (!location) return <View style={styles.center}><Text>Fetching location...</Text></View>;

  return (
    <View style={styles.container}>
      <SearchBar
        currentLocation={location}
        setRouteCoords={setRouteCoords}
        setDestinationCoords={handleSearchedLocation}
      />

      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
          ref={mapCamera}
          zoomLevel={16}
          centerCoordinate={[location.coords.longitude, location.coords.latitude]}
          animationMode="flyTo"
          animationDuration={2000}
        />

        {/* Current location */}
        <MapboxGL.PointAnnotation id="current" coordinate={[location.coords.longitude, location.coords.latitude]}>
          <View style={styles.currentMarker}><Text>📍</Text></View>
        </MapboxGL.PointAnnotation>

        {/* Destination */}
        {destination && (
          <MapboxGL.PointAnnotation id="dest" coordinate={destination}>
            <View style={styles.destMarker}><Text>🏁</Text></View>
          </MapboxGL.PointAnnotation>
        )}

        {/* Route */}
        {routeCoords.length > 0 && (
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


        {/* Campus buildings */}
        {campusBuildings.map((b) => (
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
        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.navButton} onPress={startInAppNavigation}>
            <Text style={styles.navText}>Start In-App Navigation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={startExternalNavigation}>
            <Text style={styles.navText}>Open in Google Maps</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal */}
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





// import MapboxGL from "@rnmapbox/maps";
// import * as Location from "expo-location";
// import { useRouter } from "expo-router";
// import { addDoc, collection } from "firebase/firestore";
// import React, { useEffect, useState } from "react";
// import { Alert, Button, StyleSheet, Text, View } from "react-native";
// import { db } from "./firebaseConfig";



// MapboxGL.setAccessToken("pk.eyJ1Ijoic29saWl3aXIiLCJhIjoiY21pbWlyd3I1MWk1NDNrcHdsMGdmOGJsOSJ9.GswElTdqTx40EhCSmqt0Dg");

// type LocationType = {
//   latitude: number;
//   longitude: number;
//   accuracy?: number;
// };

// const MapScreen = () => {
//   const [location, setLocation] = useState<Location.LocationObject | null>(null);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);
//   const [savedLocations, setSavedLocations] = useState<LocationType[]>([]);
//   const router = useRouter();

//   // Get current location
//   const getCurrentLocation = async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         setErrorMsg("Permission to access location was denied");
//         return;
//       }

//       const loc = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Highest,
//       });
//       setLocation(loc);
//     } catch (err) {
//       setErrorMsg("Error fetching location: " + err);
//     }
//   };

//   // Save current location to Firebase
//   const saveLocationToFirebase = async () => {
//     if (!location) {
//       Alert.alert("No location", "Please refresh location first.");
//       return;
//     }

//     try {
//       const docRef = await addDoc(collection(db, "locations"), {
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//         accuracy: location.coords.accuracy,
//         timestamp: new Date(),
//       });

//       Alert.alert("Saved!", "Location saved to Firebase.");
//       console.log("Saved doc ID:", docRef.id);

//       // // Optional: add to local state to display on map immediately
//       // setSavedLocations((prev) => [
//       //   ...prev,
//       //   {
//       //     latitude: location.coords.latitude,
//       //     longitude: location.coords.longitude,
//       //     accuracy: location.coords.accuracy,
//       //   },
//       // ]);

//       // Navigate back to main map (if you have a separate screen)
//       router.push("/MapViewScreen"); // <-- adjust route if needed
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to save location. Check console.");
//     }
//   };

//   useEffect(() => {
//     getCurrentLocation();
//   }, []);

//   return (
//     <View style={{ flex: 1 }}>
//       <MapboxGL.MapView style={styles.map}>
//         <MapboxGL.Camera
//           zoomLevel={16}
//           centerCoordinate={
//             location
//               ? [location.coords.longitude, location.coords.latitude]
//               : [-77.804428, 39.432961]
//           }
//         />

//         {/* Show current location marker */}
//         {location && (
//           <MapboxGL.PointAnnotation
//             key="currentLocation"
//             id="currentLocation"
//             coordinate={[location.coords.longitude, location.coords.latitude]}
//           >
//             <View style={styles.currentMarker} />
//           </MapboxGL.PointAnnotation>
//         )}

//         {/* Show saved Firebase locations */}
//         {savedLocations.map((loc, i) => (
//           <MapboxGL.PointAnnotation
//             key={`saved-${i}`}
//             id={`saved-${i}`}
//             coordinate={[loc.longitude, loc.latitude]}
//           >
//             <View style={styles.savedMarker} />
//           </MapboxGL.PointAnnotation>
//         ))}
//       </MapboxGL.MapView>

//       <View style={styles.controls}>
//         <Text style={styles.infoText}>
//           {errorMsg
//             ? errorMsg
//             : location
//             ? `Lat: ${location.coords.latitude.toFixed(
//                 6
//               )}, Lon: ${location.coords.longitude.toFixed(6)}`
//             : "Fetching location..."}
//         </Text>
//         <Button title="Refresh Location" onPress={getCurrentLocation} />
//         <View style={{ marginTop: 10 }}>
//           <Button
//             title="Save Location to Firebase & Go to Map"
//             onPress={saveLocationToFirebase}
//           />
//         </View>
//       </View>
//     </View>
//   );
// };

// export default MapScreen;

// const styles = StyleSheet.create({
//   map: { flex: 1 },
//   controls: {
//     position: "absolute",
//     bottom: 20,
//     left: 10,
//     right: 10,
//     backgroundColor: "rgba(255,255,255,0.9)",
//     borderRadius: 12,
//     padding: 10,
//     alignItems: "center",
//   },
//   infoText: {
//     marginBottom: 10,
//   },
//   currentMarker: {
//     width: 20,
//     height: 20,
//     backgroundColor: "blue",
//     borderRadius: 10,
//     borderColor: "white",
//     borderWidth: 2,
//   },
//   savedMarker: {
//     width: 20,
//     height: 20,
//     backgroundColor: "red",
//     borderRadius: 10,
//     borderColor: "white",
//     borderWidth: 2,
//   },
// });

// // import { Fontisto } from '@expo/vector-icons';
// // import MapboxGL from "@rnmapbox/maps";
// // import * as Location from 'expo-location';
// // import React, { useEffect, useState } from "react";
// // import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from "react-native";

// // import SearchBar from "./SearchBar";

// // import { addDoc, collection } from "firebase/firestore";

// // import { db } from "./firebaseConfig";

// // MapboxGL.setAccessToken("pk.eyJ1Ijoic29saWl3aXIiLCJhIjoiY21pbWlyd3I1MWk1NDNrcHdsMGdmOGJsOSJ9.GswElTdqTx40EhCSmqt0Dg");

// // // Types
// // type Building = {
// //   name: string;
// //   latitude: number;
// //   longitude: number;
// //   iconName: string;
// //   type: string;
// //   description: string;
// // };

// // // Buildings list
// // const campusBuildings: Building[] = [
// //   {
// //     name: "Scarborough Library",
// //     latitude: 39.432961,
// //     longitude: -77.804428,
// //     iconName: "map-marker",
// //     type: "Scarborough Library",
// //     description: "The Scarborough library holds much more than books. With student meeting spaces, computer labs, a printing center, periodicals, digital media and archives, the library is the hub for all things academic. Want to meet with an advisor? Ready to sign up for a one-on-one tutoring session? Head to the first floor where you will find the Academic Support Center, Advising Assistance Center, the TRiO lab and the IT User Support Desk. The library's 24-hour room offers private access to all students 24 hours a day, and is equipped to handle all your late night study session needs with computers, printers, and vending machines. "
      
// //   },
// //   {
// //     name: "Snyder Hall",
// //     latitude: 39.432398,
// //     longitude: -77.804750,
// //     iconName: "map-marker",
// //     type: "Snyder Hall",
// //       description: "Snyder Hall is home to the Department of Computer Science, Mathematics and Engineering. Beyond classroom space it also holds labratories for Geographic Information Systems, Aquatic Sciences, and Robotics.",
// //   },
// // ];

// // const MapViewScreen = () => {

// //   const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
// //   const [allLocations, setAllLocations] = useState<LocationType[]>([]);
// //   const [errorMsg, setErrorMsg] = useState<string | null>(null);

// //   // Modal state
// //   const [modalVisible, setModalVisible] = useState(false);
// //   const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
// //   async function saveLocationToFirebase(loc: Location.LocationObject) {
// //   try {
// //     await addDoc(collection(db, "locations"), {
// //       latitude: loc.coords.latitude,
// //       longitude: loc.coords.longitude,
// //       accuracy: loc.coords.accuracy,
// //       timestamp: new Date(),
// //     });
// //     console.log("Location saved to Firebase!");
// //   } catch (error) {
// //     console.error("Error saving location:", error);
// //   }
// // }

// //   useEffect(() => {
// //   async function getCurrentLocation() {
// //     let { status } = await Location.requestForegroundPermissionsAsync();
// //     if (status !== "granted") {
// //       setErrorMsg("Permission to access location was denied");
// //       return;
// //     }

// //     let loc = await Location.getCurrentPositionAsync({});
// //     setLocation(loc);

// //     // Save to Firebase
// //     await saveLocationToFirebase(loc);
// //   }

// //   getCurrentLocation();
// // }, []);


// //   let text = "Waiting...";
// //   if (errorMsg) text = errorMsg;
// //   else if (location) text = JSON.stringify(location);

// //   // Modal state
// //   const [modalVisible, setModalVisible] = useState(false);
// //   const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

// //   const onMarkerPress = (building: Building) => {
// //     setSelectedBuilding(building);
// //     setModalVisible(true);
// //   };

// //   const onCloseModal = () => {
// //     setModalVisible(false);
// //     setSelectedBuilding(null);
// //   };

// //   return (
// //     <View style={styles.container}>

// //       <MapboxGL.MapView
// //         style={styles.map}
// //         zoomEnabled
// //         styleURL="mapbox://styles/mapbox/streets-v12"

// //         rotateEnabled
// //       >
// //         <MapboxGL.Camera
// //           zoomLevel={16}
// //           centerCoordinate={[-77.80437482996666, 39.434021934089635]}
// //           pitch={60}
// //           animationMode={"flyTo"}
// //           animationDuration={6000}
// //         />
        
// //         {campusBuildings.map((building) => (
// //           <MapboxGL.PointAnnotation
// //             key={building.name}
// //             id={building.name}
// //             coordinate={building.coords}
// //             onSelected={() => onMarkerPress(building)}
// //           >
// //             <View style={styles.markerContainer}>
// //               <Fontisto
// //                 name={building.iconName as any}
// //                 size={20}
// //                 color="rgba(58,5,5,1)"
// //               />
// //             </View>
// //           </MapboxGL.PointAnnotation>
// //         ))}
// //       </MapboxGL.MapView>

// //       <Modal visible={modalVisible} animationType="none" transparent>
// //         <View style={styles.modalContainer}>
// //           <View style={styles.modalContent}>
// //             <TouchableOpacity onPress={onCloseModal} style={styles.closeButton}>
// //               <Text style={styles.closeButtonText}>close</Text>
// //             </TouchableOpacity>

// //             {selectedBuilding && (
// //               <>
// //                 <Text style={styles.modalTitle}>{selectedBuilding.name}</Text>
// //                 <Text style={styles.modalDescription}>{selectedBuilding.description}</Text>
// //               </>
// //             )}
// //           </View>
// //         </View>
// //       </Modal>
// //       <SearchBar searchedLocation={setLocation} />
// //     </View>
// //   );
// // };

// // export default MapViewScreen;

// // const styles = StyleSheet.create({
// //   container: { flex: 1 },
// //   map: { flex: 1 },

// //   markerContainer: {
// //     width: 50,
// //     height: 50,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     backgroundColor: "rgba(0,0,0,0.4)",
// //     borderRadius: 20,
// //   },

// //   modalContainer: {
// //     backgroundColor: "rgba(59,57,57,1)",
// //     borderRadius: 16,
// //     marginHorizontal: 20,
// //     padding: 20,
// //     elevation: 5,
// //     width: Dimensions.get("window").width - 40,
// //     alignSelf: "center",
// //     marginTop: 150,
// //   },
// //   modalContent: {
// //     backgroundColor: "rgba(63,61,61,1)",
// //     justifyContent: "center",
// //     alignItems: "center",
// //     padding: 20,
// //     borderRadius: 12,
// //   },
// //   modalTitle: {
// //     fontSize: 18,
// //     fontWeight: "bold",
// //     color: "black",
// //   },
// //   modalDescription: {
// //     fontSize: 14,
// //     marginVertical: 10,
// //     color: "white",
// //   },
// //   closeButton: {
// //     backgroundColor: "black",
// //     position: "absolute",
// //     bottom: 1,
// //     right: 1,
// //     paddingHorizontal: 12,
// //     paddingVertical: 6,
// //     borderRadius: 8,
// //   },
// //   closeButtonText: {
// //     color: "white",
// //     fontSize: 18,
// //   },
// // });
