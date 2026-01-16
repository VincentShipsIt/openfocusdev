import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    const maxOrder = await this.projectModel
      .findOne({ userId })
      .sort({ order: -1 })
      .exec();

    const project = new this.projectModel({
      ...createProjectDto,
      userId,
      order: maxOrder ? maxOrder.order + 1 : 0,
    });

    return project.save();
  }

  async findAll(userId: string): Promise<Project[]> {
    return this.projectModel.find({ userId }).sort({ order: 1, createdAt: -1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const project = await this.projectModel.findOne({ _id: id, userId }).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
    const project = await this.projectModel
      .findOneAndUpdate({ _id: id, userId }, updateProjectDto, { new: true })
      .exec();

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.projectModel
      .deleteOne({ _id: id, userId })
      .exec();

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

