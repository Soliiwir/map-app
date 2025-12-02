import { useRouter } from "expo-router";
import 'mapbox-gl/dist/mapbox-gl.css';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Platform } from 'react-native';

//import MapboxGL only for non-web platforms
let MapboxGL;
if (Platform.OS !== 'web') {
  MapboxGL = require('@rnmapbox/maps').default;
}


export default function HomeScreen() {
  const router = useRouter(); // current router instance

  return (
  
    <View style={styles.container}>
      // openning screen title
      <Text style={styles.title}>Campus App</Text>

      <TouchableOpacity // button to navigate to MapViewScreen
        style={styles.button}
        onPress={() => router.push("/MapViewScreen")}
      >
        <Text style={styles.buttonText}>Open Map</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
