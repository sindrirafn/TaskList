using TaskList.Models;
using TaskList.Data;
using Microsoft.EntityFrameworkCore;
namespace TaskList.Services;


public class TaskService
{


    private readonly TaskDbContext _db;

    public TaskService(TaskDbContext db)
    {
        _db = db;
    }


    public async Task<TaskItem> AddTaskAsync(string title, string? description)
    {
        var task = new TaskItem(title, description);
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();
        Console.WriteLine($"Task added: {task.Title} (ID: {task.Id})");
        return task;
    }


    public async Task<IEnumerable<TaskItem>> GetTasksAsync(bool? isCompleted = null)
    {
        var query = _db.Tasks.AsQueryable();

        if (isCompleted.HasValue)
        {
            query = query.Where(t => t.IsCompleted == isCompleted.Value);
        }

        return await query.OrderBy(t => t.Id).ToListAsync();
    }

    // New method to filter tasks by title, description, and completion status
    // To be used later
    public async Task<List<TaskItem>> FilterTasksAsync(string? titleContains, string? descriptionContains, bool? isCompleted)
    {
        var query = _db.Tasks.AsQueryable();

        if (!string.IsNullOrWhiteSpace(titleContains))
        {
            query = query.Where(t => t.Title.Contains(titleContains));
        }
        if (!string.IsNullOrWhiteSpace(descriptionContains))
        {
            query = query.Where(t => t.Description != null && t.Description.Contains(descriptionContains));
        }
        if (isCompleted.HasValue)
        {
            query = query.Where(t => t.IsCompleted == isCompleted.Value);
        }

        return await query.OrderBy(t => t.Id).ToListAsync();
    }


    public async Task<bool> RemoveTaskAsync(int id)
    {
        var task = await GetTaskByIdAsync(id);
        if (task != null)
        {
            _db.Tasks.Remove(task);
            await _db.SaveChangesAsync();
            Console.WriteLine($"Task removed: {task.Title} (ID: {task.Id})");
            return true;
        }
        return false;
    }


    public async Task<TaskItem?> GetTaskByIdAsync(int id)
    {
        var task = await _db.Tasks.FindAsync(id);
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

    public async Task<TaskItem?> UpdateTaskAsync(int id, UpdateTaskRequest request)
    {
        var task = await GetTaskByIdAsync(id);
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

            await _db.SaveChangesAsync();
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