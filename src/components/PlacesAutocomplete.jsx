import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, X } from 'lucide-react'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Map Google place types to our categories
function inferCategory(types) {
  if (!types) return 'services'

  const typeSet = new Set(types)

  // Food & Drink
  if (typeSet.has('restaurant') || typeSet.has('cafe') || typeSet.has('bar') ||
      typeSet.has('bakery') || typeSet.has('food') || typeSet.has('meal_takeaway') ||
      typeSet.has('meal_delivery')) {
    return 'food'
  }

  // Retail
  if (typeSet.has('store') || typeSet.has('shopping_mall') || typeSet.has('clothing_store') ||
      typeSet.has('grocery_or_supermarket') || typeSet.has('convenience_store') ||
      typeSet.has('liquor_store') || typeSet.has('florist') || typeSet.has('jewelry_store') ||
      typeSet.has('book_store') || typeSet.has('hardware_store')) {
    return 'retail'
  }

  // Arts & Culture
  if (typeSet.has('art_gallery') || typeSet.has('museum') || typeSet.has('movie_theater') ||
      typeSet.has('library') || typeSet.has('tourist_attraction')) {
    return 'arts'
  }

  // Services (default)
  return 'services'
}

// Generate a code from business name
function generateCode(name) {
  if (!name) return ''

  // Remove common words and special characters
  const cleaned = name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\b(THE|AND|OF|AT|IN)\b/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 20)

  return cleaned || 'BIZ'
}

function PlacesAutocomplete({ onPlaceSelect, placeholder = "Search for a business..." }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const autocompleteServiceRef = useRef(null)
  const placesServiceRef = useRef(null)
  const sessionTokenRef = useRef(null)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Load Google Maps script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return

    if (window.google?.maps?.places) {
      setMapsLoaded(true)
      return
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => setMapsLoaded(true))
      if (window.google?.maps?.places) setMapsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setMapsLoaded(true)
    document.head.appendChild(script)
  }, [])

  // Initialize services when maps loaded
  useEffect(() => {
    if (!mapsLoaded) return

    autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()

    // Create a dummy div for PlacesService (it requires a map or div)
    const dummyDiv = document.createElement('div')
    placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDiv)

    // Create session token for billing optimization
    sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
  }, [mapsLoaded])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search for places
  const searchPlaces = async (input) => {
    if (!input || input.length < 2 || !autocompleteServiceRef.current) {
      setSuggestions([])
      return
    }

    setLoading(true)

    const request = {
      input,
      sessionToken: sessionTokenRef.current,
      types: ['establishment'],
      // Bias toward Kinderhook area
      locationBias: {
        center: { lat: 42.3951, lng: -73.6977 },
        radius: 50000 // 50km radius
      }
    }

    autocompleteServiceRef.current.getPlacePredictions(request, (predictions, status) => {
      setLoading(false)
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        setSuggestions(predictions)
        setShowDropdown(true)
      } else {
        setSuggestions([])
      }
    })
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPlaces(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Get place details when selected
  const handleSelect = (prediction) => {
    if (!placesServiceRef.current) return

    const request = {
      placeId: prediction.place_id,
      fields: ['name', 'formatted_address', 'types', 'geometry', 'formatted_phone_number', 'website', 'opening_hours', 'photos'],
      sessionToken: sessionTokenRef.current
    }

    placesServiceRef.current.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        // Get photo URL if available
        let photoUrl = null
        if (place.photos && place.photos.length > 0) {
          // Get a medium-sized photo (400px width)
          photoUrl = place.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 })
        }

        const result = {
          name: place.name,
          address: place.formatted_address,
          code: generateCode(place.name),
          category: inferCategory(place.types),
          phone: place.formatted_phone_number,
          website: place.website,
          photoUrl,
          location: place.geometry?.location ? {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          } : null,
          placeId: prediction.place_id
        }

        onPlaceSelect(result)
        setQuery('')
        setSuggestions([])
        setShowDropdown(false)

        // Create new session token for next search
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
      }
    })
  }

  const clearQuery = () => {
    setQuery('')
    setSuggestions([])
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div style={{
        padding: '1rem',
        background: 'var(--kb-gray-50)',
        borderRadius: '8px',
        color: 'var(--kb-gray-500)',
        fontSize: '0.9rem',
      }}>
        Google Maps API key not configured. Add businesses manually below.
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--kb-gray-400)',
          }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          style={{
            width: '100%',
            paddingLeft: '40px',
            paddingRight: query ? '36px' : '12px',
          }}
        />
        {query && (
          <button
            onClick={clearQuery}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--kb-gray-400)',
              padding: '4px',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 100,
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid var(--kb-gray-100)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--kb-gray-50)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <MapPin size={16} color="var(--kb-gold)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: '500', color: 'var(--kb-navy)' }}>
                  {suggestion.structured_formatting?.main_text || suggestion.description}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
                  {suggestion.structured_formatting?.secondary_text}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          padding: '1rem',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          textAlign: 'center',
          color: 'var(--kb-gray-500)',
          fontSize: '0.9rem',
        }}>
          Searching...
        </div>
      )}
    </div>
  )
}

export default PlacesAutocomplete
