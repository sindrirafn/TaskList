using Microsoft.AspNetCore.OpenApi;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSingleton<TaskService>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseCors();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();


// var taskList = new TaskService();
var taskService = app.Services.GetRequiredService<TaskService>();
for (int i = 1; i <= 5; i++)
{
    taskService.AddTask($"Task {i}", $"Description for Task {i}");
}


// Endpoint to get the list of all tasks with optional filtering by completion status
app.MapGet("/tasks", (TaskService taskService, bool? isCompleted) =>
{
    var tasks = taskService.GetTasks(isCompleted);
    return tasks.ToArray();
})
.WithName("GetTaskList");


// Endpoint to get a specific task by ID
app.MapGet("/tasks/{id}", (TaskService taskService, int id) =>
{
    var task = taskService.GetTaskById(id);
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
app.MapPut("/tasks/{id}", (TaskService taskService, int id, UpdateTaskRequest request) =>
{
    if (request.Title != null && request.Title.Length > 100)
    {
        return Results.BadRequest("Title cannot exceed 100 characters.");
    }
    if (request.Description != null && request.Description.Length > 500)
    {
        return Results.BadRequest("Description cannot exceed 500 characters.");
    }

    var result = taskService.UpdateTask(id, request);
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
app.MapPost("/tasks", (TaskService taskService, CreateTaskRequest request) =>
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

    var task = taskService.AddTask(request.Title, request.Description);
    return Results.Created($"/tasks/{task.Id}", task);
}).WithName("AddTask");


// Endpoint to remove a task
app.MapDelete("/tasks/{id}", (TaskService taskService, int id) =>
{
    bool success = taskService.RemoveTask(id);
    if (success)
    {
        return Results.Ok($"Task with ID {id} removed.");
    }
    else
    {
        return Results.NotFound($"Task with ID {id} not found.");
    }
}).WithName("RemoveTask");


app.Run();
