import React, { useEffect, useState } from 'react';
import { Polyline } from 'react-native-maps';
import { getRoute } from '../utils/routing';

export const RoutePolyline = ({ start, end }: { start: any, end: any }) => {
    const [coords, setCoords] = useState<any[]>([]);

    useEffect(() => {
        const fetchRoute = async () => {
            if (start && end) {
                const route = await getRoute(start.latitude, start.longitude, end.latitude, end.longitude);
                setCoords(route);
            }
        };
        fetchRoute();
    }, [start, end]);

    if (coords.length === 0) return null;

    return (
        <Polyline
            coordinates={coords}
            strokeColor="#C67C4E"
            strokeWidth={4}
        />
    );
};
