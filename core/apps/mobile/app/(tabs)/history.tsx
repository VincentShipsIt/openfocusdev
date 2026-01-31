import { Task, formatTaskDueDate } from '@todoist/shared';
import { format, parseISO } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useApiClient } from '../../lib/api';

export default function HistoryScreen() {
  const api = useApiClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const tasksData = await api.tasks.getAll({ completed: true });
      // Sort by completion date, most recent first
      const sortedTasks = tasksData.sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      });
      setTasks(sortedTasks);
    } catch (error) {
      console.error('Failed to load completed tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUncomplete = async (task: Task) => {
    try {
      await api.tasks.update(task.id, { completedAt: null });
      loadData();
    } catch (error) {
      console.error('Failed to uncomplete task:', error);
    }
  };

  const handleDelete = async (task: Task) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to permanently delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.tasks.delete(task.id);
              loadData();
            } catch (error) {
              console.error('Failed to delete task:', error);
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (tasks.length === 0) return;

    Alert.alert(
      'Clear History',
      `Are you sure you want to delete all ${tasks.length} completed task${tasks.length !== 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const taskIds = tasks.map((t) => t.id);
              await api.tasks.bulkDelete(taskIds);
              loadData();
            } catch (error) {
              console.error('Failed to clear history:', error);
            }
          },
        },
      ]
    );
  };

  const renderTask = ({ item }: { item: Task }) => (
    <Pressable
      style={styles.taskItem}
      onLongPress={() => {
        Alert.alert(item.title, 'What would you like to do?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Restore', onPress: () => handleUncomplete(item) },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => handleDelete(item),
          },
        ]);
      }}
    >
      <View style={styles.taskContent}>
        <View style={styles.checkbox}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <View style={styles.taskDetails}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          {item.description && (
            <Text style={styles.taskDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
          <View style={styles.taskMeta}>
            {item.completedAt && (
              <Text style={styles.completedDate}>
                Completed {format(parseISO(item.completedAt), 'MMM d, yyyy')}
              </Text>
            )}
            {item.dueDate && (
              <Text style={styles.dueDate}>
                Due: {formatTaskDueDate(item.dueDate)}
              </Text>
            )}
          </View>
        </View>
      </View>
      <Pressable
        style={styles.restoreButton}
        onPress={() => handleUncomplete(item)}
      >
        <Text style={styles.restoreText}>Restore</Text>
      </Pressable>
    </Pressable>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No completed tasks</Text>
        <Text style={styles.emptySubtitle}>
          Completed tasks will appear here
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>
            {tasks.length} completed task{tasks.length !== 1 ? 's' : ''}
          </Text>
        </View>
        {tasks.length > 0 && (
          <Pressable style={styles.clearButton} onPress={handleClearAll}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
        contentContainerStyle={tasks.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fee2e2',
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    opacity: 0.7,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#6b7280',
    textDecorationLine: 'line-through',
  },
  taskDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  completedDate: {
    fontSize: 12,
    color: '#10b981',
  },
  dueDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  restoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    marginLeft: 12,
  },
  restoreText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
