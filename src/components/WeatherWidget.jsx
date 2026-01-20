import { useState, useEffect } from 'react'
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Sunrise, Sunset } from 'lucide-react'

// Kinderhook, NY coordinates
const KINDERHOOK_LAT = 42.3944
const KINDERHOOK_LNG = -73.7059

// Weather code to icon/description mapping
const WEATHER_CODES = {
  0: { icon: Sun, description: 'Clear sky', suggestion: 'Perfect day to explore the village!' },
  1: { icon: Sun, description: 'Mainly clear', suggestion: 'Great weather for a village stroll!' },
  2: { icon: Cloud, description: 'Partly cloudy', suggestion: 'Nice day to visit local shops!' },
  3: { icon: Cloud, description: 'Overcast', suggestion: 'Good day to cozy up at a cafe!' },
  45: { icon: Cloud, description: 'Foggy', suggestion: 'Mysterious village vibes today!' },
  48: { icon: Cloud, description: 'Foggy', suggestion: 'Grab a warm drink at a local cafe!' },
  51: { icon: CloudRain, description: 'Light drizzle', suggestion: 'Pop into a shop to stay dry!' },
  53: { icon: CloudRain, description: 'Drizzle', suggestion: 'Perfect excuse for a coffee break!' },
  55: { icon: CloudRain, description: 'Heavy drizzle', suggestion: 'Browse the bookstore while it passes!' },
  61: { icon: CloudRain, description: 'Light rain', suggestion: 'Duck into a local business!' },
  63: { icon: CloudRain, description: 'Rain', suggestion: 'Great day for indoor shopping!' },
  65: { icon: CloudRain, description: 'Heavy rain', suggestion: 'Stay cozy at a village restaurant!' },
  71: { icon: CloudSnow, description: 'Light snow', suggestion: 'Beautiful! Warm up with hot cocoa!' },
  73: { icon: CloudSnow, description: 'Snow', suggestion: 'Snow day! Explore the charming village!' },
  75: { icon: CloudSnow, description: 'Heavy snow', suggestion: 'Cozy up at a local spot!' },
  77: { icon: CloudSnow, description: 'Snow grains', suggestion: 'Winter wonderland vibes!' },
  80: { icon: CloudRain, description: 'Light showers', suggestion: 'Quick visits between showers!' },
  81: { icon: CloudRain, description: 'Showers', suggestion: 'Pop into shops along the way!' },
  82: { icon: CloudRain, description: 'Heavy showers', suggestion: 'Find shelter at a cozy cafe!' },
  85: { icon: CloudSnow, description: 'Snow showers', suggestion: 'Magical village views!' },
  86: { icon: CloudSnow, description: 'Heavy snow showers', suggestion: 'Warm drinks are calling!' },
  95: { icon: CloudLightning, description: 'Thunderstorm', suggestion: 'Stay safe indoors!' },
  96: { icon: CloudLightning, description: 'Thunderstorm with hail', suggestion: 'Seek shelter in a shop!' },
  99: { icon: CloudLightning, description: 'Severe thunderstorm', suggestion: 'Stay safe inside!' },
}

function WeatherWidget({ compact = false }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${KINDERHOOK_LAT}&longitude=${KINDERHOOK_LNG}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York`
        )

        if (!response.ok) throw new Error('Weather fetch failed')

        const data = await response.json()

        // Parse sunrise/sunset times
        const sunriseTime = data.daily?.sunrise?.[0] ? new Date(data.daily.sunrise[0]) : null
        const sunsetTime = data.daily?.sunset?.[0] ? new Date(data.daily.sunset[0]) : null

        setWeather({
          temp: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          code: data.current.weather_code,
          sunrise: sunriseTime,
          sunset: sunsetTime,
        })
        setLoading(false)
      } catch (err) {
        console.error('Weather error:', err)
        setError('Could not load weather')
        setLoading(false)
      }
    }

    fetchWeather()
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #4a90d9 0%, #67b8e3 100%)',
        borderRadius: '12px',
        padding: compact ? '0.75rem 1rem' : '1rem 1.25rem',
        color: 'white',
        opacity: 0.7,
      }}>
        Loading weather...
      </div>
    )
  }

  if (error || !weather) {
    return null // Silently fail - weather is nice-to-have
  }

  const weatherInfo = WEATHER_CODES[weather.code] || WEATHER_CODES[0]
  const WeatherIcon = weatherInfo.icon

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'linear-gradient(135deg, #4a90d9 0%, #67b8e3 100%)',
        borderRadius: '10px',
        padding: '0.5rem 1rem',
        color: 'white',
      }}>
        <WeatherIcon size={24} />
        <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>{weather.temp}°F</span>
        <span style={{ opacity: 0.9, fontSize: '0.85rem' }}>{weatherInfo.description}</span>
      </div>
    )
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #4a90d9 0%, #67b8e3 100%)',
      borderRadius: '16px',
      padding: '1.25rem',
      color: 'white',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem',
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '0.25rem' }}>
            Kinderhook, NY
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: 1 }}>
              {weather.temp}°
            </span>
            <span style={{ fontSize: '1rem' }}>F</span>
          </div>
        </div>
        <WeatherIcon size={56} strokeWidth={1.5} />
      </div>

      <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
        {weatherInfo.description}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
        fontSize: '0.8rem',
        opacity: 0.9,
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Droplets size={14} /> {weather.humidity}%
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Wind size={14} /> {weather.windSpeed} mph
        </div>
        {weather.sunrise && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Sunrise size={14} /> {weather.sunrise.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
        )}
        {weather.sunset && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Sunset size={14} /> {weather.sunset.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
        )}
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '8px',
        padding: '0.75rem',
        fontSize: '0.9rem',
        fontStyle: 'italic',
      }}>
        {weatherInfo.suggestion}
      </div>
    </div>
  )
}

export default WeatherWidget
