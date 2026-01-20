import { useState, useEffect } from 'react'
import { Store, ImageOff } from 'lucide-react'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Cache for place photos to avoid repeated API calls
const photoCache = new Map()

function PlacePhoto({ businessName, address, size = 'medium', style = {} }) {
  const [photoUrl, setPhotoUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const sizes = {
    small: { width: 80, height: 80 },
    medium: { width: 150, height: 100 },
    large: { width: 300, height: 200 },
  }

  const { width, height } = sizes[size] || sizes.medium

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !businessName) {
      setLoading(false)
      setError(true)
      return
    }

    const cacheKey = `${businessName}-${address}`

    // Check cache first
    if (photoCache.has(cacheKey)) {
      setPhotoUrl(photoCache.get(cacheKey))
      setLoading(false)
      return
    }

    // Wait for Google Maps to load
    const checkGoogle = setInterval(() => {
      if (window.google?.maps?.places) {
        clearInterval(checkGoogle)
        searchPlace()
      }
    }, 100)

    // Timeout after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkGoogle)
      setLoading(false)
      setError(true)
    }, 5000)

    async function searchPlace() {
      try {
        // Create a temporary div for PlacesService (required by Google)
        const tempDiv = document.createElement('div')
        const service = new window.google.maps.places.PlacesService(tempDiv)

        const searchQuery = `${businessName} ${address || 'Kinderhook NY'}`

        service.findPlaceFromQuery(
          {
            query: searchQuery,
            fields: ['photos', 'place_id'],
          },
          (results, status) => {
            clearTimeout(timeout)

            if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.[0]?.photos?.length > 0) {
              const photo = results[0].photos[0]
              const url = photo.getUrl({ maxWidth: width * 2, maxHeight: height * 2 })
              photoCache.set(cacheKey, url)
              setPhotoUrl(url)
            } else {
              setError(true)
            }
            setLoading(false)
          }
        )
      } catch (err) {
        console.error('Place photo error:', err)
        setError(true)
        setLoading(false)
      }
    }

    return () => {
      clearInterval(checkGoogle)
      clearTimeout(timeout)
    }
  }, [businessName, address, width, height])

  const containerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'var(--kb-gray-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    ...style,
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{
          width: '24px',
          height: '24px',
          border: '2px solid var(--kb-gray-200)',
          borderTopColor: 'var(--kb-navy)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error || !photoUrl) {
    return (
      <div style={{ ...containerStyle, background: 'linear-gradient(135deg, var(--kb-gray-100) 0%, var(--kb-gray-200) 100%)' }}>
        <Store size={24} color="var(--kb-gray-400)" />
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <img
        src={photoUrl}
        alt={businessName}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        onError={() => setError(true)}
      />
    </div>
  )
}

export default PlacePhoto
