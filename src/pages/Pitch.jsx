import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  BookOpen,
  Users,
  Presentation,
  FileText,
  Gamepad2,
  Network,
  ExternalLink,
  X,
  ChevronDown,
  Printer,
  TrendingUp,
  DollarSign,
  HelpCircle,
  Sparkles,
  Rocket,
  Map,
  Heart
} from 'lucide-react'

const PITCH_DOCS = [
  {
    id: 'villageos-saas',
    title: 'VillageOS SaaS',
    subtitle: 'The Scale Pitch',
    icon: Rocket,
    color: '#4ade80',
    audience: 'Investors / Partners',
    description: 'OK Kinderhook as proof of concept for a scalable SaaS product. Tourism infrastructure for small towns everywhere.',
    file: 'VILLAGEOS-SAAS.html',
    recommended: ['investors'],
  },
  {
    id: 'daytrip',
    title: 'Day Trip Layer',
    subtitle: 'Regional Tourism',
    icon: Map,
    color: '#84cc16',
    audience: 'Tourism Boards / County',
    description: 'Every village gets a mascot universe. Digital collectibles across Columbia County. Catskill cats, Kinderhook foxes, Hudson whales.',
    file: 'OK-KINDERHOOK-DAYTRIP.html',
    recommended: ['tourism', 'county'],
  },
  {
    id: 'village-os',
    title: 'Village OS',
    subtitle: 'Full Vision Pitch',
    icon: Gamepad2,
    color: '#2B5F2F',
    audience: 'Business Association / Board',
    description: 'Stardew Valley framing, 4 skill tracks, community bundles. The complete vision.',
    file: 'OK-KINDERHOOK-VILLAGE-OS.html',
    recommended: ['business-association', 'village-board'],
  },
  {
    id: 'economics',
    title: 'Economics of Loyalty',
    subtitle: 'The Math That Sells',
    icon: TrendingUp,
    color: '#059669',
    audience: 'Skeptical Business Owners',
    description: 'Hard numbers: why habitual 10% discount customers beat occasional full-price. The leakage problem.',
    file: 'OK-KINDERHOOK-ECONOMICS.html',
    recommended: ['individual-business', 'business-association'],
  },
  {
    id: 'faq',
    title: 'Hard Questions',
    subtitle: 'Objection Handling',
    icon: HelpCircle,
    color: '#dc3545',
    audience: 'Skeptics / Deep Divers',
    description: 'The anti-pitch. Every objection answered honestly: surveillance, trust, AI, "it never works."',
    file: 'OK-KINDERHOOK-FAQ.html',
    recommended: ['skeptics', 'individual-business'],
  },
  {
    id: '8dollar',
    title: 'The $8 Bill',
    subtitle: 'Meme Marketing',
    icon: DollarSign,
    color: '#85bb65',
    audience: 'Marketing / Tourism',
    description: 'Van Buren on an $8 bill. Absurd enough to screenshot, real enough to visit. Viral marketing angle.',
    file: 'OK-KINDERHOOK-8DOLLAR.html',
    recommended: ['marketing', 'tourism'],
  },
  {
    id: 'cooperative',
    title: 'Digital Cooperative',
    subtitle: 'Tech-Forward Angle',
    icon: Network,
    color: '#3b82f6',
    audience: 'Village Board / Tech-Savvy',
    description: 'Radical transparency, QR portals, cooperative economics. For forward-thinking audiences.',
    file: 'OK-KINDERHOOK-COOPERATIVE.html',
    recommended: ['library', 'village-board'],
  },
  {
    id: 'printable',
    title: 'Simple Explainer',
    subtitle: 'Print-Friendly',
    icon: FileText,
    color: '#f59e0b',
    audience: 'General / Seniors',
    description: 'Clear 4-step explanation with AAA card analogy. Works great printed out.',
    file: 'OK-KINDERHOOK-PRINTABLE.html',
    recommended: ['businesses', 'residents'],
  },
  {
    id: 'slide',
    title: 'Habit Ladder',
    subtitle: 'Quick Presentation',
    icon: Presentation,
    color: '#8b5cf6',
    audience: 'Quick Pitch',
    description: 'Shows how each layer builds on the previous. Great for walking through live.',
    file: 'OK-KINDERHOOK-SLIDE.html',
    recommended: ['quick-pitch'],
  },
  {
    id: 'slide-simple',
    title: 'Gentle Ladder',
    subtitle: 'Friendlier Language',
    icon: Users,
    color: '#ec4899',
    audience: 'Boomers / Skeptics',
    description: 'Same ladder concept with softer language. "No smartphone? No problem!"',
    file: 'OK-KINDERHOOK-SLIDE-SIMPLE.html',
    recommended: ['seniors', 'skeptics'],
  },
  {
    id: 'onepager',
    title: 'One-Pager',
    subtitle: 'Leave-Behind',
    icon: FileText,
    color: '#14b8a6',
    audience: 'Anyone',
    description: 'Compact summary with flow diagram. Perfect to hand out after a meeting.',
    file: 'OK-KINDERHOOK-ONEPAGER.html',
    recommended: ['leave-behind'],
  },
  {
    id: 'governance',
    title: 'Who Runs What',
    subtitle: 'Distributed Ownership',
    icon: Users,
    color: '#606c38',
    audience: 'Potential Partners',
    description: 'Shows how each stakeholder owns their piece. Business champions, library partners, quest designers, historians.',
    file: 'OK-KINDERHOOK-GOVERNANCE.html',
    recommended: ['partners', 'village-board'],
  },
  {
    id: 'philosophy',
    title: 'Circulation is Life',
    subtitle: 'The Deep Why',
    icon: Heart,
    color: '#e11d48',
    audience: 'Visionaries / Funders',
    description: 'The philosophical foundation. Five types of circulation, extraction vs. municipal mindset, the village as living organism.',
    file: 'OK-KINDERHOOK-PHILOSOPHY.html',
    recommended: ['investors', 'visionaries'],
  },
]

