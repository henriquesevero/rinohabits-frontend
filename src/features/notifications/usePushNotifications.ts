import { useCallback, useEffect, useRef, useState } from 'react'
import { getExistingSubscription, subscribeToPush, unsubscribeFromPush } from './notificationService'

export type NotificationStatus = 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed' | 'loading'

export function usePushNotifications() {
  const [status, setStatus] = useState<NotificationStatus>('loading')
  const [reminderHour, setReminderHour] = useState(20)
  const subRef = useRef<PushSubscription | null>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    !!import.meta.env.VITE_VAPID_PUBLIC_KEY

  useEffect(() => {
    if (!isSupported) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    getExistingSubscription()
      .then((sub) => {
        subRef.current = sub
        setStatus(sub ? 'subscribed' : 'unsubscribed')
      })
      .catch(() => setStatus('unsubscribed'))
  }, [isSupported])

  const subscribe = useCallback(async (hour: number) => {
    setStatus('loading')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        return
      }
      subRef.current = await subscribeToPush(hour)
      setReminderHour(hour)
      setStatus('subscribed')
    } catch {
      setStatus('unsubscribed')
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    if (!subRef.current) return
    setStatus('loading')
    try {
      await unsubscribeFromPush(subRef.current)
      subRef.current = null
      setStatus('unsubscribed')
    } catch {
      setStatus('subscribed')
    }
  }, [])

  return { status, reminderHour, setReminderHour, subscribe, unsubscribe }
}
