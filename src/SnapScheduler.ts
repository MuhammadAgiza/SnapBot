import cron from 'node-cron';
import { TaskQueue } from './TaskQueue';
import logger from './logger';

interface SnapTask {
    name: string;
    cronExpression: string;
    action: () => Promise<void>;
    priority?: number;
}

class SnapScheduler {
    private tasks: SnapTask[] = [];
    private taskQueue: TaskQueue;

    constructor(taskQueue: TaskQueue) {
        this.taskQueue = taskQueue;
    }

    addTask(task: SnapTask, start: boolean = true) {
        this.tasks.push(task);
        const cronTask = cron.schedule(task.cronExpression, async () => {
            this.taskQueue.enqueue(task.action, task.priority || 0);
        }, {
            name: task.name
        });
        if (start) cronTask.start();
        logger.info(`Scheduled task ${task.name} with cron expression ${task.cronExpression}`);
    }

    startAll() {
        this.tasks.forEach(task => {
            let existingTask: cron.ScheduledTask | undefined;
            cron.getTasks().forEach((value, key) => {
                if (key === task.name) {
                    existingTask = value;
                }
            });
            if (!existingTask) {
                const cronTask = cron.schedule(task.cronExpression, async () => {
                    this.taskQueue.enqueue(task.action, 0);
                });
                cronTask.start();
                logger.info(`Scheduled task ${task.name} with cron expression ${task.cronExpression}`);
            } else {
                logger.info(`Task ${task.name} is already scheduled`);
            }
        });
    }
}

export { SnapScheduler, SnapTask };
