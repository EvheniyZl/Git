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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const [selectedUserId, setSelectedUserId] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { data: teamData } = useGetTeamListQuery();

  const status = params?.status || "";

  const { data, isLoading } = useGetAllTaskQuery({
    strQuery: status,
    isTrashed: "",
    search: "",
    userId: selectedUserId,
  });

  const filteredTasks = selectedUserId
    ? data?.tasks
        .filter((task) => {
          const taskDate = new Date(task.date);
          return (!startDate || taskDate >= startDate) && (!endDate || taskDate <= endDate);
        })
        .map((task) => {
          const filteredSubTasks = task.subTasks.filter((subtask) =>
            subtask.team.some((user) => user._id === selectedUserId)
          );
          return {
            ...task,
            subTasks: filteredSubTasks,
          };
        })
    : data?.tasks.filter((task) => {
        const taskDate = new Date(task.date);
        return (!startDate || taskDate >= startDate) && (!endDate || taskDate <= endDate);
      });

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

      {/* Фильтры: пользователь и дата */}
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Фильтр по пользователю */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="userFilter" className="mr-2">
            Filter by user:
          </label>
          <select
            id="userFilter"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Users</option>
            {teamData?.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Фильтр по дате */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="dateFilter" className="mr-2">
            Filter by date:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              className="w-full p-2 border rounded"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Табы и отображение задач */}
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