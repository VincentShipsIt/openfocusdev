import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return null

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('task-reminders', {
      name: 'Task Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    })
  }

  const token = await Notifications.getExpoPushTokenAsync()
  return token.data
}

export async function scheduleTaskReminder(task: {
  id: string
  title: string
  dueDate: Date
}): Promise<string> {
  // Schedule 1 hour before due date
  const reminderTime = new Date(task.dueDate.getTime() - 60 * 60 * 1000)

  // If reminder time is in the past, schedule for 5 minutes from now
  const triggerDate = reminderTime > new Date() ? reminderTime : new Date(Date.now() + 5 * 60 * 1000)

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Task due soon',
      body: task.title,
      data: { taskId: task.id },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  })

  return id
}

export async function cancelTaskReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId)
}

export async function scheduleDailyDigest(hour: number = 9): Promise<void> {
  // Cancel existing daily digest
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  for (const n of scheduled) {
    if (n.content.data?.type === 'daily-digest') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier)
    }
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📋 Your tasks for today',
      body: "Tap to see what's on your plate",
      data: { type: 'daily-digest' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  })
}
