import { useForm } from "react-hook-form";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import Button from "../Button";
import UserList from "./UserList"; // Import UserList component
import { useCreateSubTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { toast } from "sonner";
import React, { useState } from "react";
import SelectList from "../SelectList";


const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"]; // Task stage options

const AddSubTask = ({ open, setOpen, id }) => {
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: today, // Устанавливаем сегодняшнюю дату по умолчанию
    },
  });

  const [addSbTask] = useCreateSubTaskMutation();
  const [team, setTeam] = useState([]); // State for team
  const [stage, setStage] = useState(LISTS[0]); // Default stage

  const handleOnSubmit = async (data) => {
    try {
      const res = await addSbTask({ data: { ...data, team, stage }, id }).unwrap(); // Include team in data
      toast.success(res.message);
      setTimeout(() => {
        setOpen(false);
        window.location.reload();
      }, 500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className=''>
          <Dialog.Title
            as='h2'
            className='text-base font-bold leading-6 text-gray-900 mb-4'
          >
            ADD SUB-TASK
          </Dialog.Title>
          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder='Sub-Task title'
              type='text'
              name='title'
              label='Title'
              className='w-full rounded'
              register={register("title", {
                required: "Title is required!",
              })}
              error={errors.title ? errors.title.message : ""}
            />

            <UserList setTeam={setTeam} team={team} /> {/* Add UserList component */}

            <SelectList
              label='Task Stage'
              lists={LISTS}
              selected={stage}
              setSelected={setStage} // Update stage state
            />

            <div className='flex items-center gap-4'>
              <Textbox
                placeholder='Date'
                type='date'
                name='date'
                label='Task Date'
                className='w-full rounded'
                register={register("date", {
                  required: "Date is required!",
                })}
                error={errors.date ? errors.date.message : ""}
              />
              {/* <Textbox
                placeholder='Tag'
                type='text'
                name='tag'
                label='Tag'
                className='w-full rounded'
                register={register("tag", {
                  required: "Tag is required!",
                })}
                error={errors.tag ? errors.tag.message : ""}
              /> */}
            </div>
          </div>
          <div className='py-3 mt-4 flex sm:flex-row-reverse gap-4'>
            <Button
              type='submit'
              className='bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 sm:ml-3 sm:w-auto'
              label='Add Task'
            />

            <Button
              type='button'
              className='bg-white border text-sm font-semibold text-gray-900 sm:w-auto'
              onClick={() => setOpen(false)}
              label='Cancel'
            />
          </div>
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddSubTask;
