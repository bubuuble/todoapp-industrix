## 📖 Technical Q&A

## Database Design Questions

### 1. What database tables did you create and why?

**Tables Created:**

**a) Categories Table**
```sql
CREATE TABLE Categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(50) DEFAULT '#1890ff',
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);
```

**Purpose:** 
- Organize todos into logical groups (e.g., Work, Personal, Shopping)
- Provide visual differentiation with color coding
- Enable filtering todos by category

**b) Todos Table**
```sql
CREATE TABLE Todos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority VARCHAR(50) DEFAULT 'medium',
  due_date TIMESTAMP,
  category_id INTEGER REFERENCES Categories(id),
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);
```

**Purpose:**
- Store individual todo items with all necessary metadata
- Track completion status, priority, and deadlines
- Link to categories through foreign key relationship

**Relationships:**
- **One-to-Many:** One Category can have many Todos
- **Foreign Key:** `category_id` in Todos references Categories
- **Optional Relationship:** Todos can exist without a category (category_id is nullable)
- **Cascade Behavior:** When category is deleted, todos' category_id is set to NULL (not cascading delete to preserve todos)

**Why This Structure?**

1. **Normalization:** Categories are separated to avoid data duplication
2. **Flexibility:** Todos can be categorized or uncategorized
3. **Scalability:** Easy to add more fields or relationships later
4. **Performance:** Simple joins for most queries
5. **Data Integrity:** Foreign key constraints ensure referential integrity

### 2. How did you handle pagination and filtering in the database?

**Pagination Implementation:**

```typescript
// Backend Controller
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const offset = (page - 1) * limit;

const { count, rows } = await Todo.findAndCountAll({
  where: whereCondition,
  limit: limit,
  offset: offset,
  order: [['createdAt', 'DESC']]
});

return {
  data: rows,
  pagination: {
    total: count,
    current_page: page,
    per_page: limit,
    total_pages: Math.ceil(count / limit)
  }
};
```

**Filtering Queries:**

```typescript
const where: any = {};

// Search filter (full-text search)
if (search) {
  where[Op.or] = [
    { title: { [Op.iLike]: `%${search}%` } },
    { description: { [Op.iLike]: `%${search}%` } }
  ];
}

// Category filter
if (category) {
  where.category_id = category;
}

// Priority filter
if (priority) {
  where.priority = priority;
}

// Completed status filter
if (completed !== undefined) {
  where.completed = completed === 'true';
}
```

**Efficient Pagination:**
- **OFFSET/LIMIT:** Uses database-level pagination, not loading all records
- **COUNT Query:** Separate count query for accurate total pages
- **Indexed Columns:** Primary keys automatically indexed for fast lookups
- **Lazy Loading:** Only fetches requested page data

**Indexes (Recommended for Production):**

```sql
-- Improve filtering performance
CREATE INDEX idx_todos_completed ON Todos(completed);
CREATE INDEX idx_todos_priority ON Todos(priority);
CREATE INDEX idx_todos_category_id ON Todos(category_id);
CREATE INDEX idx_todos_created_at ON Todos(createdAt);

-- Improve search performance
CREATE INDEX idx_todos_title ON Todos USING gin(to_tsvector('english', title));
```

**Why These Indexes?**
- `completed`, `priority`, `category_id`: Frequently used in WHERE clauses
- `createdAt`: Used for sorting
- `title` (full-text): Improves search performance for large datasets

---

## Technical Decision Questions

### 1. How did you implement responsive design?

**Breakpoints Used:**

```typescript
// Ant Design default breakpoints
xs: 0-576px    // Mobile
sm: 576-768px  // Large mobile
md: 768-992px  // Tablet
lg: 992-1200px // Desktop
xl: 1200px+    // Large desktop
```

**Implementation Approach:**

**a) CSS Clamp for Fluid Typography:**
```css
fontSize: 'clamp(20px, 5vw, 30px)'  // Min 20px, Max 30px
padding: 'clamp(12px, 3vw, 24px)'   // Min 12px, Max 24px
```

**b) Flexbox with Wrapping:**
```typescript
<Flex wrap="wrap" gap="middle">
  {/* Components automatically wrap on smaller screens */}
</Flex>
```

**c) Responsive Columns:**
```typescript
// Table columns with responsive visibility
{
  title: 'Category',
  responsive: ['sm'],  // Hidden on mobile
}
```

