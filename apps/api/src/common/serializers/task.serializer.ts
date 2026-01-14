import { Serializer } from 'jsonapi-serializer';

export const TaskSerializer = new Serializer('tasks', {
  id: '_id',
  attributes: [
    'title',
    'description',
    'projectId',
    'dueDate',
    'completedAt',
    'priority',
    'labels',
    'goalId',
    'milestoneId',
    'order',
    'createdAt',
    'updatedAt',
  ],
  project: {
    ref: 'id',
    included: false,
  },
  goal: {
    ref: 'id',
    included: false,
  },
  keyForAttribute: 'camelCase',
  transform: (record: any) => {
    const transformed = { ...record };
    if (record._id) {
      transformed.id = record._id.toString();
    }
    return transformed;
  },
});
