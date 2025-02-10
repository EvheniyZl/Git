import clsx from "clsx";
import React, { useState } from "react";
import {
  MdAttachFile,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineEdit,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, formatDate } from "../utils";
import TaskDialog from "./task/TaskDialog";
import { BiMessageAltDetail, BiPin } from "react-icons/bi";
import { FaList } from "react-icons/fa";
import UserInfo from "./UserInfo";
import { IoMdAdd } from "react-icons/io";
import AddSubTask from "./task/AddSubTask";
import { RiDeleteBin6Line } from "react-icons/ri";
import EditSubTask from "./task/EditSubTask";
import { useDeleteSubTaskMutation } from "../redux/slices/api/taskApiSlice";
import { toast } from "sonner";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const TaskCard = ({ task }) => {
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [subTasksOpen, setSubTasksOpen] = useState(false); // Состояние для открытия подзадач
  const [subTaskToEdit, setSubTaskToEdit] = useState(null); // Для редактирования подзадачи
  const [deleteSubTask] = useDeleteSubTaskMutation();


  // Обработчик клика по стрелке
  const toggleSubTasks = () => {
    setSubTasksOpen(!subTasksOpen);
  };

  const handleEditSubTask = (subTask) => {
    setSubTaskToEdit(subTask); // Устанавливаем подзадачу для редактирования
    setOpen(true); // Открываем модальное окно редактирования
  };

  const handleAddSubTask = () => {
    setSubTaskToEdit(null); // Сбрасываем состояние редактируемой подзадачи
    setOpen(true); // Открываем модальное окно добавления подзадачи
  };

  const handleDeleteSubTask = async (subTaskId) => {
    try {
      const res = await deleteSubTask({ taskId: task._id, subTaskId }).unwrap();
      toast.success(res.message); // Show success message
      setTimeout(() => {
        window.location.reload(); // Reload the page after 500ms
      }, 500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error); // Show error message
    }
  };
  

  return (
    <>
      <div className='w-full h-fit bg-white shadow-md p-4 rounded'>
        <div className='w-full flex justify-between'>
          <div
            className={clsx(
              "flex flex-1 gap-1 items-center text-sm font-medium",
              PRIOTITYSTYELS[task?.priority]
            )}
          >
            <span className='text-lg'>{ICONS[task?.priority]}</span>
            <span className='uppercase'>{task?.priority} Priority</span>
          </div>

          {user?.isAdmin && <TaskDialog task={task} />}
        </div>

        <div className='flex items-center gap-2'>
          <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])} />
          <h4 className='line-clamp-1 text-black'>{task?.title}</h4>
        </div>
        <span className='text-sm text-gray-600'>{formatDate(new Date(task?.date))}</span>

        <div className='w-full border-t border-gray-200 my-2' />
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-3'>
            <div className='flex gap-1 items-center text-sm text-gray-600'>
              <BiMessageAltDetail />
              <span>{task?.activities?.length}</span>
            </div>
            <div className='flex gap-1 items-center text-sm text-gray-600 '>
              <MdAttachFile />
              <span>{task?.assets?.length}</span>
            </div>
            <div className='flex gap-1 items-center text-sm text-gray-600 '>
              <FaList />
              <span>0/{task?.subTasks?.length}</span>
            </div>
          </div>

          <div className='flex flex-row-reverse'>
            {task?.team?.map((m, index) => (
              <div
                key={index}
                className={clsx(
                  "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                  BGS[index % BGS?.length]
                )}
              >
                <UserInfo user={m} />
              </div>
            ))}
          </div>
        </div>

        {/* sub tasks */}
        {task?.subTasks?.length > 0 ? (
          <div className="py-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-base text-black font-semibold">
              <span className="flex items-center gap-2">
              <span>Sub Tasks</span>
                {subTasksOpen ? (
                  <MdKeyboardArrowUp onClick={toggleSubTasks} className="cursor-pointer" />
                ) : (
                  <MdKeyboardArrowDown onClick={toggleSubTasks} className="cursor-pointer" />
                )}
              </span>
              </h5>

              <div className="flex gap-2">      
      </div>
            </div>
            {subTasksOpen &&
              task?.subTasks.map((subTask, index) => (
                <div key={index} className="mb-4">
                  <h5 className="text-base text-black font-semibold">
                  <div className="flex gap-1 items-center text-sm">
                    <BiPin className="flex-shrink-0" />
                    <span className="overflow-ellipsis overflow-hidden">{subTask.title}</span>
                  </div>
                </h5>


                  <div className='w-full border-t border-gray-200 my-2' />
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-3'>
                      <div className='flex gap-1 items-center text-sm text-gray-600'>
                        <span>{formatDate(new Date(subTask?.date))}</span>
                      </div>
                      <div className='flex gap-1 items-center text-sm text-gray-600'>
                      <MdOutlineEdit onClick={() => handleEditSubTask(subTask)} className="cursor-pointer text-blue-500"/>
                      <RiDeleteBin6Line
                      onClick={() => handleDeleteSubTask(subTask._id)}className="cursor-pointer text-red-500"
                      />
                        {/* <span className="bg-blue-600/10 px-3 py-1 rounded-full text-blue-700 font-medium">
                          {subTask?.tag}
                        </span> */}

                      </div>
                    </div>

                    <div className='flex flex-row-reverse'>
                      {subTask.team.map((m, index) => (
                        <div
                          key={index}
                          className={clsx(
                            "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                            BGS[index % BGS?.length]
                          )}
                        >
                          <UserInfo user={m} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="py-4 border-t border-gray-200">
            <span className="text-gray-500">No Sub Task</span>
          </div>
        )}
        <div className='w-full pb-2'>
          <button onClick={handleAddSubTask} className="flex items-center">
            <IoMdAdd />
            <span className="ml-2">Add Subtask</span>
          </button>
        </div>
      </div>
      {subTaskToEdit ? (
        <EditSubTask open={open} setOpen={setOpen} id={task._id} subTask={subTaskToEdit} />
      ) : (
        <AddSubTask open={open} setOpen={setOpen} id={task._id} />
      )}
    </>
  );
};

export default TaskCard;