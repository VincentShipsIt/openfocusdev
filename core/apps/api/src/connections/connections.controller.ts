import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConnectionsService } from './connections.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectionSerializer } from '../common/serializers/connection.serializer';

@ApiTags('connections')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task connection' })
  async create(
    @Body() createConnectionDto: CreateConnectionDto,
    @CurrentUser() user: { userId: string },
  ) {
    const connection = await this.connectionsService.create(createConnectionDto, user.userId);
    return ConnectionSerializer.serialize(connection);
  }

  @Get()
  @ApiOperation({ summary: 'Get connections for a project or task' })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'taskId', required: false })
  async findAll(
    @Query('projectId') projectId?: string,
    @Query('taskId') taskId?: string,
    @CurrentUser() user?: { userId: string },
  ) {
    const connections = await this.connectionsService.findAll(user?.userId || '', projectId, taskId);
    return ConnectionSerializer.serialize(connections);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific connection' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    const connection = await this.connectionsService.findOne(id, user.userId);
    return ConnectionSerializer.serialize(connection);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a connection' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    await this.connectionsService.remove(id, user.userId);
    return { success: true };
  }
}
