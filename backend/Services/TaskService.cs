public class TaskService
{
    private List<TaskItem> tasks;
    private int nextId;

    public TaskService()
    {
        tasks = new List<TaskItem>();
        nextId = 1;
    }

    public TaskItem AddTask(string title, string? description)
    {
        var task = new TaskItem(title, description) { Id = nextId++ };
        tasks.Add(task);
        Console.WriteLine($"Task added: {task.Title} (ID: {task.Id})");
        return task;
    }

    public IEnumerable<TaskItem> GetTasks(bool? isCompleted = null)
    {
        if (tasks.Count == 0)
        {
            Console.WriteLine("No tasks available.");
            return Enumerable.Empty<TaskItem>();
        }
        if (isCompleted.HasValue)
        {
            return tasks.Where(t => t.IsCompleted == isCompleted.Value);
        }

        return tasks;
    }


    public bool RemoveTask(int id)
    {
        var task = GetTaskById(id);
        if (task != null)
        {
            tasks.Remove(task);
            Console.WriteLine($"Task removed: {task.Title} (ID: {task.Id})");
            return true;
        }
        return false;
    }

    public TaskItem? GetTaskById(int id)
    {
        var task = tasks.FirstOrDefault(t => t.Id == id);
        if (task != null)
        {
            return task;
        }
        else
        {
            Console.WriteLine($"Task with ID {id} not found.");
            return null;
        }
    }

    public TaskItem? UpdateTask(int id, UpdateTaskRequest request)
    {
        var task = GetTaskById(id);
        if (task != null)
        {
            if (!string.IsNullOrWhiteSpace(request.Title))
            {
                task.Title = request.Title;
            }
            if (request.Description != null)
            {
                task.Description = request.Description;
            }
            if (request.IsCompleted.HasValue)
            {
                task.IsCompleted = request.IsCompleted.Value;
            }
            Console.WriteLine($"Task updated: {task.Title} (ID: {task.Id})");
            return task;
        }
        else
        {
            Console.WriteLine($"Task with ID {id} not found.");
            return null;
        }
    }

}