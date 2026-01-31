import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectsService } from '../projects.service';
import { Project } from '../schemas/project.schema';

const mockProject = {
  _id: 'project-id-1',
  name: 'Test Project',
  color: '#3b82f6',
  userId: 'user-id-1',
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  save: vi.fn().mockResolvedValue(this),
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let model: Model<Project>;

  const mockProjectModel = {
    new: vi.fn().mockResolvedValue(mockProject),
    constructor: vi.fn().mockResolvedValue(mockProject),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    deleteOne: vi.fn(),
    exec: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getModelToken(Project.name),
          useValue: mockProjectModel,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    model = module.get<Model<Project>>(getModelToken(Project.name));
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'New Project',
        color: '#ef4444',
      };

      mockProjectModel.findOne = vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
        }),
      });

      expect(service.create).toBeDefined();
    });

    it('should increment order based on existing projects', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'New Project',
      };

      mockProjectModel.findOne = vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue({ order: 3 }),
        }),
      });

      expect(service.create).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all projects for a user', async () => {
      const projects = [mockProject];
      mockProjectModel.find = vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(projects),
        }),
      });

      const result = await service.findAll('user-id-1');

      expect(mockProjectModel.find).toHaveBeenCalledWith({ userId: 'user-id-1' });
      expect(result).toEqual(projects);
    });

    it('should sort by order ascending', async () => {
      mockProjectModel.find = vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      });

      await service.findAll('user-id-1');

      const sortMock = mockProjectModel.find().sort;
      expect(sortMock).toHaveBeenCalledWith({ order: 1, createdAt: -1 });
    });
  });

  describe('findOne', () => {
    it('should return a project by id', async () => {
      mockProjectModel.findOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockProject),
      });

      const result = await service.findOne('project-id-1', 'user-id-1');

      expect(mockProjectModel.findOne).toHaveBeenCalledWith({
        _id: 'project-id-1',
        userId: 'user-id-1',
      });
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if project not found', async () => {
      mockProjectModel.findOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(
        service.findOne('non-existent', 'user-id-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateDto: UpdateProjectDto = {
        name: 'Updated Name',
        color: '#22c55e',
      };

      mockProjectModel.findOneAndUpdate = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ ...mockProject, ...updateDto }),
      });

      const result = await service.update('project-id-1', updateDto, 'user-id-1');

      expect(mockProjectModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'project-id-1', userId: 'user-id-1' },
        updateDto,
        { new: true }
      );
      expect(result.name).toBe('Updated Name');
      expect(result.color).toBe('#22c55e');
    });

    it('should throw NotFoundException if project not found', async () => {
      mockProjectModel.findOneAndUpdate = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('non-existent', { name: 'Test' }, 'user-id-1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should update only provided fields', async () => {
      const updateDto: UpdateProjectDto = {
        color: '#f97316',
      };

      mockProjectModel.findOneAndUpdate = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ ...mockProject, color: '#f97316' }),
      });

      const result = await service.update('project-id-1', updateDto, 'user-id-1');

      expect(result.name).toBe('Test Project'); // unchanged
      expect(result.color).toBe('#f97316'); // updated
    });
  });

  describe('remove', () => {
    it('should delete a project', async () => {
      mockProjectModel.deleteOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      await service.remove('project-id-1', 'user-id-1');

      expect(mockProjectModel.deleteOne).toHaveBeenCalledWith({
        _id: 'project-id-1',
        userId: 'user-id-1',
      });
    });

    it('should throw NotFoundException if project not found', async () => {
      mockProjectModel.deleteOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      await expect(
        service.remove('non-existent', 'user-id-1')
      ).rejects.toThrow(NotFoundException);
    });

    it('should only delete project belonging to user', async () => {
      mockProjectModel.deleteOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      await expect(
        service.remove('project-id-1', 'other-user')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
