import { CreateTaskDto, Project, Task, TaskPriority, UpdateTaskDto } from '@todoist/shared';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TaskFormProps {
  visible: boolean;
  task?: Task;
  projects: Project[];
  defaultProjectId?: string;
  defaultDueDate?: Date;
  onClose: () => void;
  onSave: (data: CreateTaskDto | UpdateTaskDto) => Promise<void>;
}

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: TaskPriority.LOW, label: 'Low', color: '#6b7280' },
  { value: TaskPriority.MEDIUM, label: 'Medium', color: '#eab308' },
  { value: TaskPriority.HIGH, label: 'High', color: '#f97316' },
  { value: TaskPriority.URGENT, label: 'Urgent', color: '#ef4444' },
];

export default function TaskForm({
  visible,
  task,
  projects,
  defaultProjectId,
  defaultDueDate,
  onClose,
  onSave,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [projectId, setProjectId] = useState(task?.projectId || defaultProjectId || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : defaultDueDate
  );
  const [priority, setPriority] = useState<TaskPriority>(
    (task?.priority as TaskPriority) || TaskPriority.MEDIUM
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);
      const data = {
        title: title.trim(),
        description: description.trim() || undefined,
        projectId: projectId || undefined,
        dueDate: dueDate?.toISOString(),
        priority,
      };
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === projectId);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {task ? 'Edit Task' : 'New Task'}
          </Text>
          <Pressable onPress={handleSave} disabled={loading || !title.trim()}>
            <Text
              style={[
                styles.saveButton,
                (!title.trim() || loading) && styles.saveButtonDisabled,
              ]}
            >
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>

        <ScrollView style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add details..."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Project</Text>
            <Pressable
              style={styles.picker}
              onPress={() => setShowProjectPicker(true)}
            >
              <View style={styles.pickerContent}>
                {selectedProject ? (
                  <>
                    <View
                      style={[
                        styles.projectDot,
                        { backgroundColor: selectedProject.color || '#6b7280' },
                      ]}
                    />
                    <Text style={styles.pickerText}>{selectedProject.name}</Text>
                  </>
                ) : (
                  <Text style={styles.pickerPlaceholder}>Inbox</Text>
                )}
              </View>
              <Text style={styles.pickerArrow}>›</Text>
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Due Date</Text>
            <Pressable
              style={styles.picker}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={dueDate ? styles.pickerText : styles.pickerPlaceholder}>
                {dueDate ? dueDate.toLocaleDateString() : 'No due date'}
              </Text>
              <Text style={styles.pickerArrow}>›</Text>
            </Pressable>
            {dueDate && (
              <Pressable
                style={styles.clearButton}
                onPress={() => setDueDate(undefined)}
              >
                <Text style={styles.clearButtonText}>Clear date</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {priorityOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.priorityOption,
                    priority === option.value && {
                      backgroundColor: option.color,
                    },
                  ]}
                  onPress={() => setPriority(option.value)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      priority === option.value && styles.priorityTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setDueDate(date);
            }}
          />
        )}

        <Modal
          visible={showProjectPicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowProjectPicker(false)}
        >
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Pressable onPress={() => setShowProjectPicker(false)}>
                <Text style={styles.cancelButton}>Done</Text>
              </Pressable>
            </View>
            <ScrollView>
              <Pressable
                style={styles.pickerItem}
                onPress={() => {
                  setProjectId('');
                  setShowProjectPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>Inbox</Text>
                {!projectId && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
              {projects.map((project) => (
                <Pressable
                  key={project.id}
                  style={styles.pickerItem}
                  onPress={() => {
                    setProjectId(project.id);
                    setShowProjectPicker(false);
                  }}
                >
                  <View style={styles.pickerItemContent}>
                    <View
                      style={[
                        styles.projectDot,
                        { backgroundColor: project.color || '#6b7280' },
                      ]}
                    />
                    <Text style={styles.pickerItemText}>{project.name}</Text>
                  </View>
                  {projectId === project.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
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
  headerTitle: {
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
  form: {
    flex: 1,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#1f2937',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
  pickerArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  projectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  clearButton: {
    marginTop: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#ef4444',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  priorityTextSelected: {
    color: '#fff',
  },
  pickerModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pickerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'flex-end',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  checkmark: {
    fontSize: 18,
    color: '#3b82f6',
  },
});