**d) Flexible Form Inputs:**
```typescript
style={{ flex: '1 1 200px', minWidth: '200px' }}
// Grows/shrinks but never smaller than 200px
```

**UI Adaptations by Screen Size:**

**Mobile (< 576px):**
- Header stacks vertically
- Search bar takes full width
- Table shows only essential columns
- Modal takes 90% width
- Buttons stack vertically
- Reduced padding/margins

**Tablet (576-992px):**
- Header items wrap naturally
- Form inputs start to show side-by-side
- More table columns visible
- Modal at 90% with max-width

**Desktop (> 992px):**
- Full horizontal layouts
- All table columns visible
- Side-by-side form inputs
- Fixed max-width containers (1000px)
- Optimal spacing

**Ant Design Components for Responsiveness:**

1. **Flex:** Auto-wrapping layouts with `wrap` prop
2. **Grid:** Responsive column system
3. **Space:** Adaptive spacing with `wrap` support
4. **Table:** Built-in `responsive` prop for columns
5. **Modal:** Percentage-based widths with `maxWidth`
6. **Form:** Vertical layout on mobile, horizontal on desktop

### 2. How did you structure your React components?

**Component Hierarchy:**

```
App Layout (layout.tsx)
└── TodoProvider (Context)
    └── Home Page (page.tsx)
        ├── Header Section
        │   ├── Title
        │   └── Action Buttons
        │       ├── New Task Button → TodoForm
        │       └── New Category Button → CategoryForm
        ├── Search Bar
        └── Card
            └── Table
                └── Todo Rows
                    └── Action Buttons (Edit/Delete)

Modals (Conditional Render):
├── TodoForm (Add/Edit Todo)
└── CategoryForm (Manage Categories)
```

**State Management:**

**Global State (Context API):**
```typescript
// context/TodoContext.tsx
const TodoContext = createContext<TodoContextType | null>(null);

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta>({...});

  // Shared functions
  const fetchTodos = async (page, search) => {...};
  const addTodo = async (data) => {...};
  const updateTodo = async (id, data) => {...};
  const deleteTodo = async (id) => {...};
  
  return (
    <TodoContext.Provider value={{...}}>
      {children}
    </TodoContext.Provider>
  );
};
```

**Local State (Component Level):**
```typescript
// page.tsx
const [isModalVisible, setIsModalVisible] = useState(false);
const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
const [searchText, setSearchText] = useState("");

// CategoryForm.tsx
const [editingId, setEditingId] = useState<number | null>(null);
```

**State Flow:**

1. **Context Provider** wraps entire app in `layout.tsx`
2. **Page component** consumes context with `useTodos()` hook
3. **Child components** receive props from page
4. **Form submissions** call context functions → update global state → trigger re-render

**Filtering & Pagination State:**

```typescript
// Stored in Context
const [pagination, setPagination] = useState({
  current_page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0
});

// Managed in page component
const [searchText, setSearchText] = useState("");

// Fetch function combines both
const fetchTodos = async (page = 1, search = "") => {
  const res = await axios.get('/todos', {
    params: { page, limit: 10, search }
  });
  setTodos(res.data.data);
  setPagination(res.data.pagination);
};

// Table handles pagination changes
const handleTableChange = (newPagination) => {
  fetchTodos(newPagination.current, searchText);
};
```

**Why This Structure?**

- **Context API:** Centralized state for todos/categories (avoids prop drilling)
- **Local State:** UI-specific state stays in components (modals, forms)
- **Separation of Concerns:** Each component has single responsibility
- **Reusability:** Forms are reusable for add/edit operations
- **Performance:** Context updates only trigger necessary re-renders

### 3. What backend architecture did you choose and why?

**Architecture: MVC Pattern (Model-View-Controller)**

```
Routes → Controllers → Models → Database
  ↓           ↓
Validators  Error Handlers
```

**File Structure:**

```
backend/src/
├── routes/              # API endpoint definitions
│   ├── todoRoutes.ts
│   └── categoryRoutes.ts
├── controllers/         # Business logic
│   ├── todoController.ts
│   └── categoryController.ts
├── middlewares/         # Reusable middleware
│   ├── validators.ts
│   └── errorHandler.ts
├── models/              # Database models (Sequelize)
│   ├── Todo.ts
│   ├── Category.ts
│   └── index.ts
└── index.ts            # Express app setup
```

