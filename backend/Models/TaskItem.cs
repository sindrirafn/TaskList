namespace TaskList.Models;
public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public TaskItem(string title, string? description)
    {
        Title = title;
        Description = description;
        IsCompleted = false;
    }
}