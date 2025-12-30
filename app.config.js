import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: "Map-app",
  slug: "map-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "mapapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    ...config.ios,
    supportsTablet: true,
  },
  android: {
    ...config.android,
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.mapapp",
  },
  web: {
    ...config.web,
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission: "Allow App to access your location",
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
  extra: {
    MAPBOX_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
    GOOGLE_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
    eas: {
      projectId: "93531cff-0dea-4972-afdb-592e5774b84e",
    },
    router: {},
  },
  updates: {
    url: "https://u.expo.dev/93531cff-0dea-4972-afdb-592e5774b84e",
  },
  runtimeVersion: {
    runtimeVersion: "1.0.0"
  },
});
