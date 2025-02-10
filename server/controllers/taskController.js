import Notice from "../models/notification.js";
import Task from "../models/task.js";
import User from "../models/user.js";

export const createTask = async (req, res) => {
  try {
    const { userId } = req.user;

    const { title, team, stage, date, priority, assets } = req.body;

    let text = "New task has been assigned to you";
    if (team?.length > 1) {
      text = text + ` and ${team?.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${priority} priority, so check and act accordingly. The task date is ${new Date(
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

    // Обновляем пользователя, добавляя задачу в его список
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

    // Добавляем задачу в массив задач каждого пользователя
    await User.updateMany(
      { _id: { $in: task.team } },
      { $push: { tasks: newTask._id } }
    );

    //alert users of the task
    let text = "New task has been assigned to you";
    if (task.team.length > 1) {
      text = text + ` and ${task.team.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${
        task.priority
      } priority, so check and act accordingly. The task date is ${task.date.toDateString()}. Thank you!!!`;

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

    //   group task by stage and calculate counts
    const groupTaskks = allTasks.reduce((result, task) => {
      const stage = task.stage;

      if (!result[stage]) {
        result[stage] = 1;
      } else {
        result[stage] += 1;
      }

      return result;
    }, {});

    // Group tasks by priority
    const groupData = Object.entries(
      allTasks.reduce((result, task) => {
        const { priority } = task;

        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    // calculate total tasks
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

      // Добавляем фильтрацию по userId, если он передан
      if (userId) {
          query.team = { $in: [userId] }; // Фильтруем задачи, где пользователь находится в команде
      }

      let queryResult = Task.find(query)
          .populate({
              path: "team",
              select: "name title email",
          })
          .sort({ _id: -1 })

          .populate({
            path: "subTasks.team", // Добавить populate для подзадач
            select: "name title role email" // Замените на необходимые поля
          }).sort({ _id: -1 });

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
    const { title, team, tag, date } = req.body;
    const { id } = req.params;

    const newSubTask = {
      title,
      team,
      date,
      tag,
    };

    const task = await Task.findById(id);

    task.subTasks.push(newSubTask);

    await task.save();

    res.status(200).json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateSubTask = async (req, res) => {
  try {
    const { id, subTaskId } = req.params;
    const { title, team, tag, date } = req.body;

    const task = await Task.findById(id);

    const subTaskIndex = task.subTasks.findIndex(subTask => subTask._id.toString() === subTaskId);
    
    if (subTaskIndex === -1) {
      return res.status(404).json({ status: false, message: "Subtask not found." });
    }

    const updatedSubTask = {
      ...task.subTasks[subTaskIndex],
      title,
      team,
      tag,
      date,
    };

    task.subTasks[subTaskIndex] = updatedSubTask;

    await task.save();

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

    task.subTasks.splice(subTaskIndex, 1);

    await task.save();

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

    await task.save();

    // Обновляем массив задач пользователей
    await User.updateMany(
      { tasks: id },
      { $pull: { tasks: id } }
    );
    await User.updateMany(
      { _id: { $in: team } },
      { $push: { tasks: id } }
    );

    res
      .status(200)
      .json({ status: true, message: "Task updated successfully." });
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
      // Удаляем задачу
      await Task.findByIdAndDelete(id);

      // Удаляем задачу из массива задач пользователя
      await User.updateMany(
        { tasks: id },
        { $pull: { tasks: id } }
      );
    } else if (actionType === "deleteAll") {
      // Удаляем все задачи в корзине и обновляем пользователей
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