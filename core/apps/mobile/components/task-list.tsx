import { Task } from '@todoist/shared';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import TaskItem from './task-item';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onRefresh: () => void;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onPress: (task: Task) => void;
  emptyMessage?: string;
  emptySubMessage?: string;
}

export default function TaskList({
  tasks,
  loading,
  onRefresh,
  onComplete,
  onDelete,
  onPress,
  emptyMessage = 'No tasks',
  emptySubMessage = 'Add a task to get started',
}: TaskListProps) {
  if (!loading && tasks.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{emptyMessage}</Text>
        <Text style={styles.emptySubtitle}>{emptySubMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TaskItem
          task={item}
          onComplete={onComplete}
          onDelete={onDelete}
          onPress={onPress}
        />
      )}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
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
