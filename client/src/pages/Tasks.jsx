import React, { useState } from "react";
import { FaList, FaRegCalendar } from "react-icons/fa";
import { MdGridView } from "react-icons/md";
import { useParams } from "react-router-dom";
import Loading from "../components/Loader";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import Tabs from "../components/Tabs";
import BoardView from "../components/BoardView";
import Table from "../components/task/Table";
import AddTask from "../components/task/AddTask";
import { useGetAllTaskQuery } from "../redux/slices/api/taskApiSlice";
import CalendarView from "../components/task/CalendarView";
import { useGetTeamListQuery } from "../redux/slices/api/userApiSlice";

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
  { title: "Calendar View", icon: <FaRegCalendar /> }, 
];

const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
};

const Tasks = () => {
    const params = useParams();
    const [selected, setSelected] = useState(0);
    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(""); // Состояние для хранения выбранного пользователя
    const { data: teamData } = useGetTeamListQuery();
  
    const status = params?.status || "";
  
    const { data, isLoading } = useGetAllTaskQuery({
      strQuery: status,
      isTrashed: "",
      search: "",
      userId: selectedUserId, // Передаем userId в запрос
    });
  
    // Фильтрация подзадач по выбранному пользователю, если выбран конкретный пользователь
    const filteredTasks = selectedUserId
      ? data?.tasks.map(task => {
          // Фильтруем подзадачи для каждой задачи
          const filteredSubTasks = task.subTasks.filter(subtask =>
            subtask.team.some(user => user._id === selectedUserId)
          );
  
          return {
            ...task,
            subTasks: filteredSubTasks, // Оставляем только подзадачи для выбранного пользователя
          };
        })
      : data?.tasks; // Если выбран "All Users", не фильтруем подзадачи
  
    return isLoading ? (
      <div className="py-10">
        <Loading />
      </div>
    ) : (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <Title title={status ? `${status} Tasks` : "Tasks"} />
  
          {!status && (
            <Button
              onClick={() => setOpen(true)}
              label="Create Task"
              icon={<IoMdAdd className="text-lg" />}
              className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md py-2 2xl:py-2.5"
            />
          )}
        </div>
  
        {/* Добавьте выпадающий список для выбора пользователя */}
        <div className="mb-4">
          <label htmlFor="userFilter" className="mr-2">Filter by user:</label>
          <select
            id="userFilter"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Users</option>
            {teamData?.map(user => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>
        </div>
  
        <Tabs tabs={TABS} setSelected={setSelected}>
          {selected === 0 ? (
            <BoardView tasks={filteredTasks} />
          ) : selected === 1 ? (
            <div className="w-full">
              <Table tasks={filteredTasks} selectedUserId={selectedUserId} />
            </div>
          ) : (
            <CalendarView tasks={filteredTasks} />
          )}
        </Tabs>
  
        <AddTask open={open} setOpen={setOpen} />
      </div>
    );
  };
  
  
  export default Tasks;
  
