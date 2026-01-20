export const TIERS = {
  curious: {
    name: "Curious",
    threshold: 1,
    bonus: 0.10,
    color: "#888888",
    bgColor: "#f0f0f0",
    emoji: "🎣"
  },
  hooked: {
    name: "Hooked",
    threshold: 5,
    bonus: 0.15,
    color: "#2e7d32",
    bgColor: "#e8f5e9",
    emoji: "🎣"
  },
  lineAndSinker: {
    name: "Line & Sinker",
    threshold: 10,
    bonus: 0.20,
    color: "#1565c0",
    bgColor: "#e3f2fd",
    emoji: "🎣"
  },
  patron: {
    name: "Village Patron",
    threshold: 15,
    bonus: 0.25,
    color: "#c9a227",
    bgColor: "#fff8e1",
    emoji: "👑"
  }
}

export function calculateTier(uniqueBusinessCount) {
  if (uniqueBusinessCount >= 15) return 'patron'
  if (uniqueBusinessCount >= 10) return 'lineAndSinker'
  if (uniqueBusinessCount >= 5) return 'hooked'
  if (uniqueBusinessCount >= 1) return 'curious'
  return null
}

export function getNextTier(currentTier) {
  const order = ['curious', 'hooked', 'lineAndSinker', 'patron']
  const currentIndex = order.indexOf(currentTier)
  if (currentIndex < order.length - 1) {
    return order[currentIndex + 1]
  }
  return null // Already at max tier
}

export function getProgressToNextTier(uniqueBusinessCount) {
  const currentTier = calculateTier(uniqueBusinessCount)
  const nextTierKey = getNextTier(currentTier)

  if (!nextTierKey) {
    return { progress: 100, remaining: 0, nextTier: null }
  }

  const nextTier = TIERS[nextTierKey]
  const currentThreshold = currentTier ? TIERS[currentTier].threshold : 0
  const progress = ((uniqueBusinessCount - currentThreshold) / (nextTier.threshold - currentThreshold)) * 100

  return {
    progress: Math.min(100, Math.max(0, progress)),
    remaining: nextTier.threshold - uniqueBusinessCount,
    nextTier: nextTier
  }
}