**API Route Organization:**

```typescript
// index.ts
app.use('/api/todos', todoRoutes);
app.use('/api/categories', categoryRoutes);

// todoRoutes.ts
router.get('/', getTodos);              // GET /api/todos
router.get('/:id', getTodoById);        // GET /api/todos/:id
router.post('/', createTodo);           // POST /api/todos
router.put('/:id', updateTodo);         // PUT /api/todos/:id
router.delete('/:id', deleteTodo);      // DELETE /api/todos/:id
router.patch('/:id/toggle', toggleTodo); // PATCH /api/todos/:id/toggle
```

**Code Structure (Layered):**

**1. Routes Layer (Routing):**
```typescript
// routes/todoRoutes.ts
import { getTodos, createTodo } from '../controllers/todoController';
import { validateTodo } from '../middlewares/validators';

router.get('/', getTodos);
router.post('/', validateTodo, createTodo);
```

**2. Middleware Layer (Validation):**
```typescript
// middlewares/validators.ts
export const validateTodo = (req, res, next) => {
  const errors = [];
  if (!req.body.title) errors.push('Title required');
  if (errors.length > 0) return res.status(400).json({ errors });
  next();
};
```

**3. Controller Layer (Business Logic):**
```typescript
// controllers/todoController.ts
export const getTodos = async (req, res) => {
  try {
    const { page, search, category } = req.query;
    const where = buildWhereClause(search, category);
    const { count, rows } = await Todo.findAndCountAll({...});
    res.json({ success: true, data: rows, pagination: {...} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

**4. Model Layer (Data Access):**
```typescript
// models/Todo.ts
class Todo extends Model {
  declare id: number;
  declare title: string;
  // ... Sequelize handles DB queries
}
```

**Error Handling Approach:**

**1. Try-Catch in Controllers:**
```typescript
export const createTodo = async (req, res) => {
  try {
    const todo = await Todo.create(req.body);
    res.status(201).json({ success: true, data: todo });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error creating todo',
      error: error.message 
    });
  }
};
```

**2. Validation Middleware:**
```typescript
// Runs before controller
const validateTodo = (req, res, next) => {
  const errors = validate(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};
```

**3. Centralized Error Handler:**
```typescript
// middlewares/errorHandler.ts
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// 404 Handler
export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
};

// Applied at the end
app.use(notFound);
app.use(errorHandler);
```

**Why This Architecture?**

1. **Separation of Concerns:** Each layer has specific responsibility
2. **Maintainability:** Easy to locate and fix bugs
3. **Testability:** Controllers can be unit tested independently
4. **Scalability:** Easy to add new features/endpoints
5. **Reusability:** Middleware can be reused across routes
6. **Consistency:** Standardized error responses
7. **TypeScript:** Strong typing prevents runtime errors

### 4. How did you handle data validation?

**Validation Strategy: Both Frontend and Backend**

**Frontend Validation (First Line of Defense):**

```typescript
// components/TodoForm.tsx
<Form.Item 
  name="title" 
  label="Title" 
  rules={[
    { required: true, message: 'Please input title!' },
    { max: 200, message: 'Title too long!' }
  ]}
>
  <Input placeholder="What needs to be done?" />
</Form.Item>

<Form.Item 
  name="priority" 
  rules={[
    { required: true, message: 'Please select priority!' }
  ]}
>
  <Select>
    <Select.Option value="high">High</Select.Option>
    <Select.Option value="medium">Medium</Select.Option>
    <Select.Option value="low">Low</Select.Option>
  </Select>
