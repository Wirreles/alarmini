export interface PermissionStatus {
  granted: boolean
  denied: boolean
  prompt: boolean
  unsupported: boolean
}

export interface AppPermissions {
  notifications: PermissionStatus
  vibrate: PermissionStatus
  backgroundSync: PermissionStatus
  persistentStorage: PermissionStatus
}

export class PermissionsManager {
  private static instance: PermissionsManager
  private permissionStates: Partial<AppPermissions> = {}

  static getInstance(): PermissionsManager {
    if (!PermissionsManager.instance) {
      PermissionsManager.instance = new PermissionsManager()
    }
    return PermissionsManager.instance
  }

  // Check notification permissions
  async checkNotificationPermission(): Promise<PermissionStatus> {
    if (!("Notification" in window)) {
      return { granted: false, denied: false, prompt: false, unsupported: true }
    }

    const permission = Notification.permission

    return {
      granted: permission === "granted",
      denied: permission === "denied",
      prompt: permission === "default",
      unsupported: false,
    }
  }

  // Request notification permissions
  async requestNotificationPermission(): Promise<PermissionStatus> {
    if (!("Notification" in window)) {
      return { granted: false, denied: false, prompt: false, unsupported: true }
    }

    try {
      const permission = await Notification.requestPermission()

      const status = {
        granted: permission === "granted",
        denied: permission === "denied",
        prompt: permission === "default",
        unsupported: false,
      }

      this.permissionStates.notifications = status
      return status
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      return { granted: false, denied: true, prompt: false, unsupported: false }
    }
  }

  // Check vibration support
  async checkVibrationPermission(): Promise<PermissionStatus> {
    const isSupported = "vibrate" in navigator

    return {
      granted: isSupported,
      denied: false,
      prompt: false,
      unsupported: !isSupported,
    }
  }

  // Check background sync permissions
  async checkBackgroundSyncPermission(): Promise<PermissionStatus> {
    if (!("serviceWorker" in navigator) || !("sync" in window.ServiceWorkerRegistration.prototype)) {
      return { granted: false, denied: false, prompt: false, unsupported: true }
    }

    try {
      const registration = await navigator.serviceWorker.ready
      // Background sync is generally available if service worker is supported
      return { granted: true, denied: false, prompt: false, unsupported: false }
    } catch (error) {
      return { granted: false, denied: true, prompt: false, unsupported: false }
    }
  }

  // Check persistent storage permissions
  async checkPersistentStoragePermission(): Promise<PermissionStatus> {
    if (!("storage" in navigator) || !("persist" in navigator.storage)) {
      return { granted: false, denied: false, prompt: false, unsupported: true }
    }

    try {
      const isPersistent = await navigator.storage.persist()
      return { granted: isPersistent, denied: !isPersistent, prompt: false, unsupported: false }
    } catch (error) {
      return { granted: false, denied: true, prompt: false, unsupported: false }
    }
  }

  // Request persistent storage
  async requestPersistentStorage(): Promise<PermissionStatus> {
    if (!("storage" in navigator) || !("persist" in navigator.storage)) {
      return { granted: false, denied: false, prompt: false, unsupported: true }
    }

    try {
      const isPersistent = await navigator.storage.persist()
      const status = { granted: isPersistent, denied: !isPersistent, prompt: false, unsupported: false }
      this.permissionStates.persistentStorage = status
      return status
    } catch (error) {
      console.error("Error requesting persistent storage:", error)
      return { granted: false, denied: true, prompt: false, unsupported: false }
    }
  }

  // Check all permissions
  async checkAllPermissions(): Promise<AppPermissions> {
    const [notifications, vibrate, backgroundSync, persistentStorage] = await Promise.all([
      this.checkNotificationPermission(),
      this.checkVibrationPermission(),
      this.checkBackgroundSyncPermission(),
      this.checkPersistentStoragePermission(),
    ])

    const permissions = {
      notifications,
      vibrate,
      backgroundSync,
      persistentStorage,
    }

    this.permissionStates = permissions
    return permissions
  }

  // Request all necessary permissions
  async requestAllPermissions(): Promise<AppPermissions> {
    const notifications = await this.requestNotificationPermission()
    const vibrate = await this.checkVibrationPermission()
    const backgroundSync = await this.checkBackgroundSyncPermission()
    const persistentStorage = await this.requestPersistentStorage()

    const permissions = {
      notifications,
      vibrate,
      backgroundSync,
      persistentStorage,
    }

    this.permissionStates = permissions
    return permissions
  }

  // Get current permission states
  getCurrentPermissions(): Partial<AppPermissions> {
    return { ...this.permissionStates }
  }

  // Check if app has minimum required permissions
  hasMinimumPermissions(): boolean {
    const { notifications, backgroundSync } = this.permissionStates
    return !!(notifications?.granted && backgroundSync?.granted)
  }

  // Get permission status summary
  getPermissionSummary(): {
    total: number
    granted: number
    denied: number
    unsupported: number
    ready: boolean
  } {
    const permissions = Object.values(this.permissionStates)
    const total = permissions.length
    const granted = permissions.filter((p) => p?.granted).length
    const denied = permissions.filter((p) => p?.denied).length
    const unsupported = permissions.filter((p) => p?.unsupported).length

    return {
      total,
      granted,
      denied,
      unsupported,
      ready: this.hasMinimumPermissions(),
    }
  }
}

export const permissionsManager = PermissionsManager.getInstance()
