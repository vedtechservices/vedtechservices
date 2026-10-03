'use client';

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
} from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Office {
    id: string;
    name: string;
    branch_code: string;
    address: string;
    city: string;
    phone: string | null;
    manager_name: string | null;
    office_type:
    | 'headquarters'
    | 'branch'
    | 'service_center'
    | 'remote';
    status:
    | 'active'
    | 'inactive'
    | 'coming_soon';
    latitude: number | null;
    longitude: number | null;
}

interface OfficeMapProps {
    offices: Office[];
}

export default function OfficeMap({
    offices,
}: OfficeMapProps) {
    const mappableOffices = offices.filter(
        (office) =>
            office.latitude !== null &&
            office.longitude !== null &&
            office.status === 'active'
    );

    const center: [number, number] =
        mappableOffices.length > 0
            ? [
                mappableOffices[0].latitude!,
                mappableOffices[0].longitude!,
            ]
            : [25.8741, 85.7817];

    return (
        <MapContainer
            center={center}
            zoom={mappableOffices.length > 1 ? 7 : 13}
            style={{
                height: '100%',
                width: '100%',
            }}
            scrollWheelZoom
        >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {mappableOffices.map((office) => (
                <Marker
                    key={office.id}
                    position={[
                        office.latitude!,
                        office.longitude!,
                    ]}
                >
                    <Popup>
                        <div className="space-y-1">
                            <p className="font-semibold">
                                {office.name}
                            </p>

                            <p className="text-xs">
                                {office.branch_code}
                            </p>

                            <p className="text-xs">
                                {office.address}, {office.city}
                            </p>

                            {office.phone && (
                                <p className="text-xs">
                                    📞 {office.phone}
                                </p>
                            )}

                            {office.manager_name && (
                                <p className="text-xs">
                                    👤 {office.manager_name}
                                </p>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}