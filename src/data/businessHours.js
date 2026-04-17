/**
 * Business hours data for Kinderhook businesses
 * Sourced from Google Maps / business websites (April 2026)
 *
 * Hours format: { open: "HH:MM", close: "HH:MM" } in 24-hour format
 * null = closed that day
 * "appointment" = by appointment only
 */

export const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAY_LABELS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const BUSINESS_HOURS = {
  "AVIARY": {
    name: "The Aviary",
    category: "food",
    address: "8 Hudson Street",
    phone: "(518) 758-1727",
    hours: {
      sunday: { open: "16:00", close: "20:00" },
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: { open: "17:00", close: "21:00" },
      friday: { open: "17:00", close: "21:00" },
      saturday: { open: "17:00", close: "21:00" },
    }
  },
  "MORNINGBIRD": {
    name: "Morningbird Cafe",
    category: "food",
    address: "4 Hudson Street",
    hours: {
      sunday: { open: "08:00", close: "15:00" },
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: { open: "08:00", close: "15:00" },
      friday: { open: "08:00", close: "15:00" },
      saturday: { open: "08:00", close: "15:00" },
    }
  },
  "SAISONNIER": {
    name: "Saisonnier",
    category: "food",
    address: "11 Chatham Street",
    phone: "(518) 758-8489",
    hours: {
      sunday: { open: "11:30", close: "19:00" },
      monday: { open: "11:30", close: "21:00" },
      tuesday: null,
      wednesday: { open: "11:30", close: "21:00" },
      thursday: { open: "11:30", close: "21:00" },
      friday: { open: "11:30", close: "22:30" },
      saturday: { open: "11:30", close: "22:30" },
    }
  },
  "BROADST-BAGEL": {
    name: "Broad Street Bagel Co.",
    category: "food",
    address: "1 Broad Street",
    phone: "(518) 758-8084",
    hours: {
      sunday: { open: "07:00", close: "15:00" },
      monday: { open: "07:00", close: "15:00" },
      tuesday: { open: "07:00", close: "15:00" },
      wednesday: { open: "07:00", close: "15:00" },
      thursday: { open: "07:00", close: "15:00" },
      friday: { open: "07:00", close: "16:00" },
      saturday: { open: "07:00", close: "16:00" },
    }
  },
  "BROOKLYN-PIZZA": {
    name: "The Brooklyn Pizzeria",
    category: "food",
    address: "7 Hudson Street",
    phone: "(518) 758-1509",
    hours: {
      sunday: null,
      monday: { open: "11:00", close: "21:00" },
      tuesday: { open: "11:00", close: "21:00" },
      wednesday: { open: "11:00", close: "21:00" },
      thursday: { open: "11:00", close: "21:00" },
      friday: { open: "11:00", close: "21:00" },
      saturday: { open: "11:00", close: "21:00" },
    }
  },
  "ISOLA": {
    name: "Isola Wine Bar",
    category: "food",
    address: "16 Hudson Street",
    phone: "(518) 844-0426",
    hours: {
      sunday: null,
      monday: null,
      tuesday: null,
      wednesday: { open: "17:00", close: "21:00" },
      thursday: { open: "17:00", close: "21:00" },
      friday: { open: "17:00", close: "21:00" },
      saturday: { open: "17:00", close: "21:00" },
    }
  },
  "HAMRAHS": {
    name: "Hamrah's Lebanese Foods",
    category: "food",
    address: "3 Albany Avenue",
    phone: "(518) 610-8235",
    hours: {
      sunday: null,
      monday: null,
      tuesday: null,
      wednesday: { open: "12:00", close: "15:00" },
      thursday: { open: "12:00", close: "19:00" },
      friday: { open: "12:00", close: "19:00" },
      saturday: { open: "12:00", close: "19:00" },
    }
  },
  "OK-PANTRY": {
    name: "OK Pantry",
    category: "retail",
    address: "2 Hudson Street",
    phone: "(518) 610-8041",
    hours: {
      sunday: { open: "10:00", close: "16:00" },
      monday: { open: "09:00", close: "16:00" },
      tuesday: { open: "09:00", close: "16:00" },
      wednesday: { open: "09:00", close: "16:00" },
      thursday: { open: "09:00", close: "16:00" },
      friday: { open: "09:00", close: "18:00" },
      saturday: { open: "09:00", close: "18:00" },
    }
  },
  "BOTTLE-SHOP": {
    name: "Kinderhook Bottle Shop",
    category: "retail",
    address: "8 Hudson Street",
    hours: {
      sunday: { open: "12:00", close: "17:00" },
      monday: { open: "12:00", close: "19:00" },
      tuesday: { open: "12:00", close: "19:00" },
      wednesday: null,
      thursday: { open: "12:00", close: "19:00" },
      friday: { open: "11:00", close: "19:00" },
      saturday: { open: "11:00", close: "19:00" },
    }
  },
  "BOOKS": {
    name: "Kinderhook Books",
    category: "retail",
    address: "10 Broad Street",
    phone: "(518) 217-2192",
    hours: {
      sunday: { open: "11:00", close: "17:00" },
      monday: null,
      tuesday: null,
      wednesday: { open: "11:00", close: "18:00" },
      thursday: { open: "11:00", close: "18:00" },
      friday: { open: "11:00", close: "18:00" },
      saturday: { open: "11:00", close: "18:00" },
    }
  },
  "SAMASCOTTS": {
    name: "Samascott's Garden Market",
    category: "retail",
    address: "65 Chatham Street",
    hours: {
      sunday: { open: "09:00", close: "19:00" },
      monday: { open: "09:00", close: "19:00" },
      tuesday: { open: "09:00", close: "19:00" },
      wednesday: { open: "09:00", close: "19:00" },
      thursday: { open: "09:00", close: "19:00" },
      friday: { open: "09:00", close: "19:00" },
      saturday: { open: "09:00", close: "19:00" },
    }
  },
  "SCHOOL-GALLERY": {
    name: "The School | Jack Shainman Gallery",
    category: "arts",
    address: "25 Broad Street",
    phone: "(518) 758-1628",
    hours: {
      sunday: null,
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: { open: "11:00", close: "18:00" },
    },
    note: "Also open by appointment"
  },
  "SEPTEMBER": {
    name: "September Gallery",
    category: "arts",
    address: "4 Hudson Street #3",
    phone: "(518) 610-8709",
    hours: {
      sunday: { open: "11:00", close: "16:00" },
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: { open: "11:00", close: "17:00" },
      saturday: { open: "11:00", close: "17:00" },
    },
    note: "Also open by appointment"
  },
  "OLD-DUTCH": {
    name: "Old Dutch Inn",
    category: "services",
    address: "8 Broad Street",
    phone: "(518) 203-3347",
    hours: {
      sunday: { open: "00:00", close: "23:59" },
      monday: { open: "00:00", close: "23:59" },
      tuesday: { open: "00:00", close: "23:59" },
      wednesday: { open: "00:00", close: "23:59" },
      thursday: { open: "00:00", close: "23:59" },
      friday: { open: "00:00", close: "23:59" },
      saturday: { open: "00:00", close: "23:59" },
    },
    note: "Hotel - 24 hours"
  },
  "MUSE": {
    name: "Muse Aesthetics",
    category: "services",
    address: "12 Broad Street",
    phone: "(518) 821-8988",
    hours: {
      sunday: null,
      monday: { open: "09:00", close: "17:00" },
      tuesday: { open: "09:00", close: "17:00" },
      wednesday: { open: "09:00", close: "17:00" },
      thursday: { open: "09:00", close: "17:00" },
      friday: { open: "09:00", close: "17:00" },
      saturday: null,
    },
    note: "By appointment"
  },
  "PILATES": {
    name: "Julia Jayne Pilates",
    category: "services",
    address: "83 Broad Street",
    phone: "(908) 591-5384",
    hours: {
      sunday: null,
      monday: { open: "07:00", close: "19:00" },
      tuesday: { open: "07:00", close: "19:00" },
      wednesday: { open: "07:00", close: "19:00" },
      thursday: { open: "07:00", close: "19:00" },
      friday: { open: "07:00", close: "19:00" },
      saturday: { open: "08:00", close: "14:00" },
    },
    note: "By appointment"
  },
  "HISTORICAL": {
    name: "Columbia County Historical Society",
    category: "arts",
    address: "5 Albany Avenue",
    phone: "(518) 758-9265",
    hours: {
      sunday: null,
      monday: null,
      tuesday: null,
      wednesday: { open: "10:00", close: "14:00" },
      thursday: { open: "10:00", close: "14:00" },
      friday: { open: "10:00", close: "14:00" },
      saturday: null,
    }
  },
}

