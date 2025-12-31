import 'dotenv/config';

const isDev = process.env.EXPO_ENV === 'development';

export default {
  expo: {
    name: "Map-app",
    slug: "map-app",
    scheme: "mapapp",

    ...(isDev
      ? {}
      : {
          runtimeVersion: "1.0.0",
          updates: {
            url: "https://u.expo.dev/93531cff-0dea-4972-afdb-592e5774b84e",
          },
        }),

    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow App to access your location",
        },
      ],
    ],

    extra: {
      MAPBOX_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
      GOOGLE_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
      eas: {
        projectId: "93531cff-0dea-4972-afdb-592e5774b84e",
      },
      router: {},
    },
  },
};
