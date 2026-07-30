"use client";

/**
 * Smart Land PWA Registration
 * Handles service worker registration and update management
 */

export function registerPWA() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  // Register service worker
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      console.log("[PWA] Service Worker registered:", registration.scope);

      // Check for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New version available
              showUpdateNotification(registration);
            }
          });
        }
      });

      // Periodic update check
      setInterval(() => {
        registration.update();
      }, 1000 * 60 * 60); // Check every hour

    } catch (error) {
      console.warn("[PWA] Service Worker registration failed:", error);
    }
  });

  // Handle controller change (new SW activated)
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

function showUpdateNotification(registration: ServiceWorkerRegistration) {
  // Create update notification
  const updateContainer = document.createElement("div");
  updateContainer.className = "fixed top-4 right-4 z-[100] animate-slide-down";
  updateContainer.innerHTML = `
    <div class="bg-dark-800/95 backdrop-blur-xl border border-gold-500/20 rounded-xl shadow-2xl shadow-gold-500/10 p-4 max-w-sm">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#020617" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-bold text-white">Update Available</p>
          <p class="text-xs text-dark-400 mt-1">A new version of Smart Land is ready.</p>
          <button id="update-btn" class="mt-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 text-dark-950 text-xs font-bold hover:from-gold-500 hover:to-gold-400 transition-all">
            Update Now
          </button>
          <button id="dismiss-update" class="ml-2 px-3 py-1.5 rounded-lg text-xs text-dark-400 hover:text-gold-300 transition-colors">
            Later
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(updateContainer);

  // Handle update button
  const updateBtn = document.getElementById("update-btn");
  updateBtn?.addEventListener("click", () => {
    registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    updateContainer.remove();
  });

  // Handle dismiss
  const dismissBtn = document.getElementById("dismiss-update");
  dismissBtn?.addEventListener("click", () => {
    updateContainer.remove();
  });

  // Auto-dismiss after 30 seconds
  setTimeout(() => {
    if (document.body.contains(updateContainer)) {
      updateContainer.remove();
    }
  }, 30000);
}

/**
 * Check if the app is running in standalone/PWA mode
 */
export function isRunningStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Get PWA installation status info
 */
export function getPwaStatus() {
  return {
    isStandalone: isRunningStandalone(),
    isInstallable: "serviceWorker" in navigator && "BeforeInstallPromptEvent" in window,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream,
    isAndroid: /Android/.test(navigator.userAgent),
  };
}