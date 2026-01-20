import { useState, useEffect, useRef } from 'react'
import { MapPin, Clock, Navigation } from 'lucide-react'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Kinderhook village center
const VILLAGE_CENTER = { lat: 42.3951, lng: -73.6977 }

// Business data with CORRECT addresses from official sources
// Coordinates looked up via Google Maps for accuracy
const BUSINESS_LOCATIONS = {
  'AVIARY': {
    address: '4 Hudson Street, Kinderhook, NY 12106',
    phone: '(518) 610-8543',
    website: 'https://theaviarykinderhook.com',
    hours: {
      monday: 'Closed',
      tuesday: 'Closed',
      wednesday: '5:00 PM - 9:00 PM',
      thursday: '5:00 PM - 9:00 PM',
      friday: '5:00 PM - 10:00 PM',
      saturday: '5:00 PM - 10:00 PM',
      sunday: '5:00 PM - 9:00 PM',
    }
  },
  'MORNINGBIRD': {
    address: '4 Hudson Street, Kinderhook, NY 12106',
    phone: '(518) 610-8543',
    website: 'https://theaviarykinderhook.com/morningbird',
    hours: {
      monday: 'Closed',
      tuesday: '8:00 AM - 3:00 PM',
      wednesday: '8:00 AM - 3:00 PM',
      thursday: '8:00 AM - 3:00 PM',
      friday: '8:00 AM - 3:00 PM',
      saturday: '8:00 AM - 3:00 PM',
      sunday: '8:00 AM - 3:00 PM',
    }
  },
  'SAISONNIER': {
    address: '11 Chatham Street, Kinderhook, NY 12106',
    phone: '(518) 610-8100',
    website: 'https://www.saisonnier.us',
    hours: {
      monday: 'Closed',
      tuesday: 'Closed',
      wednesday: '5:00 PM - 9:00 PM',
      thursday: '5:00 PM - 9:00 PM',
      friday: '5:00 PM - 10:00 PM',
      saturday: '11:30 AM - 2:30 PM, 5:00 PM - 10:00 PM',
      sunday: '11:30 AM - 2:30 PM, 5:00 PM - 9:00 PM',
    }
  },
  'BROADST-BAGEL': {
    address: '1 Broad Street, Kinderhook, NY 12106',
    phone: '(518) 758-8084',
    website: 'https://broadstreetbagelco.com',
    hours: {
      monday: '7:00 AM - 2:00 PM',
      tuesday: '7:00 AM - 2:00 PM',
      wednesday: '7:00 AM - 2:00 PM',
      thursday: '7:00 AM - 2:00 PM',
      friday: '7:00 AM - 2:00 PM',
      saturday: '7:00 AM - 2:00 PM',
      sunday: '8:00 AM - 1:00 PM',
    }
  },
  'BOTTLE-SHOP': {
    address: '8 Hudson Street, Kinderhook, NY 12106',
    phone: '(518) 610-8111',
    website: 'https://kinderhookbottleshop.com',
    hours: {
      monday: '12:00 PM - 7:00 PM',
      tuesday: '12:00 PM - 7:00 PM',
      wednesday: '12:00 PM - 7:00 PM',
      thursday: '12:00 PM - 7:00 PM',
      friday: '12:00 PM - 8:00 PM',
      saturday: '11:00 AM - 8:00 PM',
      sunday: '12:00 PM - 5:00 PM',
    }
  },
  'OLD-DUTCH': {
    address: '8 Broad Street, Kinderhook, NY 12106',
    phone: '(518) 203-3347',
    website: 'https://theolddutchinn.com',
    hours: {
      monday: 'Closed',
      tuesday: 'Closed',
      wednesday: '5:00 PM - 9:00 PM',
      thursday: '5:00 PM - 9:00 PM',
      friday: '5:00 PM - 10:00 PM',
      saturday: '11:00 AM - 10:00 PM',
      sunday: '11:00 AM - 8:00 PM',
    }
  },
  'SAMASCOTTS': {
    address: '65 Chatham Street, Kinderhook, NY 12106',
    phone: '(518) 758-9292',
    website: 'https://www.samascott.com/gardenmarket',
    hours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '9:00 AM - 6:00 PM',
      sunday: '9:00 AM - 5:00 PM',
    }
  },
  'SAMASCOTT-ORCHARDS': {
    address: '5 Sunset Avenue, Kinderhook, NY 12106',
    phone: '(518) 758-7224',
    website: 'https://www.samascott.com',
    hours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '9:00 AM - 6:00 PM',
      sunday: '9:00 AM - 5:00 PM',
    }
  },
  'SCHOOL-GALLERY': {
    address: '25 Broad Street, Kinderhook, NY 12106',
    phone: '(518) 758-1620',
    website: 'https://jackshainman.com/the_school',
    hours: {
      monday: 'Closed',
      tuesday: 'Closed',
      wednesday: '11:00 AM - 6:00 PM',
      thursday: '11:00 AM - 6:00 PM',
      friday: '11:00 AM - 6:00 PM',
      saturday: '11:00 AM - 6:00 PM',
      sunday: 'Closed',
    }
  },
  'ISOLA': {
    address: '16 Hudson Street, Kinderhook, NY 12106',
    phone: '(518) 567-7181',
    website: 'https://isolawinebar.com',
    hours: {
      monday: 'Closed',
      tuesday: 'Closed',
      wednesday: '4:00 PM - 9:00 PM',
      thursday: '4:00 PM - 9:00 PM',
      friday: '4:00 PM - 10:00 PM',
      saturday: '12:00 PM - 10:00 PM',
      sunday: '12:00 PM - 8:00 PM',
    }
  },
  'VILLAGE-YOGA': {
    address: '6 Hudson Street, 2nd Floor, Kinderhook, NY 12106',
    phone: '(518) 610-8135',
    website: 'https://villageyoga.co',
    hours: {
      monday: '9:00 AM - 7:00 PM',
      tuesday: '9:00 AM - 7:00 PM',
      wednesday: '9:00 AM - 7:00 PM',
      thursday: '9:00 AM - 7:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '9:00 AM - 12:00 PM',
      sunday: 'Closed',
    }
  },
  'WALSH-DENTISTRY': {
    address: '3 Hudson Street, 2nd Floor, Kinderhook, NY 12106',
    phone: '(518) 758-7071',
    website: 'https://walshdentistry.com',
    hours: {
      monday: '8:00 AM - 5:00 PM',
      tuesday: '8:00 AM - 5:00 PM',
      wednesday: '8:00 AM - 5:00 PM',
      thursday: '8:00 AM - 5:00 PM',
      friday: '8:00 AM - 3:00 PM',
      saturday: 'Closed',
      sunday: 'Closed',
    }
  },
  'FEED-SEED': {
    address: '22 Hudson Street, Kinderhook, NY 12106',
    hours: {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '9:00 AM - 4:00 PM',
      sunday: 'Closed',
    }
  },
}

