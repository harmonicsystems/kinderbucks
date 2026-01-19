import { QRCodeSVG } from 'qrcode.react'

const denominationStyles = {
  1: {
    color: '#2d5a27',
    gradient: ['#3d7a37', '#2d5a27'],
    label: 'ONE',
    accent: '#90c695'
  },
  5: {
    color: '#1e3a5f',
    gradient: ['#2e5a8f', '#1e3a5f'],
    label: 'FIVE',
    accent: '#7ba3cc'
  },
  10: {
    color: '#5c2d5c',
    gradient: ['#7c4d7c', '#5c2d5c'],
    label: 'TEN',
    accent: '#b89db8'
  },
  20: {
    color: '#8b6914',
    gradient: ['#c9a227', '#8b6914'],
    label: 'TWENTY',
    accent: '#e8d48a'
  }
}

function QRCode({ value, size = 128, denomination = 5, showFrame = true }) {
  const style = denominationStyles[denomination] || denominationStyles[5]
  const frameSize = size + 48
  const cornerRadius = 16

  if (!showFrame) {
    return (
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        fgColor={style.color}
        style={{ display: 'block' }}
      />
    )
  }

  return (
    <div style={{
      width: frameSize,
      background: `linear-gradient(135deg, ${style.gradient[0]} 0%, ${style.gradient[1]} 100%)`,
      borderRadius: cornerRadius,
      padding: '3px',
      display: 'inline-block',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    }}>
      {/* Inner frame */}
      <div style={{
        background: `linear-gradient(135deg, #fefefe 0%, #f5f5f0 100%)`,
        borderRadius: cornerRadius - 2,
        padding: '8px',
        position: 'relative',
      }}>
        {/* Top denomination label */}
        <div style={{
          textAlign: 'center',
          marginBottom: '6px',
          fontFamily: '"Georgia", serif',
          fontSize: '10px',
          fontWeight: 'bold',
          color: style.color,
          letterSpacing: '3px',
          textTransform: 'uppercase',
        }}>
          KINDERBUCKS
        </div>

        {/* QR Code with decorative border */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '8px',
          border: `2px solid ${style.accent}`,
          position: 'relative',
        }}>
          {/* Corner decorations */}
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            width: '12px',
            height: '12px',
            borderTop: `2px solid ${style.color}`,
            borderLeft: `2px solid ${style.color}`,
            borderRadius: '2px 0 0 0',
          }} />
          <div style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '12px',
            height: '12px',
            borderTop: `2px solid ${style.color}`,
            borderRight: `2px solid ${style.color}`,
            borderRadius: '0 2px 0 0',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '4px',
            left: '4px',
            width: '12px',
            height: '12px',
            borderBottom: `2px solid ${style.color}`,
            borderLeft: `2px solid ${style.color}`,
            borderRadius: '0 0 0 2px',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            width: '12px',
            height: '12px',
            borderBottom: `2px solid ${style.color}`,
            borderRight: `2px solid ${style.color}`,
            borderRadius: '0 0 2px 0',
          }} />

          <QRCodeSVG
            value={value}
            size={size}
            level="H"
            fgColor={style.color}
            style={{ display: 'block' }}
            imageSettings={{
              src: `data:image/svg+xml,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${style.color}">
                  <circle cx="12" cy="12" r="11" fill="white" stroke="${style.color}" stroke-width="1.5"/>
                  <text x="12" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="${style.color}" font-family="Georgia">K</text>
                </svg>
              `)}`,
              height: size * 0.2,
              width: size * 0.2,
              excavate: true,
            }}
          />
        </div>

        {/* Bottom denomination */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '6px',
          padding: '0 4px',
        }}>
          <span style={{
            fontFamily: '"Georgia", serif',
            fontSize: '14px',
            fontWeight: 'bold',
            color: style.color,
          }}>
            ${denomination}
          </span>
          <span style={{
            fontFamily: '"Georgia", serif',
            fontSize: '9px',
            color: style.color,
            letterSpacing: '1px',
            opacity: 0.8,
          }}>
            {style.label}
          </span>
          <span style={{
            fontFamily: '"Georgia", serif',
            fontSize: '14px',
            fontWeight: 'bold',
            color: style.color,
          }}>
            ${denomination}
          </span>
        </div>
      </div>
    </div>
  )
}

export default QRCode
