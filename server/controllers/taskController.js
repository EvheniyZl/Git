import Notice from "../models/notification.js";
import Task from "../models/task.js";
import User from "../models/user.js";

export const createTask = async (req, res) => {
  try {
    const { userId } = req.user;

    const { title, team, stage, date, priority, assets } = req.body;

    let text = "New task has been assigned to you";
    if (team?.length > 1) {
      text = text + ` and ${team?.length - 1} others`;
    }

    text =
      text +
      `. The task date is ${new Date(
        date
      ).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    const task = await Task.create({
      title,
      team,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      assets,
      activities: activity,
    });

    await User.findByIdAndUpdate(
      userId, 
      { $push: { tasks: task._id } },
      { new: true }
    );

    await Notice.create({
      team,
      text,
      task: task._id,
    });

    res
      .status(200)
      .json({ status: true, task, message: "Task created successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const duplicateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    const newTask = await Task.create({
      ...task,
      title: task.title + " - Duplicate",
    });

    newTask.team = task.team;
    newTask.subTasks = task.subTasks;
    newTask.assets = task.assets;
    newTask.priority = task.priority;
    newTask.stage = task.stage;

    await newTask.save();

    await User.updateMany(
      { _id: { $in: task.team } },
      { $push: { tasks: newTask._id } }
    );

    let text = "New task has been assigned to you";
    if (task.team.length > 1) {
      text = text + ` and ${task.team.length - 1} others`;
    }

    text =
      text +
      `. The task date is ${task.date.toDateString()}. Thank you!!!`;

    await Notice.create({
      team: task.team,
      text,
      task: newTask._id,
    });

    res
      .status(200)
      .json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};


export const postTaskActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { type, activity } = req.body;

    const task = await Task.findById(id);

    const data = {
      type,
      activity,
      by: userId,
    };

    task.activities.push(data);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Activity posted successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const dashboardStatistics = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;

    const allTasks = isAdmin
      ? await Task.find({
          isTrashed: false,
        })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .sort({ _id: -1 })
      : await Task.find({
          isTrashed: false,
          team: { $all: [userId] },
        })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .sort({ _id: -1 });

    const users = await User.find({ isActive: true })
      .select("name title role isAdmin createdAt")
      .limit(10)
      .sort({ _id: -1 });

    const groupTaskks = allTasks.reduce((result, task) => {
      const stage = task.stage;

      if (!result[stage]) {
        result[stage] = 1;
      } else {
        result[stage] += 1;
      }

      return result;
    }, {});

    const groupData = Object.entries(
      allTasks.reduce((result, task) => {
        const { priority } = task;

        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    const totalTasks = allTasks?.length;
    const last10Task = allTasks?.slice(0, 10);

    const summary = {
      totalTasks,
      last10Task,
      users: isAdmin ? users : [],
      tasks: groupTaskks,
      graphData: groupData,
    };

    res.status(200).json({
      status: true,
      message: "Successfully",
      ...summary,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { stage, isTrashed, userId } = req.query;

    let query = { isTrashed: isTrashed ? true : false };

    if (stage) {
      query.stage = stage;
    }

    if (userId) {
      // Преобразуем userId в ObjectId
      const userObjectId = new mongoose.Types.ObjectId(userId);

      // Фильтруем задачи, где пользователь находится в команде или в подзадачах
      query.$or = [
        { team: { $in: [userObjectId] } },
        { "subTasks.team": { $in: [userObjectId] } },
      ];
    }

    let queryResult = Task.find(query)
      .populate({
        path: "team",
        select: "name title email",
      })
      .sort({ _id: -1 })
      .populate({
        path: "subTasks.team",
        select: "name title role email",
      });

    const tasks = await queryResult;

    res.status(200).json({
      status: true,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate({
        path: "team",
        select: "name title role email",
      })
      .populate({
        path: "activities.by",
        select: "name",
      })
      .populate({
        path: "subTasks.team", // Добавить populate для подзадач
        select: "name title role email" // Замените на необходимые поля
      });

    res.status(200).json({
      status: true,
      task,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const createSubTask = async (req, res) => {
  try {
    const { title, tag, date, team } = req.body;
    const { id } = req.params;
    const { userId } = req.user;

    const newSubTask = {
      title,
      date,
      tag,
      team,
    };

    const task = await Task.findById(id);
    task.subTasks.push(newSubTask);

    let text = `A new subtask has been added to the task: "${task.title}"`;
    if (newSubTask.team?.length > 1) {
      text = text + `, and ${newSubTask.team?.length - 1} others`;
    }

    text = text + `. The subtask date is ${new Date(date).toDateString()}.`;

    const activity = {
      type: "subtask added",
      activity: text,
      by: userId,
    };

    task.activities.push(activity);
    await task.save();

    // Добавляем подзадачу в поле subTasks у пользователей
    await User.updateMany(
      { _id: { $in: newSubTask.team } },
      { $push: { subTasks: task._id } }
    );

    await Notice.create({
      team: newSubTask.team,
      text,
      task: task._id,
    });

    res.status(200).json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateSubTask = async (req, res) => {
  try {
    const { id, subTaskId } = req.params;
    const { title, team, tag, date, stage } = req.body;

    const task = await Task.findById(id);
    const subTaskIndex = task.subTasks.findIndex(subTask => subTask._id.toString() === subTaskId);

    if (subTaskIndex === -1) {
      return res.status(404).json({ status: false, message: "Subtask not found." });
    }

    const oldTeam = task.subTasks[subTaskIndex].team;
    const updatedSubTask = {
      ...task.subTasks[subTaskIndex],
      title,
      team,
      tag,
      date,
      stage: stage.toLowerCase() || task.subTasks[subTaskIndex].stage,
    };

    task.subTasks[subTaskIndex] = updatedSubTask;

    let activityText = `The subtask "${updatedSubTask.title}" in task "${task.title}" has been updated.`;
    if (updatedSubTask.team?.length > 1) {
      activityText += ` The new team includes ${updatedSubTask.team.length} members.`;
    }
    activityText += ` The subtask date is now ${new Date(updatedSubTask.date).toDateString()}.`;

    const activity = {
      type: "subtask updated",
      activity: activityText,
      by: req.user.userId,
    };

    task.activities.push(activity);
    await task.save();

    // Обновляем поле subTasks у пользователей
    if (team && team.length !== oldTeam.length) {
      await User.updateMany(
        { _id: { $in: oldTeam } },
        { $pull: { subTasks: task._id } }
      );
      await User.updateMany(
        { _id: { $in: team } },
        { $push: { subTasks: task._id } }
      );
    }

    await Notice.create({
      team: updatedSubTask.team,
      text: activityText,
      task: task._id,
    });

    res.status(200).json({ status: true, message: "SubTask updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteSubTask = async (req, res) => {
  try {
    const { id, subTaskId } = req.params;

    const task = await Task.findById(id);
    const subTaskIndex = task.subTasks.findIndex(subTask => subTask._id.toString() === subTaskId);

    if (subTaskIndex === -1) {
      return res.status(404).json({ status: false, message: "Subtask not found." });
    }

    const subTaskTeam = task.subTasks[subTaskIndex].team;

    task.subTasks.splice(subTaskIndex, 1);
    await task.save();

    // Удаляем подзадачу из поля subTasks у пользователей
    await User.updateMany(
      { _id: { $in: subTaskTeam } },
      { $pull: { subTasks: task._id } }
    );

    res.status(200).json({ status: true, message: "SubTask deleted successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, team, stage, priority, assets } = req.body;

    const task = await Task.findById(id);
    const oldTeam = task.team;

    task.title = title;
    task.date = date;
    task.priority = priority.toLowerCase();
    task.assets = assets;
    task.stage = stage.toLowerCase();
    task.team = team;

    // Текст активности
    let activityText = `The task "${task.title}" has been updated.`;
    if (team?.length > 1) {
      activityText += ` The new team includes ${team.length} members.`;
    }
    activityText += ` The task date is now ${new Date(date).toDateString()}.`;

    // Создание активности
    const activity = {
      type: "updated",
      activity: activityText,
      by: req.user.userId,
    };

    // Добавление активности в задачу
    task.activities.push(activity);

    // Отправка уведомлений старой и новой команде
    if (team.length !== oldTeam.length) {
      await User.updateMany(
        { tasks: id },
        { $pull: { tasks: id } } // Удаление задачи из старой команды
      );
      await User.updateMany(
        { _id: { $in: team } },
        { $push: { tasks: id } } // Добавление задачи в новую команду
      );
    }

    // Сохраняем обновленную задачу
    await task.save();

    // Отправка уведомлений для участников новой команды
    await Notice.create({
      team: team,
      text: activityText,
      task: task._id,
    });

    res.status(200).json({ status: true, message: "Task updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const trashTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    task.isTrashed = true;

    await task.save();

    res.status(200).json({
      status: true,
      message: `Task trashed successfully.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteRestoreTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;

    const task = await Task.findById(id);

    if (actionType === "delete") {
      await Task.findByIdAndDelete(id);

      await User.updateMany(
        { tasks: id },
        { $pull: { tasks: id } }
      );
    } else if (actionType === "deleteAll") {
      await Task.deleteMany({ isTrashed: true });
      await User.updateMany(
        { tasks: { $in: (await Task.find({ isTrashed: true })).map(task => task._id) } },
        { $pull: { tasks: { $in: (await Task.find({ isTrashed: true })).map(task => task._id) } } }
      );
    } else if (actionType === "restore") {
      const resp = await Task.findById(id);
      resp.isTrashed = false;
      await resp.save();
    } else if (actionType === "restoreAll") {
      await Task.updateMany(
        { isTrashed: true },
        { $set: { isTrashed: false } }
      );
    }

    res.status(200).json({
      status: true,
      message: `Operation performed successfully.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const { taskId, activityId } = req.params;
    const { activity } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    const activityIndex = task.activities.findIndex(
      (act) => act._id.toString() === activityId
    );

    if (activityIndex === -1) {
      return res.status(404).json({ status: false, message: "Activity not found" });
    }

    task.activities[activityIndex].activity = activity;
    await task.save();

    res.status(200).json({ status: true, message: "Activity updated successfully", task });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const { taskId, activityId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    task.activities = task.activities.filter(
      (act) => act._id.toString() !== activityId
    );

    await task.save();

    res.status(200).json({ status: true, message: "Activity deleted successfully", task });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};