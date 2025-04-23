/**
 * @component TaskPageFilter
 * @description a react component that provides filtering functionality for tasks. it includes search, completion status filtering,
 * time-based sorting, and type filtering capabilities.
 * 
 * @param {Object} props
 * @param {Array} props.tasks - array of task objects to be filtered
 * @param {Function} props.onFilter - callback function to handle filtered tasks
 * 
 * @function fuzzyMatch
 * @description performs fuzzy text matching between a text and a pattern
 * @param {string} text - the text to search in
 * @param {string} pattern - the pattern to search for
 * @returns {boolean} - whether the pattern matches the text
 * 
 * @function toggleTypeDropdown
 * @description toggles the type filter dropdown and calculates its position
 * 
 * @function toggleCheckFilter
 * @description cycles through completion status filter options (none -> completed -> incomplete)
 * 
 * @function getCheckFilterSymbol
 * @description returns the symbol representing current completion filter state
 * @returns {string} - symbol representing filter state
 * 
 * @function toggleTimeFilter
 * @description cycles through time filter options (none -> ascending -> descending)
 * 
 * @function getTimeFilterSymbol
 * @description returns the symbol representing current time filter state
 * @returns {string} - symbol representing filter state
 * 
 * @function toggleTypeSelection
 * @description toggles selection state of a specific task type
 * @param {string} type - task type to toggle
 * 
 * @function toggleAllTypes
 * @description toggles selection state of all task types
 * 
 * @function getAllButtonText
 * @description returns text for the select/deselect all button
 * @returns {string} - button text
 * 
 * @function clearAllFilters
 * @description resets all filters to their default states
 * 
 * @state
 * @property {string} searchTerm - current search input value
 * @property {string} checkFilter - current completion filter state
 * @property {string} timeFilter - current time filter state
 * @property {Set} selectedTypes - set of currently selected task types
 * @property {boolean} showTypeDropdown - controls visibility of type filter dropdown
 * @property {Object} dropdownPosition - position coordinates for type filter dropdown
 */


import React, { useState, useEffect } from 'react';
import * as helper from './TaskPageHelper';
import './TaskPageFilter.css';

