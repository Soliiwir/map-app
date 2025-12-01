// app/MapViewScreen.tsx
import MapboxGL from "@rnmapbox/maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Button, Text, View } from "react-native";

import { db } from "./firebaseConfig";

MapboxGL.setAccessToken("pk.eyJ1Ijoic29saWl3aXIiLCJhIjoiY21pbWlyd3I1MWk1NDNrcHdsMGdmOGJsOSJ9.GswElTdqTx40EhCSmqt0Dg"); // <-- replace with your Mapbox token

const MapViewScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  // Request current location
  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setLocation(loc);
    } catch (error) {
      setErrorMsg("Error fetching location: " + error);
    }
  };

  // Save location to Firebase
  const saveLocationToFirebase = async () => {
    if (!location) {
      Alert.alert("No location available", "Please refresh location first.");
      return;
    }

    try {
      await addDoc(collection(db, "locations"), {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: new Date(),
      });

      Alert.alert("Saved!", "Location saved to Firebase!");
      router.push("/MapScreen"); // Navigate to map screen
    } catch (error) {
      console.error("Error saving location:", error);
      Alert.alert("Failed", "Could not save location. Check console.");
    }
  };

  // Load location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ marginBottom: 20 }}>
        {errorMsg
          ? errorMsg
          : location
          ? `Lat: ${location.coords.latitude}, Lon: ${location.coords.longitude}`
          : "Waiting for location..."}
      </Text>
      <Button title="Refresh Location" onPress={getCurrentLocation} />
      <View style={{ marginTop: 10 }}>
        <Button title="Save Location to Firebase & Go to Map" onPress={saveLocationToFirebase} />
      </View>
    </View>
  );
};

export default MapViewScreen;
