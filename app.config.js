import 'dotenv/config';

export default {
  expo: {
    name: "Map-app",
    slug: "map-app",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "mapapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    icon: "./assets/images/icon.png",

    ios: {
      supportsTablet: true,
    },

    android: {
      package: "com.mapapp",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      adaptiveIcon: {
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
        backgroundColor: "#E6F4FE",
      },
    },

    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow App to access your location",
        },
      ],
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: { backgroundColor: "#000000" },
        },
      ],
      "expo-font",
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    /** ✅ REQUIRED FOR EAS UPDATE (BARE WORKFLOW) */
    runtimeVersion: "1.0.0",

    updates: {
      url: "https://u.expo.dev/93531cff-0dea-4972-afdb-592e5774b84e",
    },

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
