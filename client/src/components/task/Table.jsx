import React from "react";
import { MdAttachFile, MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp } from "react-icons/md";
import { TASK_TYPE_TABLE, formatDate } from "../../utils";
import clsx from "clsx";
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import * as XLSX from "xlsx"; // Импортируем библиотеку для работы с Excel
import { saveAs } from "file-saver"; // Для скачивания файла

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

// Функция для вычисления продолжительности
const calculateDuration = (activities, userId) => {
  let totalDuration = 0;
  let startTime = null;

  activities.forEach(activity => {
    if (activity.type === 'started' && (!userId || activity.by === userId)) {
      startTime = new Date(activity.date);
    } else if (activity.type === 'completed' && startTime && (!userId || activity.by === userId)) {
      const endTime = new Date(activity.date);
      totalDuration += endTime - startTime;
      startTime = null; // Сбрасываем startTime после завершения интервала
    }
  });

  return totalDuration;
};

const downloadReport = (tasks, selectedUserId) => {
  const data = [];

  tasks.forEach(task => {
    let taskDuration = 0;
    let startTime = null;

    task.activities.forEach(activity => {
      if (activity.type === 'started' && (!selectedUserId || activity.by === selectedUserId)) {
        startTime = new Date(activity.date);
      } else if (activity.type === 'completed' && startTime && (!selectedUserId || activity.by === selectedUserId)) {
        const endTime = new Date(activity.date);
        const duration = endTime - startTime;
        taskDuration += duration;

        const formattedDuration = new Date(duration).toISOString().substr(11, 8); // Форматируем продолжительность в часы и минуты

        data.push({
          "Applicant": selectedUserId ? task?.team?.find(user => user._id === selectedUserId)?.name || task?.team?.[0]?.name : task?.team?.map(user => user.name).join(", "),
          "Order Name": task?.orderName || "-",
          "Activity Type": activity.type,
          "Activity Time": formatDate(new Date(activity.date)),
          "Duration": formattedDuration,
          "Project Name": task?.title,
          "Status": task?.stage,
        });

        startTime = null; // Сбрасываем startTime после завершения интервала
      }
    });

    // Добавляем строку с суммарной продолжительностью задачи внизу
    if (taskDuration > 0) {
      const formattedDuration = new Date(taskDuration).toISOString().substr(11, 8);
      data.push({
        "Applicant": "",
        "Order Name": "",
        "Activity Type": "",
        "Activity Time": "Total Duration",
        "Duration": formattedDuration,
        "Project Name": task?.title,
        "Status": "",
      });
    }
  });

  // Создаем рабочую книгу
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "User Activities");

  // Генерируем файл и сохраняем его
  const fileName = selectedUserId ? `report_${selectedUserId}.xlsx` : "all_reports.xlsx";
  const file = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([file]), fileName);
};

// Компонент для таблицы
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
        <th className='py-2 px-4'>
          <button 
            className="flex items-center text-sm text-gray-600 hover:text-blue-500"
            onClick={() => downloadReport(tasks, selectedUserId)}
          >
            <MdAttachFile className="mr-1" />
            Download all
          </button>
        </th>
      </tr>
    </thead>
  );

  const TableRow = ({ task, selectedUserId }) => {
    const getAllApplicants = (team) => {
      return team.map(user => user.name).join(", ");
    };

    const formatDuration = (duration) => {
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    };

    const duration = calculateDuration(task.activities, selectedUserId);
    const formattedDuration = formatDuration(duration);

    return (
      <tr className='border-b border-gray-200 text-gray-600 hover:bg-gray-300/10'>
        <td className='py-2 px-4 whitespace-nowrap'>
          <span className='text-sm text-gray-600'>{formatDate(new Date(task?.date))}</span>
        </td>
        <td className='py-2 px-4 whitespace-nowrap'>
          <span className='text-sm text-gray-600'>
            {selectedUserId ? task?.team?.find(user => user._id === selectedUserId)?.name || task?.team?.[0]?.name : getAllApplicants(task?.team)}
          </span>
        </td>
        <td className='py-2 px-4 whitespace-nowrap'>
          <span className='text-sm text-gray-600'>{task?.orderName || "-"}</span>
        </td>
        <td className='py-2 px-4 whitespace-nowrap'>
          <span className='text-sm text-gray-600'>{formattedDuration}</span>
        </td>
        <td className='py-2 px-4 whitespace-nowrap'>
          <span className='text-sm text-gray-600'>
            {task?.title}
            <a href={`/task/${task?._id}`} className="ml-2 text-blue-500 hover:underline" target="_blank">Detail</a>
          </span>
        </td>
        <td className='py-2 px-4 whitespace-nowrap'>
          <span className={clsx(TASK_TYPE_TABLE[task?.stage]?.background, "px-3 py-1 rounded-full", TASK_TYPE_TABLE[task?.stage]?.text)}>
            {task?.stage}
          </span>
        </td>
        <td className='py-2 px-4 whitespace-nowrap'>
          <button 
            className="flex items-center text-sm text-gray-600 hover:text-blue-500"
            onClick={() => downloadReport([task], selectedUserId)}
          >
            <MdAttachFile className="mr-1" /> Download
          </button>
        </td>
      </tr>
    );
  };

  const calculateTaskData = () => {
    let totalDuration = 0;
    let taskCount = 0;

    tasks.forEach(task => {
      taskCount++;
      totalDuration += calculateDuration(task.activities, selectedUserId);
    });

    return { totalDuration, taskCount };
  };

  const { totalDuration, taskCount } = calculateTaskData();

  const formatTotalDuration = (duration) => {
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formattedTotalDuration = formatTotalDuration(totalDuration);

  const tasksPerDay = [
    { day: 'Monday', count: 0 },
    { day: 'Tuesday', count: 0 },
    { day: 'Wednesday', count: 0 },
    { day: 'Thursday', count: 0 },
    { day: 'Friday', count: 0 },
    { day: 'Saturday', count: 0 },
    { day: 'Sunday', count: 0 },
  ];

  tasks.forEach(task => {
    const dayOfWeek = new Date(task.date).getDay();
    tasksPerDay[dayOfWeek].count++;
  });

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

      <div className="mt-8 flex flex-wrap gap-4 md:flex-nowrap">
        <div className="w-full md:w-1/2 p-6 border rounded-lg shadow-lg bg-blue-600">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">⏳</span> Total Time Spent on Tasks:
          </h3>
          <p className="text-2xl font-bold text-white mt-2">{formattedTotalDuration}</p>

          <h3 className="text-lg font-semibold text-white mt-6 flex items-center">
            <span className="mr-2">📋</span> Total Number of Tasks:
          </h3>
          <p className="text-2xl font-bold text-white mt-2">{taskCount}</p>
        </div>

        <div className="w-full md:w-1/2 p-4 border rounded-lg bg-white">
          <h3 className="text-lg font-semibold text-blue-600">Tasks by Day of the Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tasksPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="#1D4ED8" />
              <YAxis stroke="#1D4ED8" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#1D4ED8"
                strokeWidth={2}
                dot={{ fill: '#1D4ED8', r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Table;