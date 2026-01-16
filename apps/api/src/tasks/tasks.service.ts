import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument, Recurrence, Reminder } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AddReminderDto } from './dto/add-reminder.dto';
import { UpdateNodePositionDto } from './dto/update-node-position.dto';
import { TriggerAIExecutionDto } from './dto/trigger-ai-execution.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    let projectId = createTaskDto.projectId;

    // If creating a subtask, inherit projectId from parent
    if (createTaskDto.parentTaskId) {
      const parentTask = await this.taskModel
        .findOne({ _id: createTaskDto.parentTaskId, userId })
        .exec();
      if (parentTask) {
        projectId = parentTask.projectId;
      }
    }

    const maxOrder = await this.taskModel
      .findOne({ userId, projectId: projectId || null, parentTaskId: createTaskDto.parentTaskId || null })
      .sort({ order: -1 })
      .exec();

    const task = new this.taskModel({
      ...createTaskDto,
      projectId,
      userId,
      order: maxOrder ? maxOrder.order + 1 : 0,
      priority: createTaskDto.priority || 'medium',
    });

    return task.save();
  }

  async findAll(
    userId: string,
    projectId?: string,
    completed?: boolean,
    dueDate?: string,
    includeSubtasks?: boolean,
  ): Promise<Task[]> {
    const query: any = { userId };

    // By default, exclude subtasks from main queries
    if (!includeSubtasks) {
      query.parentTaskId = { $exists: false };
    }

    if (projectId) {
      query.projectId = projectId;
    }

    if (completed !== undefined) {
      if (completed) {
        query.completedAt = { $ne: null };
      } else {
        query.completedAt = null;
      }
    }

    if (dueDate) {
      const date = new Date(dueDate);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      query.dueDate = { $gte: startOfDay, $lte: endOfDay };
    }

    return this.taskModel.find(query).sort({ order: 1, createdAt: -1 }).exec();
  }

  async getSubtasks(taskId: string, userId: string): Promise<Task[]> {
    return this.taskModel
      .find({ parentTaskId: taskId, userId })
      .sort({ order: 1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: id, userId }).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  private calculateNextDueDate(currentDueDate: Date, recurrence: Recurrence): Date {
    const interval = recurrence.interval || 1;
    const date = new Date(currentDueDate);

    switch (recurrence.rule) {
      case 'daily':
        date.setDate(date.getDate() + interval);
        break;
      case 'weekly':
        date.setDate(date.getDate() + (interval * 7));
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + interval);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + interval);
        break;
      default:
        date.setDate(date.getDate() + interval);
    }

    return date;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<Task> {
    // Get the current task first to check for recurrence
    const existingTask = await this.taskModel.findOne({ _id: id, userId }).exec();
    if (!existingTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check if we're completing a recurring task
    const isCompletingRecurringTask =
      updateTaskDto.completedAt &&
      !existingTask.completedAt &&
      existingTask.recurrence &&
      existingTask.dueDate;

    const task = await this.taskModel
      .findOneAndUpdate({ _id: id, userId }, updateTaskDto, { new: true })
      .exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Create next occurrence for recurring task
    if (isCompletingRecurringTask && existingTask.recurrence && existingTask.dueDate) {
      const nextDueDate = this.calculateNextDueDate(
        new Date(existingTask.dueDate),
        existingTask.recurrence as Recurrence
      );

      // Check if we're past the end date
      const shouldCreateNext = !existingTask.recurrence.endDate ||
        nextDueDate <= new Date(existingTask.recurrence.endDate);

      if (shouldCreateNext) {
        await this.create({
          title: existingTask.title,
          description: existingTask.description,
          projectId: existingTask.projectId,
          dueDate: nextDueDate.toISOString(),
          priority: existingTask.priority as any,
          labels: existingTask.labels,
          recurrence: existingTask.recurrence as any,
        }, userId);
      }
    }

    return task;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.taskModel
      .deleteOne({ _id: id, userId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  async bulkComplete(ids: string[], userId: string): Promise<void> {
    await this.taskModel.updateMany(
      { _id: { $in: ids }, userId },
      { completedAt: new Date() },
    );
  }

  async bulkDelete(ids: string[], userId: string): Promise<void> {
    await this.taskModel.deleteMany({ _id: { $in: ids }, userId });
  }

  async search(userId: string, query: string): Promise<Task[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const regex = new RegExp(query.trim(), 'i');
    return this.taskModel
      .find({
        userId,
        $or: [{ title: { $regex: regex } }, { description: { $regex: regex } }],
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async addReminder(
    taskId: string,
    addReminderDto: AddReminderDto,
    userId: string,
  ): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: taskId, userId }).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const reminder: Reminder = {
      id: randomUUID(),
      type: addReminderDto.type,
      time: addReminderDto.time ? new Date(addReminderDto.time) : undefined,
      offset: addReminderDto.offset,
      notified: false,
    };

    const reminders = task.reminders || [];
    reminders.push(reminder);

    return this.taskModel
      .findOneAndUpdate(
        { _id: taskId, userId },
        { reminders },
        { new: true },
      )
      .exec();
  }

  async removeReminder(
    taskId: string,
    reminderId: string,
    userId: string,
  ): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: taskId, userId }).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const reminders = (task.reminders || []).filter((r) => r.id !== reminderId);

    return this.taskModel
      .findOneAndUpdate(
        { _id: taskId, userId },
        { reminders },
        { new: true },
      )
      .exec();
  }

  async updateNodePosition(
    id: string,
    dto: UpdateNodePositionDto,
    userId: string,
  ): Promise<Task> {
    const task = await this.taskModel
      .findOneAndUpdate(
        { _id: id, userId },
        { nodePosition: { x: dto.x, y: dto.y } },
        { new: true },
      )
      .exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async triggerAIExecution(
    id: string,
    dto: TriggerAIExecutionDto,
    userId: string,
  ): Promise<Task> {
    const task = await this.taskModel.findOne({ _id: id, userId }).exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (!task.aiEnabled) {
      throw new BadRequestException('AI execution not enabled for this task');
    }

    // Update status to running
    await this.taskModel.updateOne(
      { _id: id, userId },
      { aiExecutionStatus: 'running' },
    );

    try {
      const prompt = dto.prompt || task.aiPrompt || `Complete this task: ${task.title}`;

      // AI integration point - placeholder for now
      const result = await this.executeAITask(task, prompt);

      return this.taskModel
        .findOneAndUpdate(
          { _id: id, userId },
          {
            aiExecutionStatus: 'completed',
            aiExecutionResult: result,
            completedAt: new Date(),
          },
          { new: true },
        )
        .exec();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.taskModel
        .findOneAndUpdate(
          { _id: id, userId },
          {
            aiExecutionStatus: 'failed',
            aiExecutionResult: errorMessage,
          },
          { new: true },
        )
        .exec();
    }
  }

  private async executeAITask(task: Task, prompt: string): Promise<string> {
    // TODO: Integrate with Anthropic/OpenAI API
    // For now, return a placeholder result
    return `Task "${task.title}" analyzed and completed by AI. Prompt: ${prompt}`;
  }
}

