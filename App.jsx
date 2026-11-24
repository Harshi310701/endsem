import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState(() => {
  const savedTasks = localStorage.getItem('tasks');
  return savedTasks ? JSON.parse(savedTasks) : [];
});
  const [taskName, setTaskName] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [reminder, setReminder] = useState(null);
  useEffect(() => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}, [tasks]);

  // Add Task
  const addTask = (e) => {
    e.preventDefault();

    if (!taskName || !taskTime) {
      alert('Please enter task name and time!');
      return;
    }

    const newTask = {
      id: Date.now(),
      name: taskName,
      time: taskTime,
      completed: false,
      notified: false,
      snoozeUntil: null
    };

    setTasks([...tasks, newTask]);
    setTaskName('');
    setTaskTime('');
  };

  // Automatic reminder checker
  useEffect(() => {
    const interval = setInterval(() => {
      if (reminder) return;

      const now = new Date();

      const currentTime =
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0');

      const dueTask = tasks.find(task =>
        !task.completed &&
        (
          (task.snoozeUntil && Date.now() >= task.snoozeUntil) ||
          (!task.notified && task.time === currentTime)
        )
      );

      if (dueTask) {
        setReminder(dueTask);

        setTasks(previous =>
          previous.map(task =>
            task.id === dueTask.id
              ? { ...task, notified: true, snoozeUntil: null }
              : task
          )
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks, reminder]);

  // Snooze for 5 minutes
  const snoozeTask = () => {
    setTasks(previous =>
      previous.map(task =>
        task.id === reminder.id
          ? {
              ...task,
              snoozeUntil: Date.now() + 5 * 60 * 1000
            }
          : task
      )
    );

    setReminder(null);
  };

  // Mark completed
  const completeTask = (id) => {
    setTasks(previous =>
      previous.map(task =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );

    if (reminder && reminder.id === id) {
      setReminder(null);
    }
  };

  // Delete task
  const deleteTask = (id) => {
    setTasks(previous =>
      previous.filter(task => task.id !== id)
    );

    if (reminder && reminder.id === id) {
      setReminder(null);
    }
  };

  return (
    <div className="container">

      <h1>Daily Routine Reminder</h1>
      <p>Organize your day, one task at a time!</p>

      {/* Reminder Notification */}
      {reminder && (
        <div className="reminder-box">
          <h2>Time for your task!</h2>
          <h3>{reminder.name}</h3>
          <p>Scheduled Time: {reminder.time}</p>

          <button onClick={() => completeTask(reminder.id)}>
            Mark as Done
          </button>

          <button onClick={snoozeTask}>
            Snooze 5 Minutes
          </button>
        </div>
      )}

      <div className="task-box">

        <h2>My Daily Tasks</h2>

        <h3>Total Tasks: {tasks.length}</h3>

        <h3>
          Completed: {tasks.filter(t => t.completed).length}
        </h3>

        <form onSubmit={addTask}>

          <input
            type="text"
            placeholder="Enter your task"
            value={taskName}
            onChange={e => setTaskName(e.target.value)}
          />

          <input
            type="time"
            value={taskTime}
            onChange={e => setTaskTime(e.target.value)}
          />

          <button type="submit">Add Task</button>

        </form>

        <h2>Today's Schedule</h2>

        {tasks.length === 0 ? (
          <p>No tasks added yet.</p>
        ) : (
          tasks.map(task => (
            <div className="task-item" key={task.id}>

              <span className={task.completed ? 'completed' : ''}>
                {task.name} - {task.time}
              </span>

              <button onClick={() => completeTask(task.id)}>
                {task.completed ? 'Undo' : 'Done'}
              </button>

              <button onClick={() => deleteTask(task.id)}>
                Delete
              </button>

              {task.snoozeUntil && (
                <p>Snoozed for 5 minutes</p>
              )}

            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default App;