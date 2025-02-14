import React from "react";
import {
  MdAttachFile,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { TASK_TYPE_TABLE, formatDate } from "../../utils";
import clsx from "clsx";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const Table = ({ tasks, selectedUserId }) => {

  const TableHeader = () => (
    <thead className='w-full border-b border-gray-300'>
      <tr className='w-full text-black text-left'>
        <th className='py-2 px-4'>Date of Created</th>
        <th className='py-2 px-4'>Applicant</th>
        <th className='py-2 px-4'>Order Name</th>
        <th className='py-2 px-4'>Duration</th>
        <th className='py-2 px-4'>Project Name</th>
        <th className='py-2 px-4'>Status</th>
        <th className='py-2 px-4'>Export</th>
      </tr>
    </thead>
  );

  const TableRow = ({ task, selectedUserId }) => {
    const getAllApplicants = (team) => {
      return team.map(user => user.name).join(", ");
    };

    const calculateDuration = (activities, userId) => {
      let totalDuration = 0; // Общая продолжительность в миллисекундах
      let startTime = null; // Время начала задачи

      // Проходим по всем активностям
      activities.forEach(activity => {
        if (activity.type === 'started' && (!userId || activity.by === userId)) {
          // Если активность — "started" и соответствует выбранному пользователю (или пользователь не выбран)
          startTime = new Date(activity.date); // Запоминаем время начала
        } else if (activity.type === 'completed' && startTime && (!userId || activity.by === userId)) {
          // Если активность — "completed" и есть время начала
          const endTime = new Date(activity.date); // Получаем время завершения
          totalDuration += endTime - startTime; // Добавляем разницу к общей продолжительности
          startTime = null; // Сбрасываем время начала
        }
      });

      return totalDuration; // Возвращаем общую продолжительность в миллисекундах
    };

    const formatDuration = (duration) => {
      const hours = Math.floor(duration / (1000 * 60 * 60)); // Переводим миллисекунды в часы
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60)); // Остаток в минуты
      return `${hours}h ${minutes}m`; // Форматируем в "часы:минуты"
    };

    // Рассчитываем продолжительность для задачи
    const duration = calculateDuration(task.activities, selectedUserId);
    const formattedDuration = formatDuration(duration);

    return (
      <tr className='border-b border-gray-200 text-gray-600 hover:bg-gray-300/10'>
        {/* Date of Created */}
        <td className='py-2 px-4 whitespace-nowrap'>
          <span className='text-sm text-gray-600'>
            {formatDate(new Date(task?.date))}
          </span>
        </td>

        {/* Applicant */}
        <td className='py-2 px-4 whitespace-nowrap'>
          <span className='text-sm text-gray-600'>
            {selectedUserId
              ? task?.team?.find(user => user._id === selectedUserId)?.name || task?.team?.[0]?.name
              : getAllApplicants(task?.team)}
          </span>
        </td>

        {/* Order Name */}
        <td className='py-2 px-4 whitespace-nowrap'>
          <span className='text-sm text-gray-600'>
            {task?.orderName || "-"}
          </span>
        </td>

        {/* Duration */}
        <td className='py-2 px-4 whitespace-nowrap'>
          <span className='text-sm text-gray-600'>
            {formattedDuration}
          </span>
        </td>

        {/* Project Name */}
        <td className='py-2 px-4 whitespace-nowrap'>
          <span className='text-sm text-gray-600'>
            {task?.title}
            {/* Ссылка на задачу */}
            <a
              href={`/task/${task?._id}`}
              className="ml-2 text-blue-500 hover:underline"
              target="_blank"
            >
              Detail
            </a>
          </span>
        </td>

        {/* Status */}
        <td className='py-2 px-4 whitespace-nowrap'>
          <span
            className={clsx(
              TASK_TYPE_TABLE[task?.stage]?.background,
              "px-3 py-1 rounded-full",
              TASK_TYPE_TABLE[task?.stage]?.text
            )}
          >
            {task?.stage}
          </span>
        </td>

        {/* Export */}
        <td className='py-2 px-4 whitespace-nowrap'>
          <button className="flex items-center text-sm text-gray-600 hover:text-blue-500">
            <MdAttachFile className="mr-1" />
            Download
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className='bg-white px-2 md:px-4 pt-4 pb-9 shadow-md rounded'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <TableHeader />
          <tbody>
            {tasks.map((task, index) => (
              <TableRow key={index} task={task} selectedUserId={selectedUserId} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
