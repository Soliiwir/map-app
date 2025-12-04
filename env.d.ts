declare module 'expo-env' {
  export const env: {
    MAPBOX_TOKEN: string;
    GOOGLE_API_KEY: string;
    [key: string]: string; 
  };
}
