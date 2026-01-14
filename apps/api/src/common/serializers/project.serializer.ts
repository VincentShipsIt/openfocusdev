import { Serializer } from 'jsonapi-serializer';

export const ProjectSerializer = new Serializer('projects', {
  id: '_id',
  attributes: [
    'name',
    'description',
    'color',
    'icon',
    'status',
    'category',
    'progress',
    'startDate',
    'targetLaunchDate',
    'launchedAt',
    'distributionChannels',
    'tags',
    'order',
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
