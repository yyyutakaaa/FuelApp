const openRouteApiKey =
  "5b3ce3597851110001cf624883bb3b5b72ca49f4b0a6c63f5c91392f";
const openRouteUrl =
  "https://api.openrouteservice.org/v2/directions/driving-car";

export async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.display_name || null;
  } catch {
    return null;
  }
}

export async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
    address
  )}&limit=1&addressdetails=0`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export async function fetchDistance(from, to) {
  const fromCoords = await geocodeAddress(from);
  const toCoords = await geocodeAddress(to);
  if (!fromCoords || !toCoords) throw new Error("Ongeldig adres");

  const body = {
    coordinates: [
      [fromCoords.lng, fromCoords.lat],
      [toCoords.lng, toCoords.lat],
    ],
  };

  const res = await fetch(openRouteUrl, {
    method: "POST",
    headers: {
      Authorization: openRouteApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Route API error");

  const data = await res.json();
  if (!data || !data.features || !data.features[0].properties.segments)
    throw new Error("Route data ongeldig");

  const distanceMeters = data.features[0].properties.segments[0].distance;
  return distanceMeters / 1000;
}
