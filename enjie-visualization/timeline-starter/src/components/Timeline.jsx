import React from 'react'
import dayjs from 'dayjs'

export default function Timeline({ items = [] }) {
  if (!items.length) return <div style={{ padding: 12, color: '#666' }}>No items to display</div>

  const color = {
    ERROR: '#ff6b6b',
    WARN: '#ffd166',
    INFO: '#a8dadc',
    DEBUG: '#caffbf',
    TRACE: '#e0fbfc'
  }

  const sectionIcon = {
    plan: '📋',
    apply: '⚙️',
    http: '🌐',
    other: '📝'
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Timeline ({items.length} events)</h3>
      <div style={{ position: 'relative', paddingLeft: 20, borderLeft: '2px solid #ccc' }}>
        {items.map((it, idx) => (
          <div
            key={it.id || idx}
            style={{
              position: 'relative',
              marginBottom: 12,
              padding: '8px 12px',
              background: color[it.level] || '#e0e0e0',
              borderRadius: 4,
              border: '1px solid #999',
              fontSize: 12
            }}
          >
            <div style={{
              position: 'absolute',
              left: -28,
              top: 12,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: color[it.level] || '#999',
              border: '2px solid #333'
            }}></div>

            <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>
              {it.ts ? dayjs(it.ts).format('HH:mm:ss.SSS') : '—'}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 'bold' }}>
              <span>{sectionIcon[it.section] || '📝'}</span>
              <span>{it.level}</span>
              <span style={{ color: '#555', fontWeight: 'normal' }}>{it.section}</span>
              {it.tf_resource_type && (
                <span style={{ background: '#fff', padding: '1px 6px', borderRadius: 3, fontSize: 10 }}>
                  {it.tf_resource_type}
                </span>
              )}
            </div>

            {it.message && (
              <div style={{ marginTop: 4, color: '#333', wordBreak: 'break-word' }}>
                {it.message.length > 200 ? it.message.substring(0, 200) + '...' : it.message}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
