import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

//
type PlacePrediction = {
  place_id: string;
  description: string;
};

// Define Destination type
type Destination = {
  lat: number;
  lng: number;
};

// Define props for SearchBar component
interface SearchBarProps {
  currentLocation: { coords: { latitude: number; longitude: number } } | null;
  setRouteCoords: (coords: [number, number][]) => void;
  setDestinationCoords: (coords: Destination) => void;
}

// SearchBar component
export default function SearchBar({ currentLocation, setRouteCoords, setDestinationCoords }: SearchBarProps) {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<PlacePrediction[]>([]);

  const API_KEY = "AIzaSyA7QzAfYiQHE8mPE-KcbpWPMDqvM4lt0MY";
  const MAPBOX_TOKEN = "pk.eyJ1Ijoic29saWl3aXIiLCJhIjoiY21pbWlyd3I1MWk1NDNrcHdsMGdmOGJsOSJ9.GswElTdqTx40EhCSmqt0Dg";

  //search places using Google Places API
  const searchPlaces = async (text: string) => {
    setQuery(text);
    if (text.length < 2) return setResults([]);

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      text
    )}&key=${API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.predictions || []);
    } catch (err) {
      console.log(err);
    }
  };

  const selectPlace = async (placeId: string) => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      const destination: Destination = {
        lat: data.result.geometry.location.lat,
        lng: data.result.geometry.location.lng,
      };

      // Show full address in search bar
      setQuery(data.result.formatted_address);
      setResults([]);
      setDestinationCoords(destination);

      // Draw route with Mapbox
      if (currentLocation) {
        const origin: [number, number] = [
          currentLocation.coords.longitude,
          currentLocation.coords.latitude,
        ];
        const dest: [number, number] = [destination.lng, destination.lat];

        const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${dest[0]},${dest[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

        const routeRes = await fetch(directionsUrl);
        const routeData = await routeRes.json();

        if (routeData.routes && routeData.routes.length) {
          setRouteCoords(routeData.routes[0].geometry.coordinates);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search destination"
        value={query}
        onChangeText={searchPlaces}
        style={styles.input}
      />
      {results.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => selectPlace(item.place_id)} style={styles.suggestionItem}>
                <Text>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    width: "100%",
    zIndex: 1000,
    alignItems: "center",
  },
  input: {
    width: "90%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  suggestionsContainer: {
    width: "90%",
    backgroundColor: "white",
    maxHeight: 200,
    marginTop: 5,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
});





