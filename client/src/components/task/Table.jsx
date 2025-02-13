import React, { useState } from "react";
import { BiMessageAltDetail } from "react-icons/bi";
import {
  MdAttachFile,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { toast } from "sonner";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, formatDate, SUBTASK_TYPE } from "../../utils";
import clsx from "clsx";
import { FaList } from "react-icons/fa";
import UserInfo from "../UserInfo";
import Button from "../Button";
import ConfirmatioDialog from "../Dialogs";
import { useTrashTaskMutation } from "../../redux/slices/api/taskApiSlice";
import AddTask from "./AddTask";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const Table = ({ tasks, selectedUserId }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);

  const [trashTask] = useTrashTaskMutation();

  const deleteClicks = (id) => {
    setSelected(id);
    setOpenDialog(true);
  };

  const editTaskHandler = (el) => {
    setSelected(el);
    setOpenEdit(true);
  }

  const deleteHandler = async () => {
    try {
      const result = await trashTask({
        id: selected,
        isTrashed: "trash",
      }).unwrap();
      toast.success(result?.message);
      setTimeout(() => {
        setOpenDialog(false);
      }, 500);
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.message || error.error);
    }
  };

  const TableHeader = () => (
    <thead className='w-full border-b border-gray-300'>
      <tr className='w-full text-black text-left'>
        <th className='py-2'>Date of Created</th>
        <th className='py-2'>Applicant</th>
        <th className='py-2'>Order Name</th>
        <th className='py-2'>Duration</th>
        <th className='py-2'>Project Name</th>
        <th className='py-2'>Status</th>
        <th className='py-2'>Export</th>
      </tr>
    </thead>
  );

  const TableRow = ({ task, selectedUserId }) => {
    const getAllApplicants = (team) => {
      return team.map(user => user.name).join(", ");
    };

    const getSubTaskData = (subTask) => {
      return {
        date: subTask?.date || task?.date,
        applicant: selectedUserId
          ? subTask?.team?.find(user => user._id === selectedUserId)?.name || task?.team?.[0]?.name
          : getAllApplicants(subTask?.team || task?.team),
        orderName: subTask?.title || "-",
        status: subTask?.stage || task?.stage,
      };
    };

    const subTaskData = task?.subTasks?.[0]
      ? getSubTaskData(task?.subTasks[0])
      : {
          date: task?.date,
          applicant: selectedUserId
            ? task?.team?.find(user => user._id === selectedUserId)?.name || task?.team?.[0]?.name || "No team"
            : getAllApplicants(task?.team),
          orderName: "-",
          status: task?.stage || "No stage",
        };

    return (
      <>
        <tr className='border-b border-gray-200 text-gray-600 hover:bg-gray-300/10'>
          {/* Date of Created */}
          <td className='py-2'>
            <span className='text-sm text-gray-600'>
              {formatDate(new Date(task?.date))}
            </span>
          </td>

          {/* Applicant */}
          <td className='py-2'>
            <span className='text-sm text-gray-600'>
              {selectedUserId
                ? task?.team?.find(user => user._id === selectedUserId)?.name || task?.team?.[0]?.name || "No team"
                : getAllApplicants(task?.team)}
            </span>
          </td>

          {/* Order Name */}
          <td className='py-2'>
            <span className='text-sm text-gray-600'>-</span>
          </td>

          {/* Duration */}
          <td className='py-2'>
            <span className='text-sm text-gray-600'>
              24h
            </span>
          </td>

          {/* Project Name */}
          <td className='py-2'>
            <span className='text-sm text-gray-600'>
              {task?.title}
            </span>
          </td>

          {/* Status */}
          <td className='py-2'>
            <span
              className={clsx(
                SUBTASK_TYPE[subTaskData.status]?.background,
                "px-3 py-1 rounded-full",
                SUBTASK_TYPE[subTaskData.status]?.text
              )}
            >
              {subTaskData.status}
            </span>   
          </td>

          {/* Export */}
          <td className='py-2'>
            <button className="flex items-center text-sm text-gray-600 hover:text-blue-500">
              <MdAttachFile className="mr-1" />
              Download
            </button>
          </td>
        </tr>

        {/* Подзадачи */}
        {task?.subTasks?.map((subTask) => {
          const subTaskData = getSubTaskData(subTask);
          return (
            <tr key={subTask._id} className='border-b border-gray-200 text-gray-600 hover:bg-gray-300/10'>
              {/* Date of Created */}
              <td className='py-2'>
                <span className='text-sm text-gray-600'>
                  {formatDate(new Date(subTaskData.date))}
                </span>
              </td>

              {/* Applicant */}
              <td className='py-2'>
                <span className='text-sm text-gray-600'>
                  {subTaskData.applicant || "No team"}
                </span>
              </td>

              {/* Order Name */}
              <td className='py-2'>
                <span className='text-sm text-gray-600'>
                  {subTaskData.orderName}
                </span>
              </td>

              {/* Duration */}
              <td className='py-2'>
                <span className='text-sm text-gray-600'>
                  24h
                </span>
              </td>

              {/* Project Name */}
              <td className='py-2'>
                <span className='text-sm text-gray-600'>
                  {task?.title}
                </span>
              </td>

              {/* Status */}
              <td className='py-2'>
                <span
                  className={clsx(
                    SUBTASK_TYPE[subTaskData.status]?.background,
                    "px-3 py-1 rounded-full",
                    SUBTASK_TYPE[subTaskData.status]?.text
                  )}
                >
                  {subTaskData.status}
                </span>      
              </td>

              {/* Export */}
              <td className='py-2'>
                <button className="flex items-center text-sm text-gray-600 hover:text-blue-500">
                  <MdAttachFile className="mr-1" />
                  Download
                </button>
              </td>
            </tr>
          );
        })}
      </>
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
