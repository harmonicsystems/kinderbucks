import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import HoursGantt from '../components/HoursGantt'
import {
  DAYS,
  DAY_LABELS,
  DAY_LABELS_FULL,
  findBestTimeSlots,
  getBusinessesForDay,
  formatTime,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from '../data/businessHours'

function DaySelector({ selectedDay, onSelectDay }) {
  const today = DAYS[new Date().getDay()]

  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}>
      {DAYS.map((day, i) => {
        const isSelected = day === selectedDay
        const isToday = day === today

        return (
          <motion.button
            key={day}
            onClick={() => onSelectDay(day)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '0.75rem 1.25rem',
              border: isSelected ? 'none' : '2px solid var(--kb-gray-200)',
              borderRadius: '8px',
              background: isSelected
                ? 'linear-gradient(135deg, var(--kb-navy) 0%, var(--kb-navy-light) 100%)'
                : 'var(--kb-white)',
              color: isSelected ? 'var(--kb-white)' : 'var(--kb-gray-700)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              position: 'relative',
            }}
          >
            {DAY_LABELS[i]}
            {isToday && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '8px',
                height: '8px',
                background: 'var(--kb-green)',
                borderRadius: '50%',
              }} />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

function BestTimesCard({ day }) {
  const { bestSlots, maxCount } = findBestTimeSlots(day)

  if (bestSlots.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <span style={{ fontSize: '2rem' }}>😴</span>
        <p style={{ color: 'var(--kb-gray-500)', marginTop: '0.5rem' }}>
          Most businesses are closed on {DAY_LABELS_FULL[DAYS.indexOf(day)]}
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{
        background: 'linear-gradient(135deg, var(--kb-green) 0%, var(--kb-green-light) 100%)',
        color: 'var(--kb-white)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🎯</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Best Time to Visit</h3>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem' }}>
            {maxCount} businesses open at once
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        {bestSlots.slice(0, 6).map((slot, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
            }}
          >
            {slot.timeFormatted}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.9 }}>
        <strong>Open at these times:</strong>{' '}
        {bestSlots[0]?.businesses.slice(0, 5).map(b => b.name).join(', ')}
        {bestSlots[0]?.businesses.length > 5 && ` +${bestSlots[0].businesses.length - 5} more`}
      </div>
    </motion.div>
  )
}

function QuickStats({ day }) {
  const businesses = getBusinessesForDay(day)
  const openCount = businesses.filter(b => b.isOpen).length
  const { maxCount } = findBestTimeSlots(day)

  const byCategory = {}
  businesses.forEach(b => {
    if (b.isOpen) {
      byCategory[b.category] = (byCategory[b.category] || 0) + 1
    }
  })

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem',
    }}>
      <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--kb-green)' }}>
          {openCount}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
          Businesses Open
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--kb-navy)' }}>
          {maxCount}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
          Max at Same Time
        </div>
      </div>
      {Object.entries(byCategory).map(([cat, count]) => (
        <div key={cat} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: CATEGORY_COLORS[cat]?.bar || 'var(--kb-gray-700)',
          }}>
            {count}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--kb-gray-500)' }}>
            {CATEGORY_LABELS[cat]}
          </div>
        </div>
      ))}
    </div>
  )
}

function BusinessList({ day }) {
  const businesses = getBusinessesForDay(day)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1rem',
    }}>
      {businesses.filter(b => b.isOpen).map((biz, i) => {
        const colors = CATEGORY_COLORS[biz.category]
        return (
          <motion.div
            key={biz.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card"
            style={{ padding: '1rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: 0, color: 'var(--kb-navy)' }}>{biz.name}</h4>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  background: colors.bg,
                  color: colors.text,
                  borderRadius: '4px',
                  marginTop: '0.25rem',
                }}>
                  {CATEGORY_LABELS[biz.category]}
                </span>
              </div>
              <div style={{
                background: 'var(--kb-green)',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
              }}>
                Open
              </div>
            </div>
            <div style={{
              marginTop: '0.75rem',
              fontSize: '0.9rem',
              color: 'var(--kb-gray-600)',
            }}>
              {formatTime(biz.todayHours.open)} - {formatTime(biz.todayHours.close)}
            </div>
            {biz.address && (
              <div style={{ fontSize: '0.8rem', color: 'var(--kb-gray-400)', marginTop: '0.25rem' }}>
                {biz.address}
              </div>
            )}
            {biz.note && (
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--kb-gray-500)',
                fontStyle: 'italic',
                marginTop: '0.25rem',
              }}>
                {biz.note}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

function Schedule() {
  const today = DAYS[new Date().getDay()]
  const [selectedDay, setSelectedDay] = useState(today)
  const [view, setView] = useState('gantt')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--kb-navy) 0%, var(--kb-navy-light) 100%)',
        color: 'var(--kb-white)',
        padding: '3rem 1rem',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '700px', margin: '0 auto' }}
        >
          <div className="badge badge-gold" style={{ marginBottom: '1rem' }}>
            Plan Your Visit
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            marginBottom: '1rem',
          }}>
            Business Hours at a Glance
          </h1>
          <p style={{ color: 'var(--kb-gray-300)', fontSize: '1.1rem' }}>
            See when Kinderhook businesses are open and find the best times to visit multiple shops
          </p>
        </motion.div>
      </section>

      {/* Day Selector */}
      <section style={{
        background: 'var(--kb-white)',
        padding: '1.5rem 1rem',
        borderBottom: '1px solid var(--kb-gray-200)',
        position: 'sticky',
        top: '70px',
        zIndex: 50,
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <DaySelector selectedDay={selectedDay} onSelectDay={setSelectedDay} />
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '2rem 1rem', background: 'var(--kb-cream)', flex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Quick Stats */}
          <QuickStats day={selectedDay} />

          {/* Best Times Card */}
          <div style={{ marginBottom: '2rem' }}>
            <BestTimesCard day={selectedDay} />
          </div>

          {/* View Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}>
            <h2 style={{ color: 'var(--kb-navy)', margin: 0 }}>
              {DAY_LABELS_FULL[DAYS.indexOf(selectedDay)]} Hours
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setView('gantt')}
                className={`btn ${view === 'gantt' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Timeline View
              </button>
              <button
                onClick={() => setView('list')}
                className={`btn ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                List View
              </button>
            </div>
          </div>

          {/* Gantt Chart or List */}
          {view === 'gantt' ? (
            <HoursGantt day={selectedDay} />
          ) : (
            <BusinessList day={selectedDay} />
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'var(--kb-white)',
        padding: '2rem 1rem',
        textAlign: 'center',
        borderTop: '1px solid var(--kb-gray-200)',
      }}>
        <p style={{ color: 'var(--kb-gray-600)', marginBottom: '1rem' }}>
          Ready to explore Kinderhook?
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/exchange" className="btn btn-gold">
            Get Kinderbucks
          </Link>
          <Link to="/businesses" className="btn btn-secondary">
            View All Businesses
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Schedule
