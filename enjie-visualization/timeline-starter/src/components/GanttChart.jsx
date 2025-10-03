import React, { useEffect, useState, useMemo } from 'react'
import dayjs from 'dayjs'

const API = (path) => `http://localhost:8000${path}`

export default function GanttChart({ tfReqId = null }) {
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSegments = async () => {
      setLoading(true)
      try {
        const params = tfReqId ? `?tf_req_id=${encodeURIComponent(tfReqId)}` : ''
        const r = await fetch(API(`/gantt/segments${params}`))
        const data = await r.json()
        setSegments(data.segments || [])
      } catch (e) {
        console.error('Failed to fetch gantt segments:', e)
      }
      setLoading(false)
    }
    fetchSegments()
  }, [tfReqId])

  const chartData = useMemo(() => {
    if (!segments.length) return { items: [], minTime: 0, maxTime: 0, totalDuration: 0 }

    const allTimes = segments.flatMap(s => [
      dayjs(s.start_ts).valueOf(),
      dayjs(s.end_ts).valueOf()
    ])
    const minTime = Math.min(...allTimes)
    const maxTime = Math.max(...allTimes)
    const totalDuration = Math.max(maxTime - minTime, 1)

    const items = segments.map(seg => {
      const start = dayjs(seg.start_ts).valueOf()
      const end = dayjs(seg.end_ts).valueOf()
      const left = ((start - minTime) / totalDuration) * 100
      const width = Math.max(((end - start) / totalDuration) * 100, 0.5)

      let color = '#a8dadc'
      if (seg.levels.includes('ERROR')) color = '#ff6b6b'
      else if (seg.levels.includes('WARN')) color = '#ffd166'
      else if (seg.levels.includes('DEBUG')) color = '#caffbf'

      return { ...seg, left, width, color }
    })

    return { items, minTime, maxTime, totalDuration }
  }, [segments])

  if (loading) return <div style={{ padding: 12 }}>Loading Gantt chart...</div>
  if (!segments.length) return <div style={{ padding: 12, color: '#666' }}>No segments found</div>

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Gantt Chart ({segments.length} segments)</h3>
      <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>
        {dayjs(chartData.minTime).format('HH:mm:ss')} — {dayjs(chartData.maxTime).format('HH:mm:ss')}
        {' '}({chartData.totalDuration} ms total)
      </div>

      <div style={{ position: 'relative', height: 20, background: '#f0f0f0', borderBottom: '1px solid #ccc', marginBottom: 4 }}>
        {[0, 25, 50, 75, 100].map(pct => (
          <div key={pct} style={{ position: 'absolute', left: `${pct}%`, fontSize: 10, color: '#666' }}>
            {dayjs(chartData.minTime + (chartData.totalDuration * pct / 100)).format('HH:mm:ss')}
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', minHeight: chartData.items.length * 28 + 10, background: '#fafafa', border: '1px solid #ddd' }}>
        {chartData.items.map((seg, idx) => (
          <div
            key={seg.tf_req_id + idx}
            style={{
              position: 'absolute',
              left: `${seg.left}%`,
              width: `${seg.width}%`,
              top: idx * 28 + 6,
              height: 22,
              background: seg.color,
              border: '1px solid #333',
              borderRadius: 3,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 4,
              fontSize: 11,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box'
            }}
            title={`Request: ${seg.tf_req_id}\nDuration: ${seg.duration_ms}ms\nSections: ${seg.sections.join(', ')}\nLevels: ${seg.levels.join(', ')}`}
          >
            {seg.tf_req_id ? seg.tf_req_id.substring(0, 12) : 'unknown'}
            {seg.width > 8 && ` (${seg.duration_ms}ms)`}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, fontSize: 11, display: 'flex', gap: 12 }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#ff6b6b', marginRight: 4 }}></span>ERROR</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#ffd166', marginRight: 4 }}></span>WARN</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#a8dadc', marginRight: 4 }}></span>INFO</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#caffbf', marginRight: 4 }}></span>DEBUG</span>
      </div>
    </div>
  )
}
