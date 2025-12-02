import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const campusBuildings = [
  {
    name: "Scarborough Library",
    latitude: 39.432961,
    longitude: -77.804428,
    description: "The Scarborough library holds much more than books...",
  },
  {
    name: "Snyder Hall",
    latitude: 39.432398,
    longitude: -77.804750,
    description: "Snyder Hall is home to the Department of Computer Science...",
  },
];

export const uploadBuildingsToFirebase = async () => {
  try {
    for (let building of campusBuildings) {
      await setDoc(doc(db, "buildings", building.name), building);
    }
    console.log("Buildings uploaded to Firebase!");
  } catch (err) {
    console.error("Error uploading buildings:", err);
  }
};
