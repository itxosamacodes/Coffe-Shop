import { Alert } from "react-native";

export const getRoute = async (
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
) => {
    if (!startLat || !startLng || !endLat || !endLng) return [];

    try {
        const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
        );
        const json = await response.json();

        if (json.code === "Ok" && json.routes.length > 0) {
            const coordinates = json.routes[0].geometry.coordinates.map(
                (coord: number[]) => ({
                    latitude: coord[1],
                    longitude: coord[0],
                })
            );
            return coordinates;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Routing Error:", error);
        return [];
    }
};
