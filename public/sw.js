const CACHE_NAME = "health-tracker-v2";
const STATIC_ASSETS = ["/", "/dashboard", "/login", "/signup"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => caches.match(event.request)),
  );
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {
    title: "Health Tracker",
    body: "Время принять лекарство",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: "/dashboard#medications", medicationId: null, time: null },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: data.data,
      actions: [
        { action: "taken", title: "Принял" },
        { action: "skip", title: "Пропустить" },
      ],
      tag: data.tag || "medication-reminder",
      renotify: true,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const url = data.url || "/dashboard#medications";

  if (event.action === "taken" || event.action === "skip") {
    // Отправляем сообщение клиенту для обновления лога
    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clients) => {
        const target = clients.find((c) => c.url.includes("/dashboard"));
        if (target) {
          target.focus();
          target.postMessage({
            type: "MEDICATION_ACTION",
            action: event.action,
            medicationId: data.medicationId,
            time: data.time,
          });
        } else {
          self.clients.openWindow(url);
        }
      }),
    );
    return;
  }

  // Обычный клик — открываем приложение
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const existing = clients.find((c) => c.url.includes("/dashboard"));
      if (existing) {
        existing.focus();
        existing.navigate(url);
      } else {
        self.clients.openWindow(url);
      }
    }),
  );
});
