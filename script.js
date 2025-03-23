const timerMode = document.getElementById('timerMode');
        const screen = document.getElementById('screen');
        const focusBtn = document.getElementById('focusBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const sessionValue = document.getElementById('sessionValue');
        const breakValue = document.getElementById('breakValue');
        const sessionDial = document.getElementById('sessionDial');
        const breakDial = document.getElementById('breakDial');
        const sessionPlus = document.getElementById('sessionPlus');
        const sessionMinus = document.getElementById('sessionMinus');
        const breakPlus = document.getElementById('breakPlus');
        const breakMinus = document.getElementById('breakMinus');
        const statusLed = document.getElementById('statusLed');

        // DOM Elements - Todo List
        const todoInput = document.getElementById('todoInput');
        const addTodoBtn = document.getElementById('addTodoBtn');
        const todoList = document.getElementById('todoList');

        // Timer variables
        let countdown;
        let isRunning = false;
        let currentMode = 'session'; // 'session' or 'break'
        let sessionLength = 25;
        let breakLength = 5;
        let timeLeft = sessionLength * 60; // in seconds

        // Audio for notifications
        const alarmSound = document.getElementById('alarmSound');

        // Update session length - Allow adjustments when not running
        function updateSessionLength(change) {
            if (!isRunning) {
                sessionLength = Math.max(1, Math.min(60, sessionLength + change));
                sessionValue.textContent = sessionLength;
                
                if (currentMode === 'session') {
                    timeLeft = sessionLength * 60;
                    updateDisplay();
                }
                
                updateSessionDial();
            }
        }

        // Update break length - Allow adjustments when not running
        function updateBreakLength(change) {
            if (!isRunning) {
                breakLength = Math.max(1, Math.min(30, breakLength + change));
                breakValue.textContent = breakLength;
                
                if (currentMode === 'break') {
                    timeLeft = breakLength * 60;
                    updateDisplay();
                }
                
                updateBreakDial();
            }
        }

        // Update dial positions
        function updateSessionDial() {
            // Map 1-60 to 0-180 degrees
            const angle = (sessionLength - 1) * (180 / 59);
            sessionDial.style.setProperty('--session-angle', angle);
        }

        function updateBreakDial() {
            // Map 1-30 to 0-180 degrees
            const angle = (breakLength - 1) * (180 / 29);
            breakDial.style.setProperty('--break-angle', angle);
        }

        // Update timer display
        function updateDisplay() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // Function to play alarm sound with user interaction
        function playAlarmSound() {
            // Reset the audio to the beginning
            alarmSound.currentTime = 0;
            
            // Play the sound
            alarmSound.play().catch(error => {
                console.error("Error playing alarm sound:", error);
                // Create a user interaction to allow sound to play in the future
                alert("Time's up! Click OK to continue.");
            });
        }

        // Start timer
        function startTimer() {
            if (isRunning) return;
            
            isRunning = true;
            statusLed.style.animation = 'blink 0.5s infinite';
            
            countdown = setInterval(() => {
                timeLeft--;
                updateDisplay();
                
                if (timeLeft <= 0) {
                    clearInterval(countdown);
                    isRunning = false; // Reset running state
                    
                    playAlarmSound(); // Play alarm sound
                    
                    // Switch modes
                    if (currentMode === 'session') {
                        currentMode = 'break';
                        timerMode.textContent = 'BREAK';
                        screen.classList.add('break-mode');
                        timeLeft = breakLength * 60;
                    } else {
                        currentMode = 'session';
                        timerMode.textContent = 'SESSION';
                        screen.classList.remove('break-mode');
                        timeLeft = sessionLength * 60;
                    }
                    
                    updateDisplay();
                    
                    // Start next phase after a short delay to allow the alarm to play
                    setTimeout(() => {
                        if (!isRunning) { // Check again to prevent double-starting
                            startTimer();
                        }
                    }, 1000); // 1 second delay
                }
            }, 1000);
        }

        // Pause timer
        function pauseTimer() {
            clearInterval(countdown);
            isRunning = false;
            statusLed.style.animation = 'blink 2s infinite';
        }

        // Reset timer
        function resetTimer() {
            clearInterval(countdown);
            isRunning = false;
            currentMode = 'session';
            timerMode.textContent = 'SESSION';
            screen.classList.remove('break-mode');
            timeLeft = sessionLength * 60;
            updateDisplay();
            statusLed.style.animation = 'blink 2s infinite';
        }

        // Add function to manually switch between session and break
        function switchMode() {
            if (isRunning) return; // Only allow switching when not running
            
            if (currentMode === 'session') {
                currentMode = 'break';
                timerMode.textContent = 'BREAK';
                screen.classList.add('break-mode');
                timeLeft = breakLength * 60;
            } else {
                currentMode = 'session';
                timerMode.textContent = 'SESSION';
                screen.classList.remove('break-mode');
                timeLeft = sessionLength * 60;
            }
            
            updateDisplay();
        }

        // Event Listeners - Timer Controls
        focusBtn.addEventListener('click', startTimer);
        pauseBtn.addEventListener('click', pauseTimer);
        resetBtn.addEventListener('click', resetTimer);
        
        // Double-click on timer mode to toggle between session and break
        timerMode.addEventListener('dblclick', switchMode);
        
        // Event Listeners - Session Controls
        sessionPlus.addEventListener('click', () => updateSessionLength(1));
        sessionMinus.addEventListener('click', () => updateSessionLength(-1));
        
        // Event Listeners - Break Controls
        breakPlus.addEventListener('click', () => updateBreakLength(1));
        breakMinus.addEventListener('click', () => updateBreakLength(-1));
        
        // Initialize display
        updateDisplay();
        
        // To-Do List Functionality
        function addTodo() {
            const todoText = todoInput.value.trim();
            if (todoText === '') return;
            
            // Create list item
            const li = document.createElement('li');
            li.className = 'todo-item';
            
            // Create checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'todo-checkbox';
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    li.classList.add('completed');
                } else {
                    li.classList.remove('completed');
                }
                saveToLocalStorage();
            });
            
            // Create todo text
            const span = document.createElement('span');
            span.className = 'todo-text';
            span.textContent = todoText;
            
            // Create delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'todo-delete';
            deleteBtn.innerHTML = '×';
            deleteBtn.addEventListener('click', function() {
                li.remove();
                saveToLocalStorage();
            });
            
            // Add elements to list item
            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);
            
            // Add list item to todo list
            todoList.appendChild(li);
            
            // Clear input
            todoInput.value = '';
            
            // Save to local storage
            saveToLocalStorage();
        }
        
        // Event listeners for todo functionality
        addTodoBtn.addEventListener('click', addTodo);
        todoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTodo();
            }
        });
        
        // Local Storage Functions
        function saveToLocalStorage() {
            const todos = [];
            document.querySelectorAll('.todo-item').forEach(item => {
                const todoText = item.querySelector('.todo-text').textContent;
                const isCompleted = item.classList.contains('completed');
                todos.push({
                    text: todoText,
                    completed: isCompleted
                });
            });
            
            localStorage.setItem('pomodoro-todos', JSON.stringify(todos));
        }
        
        function loadFromLocalStorage() {
            const storedTodos = localStorage.getItem('pomodoro-todos');
            if (storedTodos) {
                const todos = JSON.parse(storedTodos);
                todos.forEach(todo => {
                    // Create list item
                    const li = document.createElement('li');
                    li.className = 'todo-item';
                    if (todo.completed) {
                        li.classList.add('completed');
                    }
                    
                    // Create checkbox
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'todo-checkbox';
                    checkbox.checked = todo.completed;
                    checkbox.addEventListener('change', function() {
                        if (this.checked) {
                            li.classList.add('completed');
                        } else {
                            li.classList.remove('completed');
                        }
                        saveToLocalStorage();
                    });
                    
                    // to do text
                    const span = document.createElement('span');
                    span.className = 'todo-text';
                    span.textContent = todo.text;
                    
                    // del btn
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'todo-delete';
                    deleteBtn.innerHTML = '×';
                    deleteBtn.addEventListener('click', function() {
                        li.remove();
                        saveToLocalStorage();
                    });
                    
                    // Add elements to list item
                    li.appendChild(checkbox);
                    li.appendChild(span);
                    li.appendChild(deleteBtn);
                    
                    // Add list item to todo list
                    todoList.appendChild(li);
                });
            }
        }
        
        // Initialize app
        loadFromLocalStorage();