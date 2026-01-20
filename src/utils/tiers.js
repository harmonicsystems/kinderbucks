/**
 * @fileoverview Kinderbucks Membership Tier System
 *
 * This module defines the loyalty tier system for Kinderbucks members.
 * Members earn tier upgrades by visiting unique businesses in Kinderhook.
 * Higher tiers provide greater bonus rates when exchanging USD for Kinderbucks.
 *
 * ## Tier Progression
 *
 * | Tier           | Unique Visits | Bonus Rate | Description                    |
 * |----------------|---------------|------------|--------------------------------|
 * | (No tier)      | 0             | 10%*       | New members (default bonus)    |
 * | Curious        | 1+            | 10%        | Just getting started           |
 * | Hooked         | 5+            | 15%        | Regular visitor                |
 * | Line & Sinker  | 10+           | 20%        | Dedicated community member     |
 * | Village Patron | 15+           | 25%        | Maximum tier, community leader |
 *
 * *New members without a tier receive 10% bonus as a welcome incentive
 *
 * ## Usage Example
 *
 * ```javascript
 * import { TIERS, calculateTier, getProgressToNextTier } from './tiers';
 *
 * // Get a member's current tier based on their visits
 * const tierKey = calculateTier(7); // Returns 'hooked'
 * const tier = TIERS[tierKey];
 * console.log(`Welcome, ${tier.name}! You get ${tier.bonus * 100}% bonus.`);
 *
 * // Show progress to next tier
 * const progress = getProgressToNextTier(7);
 * console.log(`Visit ${progress.remaining} more businesses to reach ${progress.nextTier.name}!`);
 * ```
 *
 * @module utils/tiers
 * @see {@link https://kinderbucks.com} Kinderbucks main application
 */

/**
 * @typedef {Object} TierDefinition
 * @property {string} name - Display name for the tier (e.g., "Hooked", "Village Patron")
 * @property {number} threshold - Minimum unique business visits required to achieve this tier
 * @property {number} bonus - Bonus rate as a decimal (0.10 = 10%, 0.25 = 25%)
 * @property {string} color - Primary color for tier badge/styling (hex format)
 * @property {string} bgColor - Background color for tier badge/styling (hex format)
 * @property {string} emoji - Emoji representing the tier
 */

/**
 * @typedef {'curious' | 'hooked' | 'lineAndSinker' | 'patron'} TierKey
 * String key used to reference tiers in the TIERS object
 */

/**
 * @typedef {Object} TierProgressInfo
 * @property {number} progress - Percentage progress toward next tier (0-100)
 * @property {number} remaining - Number of additional unique businesses needed to reach next tier
 * @property {TierDefinition|null} nextTier - The next tier definition, or null if at max tier
 */

/**
 * Configuration object defining all membership tiers.
 *
 * Each tier has a fishing-themed name reflecting Kinderhook's identity,
 * with progressive bonus rates to incentivize community engagement.
 *
 * @type {Object.<TierKey, TierDefinition>}
 *
 * @example
 * // Access tier information
 * const hookedTier = TIERS.hooked;
 * console.log(hookedTier.name);      // "Hooked"
 * console.log(hookedTier.threshold); // 5
 * console.log(hookedTier.bonus);     // 0.15 (15%)
 *
 * @example
 * // Calculate bonus amount for an exchange
 * const tierKey = 'hooked';
 * const usdAmount = 20;
 * const bonus = usdAmount * TIERS[tierKey].bonus;
 * const total = usdAmount + bonus;
 * console.log(`$${usdAmount} + $${bonus} bonus = $${total} Kinderbucks`);
 * // Output: "$20 + $3 bonus = $23 Kinderbucks"
 */
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

/**
 * Determines a member's tier based on their unique business visit count.
 *
 * The tier is calculated by comparing the visit count against tier thresholds
 * in descending order (patron -> lineAndSinker -> hooked -> curious).
 * This ensures the highest qualifying tier is always returned.
 *
 * @param {number} uniqueBusinessCount - The number of unique businesses the member has visited.
 *   Must be a non-negative integer. Typically sourced from `member.businessesVisited.length`.
 *
 * @returns {TierKey|null} The tier key string ('curious', 'hooked', 'lineAndSinker', 'patron'),
 *   or null if the member has not visited any businesses yet.
 *
 * @example
 * // New member with no visits
 * calculateTier(0);  // Returns null
 *
 * @example
 * // Member just starting out
 * calculateTier(1);  // Returns 'curious'
 * calculateTier(4);  // Returns 'curious'
 *
 * @example
 * // Regular visitor
 * calculateTier(5);  // Returns 'hooked'
 * calculateTier(9);  // Returns 'hooked'
 *
 * @example
 * // Dedicated member
 * calculateTier(10); // Returns 'lineAndSinker'
 * calculateTier(14); // Returns 'lineAndSinker'
 *
 * @example
 * // Maximum tier achieved
 * calculateTier(15); // Returns 'patron'
 * calculateTier(50); // Returns 'patron' (no tier above patron)
 *
 * @example
 * // Common usage pattern
 * const tierKey = calculateTier(member.businessesVisited?.length || 0);
 * if (tierKey) {
 *   const tier = TIERS[tierKey];
 *   console.log(`Current tier: ${tier.name}, Bonus: ${tier.bonus * 100}%`);
 * }
 */
