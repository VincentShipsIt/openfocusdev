import { Serializer } from 'jsonapi-serializer';

export const ConnectionSerializer = new Serializer('connections', {
  id: '_id',
  attributes: ['sourceTaskId', 'targetTaskId', 'type', 'projectId', 'createdAt', 'updatedAt'],
  keyForAttribute: 'camelCase',
  transform: (record: any) => {
    const transformed = { ...record };
    if (record._id) {
      transformed.id = record._id.toString();
    }
    return transformed;
  },
});
