const CACHE_NAME = 'contentai-studio-v1'
const STATIC_CACHE_NAME = 'contentai-static-v1'
const DYNAMIC_CACHE_NAME = 'contentai-dynamic-v1'

// Archivos para cachear en la instalación
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/logo.svg'
]

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...')
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando assets estáticos')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Instalación completada')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Error en instalación:', error)
      })
  )
})

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE_NAME && name !== DYNAMIC_CACHE_NAME)
            .map((name) => {
              console.log('[SW] Eliminando cache antiguo:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => {
        console.log('[SW] Activación completada')
        return self.clients.claim()
      })
  )
})

// Estrategia de caché
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Solo cachear solicitudes GET
  if (request.method !== 'GET') {
    return
  }

  // Ignorar solicitudes a API externas y extensions
  if (url.pathname.startsWith('/api/') ||
      url.protocol === 'chrome-extension:' ||
      url.hostname.includes('google') ||
      url.hostname.includes('analytics')) {
    return
  }

  // Estrategia: Network First para HTML, Cache First para assets estáticos
  if (request.headers.get('accept')?.includes('text/html')) {
    // Network First para páginas HTML
    event.respondWith(networkFirst(request))
  } else {
    // Cache First para assets estáticos
    event.respondWith(cacheFirst(request))
  }
})

// Estrategia Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('[SW] Error en fetch:', error)
    // Retornar página offline si está disponible
    return caches.match('/')
  }
}

// Estrategia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('[SW] Red no disponible, usando cache')
    const cachedResponse = await caches.match(request)
    return cachedResponse || caches.match('/')
  }
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name))
    })
  }
})

// Notificaciones push (preparado para futuras implementaciones)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    }
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  )
})

console.log('[SW] Service Worker cargado')
