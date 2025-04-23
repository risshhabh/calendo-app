// task type
class TaskType {
    constructor(type='Other') {
        this.type = type;
        if (!TaskType.types.includes(type)) {
            this.type = 'Other';
        }
    }

    static types = ['School', 'Work', 'Fun', 'Other'];
    static addType(newType) {
        if (!this.types.includes(newType)) {
            // title case
            this.types.push(newType.charAt(0).toUpperCase() + newType.slice(1).toLowerCase());
        }
    }

    static removeType(type) {
        const index = this.types.indexOf(type);
        if (index > -1) {
            this.types.splice(index, 1);
        }
    }

    static getTypes() {
        return this.types;
    }
}

// each task object
class Task {
    constructor(isComplete=false, taskValue='', time=0, type=new TaskType()) {
        this.isComplete = isComplete;
        this.taskValue = taskValue;
        this.time = time;
        this.type = type;
    }

    fuzzyMatch(query) {
        const text = this.taskValue.toLowerCase();
        const pattern = query.toLowerCase().trim();
        if (pattern.length === 0) return true;
        if (text.includes(pattern)) return true;
        if (pattern.length < 3) {
            return text.split(' ').some(word => word.startsWith(pattern));
        }
        let textIndex = 0;
        let patternIndex = 0;
        let matchedChars = 0;
        while (textIndex < text.length && patternIndex < pattern.length) {
            if (text[textIndex] === pattern[patternIndex]) {
                matchedChars++;
                patternIndex++;
            }
            textIndex++;
        }
        const matchThreshold = Math.min(0.7, (pattern.length - 1) / pattern.length);
        return matchedChars / pattern.length >= matchThreshold;
    }

    // time fmt
    formatTime(minutes) {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
    };
}

// convert task list to CSV format
const TaskListToCSV = tasklist =>
    tasklist.map(task =>
        `${task.isComplete},${task.taskValue},${task.time},${task.type.type}`
    ).join('\n');

// convert CSV format to task list
function CSVToTaskList(csv) {
    const lines = csv.split('\n');
    const tasks = [];
    for (const line of lines) {
        const [isComplete, taskValue, time, type] = line.split(',');
        tasks.push(new Task(
            isComplete === 'true',
            taskValue,
            Number(time),
            new TaskType(type)
        ));
    }
    return tasks;
}

class TaskCard {
    constructor() {
        this.tasks = [];
    }

    addTask(task) {
        this.tasks.push(task);
    }
}

export { TaskType, Task, TaskListToCSV, CSVToTaskList };