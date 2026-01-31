import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Goal, GoalDocument } from './schemas/goal.schema';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectModel(Goal.name) private goalModel: Model<GoalDocument>,
  ) {}

  async create(createGoalDto: CreateGoalDto, userId: string): Promise<Goal> {
    const milestones = (createGoalDto.milestones || []).map((m, index) => ({
      id: Date.now().toString() + index,
      title: m.title,
      targetDate: m.targetDate ? new Date(m.targetDate) : undefined,
      completed: m.completed || false,
    }));

    const goal = new this.goalModel({
      ...createGoalDto,
      userId,
      milestones,
    });

    return goal.save();
  }

  async findAll(userId: string, category?: string, targetYear?: number): Promise<Goal[]> {
    const query: any = { userId };

    if (category) {
      query.category = category;
    }

    if (targetYear) {
      query.targetYear = targetYear;
    }

    return this.goalModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<Goal> {
    const goal = await this.goalModel.findOne({ _id: id, userId }).exec();
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }
    return goal;
  }

  async update(
    id: string,
    updateGoalDto: UpdateGoalDto,
    userId: string,
  ): Promise<Goal> {
    const goal = await this.goalModel
      .findOneAndUpdate({ _id: id, userId }, updateGoalDto, { new: true })
      .exec();

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    return goal;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.goalModel
      .deleteOne({ _id: id, userId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }
  }

  async toggleMilestone(
    goalId: string,
    milestoneId: string,
    userId: string,
  ): Promise<Goal> {
    const goal = await this.findOne(goalId, userId);
    const milestone = goal.milestones.find((m) => m.id === milestoneId);

    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${milestoneId} not found`);
    }

    milestone.completed = !milestone.completed;
    milestone.completedAt = milestone.completed ? new Date() : undefined;

    return this.goalModel
      .findOneAndUpdate(
        { _id: goalId, userId },
        { milestones: goal.milestones },
        { new: true },
      )
      .exec();
  }
}

