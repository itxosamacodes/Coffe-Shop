import React, { useEffect, useRef, useState } from 'react';
import { Polyline } from 'react-native-maps';
import { getRoute } from '../utils/routing';

export const RoutePolyline = ({ start, end }: { start: any, end: any }) => {
    const [coords, setCoords] = useState<any[]>([]);
    const lastFetchPos = useRef<any>(null);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    useEffect(() => {
        const fetchRoute = async () => {
            if (!start || !end || !start.latitude || !start.longitude || !end.latitude || !end.longitude) return;

            // Only refetch if moved > 50 meters or destination changed
            if (lastFetchPos.current) {
                const distStart = calculateDistance(start.latitude, start.longitude, lastFetchPos.current.start.latitude, lastFetchPos.current.start.longitude);
                const distEnd = calculateDistance(end.latitude, end.longitude, lastFetchPos.current.end.latitude, lastFetchPos.current.end.longitude);
                if (distStart < 0.05 && distEnd < 0.01) return;
            }

            console.log("🛣️ [ROUTING] Fetching live route...");
            const route = await getRoute(start.latitude, start.longitude, end.latitude, end.longitude);
            if (route && route.length > 0) {
                setCoords(route);
                lastFetchPos.current = { start, end };
            }
        };

        const timer = setTimeout(fetchRoute, 500); // Debounce
        return () => clearTimeout(timer);
    }, [start?.latitude, start?.longitude, end?.latitude, end?.longitude]);

    if (coords.length === 0) return null;

    return (
        <Polyline
            coordinates={coords}
            strokeColor="#C67C4E"
            strokeWidth={4}
            lineDashPattern={[0]}
            zIndex={1}
        />
    );
};
