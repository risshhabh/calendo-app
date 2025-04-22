import './TaskPage.css';
import React, { useState, useEffect } from 'react';

// handle the task type
class TaskType {
    constructor(type='Other') {
        this.type = type;
        if (!TaskType.types.includes(type)) {
            this.type = 'Other';
        }
    }

    static types = ['Work', 'Personal', 'Urgent', 'Other'];
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
}

// convert task list to CSV format
function TaskListToCSV(tasklist) {
    return tasklist.map((task) => {
        return `${task.isComplete},${task.taskValue},${task.time},${task.type.type}`;
    }).join('\n');
}

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

// just the card displaying all tasks
function TaskCard({ tasks, toggleTaskComplete }) {
    // Add search state
    const [searchTerm, setSearchTerm] = useState('');
    // Add state for checked filter - can be 'none', 'completed', or 'incomplete'
    const [checkFilter, setCheckFilter] = useState('none');
    // Add state for time filter - can be 'none', 'ascending', or 'descending'
    const [timeFilter, setTimeFilter] = useState('none');
    // Add state for type filter - tracks which types are selected
    const [selectedTypes, setSelectedTypes] = useState(new Set(TaskType.getTypes()));
    // Add state to control the type dropdown visibility
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    // Add state for the dropdown position
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    // Reference for the button
    const typeFilterButtonRef = React.useRef(null);
    
    // time fmt
    const formatTime = (minutes) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
    };

    // Fuzzy search function to check if search term approximately matches task value
    const fuzzyMatch = (text, pattern) => {
        // Convert to lowercase for case-insensitive matching
        const textLower = text.toLowerCase();
        const patternLower = pattern.toLowerCase().trim();
        
        if (patternLower.length === 0) return true; // Empty search shows everything
        if (textLower.includes(patternLower)) return true; // Exact substring match
        
        // For short search terms, be more strict to avoid too many matches
        if (patternLower.length < 3) {
            // If search term is 1-2 characters, only match beginnings of words
            return textLower.split(' ').some(word => word.startsWith(patternLower));
        }
        
        // For longer search terms, allow more fuzzy matching
        // Check if most characters from the pattern appear in the text in the same order
        let textIndex = 0;
        let patternIndex = 0;
        let matchedChars = 0;
        
        while (textIndex < textLower.length && patternIndex < patternLower.length) {
            if (textLower[textIndex] === patternLower[patternIndex]) {
                matchedChars++;
                patternIndex++;
            }
            textIndex++;
        }
        
        // Consider it a match if at least 70% of characters in the pattern were found in order
        const matchThreshold = Math.min(0.7, (patternLower.length - 1) / patternLower.length);
        return matchedChars / patternLower.length >= matchThreshold;
    };

    // Calculate dropdown position when opened
    const toggleTypeDropdown = () => {
        if (!showTypeDropdown && typeFilterButtonRef.current) {
            const rect = typeFilterButtonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX
            });
        }
        setShowTypeDropdown(!showTypeDropdown);
    };

    console.log(TaskListToCSV(tasks));

    // Handle toggling the check filter
    const toggleCheckFilter = () => {
        // Cycle through the three states: none -> completed -> incomplete -> none
        if (checkFilter === 'none') {
            setCheckFilter('completed');
        } else if (checkFilter === 'completed') {
            setCheckFilter('incomplete');
        } else {
            setCheckFilter('none');
        }
    };
    
    // Get the appropriate filter button symbol based on the current state
    const getCheckFilterSymbol = () => {
        switch (checkFilter) {
            case 'completed':
                return '⌃'; // carat up - completed on top
            case 'incomplete':
                return '⌄'; // carat down - incomplete on top
            default:
                return '—'; // dash - no filtering
        }
    };

    // Handle toggling the time filter
    const toggleTimeFilter = () => {
        // Cycle through the three states: none -> ascending -> descending -> none
        if (timeFilter === 'none') {
            setTimeFilter('ascending');
        } else if (timeFilter === 'ascending') {
            setTimeFilter('descending');
        } else {
            setTimeFilter('none');
        }
    };
    
    // Get the appropriate time filter button symbol based on the current state
    const getTimeFilterSymbol = () => {
        switch (timeFilter) {
            case 'ascending':
                return '️⌃'; // Time with carat up - ascending order (least to greatest)
            case 'descending':
                return '️⌄'; // Time with carat down - descending order (greatest to least)
            default:
                return '—'; // Just time - no ordering
        }
    };

    // Handle toggling a specific type selection
    const toggleTypeSelection = (type) => {
        const newSelectedTypes = new Set(selectedTypes);
        if (newSelectedTypes.has(type)) {
            newSelectedTypes.delete(type);
        } else {
            newSelectedTypes.add(type);
        }
        setSelectedTypes(newSelectedTypes);
    };

    // Handle selecting or deselecting all types
    const toggleAllTypes = () => {
        if (selectedTypes.size === TaskType.getTypes().length) {
            // If all types are currently selected, deselect all
            setSelectedTypes(new Set());
        } else {
            // Otherwise, select all types
            setSelectedTypes(new Set(TaskType.getTypes()));
        }
    };

    // Get the button text for the select/deselect all button
    const getAllButtonText = () => {
        return selectedTypes.size === TaskType.getTypes().length ? 
            "Deselect All" : "Select All";
    };

    // Clear all filters and search term
    const clearAllFilters = () => {
        setSearchTerm('');
        setCheckFilter('none');
        setTimeFilter('none');
        setSelectedTypes(new Set(TaskType.getTypes()));
    };

    // Close the dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showTypeDropdown && !event.target.closest('#type-filter-container')) {
                setShowTypeDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showTypeDropdown]);

    // Filter and sort tasks based on search term, check filter, time filter, and type filter
    const filteredAndSortedTasks = tasks
        .filter(task => 
            fuzzyMatch(task.taskValue, searchTerm) && 
            selectedTypes.has(task.type.type)
        )
        .sort((a, b) => {
            // First apply check filter if active
            if (checkFilter === 'completed') {
                const completionComparison = b.isComplete - a.isComplete;
                if (completionComparison !== 0) return completionComparison;
            } else if (checkFilter === 'incomplete') {
                const completionComparison = a.isComplete - b.isComplete;
                if (completionComparison !== 0) return completionComparison;
            }
            
            // Then apply time filter if active
            if (timeFilter === 'ascending') {
                return a.time - b.time; // Sort by time ascending (least to greatest)
            } else if (timeFilter === 'descending') {
                return b.time - a.time; // Sort by time descending (greatest to least)
            }
            
            // No sorting for 'none'
            return 0;
        });

    return (
        <div className='main-card'>
            <nav id='main-card-header'>
                <h1>☑️</h1>
                <h1>Task</h1>
                <h1>Time</h1>
                <h1>Type</h1>
            </nav>
            <div className='filter-bar'>
                <button 
                    id="checked-filter" 
                    className={`filter-button ${checkFilter !== 'none' ? 'active' : ''}`}
                    onClick={toggleCheckFilter}
                >
                    {getCheckFilterSymbol()}
                </button>
                <input 
                    type="text" 
                    placeholder="Search tasks" 
                    id="task-search" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                    id="time-filter" 
                    className={`filter-button ${timeFilter !== 'none' ? 'active' : ''}`}
                    onClick={toggleTimeFilter}
                >
                    {getTimeFilterSymbol()}
                </button>
                
                <div id="type-filter-container" className="filter-dropdown-container">
                    <button 
                        id="type-filter" 
                        ref={typeFilterButtonRef}
                        className={`filter-button ${selectedTypes.size < TaskType.getTypes().length ? 'active' : ''}`}
                        onClick={toggleTypeDropdown}
                    >
                        🔍
                    </button>
                    
                    {showTypeDropdown && (
                        <>
                            <div className="dropdown-overlay" onClick={() => setShowTypeDropdown(false)}></div>
                            <div className="type-dropdown" style={{ top: dropdownPosition.top, left: dropdownPosition.left }}>
                                <div className="type-dropdown-title">Filter by Type</div>
                                {TaskType.getTypes().map((type, index) => (
                                    <div key={index} className="type-option">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={selectedTypes.has(type)}
                                                onChange={() => toggleTypeSelection(type)}
                                            />
                                            {type}
                                        </label>
                                    </div>
                                ))}
                                <div className="type-dropdown-footer">
                                    <button onClick={toggleAllTypes} className="toggle-all-button">
                                        {getAllButtonText()}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                
                <button id="clear-filter" className='filter-button' onClick={clearAllFilters}>❌</button>
                
            </div>
            <div className='card-content'>
                {filteredAndSortedTasks.length === 0 ? (
                    <p>No tasks to display</p>
                ) : (
                    filteredAndSortedTasks.map((task, index) => (
                        <div key={index} className="task-row">
                            <div className="task-complete">
                                <input 
                                    type="checkbox" 
                                    checked={task.isComplete} 
                                    onChange={() => toggleTaskComplete(tasks.findIndex(t => t === task))} 
                                />
                            </div>
                            <div className="task-value">
                                {task.taskValue}
                            </div>
                            <div className="task-time">
                                {formatTime(task.time)}
                            </div>
                            <div className="task-type">
                                {task.type.type}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function TaskButtons({ addTask, inRemoveMode, toggleRemoveMode }) {
    const [showPopup, setShowPopup] = useState(false);
    
    return (
        <div className='task-buttons'>
            <button className='add-task' onClick={() => setShowPopup(true)}>
                Add Task
            </button>
            {showPopup && <AddTaskPopUp addTask={addTask} onClose={() => setShowPopup(false)} />}
            <button 
                className={`remove-task ${inRemoveMode ? 'active' : ''}`}
                onClick={toggleRemoveMode}
            >
                {inRemoveMode ? 'Cancel Remove' : 'Remove Task'}
            </button>
            <button className='edit-task'>Edit Task</button>
        </div>
    );
}

function AddTaskPopUp({ addTask, onClose }) {
    const [formData, setFormData] = useState({
        task: '',
        time: '',
        type: 'Other'
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.task || !formData.time) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Add task and close popup
        addTask(formData.task, formData.time, formData.type);
        onClose();
    };
    
    return (
        <div className='add-task-popup'>
            <div className="popup-overlay" onClick={onClose}></div>
            <div className="popup-content">
                <h2>Add Task</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Task:
                        <input 
                            type="text" 
                            name="task" 
                            value={formData.task}
                            onChange={handleChange}
                            required 
                        />
                    </label>
                    <label>
                        Time (in minutes):
                        <input 
                            type="number" 
                            name="time" 
                            value={formData.time}
                            onChange={handleChange}
                            required 
                            min="1"
                        />
                    </label>
                    <label>
                        Type:
                        <select 
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            {TaskType.getTypes().map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
                        </select>
                    </label>
                    <div className="form-buttons">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Add</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function TaskGroup() {
    // Sample tasks array with different types
    const initialTasks = [
        new Task(false, 'Complete project documentation', 120, new TaskType('Work')),
        new Task(true, 'Buy groceries', 30, new TaskType('Personal')),
        new Task(false, 'Fix critical bug', 90, new TaskType('Urgent')),
        new Task(false, 'Schedule team meeting', 15, new TaskType('Work')),
        new Task(false, 'Call dentist', 10, new TaskType('Personal'))
    ];
    
    // State to manage tasks
    const [tasks, setTasks] = useState(initialTasks);
    // State for removal mode
    const [inRemoveMode, setInRemoveMode] = useState(false);
    // State for confirmation dialog
    const [confirmDelete, setConfirmDelete] = useState({ show: false, taskIndex: null });
    
    // Function to add a new task
    const addTask = (taskValue, time, taskType) => {
        const newTask = new Task(false, taskValue, Number(time), new TaskType(taskType));
        setTasks([...tasks, newTask]);
    };
    
    // Function to toggle task completion
    const toggleTaskComplete = (index) => {
        const updatedTasks = [...tasks];
        updatedTasks[index].isComplete = !updatedTasks[index].isComplete;
        setTasks(updatedTasks);
    };
    
    // Function to toggle remove mode
    const toggleRemoveMode = () => {
        setInRemoveMode(!inRemoveMode);
    };
    
    // Function to show delete confirmation
    const showDeleteConfirmation = (index) => {
        setConfirmDelete({ show: true, taskIndex: index });
    };
    
    // Function to remove a task
    const removeTask = (index) => {
        const updatedTasks = [...tasks];
        updatedTasks.splice(index, 1);
        setTasks(updatedTasks);
        setConfirmDelete({ show: false, taskIndex: null });
    };

    return (
        <>
            <TaskCard tasks={tasks} toggleTaskComplete={toggleTaskComplete} />
            <TaskButtons addTask={addTask} />
        </>
    );
}

function TaskPage() {
    return (
        <div className="task-page">
            <h1>Tasks</h1>
            <TaskGroup />
        </div>
    );
}

export default TaskPage;