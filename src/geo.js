export default { computeDistance }

// Computes an approximate distance, in meters, between two coordinate pairs
// Expects both a and b to contain {latitude, longitude}
function computeDistance (a, b) {
  const earthRadiusMeters = 6371000
  const radsPerDeg = Math.PI / 180

  const alon = a.longitude * radsPerDeg
  const alat = a.latitude * radsPerDeg
  const blon = b.longitude * radsPerDeg
  const blat = b.latitude * radsPerDeg

  return earthRadiusMeters *
    Math.acos(
      Math.sin(blat) * Math.sin(alat) +
      Math.cos(blat) * Math.cos(alat) * Math.cos(alon - blon)
    )
}
