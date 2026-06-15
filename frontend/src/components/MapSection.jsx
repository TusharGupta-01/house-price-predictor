/**
 * MapSection — Leaflet-based interactive map
 * Shows approximate pin location for the selected locality.
 * Uses free OpenStreetMap tiles, no API key required.
 */

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiMapPin } from 'react-icons/fi'
import 'leaflet/dist/leaflet.css'

// City centre coordinates (fallback when no location selected)
const CITY_CENTRES = {
  bengaluru: [12.9716, 77.5946],
  mumbai: [19.076, 72.8777],
}

// Geocode a free-form locality string via Nominatim
async function geocodeLocation(city, location) {
  const query = `${location}, ${city}, India`
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
    const data = await res.json()
    if (data && data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
  } catch (_) {}
  return null
}

export default function MapSection({ city, location }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  // Initialise Leaflet map once
  useEffect(() => {
    if (mapInstanceRef.current) return

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default icon paths
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const centre = CITY_CENTRES[city] || CITY_CENTRES.bengaluru
      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(centre, 12)

      // Dark-themed tile layer (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = { map, L }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.map.remove()
        mapInstanceRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Pan map when city changes (even without location)
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const { map } = mapInstanceRef.current
    const centre = CITY_CENTRES[city] || CITY_CENTRES.bengaluru
    map.setView(centre, 12, { animate: true })

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }
  }, [city])

  // Geocode location and place marker
  useEffect(() => {
    if (!location || !mapInstanceRef.current) return
    const { map, L } = mapInstanceRef.current

    geocodeLocation(city, location).then((coords) => {
      if (!mapInstanceRef.current) return

      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }

      const centre = coords || CITY_CENTRES[city] || CITY_CENTRES.bengaluru
      map.setView(centre, 14, { animate: true })

      // Custom coloured icon
      const icon = L.divIcon({
        html: `<div style="
          width:32px;height:32px;border-radius:50% 50% 50% 0;
          background:linear-gradient(135deg,#4f5ff7,#a78bfa);
          transform:rotate(-45deg);border:3px solid white;
          box-shadow:0 0 16px rgba(79,95,247,0.8);
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        className: '',
      })

      markerRef.current = L.marker(centre, { icon })
        .addTo(map)
        .bindPopup(`<b>${location}</b><br/>${city.charAt(0).toUpperCase() + city.slice(1)}`)
        .openPopup()
    })
  }, [location, city])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card overflow-hidden"
    >
      <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <FiMapPin className="text-primary-400" />
        <span className="text-sm font-semibold text-gray-300">
          {location ? `${location}` : `${city.charAt(0).toUpperCase() + city.slice(1)} — Select a locality`}
        </span>
      </div>
      <div ref={mapRef} style={{ height: '280px', width: '100%' }} />
    </motion.div>
  )
}
