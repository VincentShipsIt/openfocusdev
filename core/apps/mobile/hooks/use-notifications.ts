import { useEffect, useRef, useState } from 'react'
import * as Notifications from 'expo-notifications'
import { registerForPushNotifications } from '@/lib/notifications'
import { router } from 'expo-router'

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const notificationListener = useRef<Notifications.EventSubscription>()
  const responseListener = useRef<Notifications.EventSubscription>()

  useEffect(() => {
    registerForPushNotifications().then(token => {
      if (token) setExpoPushToken(token)
    })

    // Handle notification received while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification)
    })

    // Handle tap on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const taskId = response.notification.request.content.data?.taskId
      if (taskId) {
        router.push(`/task/${taskId}`)
      }
    })

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [])

  return { expoPushToken }
}
