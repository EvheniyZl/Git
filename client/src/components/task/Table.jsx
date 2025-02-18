import React from "react";
import { MdAttachFile} from "react-icons/md";
import { TASK_TYPE_TABLE, formatDate } from "../../utils";
import clsx from "clsx";
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts;

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

const generatePDF = (tasks, selectedUserId) => {
  const filteredActivities = tasks.reduce((acc, task) => {
    const userActivities = task.activities.filter(activity => {
      return !selectedUserId || activity.by === selectedUserId;
    });

    if (userActivities.length > 0) {
      acc.push({
        title: task.title,
        activities: userActivities,
      });
    }

    return acc;
  }, []);

  // Расчёт общего времени
  const totalDuration = tasks.reduce((acc, task) => {
    return acc + calculateDuration(task.activities, selectedUserId);
  }, 0);

  const formatDuration = (duration) => {
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formattedTotalDuration = formatDuration(totalDuration);

  const documentDefinition = {
    content: [
      { text: 'Activities Report', style: 'header' },
      ...filteredActivities.map(task => ({
        text: `Project Name: ${task.title}`,
        style: 'subheader',
        margin: [0, 10, 0, 5],
      })),
      ...filteredActivities.flatMap(task =>
        task.activities.map(activity => ({
          text: [
            { text: `Activity Type: ${activity.type}\n`, style: 'activity' },
            { text: `Activity: ${activity.activity}\n`, style: 'activity' },
            { text: `Date: ${new Date(activity.date).toLocaleString()}\n`, style: 'activity' },
          ],
          margin: [0, 0, 0, 10],
        }))
      ),
      // Добавление информации о затраченном времени
      {
        text: `Total Time Spent: ${formattedTotalDuration}`,
        style: 'footer',
        margin: [0, 20, 0, 0],
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5],
      },
      activity: {
        fontSize: 12,
        margin: [0, 0, 0, 5],
      },
      footer: {
        fontSize: 14,
        italics: true,
        margin: [0, 10, 0, 0],
      },
    },
  };

  pdfMake.createPdf(documentDefinition).download('activities_report.pdf');
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
          onClick={() => generatePDF(tasks, selectedUserId)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Download PDF
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
            onClick={() => generatePDF([task], selectedUserId)}
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