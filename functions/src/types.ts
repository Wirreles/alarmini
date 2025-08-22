export interface AlarmNotificationPayload {
  alarmType: "sound" | "vibrate"
  timestamp: string
  action: "trigger_alarm"
}

export interface AlarmRequest {
  type: "sound" | "vibrate"
  message?: string
}

export interface SubscriptionRequest {
  token: string
}

export interface AlarmResponse {
  success: boolean
  messageId?: string
  type?: "sound" | "vibrate"
  timestamp?: number
  error?: string
  details?: string
}