</Form.Item>
```

**Backend Validation (Security Layer):**

```typescript
// middlewares/validators.ts
export const validateTodo = (req, res, next) => {
  const { title, priority } = req.body;
  const errors: string[] = [];

  // Required fields
  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }

  // Length validation
  if (title && title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  // Enum validation
  if (priority && !['low', 'medium', 'high'].includes(priority)) {
    errors.push('Priority must be low, medium, or high');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors 
    });
  }

  next();
};
```

**Validation Rules Implemented:**

| Field | Frontend | Backend | Rules |
|-------|----------|---------|-------|
| Title | ✅ | ✅ | Required, max 200 chars |
| Description | - | - | Optional, text |
| Priority | ✅ | ✅ | Required, enum (low/medium/high) |
| Category | - | - | Optional, must exist in DB |
| Due Date | - | - | Optional, valid date |
| Category Name | ✅ | ✅ | Required, max 50 chars |
| Category Color | - | - | Optional, hex color |

**Why Both Frontend & Backend?**

**Frontend Validation:**
- ✅ **UX:** Instant feedback without server round-trip
- ✅ **Performance:** Reduces unnecessary API calls
- ✅ **User-Friendly:** Clear error messages inline
- ❌ **Security:** Can be bypassed (browser DevTools)

**Backend Validation:**
- ✅ **Security:** Cannot be bypassed
- ✅ **Data Integrity:** Ensures valid data in database
- ✅ **API Protection:** Guards against direct API calls
- ✅ **Consistency:** Single source of truth

**Double Validation Approach:**
1. Frontend validates → Improves UX
2. Backend validates → Ensures security
3. Both use same rules → Consistency

**Additional Safety Measures:**

```typescript
// Database-level constraints (Sequelize)
title: {
  type: DataTypes.STRING,
  allowNull: false,        // NOT NULL constraint
  validate: {
    notEmpty: true,        // Cannot be empty string
    len: [1, 200]          // Length constraint
  }
}

priority: {
  type: DataTypes.STRING,
  validate: {
    isIn: [['low', 'medium', 'high']]  // Enum constraint
  }
}
```

This multi-layered approach ensures:
- **Best UX** (frontend validation)
- **Best Security** (backend validation)
- **Best Data Quality** (database constraints)

---

## Testing & Quality Questions

### 1. What did you choose to unit test and why?

**Testing Strategy (If Implemented):**

**Functions/Methods with Tests:**

**a) Controllers (Business Logic):**
```typescript
// tests/controllers/todoController.test.ts

