import 'dotenv/config';

export const env = {
  MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
};


// // env.ts
// import Constants from "expo-constants";

// export const env = {
//   MAPBOX_TOKEN: Constants.expoConfig?.extra?.MAPBOX_TOKEN ?? "",
//   GOOGLE_API_KEY: Constants.expoConfig?.extra?.GOOGLE_API_KEY ?? "",
// };

// // Quick check
// console.log("MAPBOX_TOKEN:", env.MAPBOX_TOKEN);
// console.log("GOOGLE_API_KEY:", env.GOOGLE_API_KEY);
