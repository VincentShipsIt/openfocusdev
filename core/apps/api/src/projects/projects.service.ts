import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { PaginatedResponse, PaginationDto } from '../common/dto/pagination.dto';
import type { CreateProjectDto } from './dto/create-project.dto';
import type { UpdateProjectDto } from './dto/update-project.dto';
import { Project, type ProjectDocument } from './schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private projectModel: Model<ProjectDocument>) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    const maxOrder = await this.projectModel.findOne({ userId }).sort({ order: -1 }).exec();

    const project = new this.projectModel({
      ...createProjectDto,
      userId,
      order: maxOrder ? maxOrder.order + 1 : 0,
    });

    return project.save();
  }

  async findAll(userId: string, pagination?: PaginationDto): Promise<PaginatedResponse<Project>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const sortBy = pagination?.sortBy || 'order';
    const sortOrder = pagination?.sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const query = { userId };
    const [data, total] = await Promise.all([
      this.projectModel
        .find(query)
        .sort({ [sortBy]: sortOrder, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.projectModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const project = await this.projectModel.findOne({ _id: id, userId }).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.projectModel
      .findOneAndUpdate({ _id: id, userId }, updateProjectDto, { new: true })
      .exec();

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.projectModel.deleteOne({ _id: id, userId }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

  async toggleFavorite(id: string, userId: string): Promise<Project> {
    const project = await this.projectModel.findOne({ _id: id, userId }).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    project.isFavorite = !project.isFavorite;
    return project.save();
  }
}
