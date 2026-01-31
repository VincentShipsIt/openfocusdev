'use client';

import { useApi } from '@/hooks/use-api';
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { Task, Project } from '@todoist/shared';
import { format } from 'date-fns';
import { Calendar, CheckCircle2, Circle, Folder, Inbox } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface SearchModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
	const router = useRouter();
	const { tasks: tasksApi, projects: projectsApi } = useApi();
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<Task[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(false);

	const loadProjects = useCallback(async () => {
		try {
			const allProjects = await projectsApi.getAll();
			setProjects(allProjects);
		} catch (error) {
			console.error('Failed to load projects:', error);
		}
	}, [projectsApi]);

	useEffect(() => {
		if (open) {
			loadProjects();
		}
	}, [open, loadProjects]);

	useEffect(() => {
		if (!open) {
			setQuery('');
			setResults([]);
			return;
		}

		const searchTasks = async () => {
			if (query.length < 2) {
				setResults([]);
				return;
			}

			setLoading(true);
			try {
				const searchResults = await tasksApi.search(query);
				setResults(searchResults);
			} catch (error) {
				console.error('Search failed:', error);
				setResults([]);
			} finally {
				setLoading(false);
			}
		};

		const debounce = setTimeout(searchTasks, 300);
		return () => clearTimeout(debounce);
	}, [query, open, tasksApi]);

	const getProjectName = (projectId: string | undefined) => {
		if (!projectId) return 'Inbox';
		const project = projects.find((p) => p.id === projectId);
		return project?.name || 'Unknown';
	};

	const handleSelect = (task: Task) => {
		onOpenChange(false);
		if (task.projectId) {
			router.push(`/projects/${task.projectId}`);
		} else {
			router.push('/inbox');
		}
	};

	const groupedResults = results.reduce(
		(acc, task) => {
			const projectName = getProjectName(task.projectId);
			if (!acc[projectName]) {
				acc[projectName] = [];
			}
			acc[projectName].push(task);
			return acc;
		},
		{} as Record<string, Task[]>
	);

	return (
		<CommandDialog open={open} onOpenChange={onOpenChange}>
			<CommandInput
				placeholder="Search tasks..."
				value={query}
				onValueChange={setQuery}
			/>
			<CommandList>
				{loading ? (
					<div className="py-6 text-center text-sm text-muted-foreground">
						Searching...
					</div>
				) : query.length < 2 ? (
					<div className="py-6 text-center text-sm text-muted-foreground">
						Type at least 2 characters to search
					</div>
				) : (
					<>
						<CommandEmpty>No tasks found.</CommandEmpty>
						{Object.entries(groupedResults).map(([projectName, tasks]) => (
							<CommandGroup key={projectName} heading={projectName}>
								{tasks.map((task) => (
									<CommandItem
										key={task.id}
										value={task.id}
										onSelect={() => handleSelect(task)}
										className="flex items-start gap-3 py-3"
									>
										<div className="mt-0.5">
											{task.completedAt ? (
												<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
											) : (
												<Circle className="h-4 w-4 text-muted-foreground" />
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p
												className={`text-sm truncate ${
													task.completedAt
														? 'line-through text-muted-foreground'
														: ''
												}`}
											>
												{task.title}
											</p>
											<div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
												{task.projectId ? (
													<span className="flex items-center gap-1">
														<Folder className="h-3 w-3" />
														{projectName}
													</span>
												) : (
													<span className="flex items-center gap-1">
														<Inbox className="h-3 w-3" />
														Inbox
													</span>
												)}
												{task.dueDate && (
													<span className="flex items-center gap-1">
														<Calendar className="h-3 w-3" />
														{format(new Date(task.dueDate), 'MMM d')}
													</span>
												)}
											</div>
										</div>
									</CommandItem>
								))}
							</CommandGroup>
						))}
					</>
				)}
			</CommandList>
		</CommandDialog>
	);
}
