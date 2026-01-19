/**
 * Generate a Kinderbuck serial number
 * Format: KB-XXXX (e.g., KB-0001, KB-0042, KB-2000)
 */
export function generateSerial(number) {
  return `KB-${String(number).padStart(4, '0')}`
}

/**
 * Generate a range of serial numbers
 */
export function generateSerialRange(start, end) {
  const serials = []
  for (let i = start; i <= end; i++) {
    serials.push(generateSerial(i))
  }
  return serials
}

/**
 * Parse a serial number to get the numeric value
 */
export function parseSerial(serial) {
  const match = serial.match(/^KB-(\d{4})$/)
  if (match) {
    return parseInt(match[1], 10)
  }
  return null
}

/**
 * Validate a serial number format
 */
export function isValidSerial(serial) {
  return /^KB-\d{4}$/.test(serial)
}
