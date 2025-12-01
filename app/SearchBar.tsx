import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type PlacePrediction = {
  place_id: string;
  description: string;
};

type Destination = {
  lat: number;
  lng: number;
};

interface SearchBarProps {
  currentLocation: { coords: { latitude: number; longitude: number } } | null;
  setRouteCoords: (coords: [number, number][]) => void;
  setDestinationCoords: (coords: Destination) => void;
}

export default function SearchBar({ currentLocation, setRouteCoords, setDestinationCoords }: SearchBarProps) {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<PlacePrediction[]>([]);

  const API_KEY = "AIzaSyA7QzAfYiQHE8mPE-KcbpWPMDqvM4lt0MY";
  const MAPBOX_TOKEN = "pk.eyJ1Ijoic29saWl3aXIiLCJhIjoiY21pbWlyd3I1MWk1NDNrcHdsMGdmOGJsOSJ9.GswElTdqTx40EhCSmqt0Dg";

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





// import React, { useState } from 'react';
// import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// export default function SearchBar({ searchedLocation }) {
//   const [query, setQuery] = useState('');
//   const [results, setResults] = useState([]);

//   const searchPlaces = async (text) => {
//     setQuery(text);
//     if (text.length < 2) return setResults([]);

//     const API_KEY = 'AIzaSyA7QzAfYiQHE8mPE-KcbpWPMDqvM4lt0MY';
//     const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
//       text
//     )}&key=${API_KEY}`;

//     try {
//       const res = await fetch(url);
//       const data = await res.json();
//       setResults(data.predictions || []);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const selectPlace = async (placeId) => {
//     const API_KEY = 'AIzaSyA7QzAfYiQHE8mPE-KcbpWPMDqvM4lt0MY';
//     const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`;

//     try {
//       const res = await fetch(url);
//       const data = await res.json();
//       searchedLocation(data.result.geometry.location);
//       setQuery(data.result.name);
//       setResults([]);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TextInput
//         placeholder="Search"
//         value={query}
//         onChangeText={searchPlaces}
//         style={styles.input}
//       />

//       {results.length > 0 && (
//         <View style={styles.suggestionsContainer}>
//           <FlatList
//             data={results}
//             keyExtractor={(item) => item.place_id}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 onPress={() => selectPlace(item.place_id)}
//                 style={styles.suggestionItem}
//               >
//                 <Text>{item.description}</Text>
//               </TouchableOpacity>
//             )}
//           />
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     position: 'absolute', // stay at top
//     top: 50,              // adjust as needed for your layout / status bar
//     width: '100%',
//     zIndex: 1000,         // ensure it’s above other views
//     alignItems: 'center',
//   },
//   input: {
//     width: '90%',
//     height: 40,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     backgroundColor: 'white',
//   },
//   suggestionsContainer: {
//     width: '90%',
//     backgroundColor: 'white',
//     maxHeight: 200,        // optional, scroll if too many results
//     marginTop: 5,
//     borderRadius: 8,
//     shadowColor: '#000',   // for iOS shadow
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//     elevation: 3,          // for Android shadow
//   },
//   suggestionItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderColor: '#eee',
//   },
// });






// // import { useJsApiLoader } from '@react-google-maps/api';
// // import React from 'react';


// // function MyComponent() {
// //   const { isLoaded } = useJsApiLoader({
// //     id: 'google-map-script',
// //     googleMapsApiKey: 'AIzaSyA7QzAfYiQHE8mPE-KcbpWPMDqvM4lt0MY', //Api key
// //   })

// //   console.log(isLoaded)

// //   return (
// //     <div style={{marginTop: "10%", textAlign: "center"}}>
// //       <input type="text"
// //       placeholder='Start typing'
// //       style={{ 
// //         boxSizing: 'border-box',
// //         width: '300px',
// //         height: '40px',
// //         padding: '10px',
// //         fontSize: '16px',
// //         border: '1px solid black',
// //         borderRadius: '4px',
// //         borderRadius: '8px',
// //         outline: 'none',
// //         boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
// //         textOverflow: 'ellipses',
// //         marginTop: '20px'
      
// //       }} 
      
// //       />
// //     </div>
// //   );
// // }

// // export default React.memo(MyComponent)
  

// // // import { Ionicons } from '@expo/vector-icons';
// // // import React from 'react';
// // // import { View } from 'react-native';
// // // import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// // // export default function SearchBar({ searchedLocation }) {
// // //   return (
// // //     <View
// // //       style={{
// // //         flexDirection: 'row',
// // //         marginTop: 50,
// // //         paddingHorizontal: 10,
// // //         backgroundColor: 'white',
// // //         borderRadius: 6,
// // //       }}
// // //     >
// // //       <Ionicons
// // //         name="search"
// // //         size={24}
// // //         color="gray"
// // //         style={{ paddingTop: 10 }}
// // //       />
// // //       <GooglePlacesAutocomplete
// // //         placeholder="Search"
// // //         fetchDetails={true}
// // //         onPress={(data, details = null) => {
// // //             searchedLocation(details.geometry.location)
// // //         }}
// // //         query={{
// // //           key: 'AIzaSyA7QzAfYiQHE8mPE-KcbpWPMDqvM4lt0MY',
// // //           language: 'en',
// // //         }}
// // //         enablePoweredByContainer={false}
// // //         styles={{ textInput: { flex: 1 } }}
// // //       />
// // //     </View>
// // //   );
// // // }





// // // import React from 'react';
// // // import { StyleSheet, Text, View } from 'react-native';

// // // export default function SearchBar({ searchedLocation }) {
// // //   return (
// // //     <View style={styles.container}>
// // //       <Text>Search</Text>
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     position: 'absolute', // overlay on top of map
// // //     top: 50,              // distance from top
// // //     left: 10,             // distance from left
// // //     right: 10,            // distance from right
// // //     height: 50,           // give some height
// // //     backgroundColor: 'white',
// // //     borderRadius: 8,
// // //     paddingHorizontal: 10,
// // //     justifyContent: 'center',
// // //     zIndex: 1000          // make sure it’s above the map
// // //   }
// // // });
