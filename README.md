# Todo List Application

> A simple web app to manage your daily tasks with categories, priorities, and search.

## What is this?

This is a **todo list app** where you can:
- Create, edit, and delete tasks
- Organize tasks into categories (Work, Personal, etc.)
- Set priority levels (High, Medium, Low)
- Search and filter your tasks
- Works on phone, tablet, and computer

**Built with:** Next.js (frontend), Express (backend), PostgreSQL (database)

---

## Quick Start (5 Minutes)

### What You Need First

Download and install these (click the links):
1. [Node.js](https://nodejs.org/) - The engine that runs JavaScript
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/) - Runs the database
3. [Git](https://git-scm.com/) - Downloads the code

**Check they're installed** - Open terminal/command prompt and type:
```bash
node --version
docker --version
```
If you see version numbers, you're good! If not, try restarting your computer after installing.

---

## Setup Instructions

### Step 1: Get the Code

```bash
# Download the project
git clone <repository-url>
cd industrix
```

### Step 2: Start the Database

The database stores all your todos. We use Docker so you don't need to install PostgreSQL manually.

```bash
docker-compose up -d
```

**What this does:** Starts a PostgreSQL database in the background.

**Check it worked:**
```bash
docker ps
```
You should see `todo_db` in the list.

### Step 3: Setup the Backend (API Server)

The backend handles saving/loading todos from the database.

```bash
# Go to backend folder
cd backend

# Install required packages (takes 1-2 minutes)
npm install

# Create the database tables
npx sequelize-cli db:migrate
```

**You should see:** Messages saying "migrated" for Category and Todo tables.

### Step 4: Setup the Frontend (Website)

The frontend is what you see in your browser.

```bash
# Go to frontend folder (from project root)
cd frontend

# Install required packages (takes 1-2 minutes)
npm install
```

---

## Running the App

You need 3 things running at the same time:
1. Database (Docker)
2. Backend server (API)
3. Frontend website

### Open 3 Terminal Windows

**Terminal 1 - Database:**
```bash
docker-compose up -d
```
*(Only need to run once - it stays running)*

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```
You'll see: `🚀 Server running on http://localhost:5000`

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```
You'll see: `✓ Ready in 2.3s`

### Open Your Browser

Go to: **http://localhost:3000**

You should see the todo app! 🎉

---

## Using the App

1. **Add a category** - Click "New Category" button
   - Example: "Work" with blue color
   
2. **Add a todo** - Click "New Task" button
   - Title: "Finish project"
   - Category: Work
   - Priority: High
   - Click "Create"

3. **Mark as done** - Click the circle icon next to task

4. **Search** - Type in the search box to find tasks

5. **Filter** - Tasks are automatically sorted by date

---

## Troubleshooting

### Problem: "Port already in use"

**Symptom:** Error says port 3000 or 5000 is busy

**Fix:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <number> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### Problem: "Can't connect to database"

**Symptom:** Backend shows database connection error

**Fix:**
```bash
# Make sure Docker is running
docker ps

# If nothing shows, start database
docker-compose up -d

# Then restart backend
cd backend
npm run dev
```

### Problem: "Module not found"

**Symptom:** Errors about missing packages

**Fix:**
```bash
# In the folder showing errors (backend or frontend)
npm install
```

### Problem: Blank page or errors in browser

**Symptom:** Frontend doesn't load or shows errors

**Fix:**
1. Check backend is running (terminal 2 should show "Server running")
2. Check frontend is running (terminal 3 should show "Ready")
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try a different browser

---

## What's Running Where?

When everything is working:

| Service | URL | What it does |
|---------|-----|--------------|
| Frontend | http://localhost:3000 | The website you see |
| Backend | http://localhost:5000 | API that saves/loads data |
| Database | localhost:5432 | Stores all todos |

---

## Stopping Everything

When you're done:

```bash
# Stop frontend - Press Ctrl+C in terminal 3
# Stop backend - Press Ctrl+C in terminal 2
# Stop database
docker-compose down
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Todos Endpoints

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/todos` | Get all todos | `page`, `limit`, `search`, `category`, `priority`, `completed` |
| GET | `/todos/:id` | Get todo by ID | - |
| POST | `/todos` | Create new todo | - |
| PUT | `/todos/:id` | Update todo | - |
| DELETE | `/todos/:id` | Delete todo | - |
| PATCH | `/todos/:id/toggle` | Toggle complete status | - |

### Categories Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Get all categories |
| GET | `/categories/:id` | Get category by ID |
| POST | `/categories` | Create new category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

### Example Requests

**Create Todo:**
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project",
    "description": "Finish todo app",
    "category_id": 1,
    "priority": "high",
    "due_date": "2025-12-31"
  }'
```

**Get Todos with Filters:**
```bash
curl "http://localhost:5000/api/todos?page=1&limit=10&priority=high&completed=false"
```

**Search Todos:**
```bash
curl "http://localhost:5000/api/todos?search=project"
```

## 📁 Project Structure

```
industrix/
├── backend/
│   ├── config/
│   │   └── config.json          # Database configuration
│   ├── migrations/              # Database migrations
│   │   ├── *-create-category.js
│   │   └── *-create-todo.js
│   ├── models/                  # Sequelize models
│   │   ├── Category.ts
│   │   ├── Todo.ts
│   │   └── index.ts
│   ├── src/
│   │   ├── controllers/         # Business logic
│   │   │   ├── todoController.ts
│   │   │   └── categoryController.ts
│   │   ├── routes/              # API routes
│   │   │   ├── todoRoutes.ts
│   │   │   └── categoryRoutes.ts
│   │   ├── middlewares/         # Middleware functions
│   │   │   ├── validators.ts
│   │   │   └── errorHandler.ts
│   │   └── index.ts             # Express app entry
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── TodoForm.tsx         # Todo form modal
│   │   └── CategoryForm.tsx     # Category form modal
│   ├── context/
│   │   └── TodoContext.tsx      # Global state management
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── next.config.ts
│
├── docker-compose.yml           # Docker services config
└── README.md                    # This file
```

## 🧪 Testing

### Backend Tests (if implemented)

```bash
cd backend
npm test
```

### Frontend Tests (if implemented)

```bash
cd frontend
npm test
```

## 🐛 Troubleshooting

### Database Connection Error

**Problem:** Backend can't connect to database

**Solution:**
```bash
# Check if PostgreSQL container is running
docker ps

# If not running, start it
docker-compose up -d

# Check container logs
docker-compose logs db

# Restart backend
cd backend
npm run dev
```

### Port Already in Use

**Problem:** Port 3000 or 5000 already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in .env files
```

### Migration Errors

**Problem:** Migration fails

**Solution:**
```bash
# Reset database
npx sequelize-cli db:migrate:undo:all

# Run migrations again
npx sequelize-cli db:migrate
```

### CORS Errors

**Problem:** Frontend can't connect to backend

**Solution:**
- Check `CORS_ORIGIN` in backend `.env`
- Ensure both frontend and backend are running
- Check browser console for exact error

---

