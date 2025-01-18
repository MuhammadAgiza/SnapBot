import logger from "./logger";

type Task = () => Promise<void>;

interface TaskItem {
    task: Task;
    priority: number;
}

export class TaskQueue {
    private queue: Array<TaskItem> = [];
    private concurrency: number;
    private runningTasks: number = 0;

    constructor(concurrency: number = 1) {
        this.concurrency = concurrency;
    }

    async processQueue() {
        while (true) {
            if (this.queue.length > 0 && this.runningTasks < this.concurrency) {
                const taskItem = this.queue.shift();
                if (taskItem) {
                    this.runningTasks++;
                    this.executeTask(taskItem.task).finally(() => {
                        this.runningTasks--;
                    });
                }
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before checking the queue again
            }
        }
    }

    enqueue(task: Task, priority: number = 0) {
        this.queue.push({ task, priority });
        this.queue.sort((a, b) => b.priority - a.priority); // Higher priority tasks first
    }

    private async executeTask(task: Task) {
        try {
            await task();
        } catch (error) {
            logger.error('Task execution failed:', error);
            // Optionally, you can re-enqueue the task or handle the error as needed
        }
    }
}
