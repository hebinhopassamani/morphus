import { computed, inject, Service } from '@angular/core';
import { add, min } from 'date-fns';
import {
  Project,
  ProjectsService,
  Task,
  TaskState,
} from '@/app/domains/admin/modules/projects/data/projects';

export type TaskItem = Required<Task> & {
  project: Project;
};

const STATE_ACTIVITY: Record<Exclude<TaskState, 'todo'>, string> = {
  'in-progress': 'started the task',
  blocked: 'flagged the task as blocked',
  done: 'completed the task',
};

@Service()
export class TasksService {
  // Dependencies
  private projectsService = inject(ProjectsService);

  // Data
  readonly tasks = computed(() =>
    this.projectsService
      .projects()
      .flatMap((project) =>
        project.tasks.map((task, index): TaskItem => {
          // Older than any hand written task so those lead the default order
          const createdAt = min([
            project.startDate,
            add(new Date(), { days: -30 }),
          ]).toISOString();

          return {
            key: `${project.key}-${project.tasksTotal - project.tasks.length + index + 1}`,
            description: '',
            priority: project.priority,
            reporter: project.lead,
            labels: project.labels,
            estimate: `${(index % 4) + 1}d`,
            createdAt,
            subtasks: [],
            attachments: [],
            activity: [
              ...(task.state === 'todo'
                ? []
                : [
                    {
                      id: `${task.id}-a2`,
                      type: 'status' as const,
                      actor: task.assignee,
                      text: STATE_ACTIVITY[task.state],
                      date: project.updatedAt,
                    },
                  ]),
              {
                id: `${task.id}-a1`,
                type: 'created',
                actor: project.lead,
                text: 'created the task',
                date: createdAt,
              },
            ],
            ...task,
            project,
          };
        })
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );

  byKey(key: string) {
    return this.tasks().find((task) => task.key === key) ?? null;
  }
}
