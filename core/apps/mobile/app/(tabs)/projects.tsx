import { Project, Task } from '@todoist/shared';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useApiClient } from '../../lib/api';

interface ProjectWithCount extends Project {
  taskCount: number;
}

const PROJECT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#6b7280',
];

export default function ProjectsScreen() {
  const api = useApiClient();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [projectName, setProjectName] = useState('');
  const [projectColor, setProjectColor] = useState(PROJECT_COLORS[5]);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [projectsData, tasksData] = await Promise.all([
        api.projects.getAll(),
        api.tasks.getAll({ completed: false }),
      ]);

      // Add task counts to projects
      const projectsWithCounts = projectsData.map((project) => ({
        ...project,
        taskCount: tasksData.filter((task) => task.projectId === project.id).length,
      }));

      setProjects(projectsWithCounts);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateProject = () => {
    setEditingProject(undefined);
    setProjectName('');
    setProjectColor(PROJECT_COLORS[5]);
    setShowCreateModal(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectName(project.name);
    setProjectColor(project.color || PROJECT_COLORS[5]);
    setShowCreateModal(true);
  };

  const handleDeleteProject = (project: Project) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"? All tasks in this project will be moved to Inbox.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.projects.delete(project.id);
              loadData();
            } catch (error) {
              console.error('Failed to delete project:', error);
            }
          },
        },
      ]
    );
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) return;

    try {
      setSaving(true);
      if (editingProject) {
        await api.projects.update(editingProject.id, {
          name: projectName.trim(),
          color: projectColor,
        });
      } else {
        await api.projects.create({
          name: projectName.trim(),
          color: projectColor,
        });
      }
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleProjectPress = (project: Project) => {
    router.push(`/project/${project.id}`);
  };

  const inboxTaskCount = tasks.filter((task) => !task.projectId).length;

  const renderProject = ({ item }: { item: ProjectWithCount }) => (
    <Pressable
      style={styles.projectItem}
      onPress={() => handleProjectPress(item)}
      onLongPress={() => {
        Alert.alert(item.name, 'What would you like to do?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Edit', onPress: () => handleEditProject(item) },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => handleDeleteProject(item),
          },
        ]);
      }}
    >
      <View style={styles.projectLeft}>
        <View
          style={[
            styles.projectDot,
            { backgroundColor: item.color || '#6b7280' },
          ]}
        />
        <Text style={styles.projectName}>{item.name}</Text>
      </View>
      <Text style={styles.taskCount}>{item.taskCount}</Text>
    </Pressable>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No projects yet</Text>
        <Text style={styles.emptySubtitle}>
          Create your first project to organize your tasks
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <Pressable style={styles.addButton} onPress={handleCreateProject}>
          <Text style={styles.addButtonText}>+ New</Text>
        </Pressable>
      </View>

      {/* Inbox section */}
      <Pressable
        style={styles.inboxItem}
        onPress={() => router.push('/(tabs)/inbox')}
      >
        <View style={styles.projectLeft}>
          <View style={[styles.projectDot, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.projectName}>Inbox</Text>
        </View>
        <Text style={styles.taskCount}>{inboxTaskCount}</Text>
      </Pressable>

      <View style={styles.divider} />

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
        contentContainerStyle={projects.length === 0 ? styles.emptyList : undefined}
      />

      {/* Create/Edit Project Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>
              {editingProject ? 'Edit Project' : 'New Project'}
            </Text>
            <Pressable
              onPress={handleSaveProject}
              disabled={saving || !projectName.trim()}
            >
              <Text
                style={[
                  styles.saveButton,
                  (!projectName.trim() || saving) && styles.saveButtonDisabled,
                ]}
              >
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={projectName}
                onChangeText={setProjectName}
                placeholder="Project name"
                autoFocus
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Color</Text>
              <View style={styles.colorPicker}>
                {PROJECT_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      projectColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setProjectColor(color)}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  projectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  projectDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  projectName: {
    fontSize: 16,
    color: '#1f2937',
  },
  taskCount: {
    fontSize: 14,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 28,
    textAlign: 'center',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6b7280',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  saveButtonDisabled: {
    color: '#9ca3af',
  },
  modalContent: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#1f2937',
  },
});
