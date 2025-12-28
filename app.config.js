import 'dotenv/config';

export default {
  expo: {
    name: "Map-app",
    slug: "map-app",
    scheme: "mapapp",
    extra: {
      MAPBOX_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
      GOOGLE_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
    },
  },
};
