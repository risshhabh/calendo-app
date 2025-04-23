import './TaskPage.css';
import React, { useState, useEffect } from 'react';
import * as helper from './TaskPageHelper';
import TaskPageFilter from './TaskPageFilter';
/*
 * TaskType > {type}, constructor, addType, removeType, getTypes
 * Task     > {isComplete, taskValue, time, type}, constructor
 * TaskCard > {tasks}, constructor, addTask
 * TaskListToCSV, CSVToTaskList
 */

// just the card displaying all tasks
function TaskCard({ tasks, toggleTaskComplete }) {
    const [filteredTasks, setFilteredTasks] = useState(tasks);

    // update the visual filter tasks based on the tasks prop
    useEffect(() => {
        setFilteredTasks(tasks);
    }, [tasks]);

    return (
        <div className='main-card'>
            <nav id='main-card-header'>
                <h1>☑️</h1>
                <h1>Task</h1>
                <h1>Time</h1>
                <h1>Type</h1>
            </nav>
            <TaskPageFilter tasks={tasks} onFilter={setFilteredTasks} />
            <div className='card-content'>
                {filteredTasks.length === 0 ? (
                    <p>No tasks to display</p>
                ) : (
                    filteredTasks.map((task, index) => (
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
                                {task.formatTime(task.time)}
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
                            {helper.TaskType.getTypes().map((type, index) => (
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
        new helper.Task(false, 'Complete project documentation', 120, new helper.TaskType('Work')),
        new helper.Task(true, 'Buy groceries', 30, new helper.TaskType('Personal')),
        new helper.Task(false, 'Fix critical bug', 90, new helper.TaskType('Urgent')),
        new helper.Task(false, 'Schedule team meeting', 15, new helper.TaskType('Work')),
        new helper.Task(false, 'Call dentist', 10, new helper.TaskType('Personal'))
    ];
    
    // State to manage tasks
    const [tasks, setTasks] = useState(initialTasks);
    // State for removal mode
    const [inRemoveMode, setInRemoveMode] = useState(false);
    // State for confirmation dialog
    const [confirmDelete, setConfirmDelete] = useState({ show: false, taskIndex: null });
    
    // Function to add a new task
    const addTask = (taskValue, time, taskType) => {
        const newTask = new helper.Task(false, taskValue, Number(time), new helper.TaskType(taskType));
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