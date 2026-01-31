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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import type { PaginationDto } from '../common/dto/pagination.dto';
import { UseSerializer } from '../common/interceptors/jsonapi.interceptor';
import { ProjectSerializer } from '../common/serializers/project.serializer';
import type { CreateProjectDto } from './dto/create-project.dto';
import type { UpdateProjectDto } from './dto/update-project.dto';
import type { ProjectsService } from './projects.service';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@UseSerializer(ProjectSerializer)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  create(@Body() createProjectDto: CreateProjectDto, @CurrentUser() user: { userId: string }) {
    return this.projectsService.create(createProjectDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  findAll(@Query() pagination: PaginationDto, @CurrentUser() user: { userId: string }) {
    return this.projectsService.findAll(user.userId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.projectsService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: { userId: string }
  ) {
    return this.projectsService.update(id, updateProjectDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  remove(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.projectsService.remove(id, user.userId);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Toggle project favorite status' })
  toggleFavorite(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.projectsService.toggleFavorite(id, user.userId);
  }
}
