import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UseSerializer } from '../common/interceptors/jsonapi.interceptor';
import { GoalSerializer } from '../common/serializers/goal.serializer';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@UseSerializer(GoalSerializer)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new goal' })
  create(
    @Body() createGoalDto: CreateGoalDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.goalsService.create(createGoalDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all goals' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'targetYear', required: false, type: Number })
  findAll(
    @Query('category') category?: string,
    @Query('targetYear') targetYear?: string,
    @CurrentUser() user: { userId: string } = { userId: '' },
  ) {
    const targetYearNum = targetYear ? parseInt(targetYear, 10) : undefined;
    return this.goalsService.findAll(user.userId, category, targetYearNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a goal by ID' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.goalsService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a goal' })
  update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.goalsService.update(id, updateGoalDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a goal' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.goalsService.remove(id, user.userId);
  }

  @Post(':id/milestones/:milestoneId/toggle')
  @ApiOperation({ summary: 'Toggle milestone completion' })
  toggleMilestone(
    @Param('id') goalId: string,
    @Param('milestoneId') milestoneId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.goalsService.toggleMilestone(goalId, milestoneId, user.userId);
  }
}

