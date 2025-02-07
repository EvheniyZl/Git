import { Dialog } from "@headlessui/react";
import React from "react";
import { useForm } from "react-hook-form";
import Button from "./Button";
import Loading from "./Loader";
import ModalWrapper from "./ModalWrapper";
import Textbox from "./Textbox";
import { useChangePasswordMutation } from "../redux/slices/api/userApiSlice";
import { toast } from "sonner";

const ChangePassword = ({open, setOpen}) => {
    const{
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const [changePassword, {isLoading}] = useChangePasswordMutation();

    const handleOnSubmit = async (data) => {
        if(data.password!==data.cpass){
            toast.warning("Password and Confirm Password must be same");
            return;
        }
        try{
            const res = await changePassword(data).unwrap();
            toast.success("Password changed successfully");
            setTimeout(() => {
                setOpen(false);
            }, 1500);
        } catch (err){
            console.log(err);
            toast.error(err?.data?.message || err.error);
        }
    };

    return (
        <>
        <ModalWrapper open={open} setOpen={setOpen}>
            <form onSubmit={handleSubmit(handleOnSubmit)} className="">
                <Dialog.Title as='h3' className='text-lg font-medium leading-6 text-gray-900'>
                    Change Password
                </Dialog.Title>
                <div className="mt-2">
                    <Textbox
                        placeholder="New password"
                        type="password"
                        name="password"
                        label="New password"
                        className="w-full"
                        register={register("password", {
                            required: "Password is required",
                        })}
                        error={errors.cpass ? errors.cpass.message: ""}
                    />
                    <Textbox
                        placeholder="Confirm password"
                        type="password"
                        name="cpass"
                        label="Confirm password"
                        className="w-full"
                        register={register("cpass", {
                            required: "Confirm password is required",
                        })}
                        error={errors.cpass ? errors.cpass.message: ""}
                    />
                </div>
                {isLoading ? (
                    <div className="mt-4">
                        <Loading />
                        </div>
                ) : (
                    <div className="mt-4">
                        <Button
                            type="submit"
                            className="w-full"
                            label="Save"
                        />
                        <button
                            type="button"
                            className="mt-2 w-full"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </button>
                    </div>
                )}
                </form>
        </ModalWrapper>
        </>
    );
};

export default ChangePassword;