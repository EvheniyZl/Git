import React from 'react';
import ModalWrapper from './ModalWrapper';
import { Dialog } from '@headlessui/react';
import Button from './Button';
import { useNavigate } from 'react-router-dom'; 

const ViewNotification = ({ open, setOpen, el }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenTask = () => {
    if (el?.task?._id) {
      navigate(`/task/${el.task._id}`);
      setOpen(false);
    }
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <div className="py-4 w-full flex flex-col gap-4 items-center justify-center">
          <div className="w-full flex justify-between items-center">
          <Dialog.Title as="h3">Task</Dialog.Title>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>

          <p className="text-gray-500 text-sm">{el?.task ? el.task.title : "No task data"}</p>

          <Button
            type="button"
            className="w-full mt-4 flex items-center justify-center gap-2"
            onClick={handleOpenTask}
            label="Open Task"
          />
        </div>
      </ModalWrapper>
    </>
  );
};

export default ViewNotification;
