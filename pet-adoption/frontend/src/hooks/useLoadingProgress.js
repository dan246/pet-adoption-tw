import { useState, useEffect } from 'react'
import { subscribeToProgress } from '../services/api'

export function useLoadingProgress() {
  const [progress, setProgress] = useState({
    loaded: 0,
    total: 0,
    percent: 0,
    status: 'idle' // idle | loading | done | cached | error
  })

  useEffect(() => {
    const unsubscribe = subscribeToProgress(setProgress)
    return unsubscribe
  }, [])

  return progress
}