const QUICK_PICKS = [
  {
    id: 'business-association',
    label: 'Business Association',
    icon: Building2,
    docs: ['village-os', 'economics', 'onepager'],
    flow: 'Start with Village OS for vision, Economics for skeptics, leave One-Pager',
  },
  {
    id: 'library',
    label: 'Library',
    icon: BookOpen,
    docs: ['cooperative', 'village-os'],
    flow: 'Lead with Cooperative (learning track), show Village OS for bundles',
  },
  {
    id: 'individual-business',
    label: 'Individual Business',
    icon: Building2,
    docs: ['economics', 'faq', 'printable'],
    flow: 'Lead with Economics, Hard Questions for skeptics, Printable to leave behind',
  },
  {
    id: 'village-board',
    label: 'Village Board',
    icon: Users,
    docs: ['village-os', 'cooperative'],
    flow: 'Lead with Village OS vision, Cooperative for transparency angle',
  },
  {
    id: 'elevator',
    label: 'Elevator Pitch',
    icon: Presentation,
    docs: ['slide-simple'],
    flow: 'Pull up Gentle Ladder on your phone',
  },
  {
    id: 'marketing',
    label: 'Marketing / Tourism',
    icon: DollarSign,
    docs: ['8dollar', 'village-os'],
    flow: 'Lead with The $8 Bill meme angle, Village OS for full context',
  },
  {
    id: 'investors',
    label: 'Investors / Partners',
    icon: Rocket,
    docs: ['philosophy', 'villageos-saas', 'economics'],
    flow: 'Start with Circulation is Life for the why, VillageOS for scale, Economics for validation',
  },
  {
    id: 'tourism',
    label: 'Tourism / County',
    icon: Map,
    docs: ['daytrip', 'villageos-saas', '8dollar'],
    flow: 'Lead with Day Trip regional vision, VillageOS for scale potential, $8 Bill for meme marketing',
  },
]

// Smooth spring animation config
const springConfig = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

