import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const campusBuildings = [
  {
    name: "Stutzman Slonaker Hall",
    latitude: 39.433251,
    longitude: -77.805061,
    description: "Stutzman-Slonaker Hall houses the commuter lounge (featuring a small kitchen and fenced in outdoor area), classroom space including a Biology lab and offices for the Psychology, Biology, and Math & Computer Science department",
  },
  {
    name: "Snyder Hall",
    latitude: 39.432398,
    longitude: -77.804750,
    description: "Snyder Hall is home to the Department of Computer Science, Mathematics and Engineering. Beyond classroom space it also holds labratories for Geographic Information Systems, Aquatic Sciences, and Robotics.",
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
