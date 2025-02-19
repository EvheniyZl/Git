import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";

const localizer = momentLocalizer(moment);

const CalendarView = ({ tasks }) => {
  const navigate = useNavigate();

  // Маппинг цветов для разных типов задач и подзадач
  const getTaskBackgroundColor = (stage) => {
    switch (stage) {
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

  // Создание массива событий для календаря
  const events = tasks.flatMap((task) => {
    const taskEvents = [{
      title: task.title,
      start: new Date(task.date),
      end: new Date(task.date),
      allDay: true,
      onClick: () => navigate(`/task/${task._id}`),
      stage: task.stage, // Добавляем стадию задачи
    }];

    return [...taskEvents];
  });

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
          const backgroundColor = getTaskBackgroundColor(event.stage); // Получить цвет для задачи или подзадачи
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