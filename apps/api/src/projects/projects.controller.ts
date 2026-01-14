import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UseSerializer } from '../common/interceptors/jsonapi.interceptor';
import { ProjectSerializer } from '../common/serializers/project.serializer';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@UseSerializer(ProjectSerializer)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.projectsService.create(createProjectDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  findAll(@CurrentUser() user: { userId: string }) {
    return this.projectsService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.projectsService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.projectsService.update(id, updateProjectDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.projectsService.remove(id, user.userId);
  }
}

