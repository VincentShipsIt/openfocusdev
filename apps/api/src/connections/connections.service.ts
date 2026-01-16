import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Connection, ConnectionDocument } from './schemas/connection.schema';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { Task, TaskDocument } from '../tasks/schemas/task.schema';

@Injectable()
export class ConnectionsService {
  constructor(
    @InjectModel(Connection.name) private connectionModel: Model<ConnectionDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async create(createConnectionDto: CreateConnectionDto, userId: string): Promise<Connection> {
    const { sourceTaskId, targetTaskId, type } = createConnectionDto;

    // Validate both tasks exist and belong to user
    const [sourceTask, targetTask] = await Promise.all([
      this.taskModel.findOne({ _id: sourceTaskId, userId }).exec(),
      this.taskModel.findOne({ _id: targetTaskId, userId }).exec(),
    ]);

    if (!sourceTask) {
      throw new NotFoundException(`Source task with ID ${sourceTaskId} not found`);
    }
    if (!targetTask) {
      throw new NotFoundException(`Target task with ID ${targetTaskId} not found`);
    }

    // Prevent self-connections
    if (sourceTaskId === targetTaskId) {
      throw new BadRequestException('Cannot connect a task to itself');
    }

    // For dependencies, detect cycles
    if (type === 'dependency') {
      const hasCycle = await this.detectCycle(targetTaskId, sourceTaskId, userId);
      if (hasCycle) {
        throw new BadRequestException('Creating this dependency would cause a cycle');
      }
    }

    // Check for duplicate connection
    const existing = await this.connectionModel.findOne({
      sourceTaskId,
      targetTaskId,
      userId,
    }).exec();

    if (existing) {
      throw new ConflictException('Connection already exists');
    }

    const connection = new this.connectionModel({
      ...createConnectionDto,
      userId,
      projectId: sourceTask.projectId,
    });

    return connection.save();
  }

  async detectCycle(fromTaskId: string, toTaskId: string, userId: string): Promise<boolean> {
    // BFS to check if there's a path from toTaskId back to fromTaskId
    const visited = new Set<string>();
    const queue = [toTaskId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === fromTaskId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const outgoing = await this.connectionModel.find({
        sourceTaskId: current,
        type: 'dependency',
        userId,
      }).exec();

      for (const conn of outgoing) {
        if (!visited.has(conn.targetTaskId)) {
          queue.push(conn.targetTaskId);
        }
      }
    }

    return false;
  }

  async findAll(userId: string, projectId?: string, taskId?: string): Promise<Connection[]> {
    const query: Record<string, unknown> = { userId };

    if (projectId) {
      query.projectId = projectId;
    }

    if (taskId) {
      query.$or = [{ sourceTaskId: taskId }, { targetTaskId: taskId }];
    }

    return this.connectionModel.find(query).exec();
  }

  async findOne(id: string, userId: string): Promise<Connection> {
    const connection = await this.connectionModel.findOne({ _id: id, userId }).exec();
    if (!connection) {
      throw new NotFoundException(`Connection with ID ${id} not found`);
    }
    return connection;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.connectionModel.deleteOne({ _id: id, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Connection with ID ${id} not found`);
    }
  }

  async getBlockedStatus(taskId: string, userId: string): Promise<boolean> {
    // Find all dependency connections where this task is the target
    const dependencies = await this.connectionModel.find({
      targetTaskId: taskId,
      type: 'dependency',
      userId,
    }).exec();

    if (dependencies.length === 0) return false;

    // Check if any source task is incomplete
    for (const dep of dependencies) {
      const sourceTask = await this.taskModel.findOne({
        _id: dep.sourceTaskId,
        userId,
      }).exec();

      if (sourceTask && !sourceTask.completedAt) {
        return true;
      }
    }

    return false;
  }

  async removeByTask(taskId: string, userId: string): Promise<void> {
    await this.connectionModel.deleteMany({
      $or: [{ sourceTaskId: taskId }, { targetTaskId: taskId }],
      userId,
    }).exec();
  }
}
