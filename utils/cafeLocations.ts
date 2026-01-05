// City-based cafe locations for Coffee Shop
// Coordinates for each city's cafe location

export interface CafeLocation {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
}

export const CAFE_LOCATIONS: Record<string, CafeLocation> = {
    Islamabad: {
        latitude: 33.6539,
        longitude: 72.9975,
        name: "Coffee Shop - G-15 Markaz",
        address: "G-15 Markaz, Islamabad"
    },
    Lahore: {
        latitude: 31.4697,
        longitude: 74.2728,
        name: "Coffee Shop - Johar Town",
        address: "Johar Town, Lahore"
    },
    Peshawar: {
        latitude: 34.0151,
        longitude: 71.5249,
        name: "Coffee Shop - Hayatabad",
        address: "Hayatabad, Peshawar"
    }
};

// Default location (Lahore) if no city specified
export const DEFAULT_CITY = "Lahore";

export const getCafeLocation = (city?: string | null): CafeLocation => {
    if (city && CAFE_LOCATIONS[city]) {
        return CAFE_LOCATIONS[city];
    }
    return CAFE_LOCATIONS[DEFAULT_CITY];
};

export const AVAILABLE_CITIES = Object.keys(CAFE_LOCATIONS);
