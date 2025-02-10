import { apiSlice } from "../apiSlice";

const TASKS_URL = "/task";

export const taskApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardStats: builder.query({
            query: () => ({
                url: `${TASKS_URL}/dashboard`,
                method: "GET",
                credentials: "include",
            }),
        }),

        getAllTask: builder.query({
            query: ({strQuery, isTrashed, search, userId}) => ({
                url: `${TASKS_URL}?stage=${strQuery}&isTrashed=${isTrashed}&search=${search}&userId=${userId}`,
                method: "GET",
                credentials: "include",
            }),
        }),

        createTask: builder.mutation({

            query: (data) => ({
                url: `${TASKS_URL}/create`,
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),

        duplicateTask: builder.mutation({
            query: (id) => ({
                url: `${TASKS_URL}/duplicate/${id}`,
                method: "POST",
                body: {},
                credentials: "include",
            }),
        }),

        updateTask: builder.mutation({
            query: (data) => ({
                url: `${TASKS_URL}/update/${data._id}`,
                method: "PUT",
                body: data,
                credentials: "include",
            }),
        }),

        trashTask: builder.mutation({
            query: ({id}) => ({
                url: `${TASKS_URL}/${id}`,
                method: "PUT",
                credentials: "include",
            }),
        }),

        createSubTask: builder.mutation({
            query: ({data, id}) => ({
                url: `${TASKS_URL}/create-subtask/${id}`,
                method: "PUT",
                body: data,
                credentials: "include",
            }),
        }),

        updateSubTask: builder.mutation({
            query: ({ data, taskId, subTaskId }) => ({
                url: `${TASKS_URL}/update-subtask/${taskId}/${subTaskId}`,
                method: "PUT",
                body: data,
                credentials: "include",
            }),
        }),

        deleteSubTask: builder.mutation({
            query: ({ taskId, subTaskId }) => ({
                url: `${TASKS_URL}/delete-subtask/${taskId}/${subTaskId}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),

        getSingleTask: builder.query({
            query: (id) => ({
                url: `${TASKS_URL}/${id}`,
                method: "GET",
                credentials: "include",
            }),
        }),

        postTaskActivity: builder.mutation({
            query: ({data, id}) => ({
                url: `${TASKS_URL}/activity/${id}`,
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),

        deleteRestore: builder.mutation({
            query: ({id, actionType}) => ({
                url: `${TASKS_URL}/delete-restore/${id}?actionType=${actionType}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useGetDashboardStatsQuery, 
    useGetAllTaskQuery, 
    useCreateTaskMutation, 
    useDuplicateTaskMutation, 
    useUpdateTaskMutation,
    useTrashTaskMutation,
    useCreateSubTaskMutation,
    useGetSingleTaskQuery,
    usePostTaskActivityMutation,
    useDeleteRestoreMutation,
    useUpdateSubTaskMutation, // Added updateSubTask hook
    useDeleteSubTaskMutation,
} = taskApiSlice;