import React from "react";
import TaskCard from "./TaskCard";

const BoardView = ({ tasks }) => {
  if (!Array.isArray(tasks)) {
    // Можно вернуть какой-то fallback (например, пустой div или сообщение)
    return <div>No tasks available</div>;
  }

  return (
    <div className='w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 2xl:gap-10'>
      {tasks.map((task, index) => (
        <TaskCard task={task} key={index} />
      ))}
    </div>
  );
};

export default BoardView;