export function calculateTier(uniqueBusinessCount) {
  if (uniqueBusinessCount >= 15) return 'patron'
  if (uniqueBusinessCount >= 10) return 'lineAndSinker'
  if (uniqueBusinessCount >= 5) return 'hooked'
  if (uniqueBusinessCount >= 1) return 'curious'
  return null
}

/**
 * Gets the next tier in the progression sequence.
 *
 * Tier progression order: curious -> hooked -> lineAndSinker -> patron
 *
 * This function is useful for showing members what tier they're working toward
 * and what benefits await them at the next level.
 *
 * @param {TierKey|null} currentTier - The member's current tier key, or null if no tier.
 *   Expected values: 'curious', 'hooked', 'lineAndSinker', 'patron', or null.
 *
 * @returns {TierKey|null} The next tier key in the progression, or null if:
 *   - The member is already at the maximum tier ('patron')
 *   - The currentTier is not recognized (not in the progression order)
 *
 * @example
 * // Progress from each tier
 * getNextTier(null);            // Returns 'curious' (though typically null is handled separately)
 * getNextTier('curious');       // Returns 'hooked'
 * getNextTier('hooked');        // Returns 'lineAndSinker'
 * getNextTier('lineAndSinker'); // Returns 'patron'
 * getNextTier('patron');        // Returns null (already at max)
 *
 * @example
 * // Show upcoming tier benefits
 * const nextTierKey = getNextTier(currentTierKey);
 * if (nextTierKey) {
 *   const nextTier = TIERS[nextTierKey];
 *   console.log(`Reach ${nextTier.name} for ${nextTier.bonus * 100}% bonus!`);
 * } else {
 *   console.log("You've reached the highest tier!");
 * }
 */
export function getNextTier(currentTier) {
  const order = ['curious', 'hooked', 'lineAndSinker', 'patron']
  const currentIndex = order.indexOf(currentTier)
  if (currentIndex < order.length - 1) {
    return order[currentIndex + 1]
  }
  return null // Already at max tier
}

/**
 * Calculates the member's progress toward the next tier.
 *
 * Returns detailed progress information including:
 * - Percentage completion toward the next tier
 * - Number of businesses remaining to visit
 * - Full tier definition for the next tier
 *
 * Progress is calculated as a percentage between the current tier's threshold
 * and the next tier's threshold. For example, if a member has visited 7 businesses
 * (currently "Hooked" at threshold 5, next is "Line & Sinker" at threshold 10):
 * - Progress = (7 - 5) / (10 - 5) * 100 = 40%
 * - Remaining = 10 - 7 = 3 businesses
 *
 * @param {number} uniqueBusinessCount - The number of unique businesses the member has visited.
 *   Must be a non-negative integer.
 *
 * @returns {TierProgressInfo} An object containing:
 *   - `progress` {number}: Percentage (0-100) toward next tier. Clamped to valid range.
 *   - `remaining` {number}: Businesses left to visit. 0 if at max tier.
 *   - `nextTier` {TierDefinition|null}: The next tier object, or null if at max tier.
 *
 * @example
 * // Member with 0 visits (no tier yet, working toward "Curious")
 * getProgressToNextTier(0);
 * // Returns: { progress: 0, remaining: 1, nextTier: { name: "Curious", ... } }
 *
 * @example
 * // Member with 7 visits ("Hooked", working toward "Line & Sinker")
 * getProgressToNextTier(7);
 * // Returns: { progress: 40, remaining: 3, nextTier: { name: "Line & Sinker", ... } }
 *
 * @example
 * // Member at maximum tier (15+ visits)
 * getProgressToNextTier(20);
 * // Returns: { progress: 100, remaining: 0, nextTier: null }
 *
 * @example
 * // Display progress bar in UI
 * const { progress, remaining, nextTier } = getProgressToNextTier(visitCount);
 * if (nextTier) {
 *   return (
 *     <div>
 *       <ProgressBar value={progress} />
 *       <span>Visit {remaining} more businesses to reach {nextTier.name}!</span>
 *     </div>
 *   );
 * } else {
 *   return <span>Congratulations! You've reached the highest tier!</span>;
 * }
 */
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
