import clsx from "clsx";
import moment from "moment";
import React, { useState } from "react";
import { FaBug, FaTasks, FaThumbsUp, FaUser } from "react-icons/fa";
import { GrInProgress } from "react-icons/gr";
import {
  MdOutlineDoneAll,
  MdOutlineMessage,
} from "react-icons/md";
import { RxActivityLog } from "react-icons/rx";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import Tabs from "../components/Tabs";
import { TASK_TYPE, SUBTASK_TYPE, getInitials } from "../utils";
import Loading from "../components/Loader";
import Button from "../components/Button";
import { useGetSingleTaskQuery, usePostTaskActivityMutation, useUpdateActivityMutation, useDeleteActivityMutation } from "../redux/slices/api/taskApiSlice";
import UserInfo from "../components/UserInfo";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const TABS = [
  { title: "Task Detail", icon: <FaTasks /> },
  { title: "Activities/Timeline", icon: <RxActivityLog /> },
];

const TASKTYPEICON = {
  commented: (
    <div className='w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white'>
      <MdOutlineMessage />,
    </div>
  ),
  started: (
    <div className='w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white'>
      <FaThumbsUp size={20} />
    </div>
  ),
  assigned: (
    <div className='w-6 h-6 flex items-center justify-center rounded-full bg-gray-500 text-white'>
      <FaUser size={14} />
    </div>
  ),
  bug: (
    <div className='text-red-600'>
      <FaBug size={24} />
    </div>
  ),
  completed: (
    <div className='w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white'>
      <MdOutlineDoneAll size={24} />
    </div>
  ),
  "in progress": (
    <div className='w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 text-white'>
      <GrInProgress size={16} />
    </div>
  ),
};

const act_types = [
  "Started",
  "Completed",
  "In Progress",
  "Commented",
  "Bug",
  "Assigned",
];

