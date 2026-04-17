import { motion } from 'framer-motion'
import {
  BUSINESS_HOURS,
  DAYS,
  DAY_LABELS,
  timeToMinutes,
  formatTime,
  getBusinessesForDay,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from '../data/businessHours'

const START_HOUR = 7  // 7 AM
const END_HOUR = 23   // 11 PM
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60

function TimeAxis() {
  const hours = []
  for (let h = START_HOUR; h <= END_HOUR; h += 2) {
    hours.push(h)
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0 0 0.5rem 140px',
      borderBottom: '1px solid var(--kb-gray-200)',
      marginBottom: '0.5rem',
    }}>
      {hours.map(h => (
        <div key={h} style={{
          fontSize: '0.75rem',
          color: 'var(--kb-gray-500)',
          width: '40px',
          textAlign: 'center',
        }}>
          {h > 12 ? `${h - 12}pm` : h === 12 ? '12pm' : `${h}am`}
        </div>
      ))}
    </div>
  )
}

function BusinessBar({ business, index }) {
  const { todayHours, name, category, isOpen, note } = business
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.food

  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '32px',
          marginBottom: '4px',
        }}
      >
        <div style={{
          width: '140px',
          paddingRight: '12px',
          fontSize: '0.8rem',
          color: 'var(--kb-gray-400)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'right',
        }}>
          {name}
        </div>
        <div style={{
          flex: 1,
          height: '24px',
          background: 'var(--kb-gray-50)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--kb-gray-400)' }}>Closed</span>
        </div>
      </motion.div>
    )
  }

  const openMinutes = timeToMinutes(todayHours.open) - START_HOUR * 60
  const closeMinutes = timeToMinutes(todayHours.close) - START_HOUR * 60
  const leftPercent = (openMinutes / TOTAL_MINUTES) * 100
  const widthPercent = ((closeMinutes - openMinutes) / TOTAL_MINUTES) * 100

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '32px',
        marginBottom: '4px',
      }}
    >
      <div style={{
        width: '140px',
        paddingRight: '12px',
        fontSize: '0.8rem',
        color: 'var(--kb-gray-700)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textAlign: 'right',
        fontWeight: '500',
      }} title={name}>
        {name}
      </div>
      <div style={{
        flex: 1,
        height: '24px',
        background: 'var(--kb-gray-100)',
        borderRadius: '4px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: index * 0.03 + 0.1, duration: 0.4 }}
          style={{
            position: 'absolute',
            left: `${leftPercent}%`,
            width: `${widthPercent}%`,
            height: '100%',
            background: colors.bar,
            borderRadius: '4px',
            transformOrigin: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
          title={`${formatTime(todayHours.open)} - ${formatTime(todayHours.close)}${note ? ` (${note})` : ''}`}
        >
          {widthPercent > 15 && (
            <span style={{
              fontSize: '0.65rem',
              color: 'white',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            }}>
              {formatTime(todayHours.open)} - {formatTime(todayHours.close)}
            </span>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

function CurrentTimeLine({ day }) {
  const now = new Date()
  const currentDay = DAYS[now.getDay()]

  if (day !== currentDay) return null

  const currentMinutes = now.getHours() * 60 + now.getMinutes() - START_HOUR * 60
  if (currentMinutes < 0 || currentMinutes > TOTAL_MINUTES) return null

  const leftPercent = (currentMinutes / TOTAL_MINUTES) * 100

  return (
    <div style={{
      position: 'absolute',
      left: `calc(140px + ${leftPercent}%)`,
      top: 0,
      bottom: 0,
      width: '2px',
      background: 'var(--kb-green)',
      zIndex: 10,
    }}>
      <div style={{
        position: 'absolute',
        top: '-8px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--kb-green)',
        color: 'white',
        fontSize: '0.65rem',
        padding: '2px 6px',
        borderRadius: '4px',
        fontWeight: '600',
      }}>
        NOW
      </div>
    </div>
  )
}

function CategoryLegend() {
  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      marginBottom: '1rem',
    }}>
      {Object.entries(CATEGORY_COLORS).map(([cat, colors]) => (
        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            background: colors.bar,
          }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--kb-gray-600)' }}>
            {CATEGORY_LABELS[cat]}
          </span>
        </div>
      ))}
    </div>
  )
}

function HoursGantt({ day, showLegend = true, compact = false }) {
  const businesses = getBusinessesForDay(day)
  const openCount = businesses.filter(b => b.isOpen).length

  return (
    <div>
      {showLegend && <CategoryLegend />}

      <div style={{
        background: 'var(--kb-white)',
        borderRadius: '12px',
        padding: compact ? '1rem' : '1.5rem',
        border: '1px solid var(--kb-gray-200)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <TimeAxis />
        <CurrentTimeLine day={day} />

        <div style={{ position: 'relative' }}>
          {businesses.map((biz, i) => (
            <BusinessBar key={biz.code} business={biz} index={i} />
          ))}
        </div>

        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--kb-gray-200)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
            <strong style={{ color: 'var(--kb-green)' }}>{openCount}</strong> of {businesses.length} businesses open
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--kb-gray-400)' }}>
            Hours may vary - call ahead to confirm
          </span>
        </div>
      </div>
    </div>
  )
}

export default HoursGantt