function Pitch() {
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [showQuickPicks, setShowQuickPicks] = useState(true)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  // Reset iframe loaded state when doc changes
  useEffect(() => {
    if (selectedDoc) {
      setIframeLoaded(false)
    }
  }, [selectedDoc?.id])

  const openDoc = (doc) => {
    setSelectedDoc(doc)
  }

  const openInNewTab = (file) => {
    window.open(`${import.meta.env.BASE_URL}pitches/${file}`, '_blank')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      color: 'white',
    }}>
      {/* Header - More prominent */}
      <header style={{
        padding: '2rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(201, 162, 39, 0.3)',
            }}>
              <Sparkles size={24} color="#1a1a2e" />
            </div>
            <div>
              <h1 style={{
                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                fontWeight: '700',
                letterSpacing: '-0.02em',
                marginBottom: '0.15rem',
              }}>
                OK Kinderhook
              </h1>
              <div style={{
                fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                color: '#c9a227',
                fontWeight: '500',
                letterSpacing: '0.05em',
              }}>
                PITCH ROOM
              </div>
            </div>
          </div>
          <a
            href="/#/"
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.85rem',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.05)'
              e.target.style.color = 'rgba(255,255,255,0.8)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.color = 'rgba(255,255,255,0.5)'
            }}
          >
            Back to Site
          </a>
        </div>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Quick Picks */}
        <section style={{ marginBottom: '2.5rem' }}>
          <button
            onClick={() => setShowQuickPicks(!showQuickPicks)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '1rem',
              padding: '0.5rem 0',
            }}
          >
            <motion.div
              animate={{ rotate: showQuickPicks ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={20} />
            </motion.div>
            Who are you pitching to?
          </button>

          <AnimatePresence initial={false}>
            {showQuickPicks && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '1rem',
                  paddingBottom: '0.5rem',
                }}>
                  {QUICK_PICKS.map((pick, index) => (
                    <motion.div
                      key={pick.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        padding: '1rem',
                        cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.08)',
                        transition: 'background 0.2s, border-color 0.2s',
                      }}
                      onClick={() => {
                        const firstDoc = PITCH_DOCS.find(d => d.id === pick.docs[0])
                        if (firstDoc) openDoc(firstDoc)
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <pick.icon size={18} color="#c9a227" />
                        <span style={{ fontWeight: '600' }}>{pick.label}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                        {pick.flow}
                      </p>
                      <div style={{
                        marginTop: '0.75rem',
                        display: 'flex',
                        gap: '0.35rem',
                        flexWrap: 'wrap',
                      }}>
                        {pick.docs.map(docId => {
                          const doc = PITCH_DOCS.find(d => d.id === docId)
                          return (
                            <span
                              key={docId}
                              style={{
                                fontSize: '0.65rem',
                                background: doc?.color || '#666',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                opacity: 0.85,
                                fontWeight: '500',
                              }}
                            >
                              {doc?.title}
                            </span>
                          )
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* All Documents */}
        <section>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: 'rgba(255,255,255,0.7)',
          }}>
            All Pitch Documents
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {PITCH_DOCS.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.4 }}
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                }}
                onClick={() => openDoc(doc)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                  e.currentTarget.style.boxShadow = `0 8px 24px ${doc.color}15`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  height: '3px',
                  background: doc.color,
                }} />
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: `${doc.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <doc.icon size={20} color={doc.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.15rem' }}>
                        {doc.title}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: doc.color, fontWeight: '500' }}>
                        {doc.subtitle}
                      </div>
                    </div>
                  </div>
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: '0.75rem',
                    lineHeight: 1.5,
                  }}>
                    {doc.description}
                  </p>
                  <div style={{
                    marginTop: '0.75rem',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.35)',
                  }}>
                    Best for: {doc.audience}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section style={{
          marginTop: '2.5rem',
          padding: '1.25rem 1.5rem',
          background: 'rgba(201, 162, 39, 0.08)',
          borderRadius: '12px',
          border: '1px solid rgba(201, 162, 39, 0.2)',
        }}>
          <h3 style={{ color: '#c9a227', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '600' }}>
            Pro Tips
          </h3>
          <ul style={{
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.8,
            paddingLeft: '1.25rem',
            margin: 0,
          }}>
            <li>Print docs with <strong style={{ color: 'rgba(255,255,255,0.8)' }}>File → Print</strong> and enable "Background graphics"</li>
            <li>Present full-screen with <strong style={{ color: 'rgba(255,255,255,0.8)' }}>F11</strong> or <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Cmd+Shift+F</strong></li>
            <li>The One-Pager is designed for letter-size paper (8.5" × 11")</li>
            <li>For skeptics, start with Hard Questions - addresses every concern upfront</li>
          </ul>
        </section>
      </main>

      {/* Document Viewer Modal */}
      <AnimatePresence mode="wait">
        {selectedDoc && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedDoc(null)
            }}
          >
            {/* Modal Content */}
            <motion.div
              key="modal-container"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                margin: '1rem',
                background: '#1a1a2e',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              }}
            >
              {/* Modal Header - animated when doc changes */}
              <motion.div
                key={`header-${selectedDoc.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                style={{
                  padding: '1rem 1.25rem',
                  background: 'rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: `${selectedDoc.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}>
                    <selectedDoc.icon size={20} color={selectedDoc.color} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white' }}>{selectedDoc.title}</h2>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                      {selectedDoc.subtitle}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => openInNewTab(selectedDoc.file)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 0.85rem',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      transition: 'background 0.15s, transform 0.1s',
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <ExternalLink size={15} />
                    Open
                  </button>
                  <button
                    onClick={() => {
                      const win = window.open(`${import.meta.env.BASE_URL}pitches/${selectedDoc.file}`, '_blank')
                      if (win) win.addEventListener('load', () => win.print())
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 0.85rem',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      transition: 'background 0.15s, transform 0.1s',
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Printer size={15} />
                    Print
                  </button>
                  <button
                    onClick={() => setSelectedDoc(null)}
                    style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'background 0.15s, transform 0.1s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <X size={18} />
                  </button>
                </div>
              </motion.div>

              {/* Document iframe container - keyed to doc ID for smooth transitions */}
              <div style={{ flex: 1, position: 'relative', background: '#0a0a0f', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedDoc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                    }}
                  >
                    {/* Loading spinner */}
                    {!iframeLoaded && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#0a0a0f',
                          zIndex: 1,
                        }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          style={{
                            width: '32px',
                            height: '32px',
                            border: '3px solid rgba(255,255,255,0.1)',
                            borderTopColor: selectedDoc.color,
                            borderRadius: '50%',
                          }}
                        />
                      </div>
                    )}
                    <iframe
                      src={`${import.meta.env.BASE_URL}pitches/${selectedDoc.file}`}
                      onLoad={() => setIframeLoaded(true)}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        background: 'white',
                        opacity: iframeLoaded ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                      }}
                      title={selectedDoc.title}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Pitch
