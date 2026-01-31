import { Task, formatTaskDueDate, isOverdue } from '@todoist/shared';
import { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  Swipeable,
} from 'react-native-gesture-handler';

interface TaskItemProps {
  task: Task;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onPress: (task: Task) => void;
}

export default function TaskItem({
  task,
  onComplete,
  onDelete,
  onPress,
}: TaskItemProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const isTaskOverdue =
    task.dueDate && !task.completedAt && isOverdue(task.dueDate);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#eab308';
      default:
        return '#6b7280';
    }
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.leftAction}>
        <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>
          ✓ Complete
        </Animated.Text>
      </View>
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightAction}>
        <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>
          🗑 Delete
        </Animated.Text>
      </View>
    );
  };

  const handleSwipeLeft = () => {
    swipeableRef.current?.close();
    onDelete(task);
  };

  const handleSwipeRight = () => {
    swipeableRef.current?.close();
    onComplete(task);
  };

  return (
    <GestureHandlerRootView>
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        onSwipeableOpen={(direction) => {
          if (direction === 'left') {
            handleSwipeRight();
          } else {
            handleSwipeLeft();
          }
        }}
        friction={2}
        leftThreshold={80}
        rightThreshold={80}
      >
        <Pressable
          style={[styles.container, task.completedAt && styles.completed]}
          onPress={() => onPress(task)}
        >
          <Pressable
            style={[
              styles.checkbox,
              task.completedAt && styles.checkboxChecked,
            ]}
            onPress={() => onComplete(task)}
          >
            {task.completedAt && <Text style={styles.checkmark}>✓</Text>}
          </Pressable>

          <View style={styles.content}>
            <Text
              style={[styles.title, task.completedAt && styles.titleCompleted]}
              numberOfLines={2}
            >
              {task.title}
            </Text>

            {task.description && (
              <Text style={styles.description} numberOfLines={1}>
                {task.description}
              </Text>
            )}

            <View style={styles.meta}>
              {task.dueDate && (
                <Text
                  style={[styles.dueDate, isTaskOverdue && styles.overdue]}
                >
                  {formatTaskDueDate(task.dueDate)}
                </Text>
              )}

              {task.priority && task.priority !== 'low' && (
                <View
                  style={[
                    styles.priority,
                    { backgroundColor: getPriorityColor(task.priority) },
                  ]}
                >
                  <Text style={styles.priorityText}>{task.priority}</Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Swipeable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  completed: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  dueDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  overdue: {
    color: '#ef4444',
  },
  priority: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  leftAction: {
    flex: 1,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  rightAction: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
