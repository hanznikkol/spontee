/**
 * Calculates the great-circle distance between two geographic points
 * using the Haversine formula.
 *
 * @param lat1 Latitude of origin point in degrees
 * @param lon1 Longitude of origin point in degrees
 * @param lat2 Latitude of destination point in degrees
 * @param lon2 Longitude of destination point in degrees
 * @returns Distance in meters rounded to the nearest integer
 */
export function calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
        return 0;
    }

    const R = 6371000; // Earth's mean radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

/**
 * Computes a smooth, gentle distance attenuation factor between 0.85 and 1.00.
 * Ensures proximity acts as a favorable tie-breaker without overpowering place quality.
 *
 * - Distance 0m (Center): 1.00 (0% penalty)
 * - Distance = Search Radius: 0.85 (15% maximum penalty at perimeter)
 */
export function calculateDistanceFactor(distanceMeters: number, searchRadiusMeters: number): number {
    if (searchRadiusMeters <= 0) return 1.0;

    const normalized = Math.min(1.0, Math.max(0.0, distanceMeters / searchRadiusMeters));
    return 1.0 - 0.15 * normalized;
}

/**
 * Formats distance in meters for UI display:
 * - Distance < 1000m: e.g. "850 m"
 * - Distance >= 1000m: e.g. "1.3 km", "4.8 km"
 */
export function formatDistance(distanceMeters?: number | null): string {
    if (distanceMeters == null || isNaN(distanceMeters)) {
        return "";
    }

    if (distanceMeters < 1000) {
        return `${Math.round(distanceMeters)} m`;
    }

    return `${(distanceMeters / 1000).toFixed(1)} km`;
}

