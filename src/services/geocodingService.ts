import NodeGeocoder from "node-geocoder";

const geocoder = NodeGeocoder({
  provider: "openstreetmap"
});

const CITY_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  "new york": { lat: 40.7128, lng: -74.0060 },
  "seattle": { lat: 47.6062, lng: -122.3321 },
  "bellevue": { lat: 47.6101, lng: -122.2015 },
  "san francisco": { lat: 37.7749, lng: -122.4194 },
  "los angeles": { lat: 34.0522, lng: -118.2437 },
  "chicago": { lat: 41.8781, lng: -87.6298 },
  "boston": { lat: 42.3601, lng: -71.0589 },
  "miami": { lat: 25.7617, lng: -80.1918 }
};

export async function geocodeAddress(address: string): Promise<{
  lat: number | null;
  lng: number | null;
  formattedAddress: string;
  fallbackUsed: boolean;
  warning?: string;
}> {
  try {
    const res = await geocoder.geocode(address);
    if (res && res.length > 0) {
      const first = res[0];
      if (first.latitude !== undefined && first.longitude !== undefined) {
        return {
          lat: first.latitude,
          lng: first.longitude,
          formattedAddress: first.formattedAddress || address,
          fallbackUsed: false
        };
      }
    }
    throw new Error("No coordinate results found");
  } catch (err: any) {
    console.warn(`Geocoding API failed for "${address}": ${err.message || String(err)}. Falling back to centroid map...`);

    const normalized = address.toLowerCase();
    for (const city of Object.keys(CITY_CENTROIDS)) {
      if (normalized.includes(city)) {
        return {
          lat: CITY_CENTROIDS[city].lat,
          lng: CITY_CENTROIDS[city].lng,
          formattedAddress: address,
          fallbackUsed: true
        };
      }
    }

    // Geocoding failed completely and no matching city centroid found
    return {
      lat: null,
      lng: null,
      formattedAddress: address,
      fallbackUsed: true,
      warning: "We could not verify your address. Please contact support."
    };
  }
}
