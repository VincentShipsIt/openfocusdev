import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from '../tasks/schemas/task.schema';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async findAll(
    userId: string,
    projectId?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const query: any = {
      userId,
      completedAt: { $ne: null },
    };

    if (projectId) {
      query.projectId = projectId;
    }

    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) {
        query.completedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.completedAt.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.taskModel
        .find(query)
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.taskModel.countDocuments(query).exec(),
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