function TaskPageFilter({ tasks, onFilter }) {
    // search bar state
    const [searchTerm, setSearchTerm] = useState('');
    const [checkFilter, setCheckFilter] = useState('none');
    const [timeFilter, setTimeFilter] = useState('none');
    const [selectedTypes, setSelectedTypes] = useState(new Set(helper.TaskType.getTypes()));
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const typeFilterButtonRef = React.useRef(null);

    
    const fuzzyMatchDeprecated = (text, pattern) => {
        const textLower = text.toLowerCase();
        const patternLower = pattern.toLowerCase().trim();
        if (patternLower.length === 0) return true;
        if (textLower.includes(patternLower)) return true;
        if (patternLower.length < 3) {
            return textLower.split(' ').some(word => word.startsWith(patternLower));
        }
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
        const matchThreshold = Math.min(0.7, (patternLower.length - 1) / patternLower.length);
        return matchedChars / patternLower.length >= matchThreshold;
    };

    // Calculate dropdown position when opened
    const toggleTypeDropdown = () => {
        if (!showTypeDropdown && typeFilterButtonRef.current) {
            const buttonRect = typeFilterButtonRef.current.getBoundingClientRect();
            const dropdownWidth = 240; // Width from our CSS
            
            // Position the dropdown below the button
            setDropdownPosition({
                top: buttonRect.bottom + 8,
                left: Math.min(
                    buttonRect.left,
                    window.innerWidth - dropdownWidth - 16
                )
            });
        }
        setShowTypeDropdown(!showTypeDropdown);
    };

    const toggleCheckFilter = () => {
        if (checkFilter === 'none') {
            setCheckFilter('completed');
        } else if (checkFilter === 'completed') {
            setCheckFilter('incomplete');
        } else {
            setCheckFilter('none');
        }
    };

    const getCheckFilterSymbol = () => {
        switch (checkFilter) {
            case 'completed':
                return '↑';
            case 'incomplete':
                return '↓';
            default:
                return '-';
        }
    };

    const toggleTimeFilter = () => {
        if (timeFilter === 'none') {
            setTimeFilter('ascending');
        } else if (timeFilter === 'ascending') {
            setTimeFilter('descending');
        } else {
            setTimeFilter('none');
        }
    };

    const getTimeFilterSymbol = () => {
        switch (timeFilter) {
            case 'ascending':
                return '↑';
            case 'descending':
                return '↓';
            default:
                return '-';
        }
    };

    const toggleTypeSelection = (type) => {
        const newSelectedTypes = new Set(selectedTypes);
        if (newSelectedTypes.has(type)) {
            newSelectedTypes.delete(type);
        } else {
            newSelectedTypes.add(type);
        }
        setSelectedTypes(newSelectedTypes);
    };

    const toggleAllTypes = () => {
        if (selectedTypes.size === helper.TaskType.getTypes().length) {
            setSelectedTypes(new Set());
        } else {
            setSelectedTypes(new Set(helper.TaskType.getTypes()));
        }
    };

    const getAllButtonText = () => {
        return selectedTypes.size === helper.TaskType.getTypes().length ? 
            "Deselect All" : "Select All";
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setCheckFilter('none');
        setTimeFilter('none');
        setSelectedTypes(new Set(helper.TaskType.getTypes()));
    };

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

    // filter and sort tasks, then notify parent
    /*
     * 1. filter based on search term & selected types
     * 2. filter based on if completed / ascending/descending time & check filter applies
     * 3. call onFilter with the filtered and sorted tasks to update the parent component (TaskCard)
     */
    useEffect(() => {
        const filteredAndSortedTasks = tasks
            .filter(task => 
                task.fuzzyMatch(searchTerm) && 
                selectedTypes.has(task.type.type)
            )
            .sort((a, b) => {
                if (checkFilter === 'completed') {
                    const completionComparison = b.isComplete - a.isComplete;
                    if (completionComparison !== 0) return completionComparison;
                } else if (checkFilter === 'incomplete') {
                    const completionComparison = a.isComplete - b.isComplete;
                    if (completionComparison !== 0) return completionComparison;
                }
                if (timeFilter === 'ascending') {
                    return a.time - b.time;
                } else if (timeFilter === 'descending') {
                    return b.time - a.time;
                }
                return 0;
            });
        onFilter(filteredAndSortedTasks);
    }, [tasks, searchTerm, checkFilter, timeFilter, selectedTypes, onFilter]);
    // if any of the above dependencies change, re-run the filter and sort

    return (
        <div className="filter-container">
            <input
                type="text"
                className="search-input"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <button 
                className={`filter-button ${checkFilter !== 'none' ? 'active' : ''}`}
                onClick={toggleCheckFilter}
                title="Filter by completion status"
            >
                Status {getCheckFilterSymbol()}
            </button>
            
            <button 
                className={`filter-button ${timeFilter !== 'none' ? 'active' : ''}`}
                onClick={toggleTimeFilter}
                title="Sort by time"
            >
                Time {getTimeFilterSymbol()}
            </button>
            
            <div className="filter-dropdown-wrapper">
                <button 
                    ref={typeFilterButtonRef}
                    className={`filter-button ${selectedTypes.size !== helper.TaskType.getTypes().length ? 'active' : ''}`}
                    onClick={toggleTypeDropdown}
                    title="Filter by type"
                >
                    Type {selectedTypes.size === helper.TaskType.getTypes().length ? '-' : '↓'}
                </button>

                {showTypeDropdown && (
                    <div 
                        className="type-dropdown"
                        id="type-filter-container"
                    >
                    <div className="type-dropdown-header">
                        <span className="type-dropdown-title">Filter by Type</span>
                        <button className="select-all-button" onClick={toggleAllTypes}>
                            {getAllButtonText()}
                        </button>
                    </div>
                    <div className="type-options">
                        {helper.TaskType.getTypes().map(type => (
                            <div
                                key={type}
                                className={`type-option ${selectedTypes.has(type) ? 'selected' : ''}`}
                                onClick={() => toggleTypeSelection(type)}
                            >
                                <span>{selectedTypes.has(type) ? '✓' : ''}</span>
                                {type}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button 
                className="clear-filters"
                onClick={clearAllFilters}
                title="Clear all filters"
                disabled={!searchTerm && checkFilter === 'none' && timeFilter === 'none' && selectedTypes.size === helper.TaskType.getTypes().length}
            >
                Clear
            </button>
        </div>
        </div>
    );
}

export default TaskPageFilter;
