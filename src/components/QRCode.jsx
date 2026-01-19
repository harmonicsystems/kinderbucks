import { QRCodeSVG } from 'qrcode.react'

const denominationColors = {
  1: '#2d5a27',   // Green for $1
  5: '#1e3a5f',   // Blue for $5
  10: '#5c2d5c',  // Purple for $10
  20: '#c9a227',  // Gold for $20
}

function QRCode({ value, size = 128, denomination = 5 }) {
  const color = denominationColors[denomination] || denominationColors[5]

  return (
    <div style={{
      background: 'white',
      padding: '8px',
      borderRadius: '12px',
      display: 'inline-block',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        fgColor={color}
        style={{ display: 'block' }}
      />
    </div>
  )
}

export default QRCode
