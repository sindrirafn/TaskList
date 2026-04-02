# Task Tracker (Full Stack)

A simple full-stack task tracking application built with:

- **Backend:** ASP.NET Core (.NET, C#)
- **Frontend:** React (Vite)
- **Architecture:** REST API + client-side UI

## Features

- Create tasks
- View all tasks
- Filter tasks by completion status
- Update task title, description, and completion state
- Delete tasks
- In-memory data storage (no database)

## Backend (ASP.NET Core)

- Minimal API structure
- Dependency Injection (singleton service)
- Request models for create/update operations
- Input validation
- REST-style endpoints
- Swagger/OpenAPI for testing

### Endpoints

- `GET /tasks` – Get all tasks (optional filter by `isCompleted`)
- `GET /tasks/{id}` – Get task by ID
- `POST /tasks` – Create task
- `PUT /tasks/{id}` – Update task
- `DELETE /tasks/{id}` – Delete task

## Frontend (React)

- Fetches data from backend API
- Displays task list
- Handles loading and error states
- (Planned/implemented depending on your progress)
  - Create task form
  - Completion toggle

## Project Structure
Tasklist/

├── backend/ # ASP.NET Core API 

└── frontend/ # React app (Vite)

## Running the project

### Backend

```bash
cd backend
dotnet run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```


## Notes
This project was built as part of learning and practicing:
 - C# and .NET Web API development
 - React fundamentals
 - Full-stack integration
 - Git and project structuring
 
## Future improvements
- Add database (e.g., SQLite / PostgreSQL)
- Improve UI/UX 
- Add authentication
- Convert frontend to TypeScript