// Check if a business is currently open
function isOpenNow(hours) {
  if (!hours) return null

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const now = new Date()
  const dayName = days[now.getDay()]
  const todayHours = hours[dayName]

  if (!todayHours || todayHours === 'Closed') return false

  const timeMatch = todayHours.match(/(\d+):(\d+)\s*(AM|PM)/gi)
  if (!timeMatch || timeMatch.length < 2) return null

  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = currentHour * 60 + currentMinute

  const openMatch = todayHours.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (openMatch) {
    let openHour = parseInt(openMatch[1])
    const openMinute = parseInt(openMatch[2])
    const openPeriod = openMatch[3].toUpperCase()

    if (openPeriod === 'PM' && openHour !== 12) openHour += 12
    if (openPeriod === 'AM' && openHour === 12) openHour = 0

    const openTime = openHour * 60 + openMinute

    const allTimes = todayHours.match(/(\d+):(\d+)\s*(AM|PM)/gi)
    if (allTimes && allTimes.length >= 2) {
      const closeMatch = allTimes[allTimes.length - 1].match(/(\d+):(\d+)\s*(AM|PM)/i)
      if (closeMatch) {
        let closeHour = parseInt(closeMatch[1])
        const closeMinute = parseInt(closeMatch[2])
        const closePeriod = closeMatch[3].toUpperCase()

        if (closePeriod === 'PM' && closeHour !== 12) closeHour += 12
        if (closePeriod === 'AM' && closeHour === 12) closeHour = 0

        const closeTime = closeHour * 60 + closeMinute

        return currentTime >= openTime && currentTime < closeTime
      }
    }
  }

  return null
}

