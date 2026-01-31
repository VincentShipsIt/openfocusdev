import { Project, Task, isOverdue } from '@todoist/shared';
import {
  addDays,
  format,
  isSameDay,
  isToday,
  isTomorrow,
  parseISO,
  startOfDay,
} from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { Alert, SectionList, StyleSheet, Text, View } from 'react-native';
import FAB from '../../components/fab';
import TaskForm from '../../components/task-form';
import TaskItem from '../../components/task-item';
import { useApiClient } from '../../lib/api';

interface TaskSection {
  title: string;
  date: Date;
  data: Task[];
}

export default function UpcomingScreen() {
  const api = useApiClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData] = await Promise.all([
        api.tasks.getAll({ completed: false }),
        api.projects.getAll(),
      ]);
      // Filter for tasks with due dates that are not overdue
      const upcomingTasks = tasksData.filter((task) => {
        if (!task.dueDate) return false;
        return !isOverdue(task.dueDate);
      });
      setTasks(upcomingTasks);
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
    setSelectedDate(undefined);
  };

  const handleAddTask = () => {
    setEditingTask(undefined);
    setSelectedDate(undefined);
    setShowTaskForm(true);
  };

  // Group tasks by date
  const groupTasksByDate = (): TaskSection[] => {
    const sections: TaskSection[] = [];
    const today = startOfDay(new Date());

    // Create sections for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      const dayTasks = tasks.filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = parseISO(task.dueDate);
        return isSameDay(dueDate, date);
      });

      if (dayTasks.length > 0) {
        let title = format(date, 'EEEE, MMM d');
        if (isToday(date)) {
          title = 'Today';
        } else if (isTomorrow(date)) {
          title = 'Tomorrow';
        }

        sections.push({
          title,
          date,
          data: dayTasks,
        });
      }
    }

    // Add "Later" section for tasks beyond 7 days
    const laterDate = addDays(today, 7);
    const laterTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = parseISO(task.dueDate);
      return dueDate >= laterDate;
    });

    if (laterTasks.length > 0) {
      sections.push({
        title: 'Later',
        date: laterDate,
        data: laterTasks.sort((a, b) => {
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          return dateA - dateB;
        }),
      });
    }

    return sections;
  };

  const sections = groupTasksByDate();

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No upcoming tasks</Text>
        <Text style={styles.emptySubtitle}>
          Tasks with due dates will appear here
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming</Text>
        <Text style={styles.subtitle}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} scheduled
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
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length}</Text>
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
        defaultDueDate={selectedDate}
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
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
