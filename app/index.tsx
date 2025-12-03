import { useRouter } from "expo-router";
import 'mapbox-gl/dist/mapbox-gl.css';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Platform } from 'react-native';

let MapboxGL;
if (Platform.OS !== 'web') {
  MapboxGL = require('@rnmapbox/maps').default;
}


export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Campus App</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/MapScreen")}
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
