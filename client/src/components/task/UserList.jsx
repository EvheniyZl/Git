import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { BsChevronExpand } from "react-icons/bs";
import clsx from "clsx";
import { getInitials } from "../../utils";
import { MdCheck } from "react-icons/md";
import { useGetTeamListQuery } from "../../redux/slices/api/userApiSlice";

const UserList = ({ setTeam, team }) => {
  const { data, isLoading } = useGetTeamListQuery();
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Обработчик изменения списка пользователей
  const handleChange = (el) => {
    const uniqueUsers = Array.from(new Set(el.map((user) => user._id)))  // Получаем только уникальные ID пользователей
      .map((id) => el.find((user) => user._id === id));  // Возвращаем полные объекты пользователей, уникализированные по ID
    
    setSelectedUsers(uniqueUsers);  // Обновляем выбранных пользователей
    setTeam(uniqueUsers.map((u) => u._id));  // Обновляем состояние с ID пользователей
  };

  // Удаление пользователя из списка выбранных
  const removeUser = (userToRemove) => {
    const updatedUsers = selectedUsers.filter((user) => user._id !== userToRemove._id);
    setSelectedUsers(updatedUsers); // Обновляем состояние
    setTeam(updatedUsers.map((u) => u._id)); // Обновляем состояние ID
  };

  useEffect(() => {
    if (team?.length < 1) {
      data;
    } else {
      setSelectedUsers(team);
    }
  }, [isLoading]);

  return (
    <div>
      <p className='text-gray-700'>Assign Task To: </p>
      <Listbox value={selectedUsers} onChange={(el) => handleChange(el)} multiple>
        <div className='relative mt-1'>
          <Listbox.Button className='relative w-full cursor-default rounded bg-white pl-3 pr-10 text-left px-3 py-2.5 2xl:py-3 border border-gray-300 sm:text-sm'>
            <span className='block truncate'>
              {selectedUsers?.length > 0
                ? selectedUsers.map((user) => user.name).join(", ")
                : "Select User"} {/* Если нет выбранных пользователей, выводим "Select User" */}
            </span>

            <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
              <BsChevronExpand
                className='h-5 w-5 text-gray-400'
                aria-hidden='true'
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Listbox.Options className='z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm'>
              {data?.map((user, index) => (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4. ${
                      active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                    }`
                  }
                  value={user}
                >
                  {({ selected }) => (
                    <>
                      <div
                        className={clsx(
                          "flex items-center gap-2 truncate",
                          selected ? "font-medium" : "font-normal"
                        )}
                      >
                        <div className='w-6 h-6 rounded-full text-white flex items-center justify-center bg-violet-600'>
                          <span className='text-center text-[10px]'>
                            {getInitials(user.name)}
                          </span>
                        </div>
                        <span>{user.name}</span>
                      </div>
                      {selected ? (
                        <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600'>
                          <MdCheck className='h-5 w-5' aria-hidden='true' />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      {/* Вывод списка выбранных пользователей с кнопкой для их удаления */}
      {selectedUsers.length > 0 && (
        <div className="mt-4">
          <h3 className="text-gray-700">Assigned Users:</h3>
          <ul>
            {selectedUsers.map((user) => (
              <li key={user._id} className="flex items-center justify-between">
                <span>{user.name}</span>
                <button
                  onClick={() => removeUser(user)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserList;
