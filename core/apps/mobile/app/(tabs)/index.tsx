import { Project, Task, isOverdue } from '@todoist/shared';
import { isToday, parseISO } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { Alert, SectionList, StyleSheet, Text, View } from 'react-native';
import FAB from '../../components/fab';
import TaskForm from '../../components/task-form';
import TaskItem from '../../components/task-item';
import { useApiClient } from '../../lib/api';

interface TaskSection {
  title: string;
  data: Task[];
}

export default function TodayScreen() {
  const api = useApiClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData] = await Promise.all([
        api.tasks.getAll({ completed: false }),
        api.projects.getAll(),
      ]);
      // Filter for tasks due today or overdue
      const todayTasks = tasksData.filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = parseISO(task.dueDate);
        return isToday(dueDate) || isOverdue(task.dueDate);
      });
      setTasks(todayTasks);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleComplete = async (task: Task) => {
    try {
      await api.tasks.update(task.id, {
        completedAt: task.completedAt ? null : new Date().toISOString(),
      });
      loadData();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleDelete = async (task: Task) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
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
    ]);
  };

  const handlePress = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleSave = async (data: any) => {
    if (editingTask) {
      await api.tasks.update(editingTask.id, data);
    } else {
      await api.tasks.create(data);
    }
    loadData();
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const handleAddTask = () => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  };

  // Separate overdue and today tasks
  const overdueTasks = tasks.filter((task) => task.dueDate && isOverdue(task.dueDate));
  const todayOnlyTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = parseISO(task.dueDate);
    return isToday(dueDate);
  });

  const sections: TaskSection[] = [];
  if (overdueTasks.length > 0) {
    sections.push({ title: 'Overdue', data: overdueTasks });
  }
  if (todayOnlyTasks.length > 0) {
    sections.push({ title: 'Today', data: todayOnlyTasks });
  }

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No tasks for today</Text>
        <Text style={styles.emptySubtitle}>Enjoy your free time or add a task</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.subtitle}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} for today
        </Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onPress={handlePress}
          />
        )}
        renderSectionHeader={({ section: { title, data } }) => (
          <View
            style={[
              styles.sectionHeader,
              title === 'Overdue' && styles.overdueHeader,
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                title === 'Overdue' && styles.overdueTitle,
              ]}
            >
              {title}
            </Text>
            <Text style={styles.sectionCount}>{data.length}</Text>
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        refreshing={loading}
        onRefresh={loadData}
        contentContainerStyle={sections.length === 0 ? styles.emptyList : undefined}
      />

      <FAB onPress={handleAddTask} />

      <TaskForm
        visible={showTaskForm}
        task={editingTask}
        projects={projects}
        defaultDueDate={new Date()}
        onClose={handleCloseForm}
        onSave={handleSave}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  overdueHeader: {
    backgroundColor: '#fef2f2',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  overdueTitle: {
    color: '#ef4444',
  },
  sectionCount: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
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
