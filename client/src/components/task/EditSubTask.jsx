// EditSubTask.js
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import Button from "../Button";
import UserList from "./UserList"; // Import UserList component
import { useUpdateSubTaskMutation } from "../../redux/slices/api/taskApiSlice"; // Хук для обновления подзадачи
import { toast } from "sonner";
import SelectList from "../SelectList";

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"]; // Task stage options

const EditSubTask = ({ open, setOpen, id, subTask }) => {
  const today = new Date().toISOString().split("T")[0];
  const [updateSubTask] = useUpdateSubTaskMutation(); // Хук для обновления подзадачи

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      title: subTask ? subTask.title : "",
      date: subTask ? subTask.date : today,
      tag: subTask ? subTask.tag : "",
      stage: subTask ? subTask.stage : "",
    },
  });

  const [team, setTeam] = useState(subTask?.team || []); // Состояние для команды
  const [stage, setStage] = useState(subTask?.stage?.toUpperCase() || LISTS[0]);


  const handleOnSubmit = async (data) => {
    try {
      const res = await updateSubTask({
        data: { ...data, team, stage },
        taskId: id,
        subTaskId: subTask._id, // Отправляем ID подзадачи для обновления
      }).unwrap();
      toast.success(res.message);
      setTimeout(() => {
        setOpen(false); // Закрываем модальное окно
        window.location.reload();
      }, 500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  useEffect(() => {
    if (subTask) {
      setValue("title", subTask.title);
      setValue("date", subTask.date.split("T")[0]);
      setValue("tag", subTask.tag);
      setTeam(subTask.team);
    }
  }, [subTask, setValue]);

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(handleOnSubmit)} className="">
        <Dialog.Title as="h2" className="text-base font-bold leading-6 text-gray-900 mb-4">
          Edit Sub-Task
        </Dialog.Title>
        <div className="mt-2 flex flex-col gap-6">
          <Textbox
            placeholder="Sub-Task title"
            type="text"
            name="title"
            label="Title"
            className="w-full rounded"
            register={register("title", {
              required: "Title is required!",
            })}
            error={errors.title ? errors.title.message : ""}
          />
          <UserList setTeam={setTeam} team={team} />

          <SelectList
              label='Task Stage'
              lists={LISTS}
              selected={stage}
              setSelected={setStage} // Update stage state
            />

          <div className="flex items-center gap-4">
            <Textbox
              placeholder="Date"
              type="date"
              name="date"
              label="Task Date"
              className="w-full rounded"
              register={register("date", {
                required: "Date is required!",
              })}
              error={errors.date ? errors.date.message : ""}
            />
            {/* <Textbox
              placeholder="Tag"
              type="text"
              name="tag"
              label="Tag"
              className="w-full rounded"
              register={register("tag", {
                required: "Tag is required!",
              })}
              error={errors.tag ? errors.tag.message : ""}
            /> */}
          </div>
        </div>
        <div className="py-3 mt-4 flex sm:flex-row-reverse gap-4">
          <Button
            type="submit"
            className="bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 sm:ml-3 sm:w-auto"
            label="Update Task"
          />
          <Button
            type="button"
            className="bg-white border text-sm font-semibold text-gray-900 sm:w-auto"
            onClick={() => setOpen(false)}
            label="Cancel"
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default EditSubTask;
