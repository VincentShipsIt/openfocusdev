import { Serializer } from 'jsonapi-serializer';

export const GoalSerializer = new Serializer('goals', {
  id: '_id',
  attributes: [
    'title',
    'description',
    'category',
    'targetYear',
    'milestones',
    'createdAt',
    'updatedAt',
  ],
  keyForAttribute: 'camelCase',
  transform: (record: any) => {
    const transformed = { ...record };
    if (record._id) {
      transformed.id = record._id.toString();
    }
    return transformed;
  },
});
