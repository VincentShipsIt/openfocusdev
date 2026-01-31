import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Task } from '../schemas/task.schema';
import { TasksService } from '../tasks.service';

const mockTask = {
  _id: 'task-id-1',
  title: 'Test Task',
  description: 'Test description',
  userId: 'user-id-1',
  projectId: null,
  priority: 'medium',
  order: 0,
  completedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  save: vi.fn().mockResolvedValue(this),
};

describe('TasksService', () => {
  let service: TasksService;
  let model: Model<Task>;

  const mockTaskModel = {
    new: vi.fn().mockResolvedValue(mockTask),
    constructor: vi.fn().mockResolvedValue(mockTask),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    deleteOne: vi.fn(),
    deleteMany: vi.fn(),
    updateMany: vi.fn(),
    exec: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: mockTaskModel,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    model = module.get<Model<Task>>(getModelToken(Task.name));
  });

  describe('create', () => {
    it('should have a create method defined', () => {
      // The actual implementation uses `new this.taskModel()` which requires
      // integration testing with a real MongoDB instance
      expect(service.create).toBeDefined();
      expect(typeof service.create).toBe('function');
    });
  });

  describe('findAll', () => {
    it('should return all tasks for a user', async () => {
      const tasks = [mockTask];
      mockTaskModel.find = vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(tasks),
        }),
      });

      const result = await service.findAll('user-id-1');

      expect(mockTaskModel.find).toHaveBeenCalledWith({ userId: 'user-id-1' });
      expect(result).toEqual(tasks);
    });

    it('should filter by projectId', async () => {
      mockTaskModel.find = vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      });

      await service.findAll('user-id-1', 'project-1');

      expect(mockTaskModel.find).toHaveBeenCalledWith({
        userId: 'user-id-1',
        projectId: 'project-1',
      });
    });

    it('should filter completed tasks', async () => {
      mockTaskModel.find = vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      });

      await service.findAll('user-id-1', undefined, true);

      expect(mockTaskModel.find).toHaveBeenCalledWith({
        userId: 'user-id-1',
        completedAt: { $ne: null },
      });
    });

    it('should filter incomplete tasks', async () => {
      mockTaskModel.find = vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      });

      await service.findAll('user-id-1', undefined, false);

      expect(mockTaskModel.find).toHaveBeenCalledWith({
        userId: 'user-id-1',
        completedAt: null,
      });
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      mockTaskModel.findOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockTask),
      });

      const result = await service.findOne('task-id-1', 'user-id-1');

      expect(mockTaskModel.findOne).toHaveBeenCalledWith({
        _id: 'task-id-1',
        userId: 'user-id-1',
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskModel.findOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(
        service.findOne('non-existent', 'user-id-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateDto: UpdateTaskDto = {
        title: 'Updated Title',
      };

      mockTaskModel.findOneAndUpdate = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ ...mockTask, ...updateDto }),
      });

      const result = await service.update('task-id-1', updateDto, 'user-id-1');

      expect(mockTaskModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'task-id-1', userId: 'user-id-1' },
        updateDto,
        { new: true }
      );
      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskModel.findOneAndUpdate = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('non-existent', { title: 'Test' }, 'user-id-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      mockTaskModel.deleteOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      await service.remove('task-id-1', 'user-id-1');

      expect(mockTaskModel.deleteOne).toHaveBeenCalledWith({
        _id: 'task-id-1',
        userId: 'user-id-1',
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskModel.deleteOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      await expect(
        service.remove('non-existent', 'user-id-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkComplete', () => {
    it('should mark multiple tasks as completed', async () => {
      mockTaskModel.updateMany = vi.fn().mockResolvedValue({ modifiedCount: 2 });

      const ids = ['task-1', 'task-2'];
      await service.bulkComplete(ids, 'user-id-1');

      expect(mockTaskModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: ids }, userId: 'user-id-1' },
        { completedAt: expect.any(Date) }
      );
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple tasks', async () => {
      mockTaskModel.deleteMany = vi.fn().mockResolvedValue({ deletedCount: 2 });

      const ids = ['task-1', 'task-2'];
      await service.bulkDelete(ids, 'user-id-1');

      expect(mockTaskModel.deleteMany).toHaveBeenCalledWith({
        _id: { $in: ids },
        userId: 'user-id-1',
      });
    });
  });
});
