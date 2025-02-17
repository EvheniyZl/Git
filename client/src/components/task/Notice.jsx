import React from "react";
import { formatDate } from "../../utils";
import { Link } from "react-router-dom";

const Notice = ({ tasks }) => {
  // Фильтруем только те задачи, которые содержат bug-активности
  const bugActivities = tasks
    .flatMap((task) => task.activities)
    .filter((activity) => activity.type === "bug");

  return (
    <div className="bg-white px-2 md:px-4 pt-4 pb-9 shadow-md rounded">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bug Notices</h2>

      {bugActivities.length === 0 ? (
        <p className="text-gray-600">No bug activities found.</p>
      ) : (
        bugActivities.map((activity, index) => {
          const task = tasks.find((task) =>
            task.activities.some((item) => item._id === activity._id)
          );

          return (
            <div
              key={index}
              className="border-b border-gray-200 py-4 flex justify-between items-start"
            >
              <div>
                <p className="text-sm text-gray-600">
                  <strong>Date: </strong>
                  {formatDate(new Date(activity.date))}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Note: </strong>
                  {activity.activity}
                </p>
              </div>
              <div className="flex items-center">
                <Link
                  to={`/task/${task._id}`}
                  className="text-blue-500 hover:underline"
                  target="_blank"
                >
                  View Task
                </Link>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Notice;
