import { Project, Task } from '@todoist/shared';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import FAB from '../../components/fab';
import TaskForm from '../../components/task-form';
import TaskList from '../../components/task-list';
import { useApiClient } from '../../lib/api';

export default function InboxScreen() {
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
      // Filter for inbox tasks (no project)
      const inboxTasks = tasksData.filter((task) => !task.projectId);
      setTasks(inboxTasks);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
        <Text style={styles.subtitle}>Tasks without a project</Text>
      </View>

      <TaskList
        tasks={tasks}
        loading={loading}
        onRefresh={loadData}
        onComplete={handleComplete}
        onDelete={handleDelete}
        onPress={handlePress}
        emptyMessage="Inbox is empty"
        emptySubMessage="Add a task to get started"
      />

      <FAB onPress={() => setShowTaskForm(true)} />

      <TaskForm
        visible={showTaskForm}
        task={editingTask}
        projects={projects}
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
});

