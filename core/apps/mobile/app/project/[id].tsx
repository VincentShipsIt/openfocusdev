import { Project, Task } from '@todoist/shared';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import FAB from '../../components/fab';
import TaskForm from '../../components/task-form';
import TaskList from '../../components/task-list';
import { useApiClient } from '../../lib/api';

export default function ProjectDetailScreen() {
  const api = useApiClient();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [projectData, tasksData, projectsData] = await Promise.all([
        api.projects.getOne(id),
        api.tasks.getAll({ completed: false }),
        api.projects.getAll(),
      ]);
      setProject(projectData);
      setAllProjects(projectsData);
      // Filter tasks for this project
      const projectTasks = tasksData.filter((task) => task.projectId === id);
      setTasks(projectTasks);
    } catch (error) {
      console.error('Failed to load project:', error);
      Alert.alert('Error', 'Failed to load project', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [api, id, router]);

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
      await api.tasks.create({ ...data, projectId: id });
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

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: project?.name || 'Project',
          headerBackTitle: 'Back',
        }}
      />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.projectDot,
              { backgroundColor: project?.color || '#6b7280' },
            ]}
          />
          <Text style={styles.title}>{project?.name || 'Loading...'}</Text>
        </View>
        <Text style={styles.taskCount}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <TaskList
        tasks={tasks}
        loading={loading}
        onRefresh={loadData}
        onComplete={handleComplete}
        onDelete={handleDelete}
        onPress={handlePress}
        emptyMessage="No tasks in this project"
        emptySubMessage="Add a task to get started"
      />

      <FAB onPress={handleAddTask} />

      <TaskForm
        visible={showTaskForm}
        task={editingTask}
        projects={allProjects}
        defaultProjectId={id}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  taskCount: {
    fontSize: 14,
    color: '#6b7280',
  },
});
