import { reverseGeocode } from "./api.js";

export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocatie wordt niet ondersteund."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(err),
      { timeout: 15000 }
    );
  });
}

export async function getAddressFromCoords(lat, lon) {
  return await reverseGeocode(lat, lon);
}
