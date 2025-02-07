import React from 'react';
import ModalWrapper from './ModalWrapper';
import { Dialog } from '@headlessui/react';
import Button from './Button';

const ViewNotification = ({ open, setOpen, el }) => {
    return (
        <>
        <ModalWrapper open={open} setOpen={setOpen}>
            <div className='py-4 w-full flex flex-col gap-4 items-center justify-center'>
                <Dialog.Title as='h3' className=''>
                    {el?.task?.title}
                </Dialog.Title>
                <p className='text-gray-500 text-sm'>{el?.task}</p>
                <Button
                    type='button'
                    className={`w-full mt-4`}
                    onClick={() => setOpen(false)}
                    label="Ok"
                />
            </div>
        </ModalWrapper>
        </>
    );
};

export default ViewNotification;