import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import type { PaginationDto } from '../common/dto/pagination.dto';
import { UseSerializer } from '../common/interceptors/jsonapi.interceptor';
import { TaskSerializer } from '../common/serializers/task.serializer';
import type { AddReminderDto } from './dto/add-reminder.dto';
import type { CreateTaskDto } from './dto/create-task.dto';
import type { TriggerAIExecutionDto } from './dto/trigger-ai-execution.dto';
import type { UpdateNodePositionDto } from './dto/update-node-position.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';
import type { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@UseSerializer(TaskSerializer)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: { userId: string }) {
    return this.tasksService.create(createTaskDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'completed', required: false, type: Boolean })
  @ApiQuery({ name: 'dueDate', required: false })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('projectId') projectId?: string,
    @Query('completed') completed?: string,
    @Query('dueDate') dueDate?: string,
    @CurrentUser() user: { userId: string } = { userId: '' }
  ) {
    const completedBool = completed === 'true' ? true : completed === 'false' ? false : undefined;
    return this.tasksService.findAll(
      user.userId,
      projectId,
      completedBool,
      dueDate,
      false,
      pagination
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.tasksService.findOne(id, user.userId);
  }

  @Get(':id/subtasks')
  @ApiOperation({ summary: 'Get subtasks for a task' })
  getSubtasks(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.tasksService.getSubtasks(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: { userId: string }
  ) {
    return this.tasksService.update(id, updateTaskDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  remove(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.tasksService.remove(id, user.userId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search tasks by title or description' })
  @ApiQuery({ name: 'q', required: true })
  search(@Query('q') query: string, @CurrentUser() user: { userId: string }) {
    return this.tasksService.search(user.userId, query);
  }

  @Post(':id/reminders')
  @ApiOperation({ summary: 'Add a reminder to a task' })
  addReminder(
    @Param('id') id: string,
    @Body() addReminderDto: AddReminderDto,
    @CurrentUser() user: { userId: string }
  ) {
    return this.tasksService.addReminder(id, addReminderDto, user.userId);
  }

  @Delete(':id/reminders/:reminderId')
  @ApiOperation({ summary: 'Remove a reminder from a task' })
  removeReminder(
    @Param('id') id: string,
    @Param('reminderId') reminderId: string,
    @CurrentUser() user: { userId: string }
  ) {
    return this.tasksService.removeReminder(id, reminderId, user.userId);
  }

  @Patch(':id/position')
  @ApiOperation({ summary: 'Update task node position in workflow view' })
  updatePosition(
    @Param('id') id: string,
    @Body() updateNodePositionDto: UpdateNodePositionDto,
    @CurrentUser() user: { userId: string }
  ) {
    return this.tasksService.updateNodePosition(id, updateNodePositionDto, user.userId);
  }

  @Post(':id/ai/execute')
  @ApiOperation({ summary: 'Trigger AI execution for a task' })
  triggerAIExecution(
    @Param('id') id: string,
    @Body() triggerAIExecutionDto: TriggerAIExecutionDto,
    @CurrentUser() user: { userId: string }
  ) {
    return this.tasksService.triggerAIExecution(id, triggerAIExecutionDto, user.userId);
  }

  @Post('bulk/complete')
  @ApiOperation({ summary: 'Complete multiple tasks' })
  bulkComplete(@Body() body: { ids: string[] }, @CurrentUser() user: { userId: string }) {
    return this.tasksService.bulkComplete(body.ids, user.userId);
  }

  @Post('bulk/delete')
  @ApiOperation({ summary: 'Delete multiple tasks' })
  bulkDelete(@Body() body: { ids: string[] }, @CurrentUser() user: { userId: string }) {
    return this.tasksService.bulkDelete(body.ids, user.userId);
  }
}