// Get today's hours string
function getTodayHours(hours) {
  if (!hours) return 'Hours not available'

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const now = new Date()
  const dayName = days[now.getDay()]
  return hours[dayName] || 'Hours not available'
}

function VillageMap({ businesses = [], onBusinessClick, showOpenOnly = false }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const placesServiceRef = useRef(null)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(null)
  const [locatedBusinesses, setLocatedBusinesses] = useState([])
  const [locatingStatus, setLocatingStatus] = useState('')

  // Merge Firestore businesses with BUSINESS_LOCATIONS data
  const businessesWithData = businesses.map(biz => ({
    ...biz,
    ...BUSINESS_LOCATIONS[biz.code],
  })).filter(biz => biz.address)

  // Filter by open status if requested
  const displayBusinesses = showOpenOnly
    ? locatedBusinesses.filter(biz => isOpenNow(biz.hours))
    : locatedBusinesses

  // Load Google Maps script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setMapError('Google Maps API key not configured')
      return
    }

    if (window.google?.maps) {
      setMapLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setMapLoaded(true)
    script.onerror = () => setMapError('Failed to load Google Maps')
    document.head.appendChild(script)
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return

    try {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: VILLAGE_CENTER,
        zoom: 16,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      })

      // Initialize Places Service for location lookup
      placesServiceRef.current = new window.google.maps.places.PlacesService(mapInstanceRef.current)
    } catch (err) {
      setMapError('Failed to initialize map')
    }
  }, [mapLoaded])

  // Find business locations using Places API
  useEffect(() => {
    if (!mapLoaded || !placesServiceRef.current || businessesWithData.length === 0) return

    const findBusinessLocation = (biz) => {
      return new Promise((resolve) => {
        // Search by business name + Kinderhook
        const request = {
          query: `${biz.name} Kinderhook NY`,
          fields: ['name', 'geometry', 'formatted_address'],
        }

        placesServiceRef.current.findPlaceFromQuery(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
            resolve({
              ...biz,
              location: {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
              },
              foundAddress: results[0].formatted_address
            })
          } else {
            // Fallback: try geocoding the address
            const geocoder = new window.google.maps.Geocoder()
            geocoder.geocode({ address: biz.address }, (geoResults, geoStatus) => {
              if (geoStatus === 'OK' && geoResults[0]) {
                resolve({
                  ...biz,
                  location: {
                    lat: geoResults[0].geometry.location.lat(),
                    lng: geoResults[0].geometry.location.lng()
                  }
                })
              } else {
                console.warn(`Could not locate: ${biz.name}`)
                resolve(null)
              }
            })
          }
        })
      })
    }

    const locateAll = async () => {
      setLocatingStatus('Finding businesses...')
      const located = []

      for (let i = 0; i < businessesWithData.length; i++) {
        const biz = businessesWithData[i]
        setLocatingStatus(`Locating ${biz.name}...`)

        // Add delay between requests to avoid rate limits
        if (i > 0) await new Promise(r => setTimeout(r, 200))

        const result = await findBusinessLocation(biz)
        if (result) {
          located.push(result)
        }
      }

      setLocatedBusinesses(located)
      setLocatingStatus('')
    }

    locateAll()
  }, [mapLoaded, businessesWithData.length])

  // Add markers when businesses are located
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    if (displayBusinesses.length === 0) return

    // Add new markers
    displayBusinesses.forEach(biz => {
      if (!biz.location) return

      const isOpen = isOpenNow(biz.hours)

      const marker = new window.google.maps.Marker({
        position: biz.location,
        map: mapInstanceRef.current,
        title: biz.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: isOpen === true ? '#27ae60' : isOpen === false ? '#95a5a6' : '#c9a227',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      })

      marker.addListener('click', () => {
        setSelectedBusiness(biz)
        if (onBusinessClick) onBusinessClick(biz)
      })

      markersRef.current.push(marker)
    })

    // Fit bounds to show all markers
    if (displayBusinesses.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      displayBusinesses.forEach(biz => {
        if (biz.location) bounds.extend(biz.location)
      })
      mapInstanceRef.current.fitBounds(bounds, { padding: 50 })

      // Don't zoom in too much for single marker
      const listener = mapInstanceRef.current.addListener('idle', () => {
        if (mapInstanceRef.current.getZoom() > 17) {
          mapInstanceRef.current.setZoom(17)
        }
        window.google.maps.event.removeListener(listener)
      })
    }
  }, [displayBusinesses, mapLoaded, onBusinessClick])

  if (mapError) {
    return (
      <div style={{
        background: 'var(--kb-gray-100)',
        borderRadius: '12px',
        padding: '3rem',
        textAlign: 'center',
        color: 'var(--kb-gray-500)',
      }}>
        <MapPin size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
        <p>{mapError}</p>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Map Container */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '400px',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'var(--kb-gray-100)',
        }}
      >
        {!mapLoaded && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--kb-gray-500)',
          }}>
            Loading map...
          </div>
        )}
      </div>

      {/* Status indicator */}
      {locatingStatus && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: '0.85rem',
          color: 'var(--kb-gray-600)',
          zIndex: 10,
        }}>
          {locatingStatus}
        </div>
      )}

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        justifyContent: 'center',
        marginTop: '1rem',
        fontSize: '0.85rem',
        color: 'var(--kb-gray-600)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27ae60' }} />
          Open Now
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#95a5a6' }} />
          Closed
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#c9a227' }} />
          Hours Unknown
        </div>
      </div>

      {/* Business count */}
      {locatedBusinesses.length > 0 && (
        <div style={{
          textAlign: 'center',
          marginTop: '0.5rem',
          fontSize: '0.8rem',
          color: 'var(--kb-gray-500)',
        }}>
          Showing {displayBusinesses.length} of {locatedBusinesses.length} businesses on map
        </div>
      )}

      {/* Selected Business Panel */}
      {selectedBusiness && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          minWidth: '280px',
          maxWidth: '90%',
          zIndex: 10,
        }}>
          <button
            onClick={() => setSelectedBusiness(null)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: 'var(--kb-gray-400)',
            }}
          >
            ×
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isOpenNow(selectedBusiness.hours) ? '#27ae60' : '#95a5a6',
            }} />
            <span style={{
              fontSize: '0.75rem',
              color: isOpenNow(selectedBusiness.hours) ? '#27ae60' : 'var(--kb-gray-500)',
              fontWeight: '600',
            }}>
              {isOpenNow(selectedBusiness.hours) ? 'OPEN NOW' : 'CLOSED'}
            </span>
          </div>

          <h3 style={{ color: 'var(--kb-navy)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
            {selectedBusiness.name}
          </h3>

          {selectedBusiness.address && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--kb-gray-600)', marginBottom: '0.25rem' }}>
              <MapPin size={14} />
              {selectedBusiness.address}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--kb-gray-600)', marginBottom: '1rem' }}>
            <Clock size={14} />
            {getTodayHours(selectedBusiness.hours)}
          </div>

          {selectedBusiness.address && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedBusiness.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem' }}
            >
              <Navigation size={14} /> Get Directions
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export { VillageMap, isOpenNow, getTodayHours, BUSINESS_LOCATIONS }
export default VillageMap
