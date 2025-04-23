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
        
        if (pattern.length === 0) return true; // empty search = display all
        if (text.includes(pattern)) return true; // exact match
        
        const THRESHOLD = 3; // max allowed operations
        const m = text.length;
        const n = pattern.length;
        
        // init matrix
        const dp = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));
        for (let i = 0; i <= n; i++) dp[i][0] = i;
        for (let j = 0; j <= m; j++) dp[0][j] = 0;
        
        // fill matrix
        for (let i = 1; i <= n; i++) {
            let matches = false; // track if row has any match within threshold
            for (let j = 1; j <= m; j++) {
                if (pattern[i-1] === text[j-1]) {
                    dp[i][j] = dp[i-1][j-1];
                } else {
                    dp[i][j] = 1 + Math.min(
                        dp[i-1][j],     // deletion
                        dp[i][j-1],     // insertion
                        dp[i-1][j-1]    // substitution
                    );
                }
                if (dp[i][j] <= THRESHOLD) matches = true;
            }
            // early termination if no matches within threshold
            if (!matches) return false;
        }
        
        // check if any position in the last row is within threshold
        return dp[n].some(val => val <= THRESHOLD);
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