/**
 * Convert time string "HH:MM" to minutes since midnight
 */
export function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Convert minutes since midnight to "HH:MM" format
 */
export function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Format time for display (e.g., "9:00 AM")
 */
export function formatTime(time) {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Get businesses open at a specific time on a specific day
 */
export function getBusinessesOpenAt(day, timeMinutes) {
  return Object.entries(BUSINESS_HOURS)
    .filter(([_, biz]) => {
      const hours = biz.hours[day]
      if (!hours) return false
      const open = timeToMinutes(hours.open)
      const close = timeToMinutes(hours.close)
      return timeMinutes >= open && timeMinutes < close
    })
    .map(([code, biz]) => ({ code, ...biz }))
}

/**
 * Find the best time slots when the most businesses are open
 */
export function findBestTimeSlots(day) {
  const slots = []

  // Check every 30-minute slot from 7am to 10pm
  for (let minutes = 7 * 60; minutes <= 22 * 60; minutes += 30) {
    const openBusinesses = getBusinessesOpenAt(day, minutes)
    if (openBusinesses.length > 0) {
      slots.push({
        time: minutesToTime(minutes),
        timeFormatted: formatTime(minutesToTime(minutes)),
        count: openBusinesses.length,
        businesses: openBusinesses,
      })
    }
  }

  // Find the max count and return top slots
  const maxCount = Math.max(...slots.map(s => s.count))
  return {
    bestSlots: slots.filter(s => s.count === maxCount),
    allSlots: slots,
    maxCount,
  }
}

/**
 * Get all businesses with their hours for a specific day
 */
export function getBusinessesForDay(day) {
  return Object.entries(BUSINESS_HOURS)
    .map(([code, biz]) => ({
      code,
      ...biz,
      isOpen: biz.hours[day] !== null,
      todayHours: biz.hours[day],
    }))
    .sort((a, b) => {
      // Sort by: open businesses first, then by opening time
      if (a.isOpen && !b.isOpen) return -1
      if (!a.isOpen && b.isOpen) return 1
      if (a.isOpen && b.isOpen) {
        return timeToMinutes(a.todayHours.open) - timeToMinutes(b.todayHours.open)
      }
      return a.name.localeCompare(b.name)
    })
}

export const CATEGORY_COLORS = {
  food: { bg: '#fee2e2', bar: '#ef4444', text: '#991b1b' },
  retail: { bg: '#dbeafe', bar: '#3b82f6', text: '#1e40af' },
  services: { bg: '#f3e8ff', bar: '#a855f7', text: '#6b21a8' },
  arts: { bg: '#fef3c7', bar: '#f59e0b', text: '#92400e' },
}

export const CATEGORY_LABELS = {
  food: 'Food & Drink',
  retail: 'Retail',
  services: 'Services',
  arts: 'Arts & Culture',
}
