import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";

const localizer = momentLocalizer(moment);

const CalendarView = ({ tasks }) => {
  const navigate = useNavigate();

  // Маппинг цветов для разных типов задач
  const getTaskBackgroundColor = (task) => {
    switch (task.stage) {
      case 'todo':
        return "rgb(37 99 235 / var(--tw-bg-opacity))"; 
      case 'completed':
        return 'rgb(22 163 74 / var(--tw-bg-opacity))';
      case 'in progress':
        return 'rgb(202 138 4 / var(--tw-bg-opacity))'; 
      default:
        return '#4D0A4DFF'; 
    }
  };

  const events = tasks.map((task) => ({
    title: task.title,
    start: new Date(task.date),
    end: new Date(task.date),
    allDay: true,
    onClick: () => navigate(`/task/${task._id}`), // This handles the click and navigates to the task details page
  }));

  return (
    <div style={{ height: 500 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        onSelectEvent={(event) => event.onClick()}
        eventPropGetter={(event) => {
          const task = tasks.find((task) => task.title === event.title); // Найти задачу по названию
          const backgroundColor = getTaskBackgroundColor(task); // Получить цвет для задачи
          return {
            style: {
              backgroundColor: backgroundColor, // Используем динамический цвет
              color: "white",
              borderRadius: "5px",
            },
          };
        }}
      />
    </div>
  );
};



export default CalendarView;
