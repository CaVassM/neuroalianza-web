import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Establecimiento } from '../../types';
import { formatDistancia } from '../../utils/distancia';
import { ChevronRight, X, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MapComponentProps {
  items: Establecimiento[];
  userLocation: { lat: number; lng: number; isBrowserLocation: boolean; district: string };
  hoveredId: string | null;
  selectedId: string | null;
  onSelectEstablecimiento: (item: Establecimiento) => void;
  onOpenFicha: (item: Establecimiento) => void;
  /** Radio de búsqueda en km. Se dibuja alrededor de la ubicación de la familia. */
  radioKm?: number;
}

// Controller component to handle panning, fitBounds & size invalidation
const MapController: React.FC<{
  items: Establecimiento[];
  userLocation: { lat: number; lng: number };
  selectedItem: Establecimiento | null;
}> = ({ items, userLocation, selectedItem }) => {
  const map = useMap();

  // Invalidate map size on mount and container resizing
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);

  // If a specific item is selected/clicked, fly to it smoothly
  useEffect(() => {
    if (selectedItem) {
      map.flyTo([selectedItem.lat, selectedItem.lng], 16, {
        duration: 0.8,
        easeLinearity: 0.25,
      });
    }
  }, [selectedItem, map]);

  // Fit bounds when items or user location changes
  useEffect(() => {
    if (items.length === 0) {
      map.setView([userLocation.lat, userLocation.lng], 14);
      return;
    }

    const bounds = L.latLngBounds([
      [userLocation.lat, userLocation.lng],
      ...items.map((item) => [item.lat, item.lng] as [number, number]),
    ]);

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
      animate: true,
    });
  }, [items, userLocation, map]);

  return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({
  items,
  userLocation,
  hoveredId,
  selectedId,
  onSelectEstablecimiento,
  onOpenFicha,
  radioKm = 2,
}) => {
  const [mobileActiveItem, setMobileActiveItem] = useState<Establecimiento | null>(null);

  // Find currently selected item
  const selectedItem = useMemo(() => {
    return items.find((i) => i.codigo === selectedId) || null;
  }, [items, selectedId]);

  // Custom marker pin generator
  const createPinIcon = (cat: string, isHovered: boolean, isSelected: boolean) => {
    let color = '#6B3FA0'; // I-1 to I-4
    if (cat.startsWith('II-')) color = '#4A2270';
    else if (cat.startsWith('III-')) color = '#2E1A47';

    const isHighlight = isHovered || isSelected;
    const bounceClass = isHovered ? 'animate-marker-bounce' : '';
    const zClass = isHighlight ? 'z-50' : 'z-10';

    const html = `
      <div class="relative flex items-center justify-center ${bounceClass} ${zClass} transition-transform duration-200 cursor-pointer" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.28));">
        <svg width="36" height="44" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 42C17 42 34 26.5 34 17C34 7.61116 26.3888 0 17 0C7.61116 0 0 7.61116 0 17C0 26.5 17 42 17 42Z" fill="${color}" stroke="#ffffff" stroke-width="${isHighlight ? '3' : '1.8'}"/>
          <circle cx="17" cy="16" r="11.5" fill="rgba(255,255,255,0.25)"/>
          <text x="17" y="19.5" text-anchor="middle" fill="#ffffff" font-size="9.5" font-family="Inter, system-ui, sans-serif" font-weight="700" letter-spacing="0.2px">${cat}</text>
        </svg>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-leaflet-marker-pin',
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      tooltipAnchor: [0, -42],
      popupAnchor: [0, -44],
    });
  };

  // User location marker pin
  const userPinIcon = useMemo(() => {
    const html = `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-9 h-9 rounded-full bg-[#E9DFF5] animate-ping opacity-75"></span>
        <div class="w-8 h-8 rounded-full bg-[#E9DFF5] border-2 border-[#4A2270] shadow-md flex items-center justify-center text-[#4A2270]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A2270" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="7" r="4"/>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          </svg>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-user-marker-pin',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      tooltipAnchor: [0, -18],
    });
  }, []);

  // Custom cluster icon builder
  const createClusterCustomIcon = (cluster: any) => {
    const count = cluster.getChildCount();
    return L.divIcon({
      html: `<div class="marker-cluster-custom"><div>${count}</div></div>`,
      className: 'custom-cluster-icon',
      iconSize: L.point(42, 42, true),
    });
  };

  return (
    <div className="relative w-full h-[500px] sm:h-[580px] lg:h-[640px] rounded-3xl border border-[#E5E1EC] shadow-sm overflow-hidden z-0 bg-[#EFEFF4]">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapController
          items={items}
          userLocation={userLocation}
          selectedItem={selectedItem}
        />

        {/* User location marker */}
        {/* Radio de búsqueda. Va ANTES de los marcadores para quedar por
            debajo de ellos, y sin relleno opaco para no tapar el mapa. */}
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={radioKm * 1000}
          pathOptions={{
            color: '#4A2270',
            weight: 1.5,
            opacity: 0.55,
            fillColor: '#6B3FA0',
            fillOpacity: 0.07,
            dashArray: '6 6',
          }}
          interactive={false}
        />

        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userPinIcon}
        >
          <Tooltip direction="top" offset={[0, -2]} opacity={1} className="custom-leaflet-tooltip custom-user-tooltip">
            <div className="text-xs font-bold text-[#4A2270] py-0.5 px-1 whitespace-nowrap">
              {userLocation.isBrowserLocation
                ? 'Tu ubicación actual'
                : `Centro de ${userLocation.district}`}
            </div>
          </Tooltip>
        </Marker>

        {/* Clustered establishment markers */}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={35}
          spiderfyOnMaxZoom={true}
          disableClusteringAtZoom={15}
          showCoverageOnHover={false}
        >
          {items.map((item) => {
            const isHovered = hoveredId === item.codigo;
            const isSelected = selectedId === item.codigo;
            const icon = createPinIcon(item.categoria, isHovered, isSelected);
            const distLabel = item.distanciaKm !== undefined ? formatDistancia(item.distanciaKm) : '';

            return (
              <Marker
                key={item.codigo}
                position={[item.lat, item.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    onSelectEstablecimiento(item);
                    onOpenFicha(item);
                    // On mobile, also trigger bottom preview sheet
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      setMobileActiveItem(item);
                    }
                  },
                }}
              >
                {/* Clear, high-contrast hover Tooltip */}
                <Tooltip
                  direction="top"
                  offset={[0, -4]}
                  opacity={1}
                  className="custom-leaflet-tooltip"
                >
                  <div className="w-[220px] sm:w-[250px] space-y-2 p-1 text-left">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-[#E9DFF5] text-[10.5px] font-bold text-[#4A2270]">
                          {item.categoria}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#E6F2EC] text-[10.5px] font-bold text-[#2E7D5B]">
                          {item.cobertura}
                        </span>
                        {distLabel && (
                          <span className="text-[11px] text-[#6E6A75] font-semibold ml-auto">
                            {distLabel}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-[13.5px] text-[#2E2A33] leading-snug break-words">
                        {item.nombre}
                      </p>
                      <p className="text-[11.5px] text-[#6E6A75] mt-0.5 break-words">
                        {item.clasificacion} · {item.distrito}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-[#F0EDF5] flex items-center justify-between text-[11px]">
                      <span className="text-[#6B3FA0] font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#6B3FA0]" />
                        <span>Haz clic para ver la ficha</span>
                      </span>
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Mobile Bottom Sheet when touching a marker on phones */}
      <AnimatePresence>
        {mobileActiveItem && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="md:hidden absolute bottom-0 inset-x-0 bg-white border-t border-[#E5E1EC] rounded-t-2xl p-4 shadow-xl z-50 text-left"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-2 py-0.5 rounded bg-[#E9DFF5] text-[11px] font-bold text-[#4A2270]">
                    {mobileActiveItem.categoria}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#E6F2EC] text-[11px] font-bold text-[#2E7D5B]">
                    {mobileActiveItem.cobertura}
                  </span>
                </div>
                <h4 className="font-bold text-[14.5px] text-[#2E2A33]">
                  {mobileActiveItem.nombre}
                </h4>
                <p className="text-xs text-[#6E6A75] mt-0.5">
                  {mobileActiveItem.clasificacion} · {mobileActiveItem.distrito}{' '}
                  {mobileActiveItem.distanciaKm !== undefined
                    ? `· ${formatDistancia(mobileActiveItem.distanciaKm)}`
                    : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMobileActiveItem(null)}
                className="w-7 h-7 rounded-full bg-[#F7F5FA] flex items-center justify-center text-[#6E6A75] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = mobileActiveItem;
                  setMobileActiveItem(null);
                  onOpenFicha(target);
                }}
                className="flex-1 py-2.5 bg-[#4A2270] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <span>Ver ficha completa y requisitos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
