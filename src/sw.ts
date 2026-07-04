import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: { url: string; revision: string | null }[]
}

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'html-cache',
    networkTimeoutSeconds: 3,
    plugins: [new ExpirationPlugin({ maxEntries: 5 })],
  }),
)

registerRoute(
  ({ url }) => url.hostname === 'www.gravatar.com',
  new CacheFirst({
    cacheName: 'gravatar-cache',
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 86400 })],
  }),
)

self.addEventListener('push', (event) => {
  const data = (event as PushEvent).data?.json() ?? {}
  const title: string = data.title ?? 'RinoHabits'
  const body: string = data.body ?? 'Você tem hábitos para completar hoje!'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/favicon.svg',
      tag: 'habit-reminder',
      renotify: true,
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  ;(event as NotificationEvent).notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => 'focus' in c)
      if (existing) return existing.focus()
      return self.clients.openWindow('/')
    }),
  )
})
