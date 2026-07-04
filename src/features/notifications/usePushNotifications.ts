import { useCallback, useEffect, useRef, useState } from 'react'
import { getExistingSubscription, subscribeToPush, unsubscribeFromPush } from './notificationService'

export type NotificationStatus = 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed' | 'loading'

const LS_HOUR = 'rinohabits:reminder_hour'
const LS_MINUTE = 'rinohabits:reminder_minute'

function loadSavedTime() {
  return {
    hour: Number(localStorage.getItem(LS_HOUR) ?? 20),
    minute: Number(localStorage.getItem(LS_MINUTE) ?? 0),
  }
}

function saveTime(hour: number, minute: number) {
  localStorage.setItem(LS_HOUR, String(hour))
  localStorage.setItem(LS_MINUTE, String(minute))
}

function clearSavedTime() {
  localStorage.removeItem(LS_HOUR)
  localStorage.removeItem(LS_MINUTE)
}

export function usePushNotifications() {
  const saved = loadSavedTime()
  const [status, setStatus] = useState<NotificationStatus>('loading')
  const [reminderHour, setReminderHour] = useState(saved.hour)
  const [reminderMinute, setReminderMinute] = useState(saved.minute)
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

  const subscribe = useCallback(async (hour: number, minute: number) => {
    setStatus('loading')
    try {
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          setStatus('denied')
          return
        }
      }
      subRef.current = await subscribeToPush(hour, minute)
      setReminderHour(hour)
      setReminderMinute(minute)
      saveTime(hour, minute)
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
      clearSavedTime()
      setStatus('unsubscribed')
    } catch {
      setStatus('subscribed')
    }
  }, [])

  return { status, reminderHour, setReminderHour, reminderMinute, setReminderMinute, subscribe, unsubscribe }
}