const TaskDetails = () => {
  const { id } = useParams();
  const {data, isLoading, refetch} = useGetSingleTaskQuery(id);
  const [selected, setSelected] = useState(0);
  const task = data?.task;

  if(isLoading)
    return (
      <div className='w-full flex items-center justify-center h-screen'>
        <Loading />
      </div>
    );

  return (
    <div id="activities-container" className='w-full flex flex-col gap-3 mb-4 overflow-y-hidden'>
      <h1 className='text-2xl text-gray-600 font-bold'>{task?.title}</h1>

      <Tabs tabs={TABS} setSelected={setSelected}>
        {selected === 0 ? (
          <>
            <div className='w-full flex flex-col md:flex-row gap-5 2xl:gap-8 bg-white shadow-md p-8 overflow-y-auto'>
              {/* LEFT */}
              <div className='w-full md:w-1/2 space-y-8'>
                <div className='flex items-center gap-5'>
                  <div className={clsx("flex items-center gap-2")}>
                    <div
                      className={clsx(
                        "w-4 h-4 rounded-full",
                        TASK_TYPE[task.stage]
                      )}
                    />
                    <span className='text-black uppercase'>{task?.stage}</span>
                  </div>
                </div>

                <p className='text-gray-500'>
                  Created At: {new Date(task?.createdAt).toLocaleString('ru-RU')}
                </p>

                <div>
                  <div className='space-x-2'>
                    <span className='font-semibold'>Assets :</span>
                    <span>{task?.assets?.length}</span>
                  </div>
                </div>

                  <p className='text-gray-600 font-semibold test-sm'>
                    TASK TEAM
                  </p>
                  <div className='space-y-3'>
                    {task?.team?.map((m, index) => (
                      <div
                        key={index}
                        className='flex gap-4 py-2 items-center border-t border-gray-200'
                      >
                        <div
                          className={
                            "w-10 h-10 rounded-full text-white flex items-center justify-center text-sm -mr-1 bg-blue-600"
                          }
                        >
                          <span className='text-center'>
                            {getInitials(m?.name)}
                          </span>
                        </div>

                        <div>
                          <p className='text-lg font-semibold'>{m?.name}</p>
                          <span className='text-gray-500'>{m?.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
              </div>
              {/* RIGHT */}
              <div className='w-full md:w-1/2 space-y-8'>
                <p className='text-lg font-semibold'>ASSETS</p>

                <div className='w-full grid grid-cols-2 gap-4'>
                  {task?.assets?.map((el, index) => (
                    <img
                      key={index}
                      src={el}
                      alt={task?.title}
                      className='w-full rounded h-28 md:h-36 2xl:h-52 cursor-pointer transition-all duration-700 hover:scale-125 hover:z-50'
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <Activities activity={data?.task?.activities} id={id} refetch={refetch}/>
          </>
        )}
      </Tabs>
    </div>
  );
};

const Activities = ({ activity, id, refetch }) => {
  const [selected, setSelected] = useState(act_types[0]);
  const [text, setText] = useState("");
  const [editActivityId, setEditActivityId] = useState(null);
  const [editText, setEditText] = useState("");

  const [postActivity, { isLoading: isPosting }] = usePostTaskActivityMutation();
  const [updateActivity, { isLoading: isUpdating }] = useUpdateActivityMutation();
  const [deleteActivity, { isLoading: isDeleting }] = useDeleteActivityMutation();

  const handleSubmit = async () => {
    try {
      const activityData = {
        type: selected?.toLowerCase(),
        activity: text,
      };

      await postActivity({
        data: activityData,
        id,
      }).unwrap();

      setText("");
      toast.success("Activity added successfully");
      refetch();
    } catch (error) {
      console.log(error);
      toast.error("Failed to add activity");
    }
  };

  const handleEdit = async (activityId) => {
    try {
      await updateActivity({
        taskId: id,
        activityId,
        data: { activity: editText },
      }).unwrap();

      setEditActivityId(null);
      setEditText("");
      toast.success("Activity updated successfully");
      refetch();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update activity");
    }
  };

  const handleDelete = async (activityId) => {
    try {
      await deleteActivity({
        taskId: id,
        activityId,
      }).unwrap();

      toast.success("Activity deleted successfully");
      refetch();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete activity");
    }
  };

  const handleDownloadPdf = () => {
    const input = document.getElementById("activities-container");
    const buttons = document.querySelectorAll('button');  // или выбери по более точному селектору, если это необходимо
  
    buttons.forEach(button => button.style.display = "none");
  
    if (!input) {
      console.error("Element with id 'activities-container' not found.");
      toast.error("Failed to generate PDF: Element not found.");
      return;
    }
  
    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Если изображение превышает высоту страницы, разбиваем на несколько страниц
        const pageHeight = 297; // A4 height in mm
        let currentHeight = 0;
  
        // Добавление первой страницы
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        currentHeight += imgHeight;
  
        // Добавление последующих страниц, если контента больше одной страницы
        while (currentHeight > pageHeight) {
          pdf.addPage();
          currentHeight = 0;
          pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        }
  
        pdf.save("activities.pdf");
        buttons.forEach(button => button.style.display = "block");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
        toast.error("Failed to generate PDF.");
        buttons.forEach(button => button.style.display = "block");
      });
  };
  

  const Card = ({ item }) => {
    return (
      <div className='flex space-x-4'>
        <div className='flex flex-col items-center flex-shrink-0'>
          <div className='w-10 h-10 flex items-center justify-center'>
            {TASKTYPEICON[item?.type]}
          </div>
          <div className='w-full flex items-center'>
            <div className='w-0.5 bg-gray-300 h-full'></div>
          </div>
        </div>

        <div className='flex flex-col gap-y-1 mb-8'>
          <p className='font-semibold'>{item?.by?.name}</p>
          <div className='text-gray-500 space-y-2'>
            <span className='capitalize'>{item?.type} </span>
            <span className='text-sm'>{moment(item?.date).fromNow()}</span>
          </div>
          {editActivityId === item._id ? (
            <div className='flex gap-2'>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className='bg-white w-full mt-2 border border-gray-300 outline-none p-2 rounded-md focus:ring-2 ring-blue-500'
              />
              <Button
                type='button'
                label='Save'
                onClick={() => handleEdit(item._id)}
                className='bg-blue-600 text-white rounded'
              />
            </div>
          ) : (
            <div className='text-gray-700'>{item?.activity}</div>
          )}
          <div className='flex gap-2'>
            <Button
              type='button'
              label='Edit'
              onClick={() => {
                setEditActivityId(item._id);
                setEditText(item.activity);
              }}
              className='bg-yellow-500 text-white rounded'
            />
            <Button
              type='button'
              label='Delete'
              onClick={() => handleDelete(item._id)}
              className='bg-red-600 text-white rounded'
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='w-full gap-10 2xl:gap-20 min-h-screen px-10 py-8 bg-white shadow rounded-md justify-between overflow-y-auto'>
      <div className='w-full md:w-1/1'>
      <div className='flex justify-between items-center'>
    <h4 className='text-gray-600 font-semibold text-lg mb-5'>Activities</h4>
    <Button
      type='button'
      label='Download PDF'
      onClick={handleDownloadPdf}
      className='bg-green-600 text-white rounded mt-5'
    />
  </div>

        <div className='w-full'>
          {activity?.map((el, index) => (
            <Card
              key={index}
              item={el}
              isConnected={index < activity?.length - 1}
            />
          ))}
        </div>
      </div>

      <div className='w-full md:w-1/1'>
        <h4 className='text-gray-600 font-semibold text-lg mb-5'>
          Add Activity
        </h4>
        <div className='w-full flex flex-wrap gap-5'>
          {act_types.map((item, index) => (
            <div key={item} className='flex gap-2 items-center'>
              <input
                type='checkbox'
                className='w-4 h-4'
                checked={selected === item ? true : false}
                onChange={(e) => setSelected(item)}
              />
              <p>{item}</p>
            </div>
          ))}
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Type ......'
            className='bg-white w-full mt-10 border border-gray-300 outline-none p-4 rounded-md focus:ring-2 ring-blue-500'
          ></textarea>
          {isPosting ? (
            <Loading />
          ) : (
            <Button
              type='button'
              label='Submit'
              onClick={handleSubmit}
              className='bg-blue-600 text-white rounded'
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;