import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const fetchBuildingsFromFirebase = async () => {
  const buildings: any[] = [];
  const snap = await getDocs(collection(db, "buildings"));
  snap.forEach(doc => buildings.push(doc.data()));
  return buildings;
};
