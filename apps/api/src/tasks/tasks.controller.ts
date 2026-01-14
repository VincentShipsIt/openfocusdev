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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UseSerializer } from '../common/interceptors/jsonapi.interceptor';
import { TaskSerializer } from '../common/serializers/task.serializer';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@UseSerializer(TaskSerializer)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.tasksService.create(createTaskDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'completed', required: false, type: Boolean })
  @ApiQuery({ name: 'dueDate', required: false })
  findAll(
    @Query('projectId') projectId?: string,
    @Query('completed') completed?: string,
    @Query('dueDate') dueDate?: string,
    @CurrentUser() user: { userId: string } = { userId: '' },
  ) {
    const completedBool = completed === 'true' ? true : completed === 'false' ? false : undefined;
    return this.tasksService.findAll(user.userId, projectId, completedBool, dueDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.tasksService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.tasksService.update(id, updateTaskDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.tasksService.remove(id, user.userId);
  }

  @Post('bulk/complete')
  @ApiOperation({ summary: 'Complete multiple tasks' })
  bulkComplete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: { userId: string },
  ) {
    return this.tasksService.bulkComplete(body.ids, user.userId);
  }

  @Post('bulk/delete')
  @ApiOperation({ summary: 'Delete multiple tasks' })
  bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: { userId: string },
  ) {
    return this.tasksService.bulkDelete(body.ids, user.userId);
  }
}

