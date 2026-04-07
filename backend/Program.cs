using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using TaskList.Models;
using TaskList.Data;
using TaskList.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
// builder.Services.AddSingleton<TaskService>();
builder.Services.AddScoped<TaskService>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<TaskDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
    
var app = builder.Build();
app.UseCors();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Ensure the database is created and apply any pending migrations
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TaskDbContext>();
    db.Database.Migrate();

    if (!db.Tasks.Any())
    {
        db.Tasks.AddRange(
            new TaskItem("Buy groceries", "Buy milk, bread, and eggs"),
            new TaskItem("Finish backend cleanup", "Remove unused code and optimize performance"),
            new TaskItem("Walk the dog", "Take the dog for a 30-minute walk")
        );

        db.SaveChanges();
    }
}


// Endpoint to get the list of all tasks with optional filtering by completion status
app.MapGet("/tasks", async (TaskService taskService, bool? isCompleted) =>
{
    var tasks = await taskService.GetTasksAsync(isCompleted);
    return Results.Ok(tasks);
})
.WithName("GetTaskList");

// Endpoint to get a specific task by ID
app.MapGet("/tasks/{id}", async (TaskService taskService, int id) =>
{
    var task = await taskService.GetTaskByIdAsync(id);
    if (task != null)
    {
        return Results.Ok(task);
    }
    else
    {
        return Results.NotFound($"Task with ID {id} not found.");
    }
}).WithName("GetTaskById");


// Endpoint to update a task's title, description, and completion status
app.MapPut("/tasks/{id}", async(TaskService taskService, int id, UpdateTaskRequest request) =>
{
    if (request.Title != null && request.Title.Length > 100)
    {
        return Results.BadRequest("Title cannot exceed 100 characters.");
    }
    if (request.Description != null && request.Description.Length > 500)
    {
        return Results.BadRequest("Description cannot exceed 500 characters.");
    }

    var result = await taskService.UpdateTaskAsync(id, request);
    if (result is TaskItem updatedTask)
    {
        return Results.Ok(updatedTask);
    }
    else
    {
        return Results.NotFound($"Task with ID {id} not found.");
    }
}).WithName("UpdateTask");


// Endpoint to add a new task. Returns the created task with its assigned ID.
app.MapPost("/tasks", async (TaskService taskService, CreateTaskRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest("Title is required.");
    }
    if (request.Title.Length > 100)
    {
        return Results.BadRequest("Title cannot exceed 100 characters.");
    }
    if (request.Description != null && request.Description.Length > 500)
    {
        return Results.BadRequest("Description cannot exceed 500 characters.");
    }

    var task = await taskService.AddTaskAsync(request.Title, request.Description);
    return Results.Created($"/tasks/{task.Id}", task);
}).WithName("AddTask");


// Endpoint to remove a task
app.MapDelete("/tasks/{id}", async (TaskService taskService, int id) =>
{
    bool success = await taskService.RemoveTaskAsync(id);
    if (success)
    {
        return Results.NoContent();
    }
    else
    {
        return Results.NotFound($"Task with ID {id} not found.");
    }
}).WithName("RemoveTask");


app.Run();