describe('Todo Controller', () => {
  // Edge case: Empty database
  test('GET /todos returns empty array when no todos', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  // Edge case: Invalid data
  test('POST /todos fails without title', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ description: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('Title is required');
  });

  // Edge case: Pagination beyond limits
  test('GET /todos handles page beyond total', async () => {
    const res = await request(app).get('/api/todos?page=9999');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  // Happy path
  test('POST /todos creates todo successfully', async () => {
    const todo = { title: 'Test', priority: 'high', category_id: 1 };
    const res = await request(app).post('/api/todos').send(todo);
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Test');
  });
});
```

**b) Validation Middleware:**
```typescript
// tests/middlewares/validators.test.ts

describe('Validators', () => {
  test('validateTodo rejects empty title', () => {
    const req = { body: { title: '' } };
    const res = mockResponse();
    validateTodo(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('validateTodo accepts valid data', () => {
    const req = { body: { title: 'Valid', priority: 'high' } };
    validateTodo(req, mockResponse(), mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
```

**c) Database Queries:**
```typescript
// tests/models/todo.test.ts

describe('Todo Model', () => {
  test('creates todo with valid data', async () => {
    const todo = await Todo.create({ title: 'Test', completed: false });
    expect(todo.id).toBeDefined();
    expect(todo.completed).toBe(false);
  });

  test('fails to create todo without title', async () => {
    await expect(Todo.create({ completed: false }))
      .rejects.toThrow('notNull Violation');
  });
});
```

**Edge Cases Considered:**

1. **Empty/Null Values:**
   - Empty title, description
   - Null category_id
   - Undefined fields

2. **Boundary Values:**
   - Title exactly 200 characters
   - Title 201 characters (should fail)
   - Page 0 or negative
   - Limit 0 or > 100

3. **Invalid Types:**
   - String for category_id (should be number)
   - Invalid date format
   - Invalid priority value

4. **Database Errors:**
   - Foreign key constraint (non-existent category)
   - Unique constraint violations
   - Connection failures

5. **Pagination Edge Cases:**
   - Page beyond total pages
   - Limit = 0
   - Empty result set

**Test Structure:**

```typescript
// tests/
├── setup.ts              // Test database setup
├── controllers/
│   ├── todoController.test.ts
│   └── categoryController.test.ts
├── middlewares/
│   └── validators.test.ts
├── models/
│   ├── todo.test.ts
│   └── category.test.ts
└── integration/
    └── api.test.ts       // Full API flow tests
```

**Why These Tests?**

- **Controllers:** Core business logic, most bugs occur here
- **Validators:** Security-critical, must catch all invalid data
- **Models:** Ensure database constraints work
- **Integration:** Verify full request-response cycle

**Testing Tools:**
- **Jest:** Test runner
- **Supertest:** HTTP assertions
- **Factory functions:** Generate test data
- **Test database:** Isolated from development DB

### 2. If you had more time, what would you improve or add?

**Technical Debt to Address:**

1. **Error Handling:**
   - Implement custom error classes (NotFoundError, ValidationError)
   - Add error logging service (Winston, Sentry)
   - Better error messages with error codes

2. **Performance:**
   - Add Redis caching for frequently accessed data
   - Implement database connection pooling optimization
   - Add database indexes for search queries
   - Lazy loading for categories in todo list

3. **Code Quality:**
   - Add ESLint + Prettier configuration
   - Increase TypeScript strictness
   - Add JSDoc comments for complex functions
   - Implement service layer (separate from controllers)

4. **Testing:**
   - Increase test coverage to 80%+
   - Add E2E tests with Playwright/Cypress
   - Add performance/load testing
   - Add CI/CD pipeline with automated testing

**Features to Add:**

1. **Authentication & Authorization:**
   - User registration and login (JWT)
   - User-specific todos
   - Role-based access control (admin/user)
   - OAuth integration (Google, GitHub)

2. **Advanced Todo Features:**
   - Subtasks/checklist within todos
   - Todo templates
   - Recurring todos (daily, weekly)
   - Attachments/file uploads
   - Tags system (in addition to categories)
   - Todo sharing/collaboration

3. **UI/UX Improvements:**
   - Dark mode toggle
   - Drag-and-drop todo reordering
   - Bulk operations (select multiple, bulk delete)
   - Keyboard shortcuts
   - Toast notifications for actions
   - Undo/redo functionality

4. **Analytics & Insights:**
   - Productivity dashboard
   - Completion rate charts
   - Time tracking per todo
   - Weekly/monthly reports
   - Streak tracking

5. **Notifications:**
   - Email reminders for due dates
   - Push notifications (PWA)
   - Webhook integrations (Slack, Discord)

6. **Data Management:**
   - Import/export (CSV, JSON)
   - Data backup and restore
   - Archive completed todos
   - Soft delete with trash bin

**Refactoring Ideas:**

1. **Backend:**
```typescript
// Current
export const getTodos = async (req, res) => {
  try {
    const todos = await Todo.findAll();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Improved with Service Layer
class TodoService {
  async getAllTodos(filters: TodoFilters): Promise<TodoResult> {
    // Business logic here
  }
}

export const getTodos = async (req, res) => {
  const filters = buildFilters(req.query);
  const result = await todoService.getAllTodos(filters);
  res.json(result);
};
```

2. **Frontend:**
```typescript
// Current: Context with all logic
// Improved: Separate hooks for different concerns

// hooks/useTodos.ts
export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  // ... todo logic
  return { todos, addTodo, updateTodo, deleteTodo };
};

// hooks/useCategories.ts
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  // ... category logic
  return { categories, addCategory, updateCategory };
};

// hooks/usePagination.ts
export const usePagination = (fetchFn) => {
  const [pagination, setPagination] = useState({...});
  // ... pagination logic
  return { pagination, goToPage, nextPage, prevPage };
};
```

3. **Configuration:**
```typescript
// Add config management
// config/index.ts
export const config = {
  api: {
    baseUrl: process.env.API_URL,
    timeout: 5000,
    retries: 3
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  },
  cache: {
    ttl: 60000, // 1 minute
    enabled: true
  }
};
```

**Priority Order for Improvements:**

1. **Authentication** (Most valuable feature)
2. **Unit Tests** (Technical debt)
3. **Service Layer** (Architecture improvement)
4. **Dark Mode** (Quick win for UX)
5. **Error Logging** (Production readiness)
6. **Caching** (Performance)
7. **Advanced Filters** (User experience)
8. **CI/CD** (Development workflow)

---

## 📝 License

This project is created for educational purposes.

## 👥 Authors

- Your Name

## 🙏 Acknowledgments

- Next.js Team
- Ant Design Team
- Sequelize Team
- PostgreSQL Community

---

**Last Updated:** November 26, 2025
