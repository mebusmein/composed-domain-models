import "./App.css";
import { TaskCard, PostCard } from "./components";
import {
  createWatchableTask,
  type TaskServerData,
} from "./models/function/task";
import {
  createPostListItem,
  type PostServerData,
} from "./models/function/post";

// Mock task data
const taskData: TaskServerData[] = [
  {
    id: "task-1",
    title: "Implement composable models",
    body: "Create a flexible system for building typed domain models from API responses with composable behaviors. This will allow us to easily create different versions of the same model with or without certain relations.",
    status: "in_progress",
    priority: "high",
    isWatched: true,
    tags: ["architecture", "typescript"],
    author: {
      id: "user-1",
      name: "Alex Smith",
      avatarUrl: "https://github.com/alexsmith.png",
    },
  },
  {
    id: "task-2",
    title: "Write unit tests",
    body: "Add comprehensive test coverage for all enhancers and the compose function. Make sure edge cases are handled properly.",
    status: "todo",
    priority: "medium",
    isWatched: false,
    tags: ["testing"],
    author: {
      id: "user-2",
      name: "Jordan Lee",
      avatarUrl: "https://github.com/jordanlee.png",
    },
  },
  {
    id: "task-3",
    title: "Update documentation",
    body: "Document the composable model pattern with examples showing how to create custom enhancers and compose them together.",
    status: "done",
    priority: "low",
    isWatched: false,
    tags: ["docs"],
    author: {
      id: "user-1",
      name: "Alex Smith",
      avatarUrl: "https://github.com/alexsmith.png",
    },
  },
  {
    id: "task-4",
    title: "Performance optimization",
    body: "Profile the compose function and optimize for large arrays of enhancers. Consider memoization strategies.",
    status: "todo",
    priority: "high",
    isWatched: true,
    tags: ["performance", "optimization"],
    author: {
      id: "user-2",
      name: "Jordan Lee",
      avatarUrl: "https://github.com/jordanlee.png",
    },
  },
];

// Mock post data
const postData: PostServerData[] = [
  {
    id: "post-1",
    title: "Getting Started with Composable Models",
    body: "Learn how to build flexible, typed domain models that can be composed from reusable behaviors. This pattern allows you to create different variants of your models for different use cases - like a minimal version for list views and a full version for detail pages.",
    slug: "composable-models-intro",
    published: true,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-12T16:30:00Z",
    author: {
      id: "user-1",
      name: "Alex Smith",
    },
    commentsCount: 42,
    likesCount: 128,
    isWatched: false,
  },
  {
    id: "post-2",
    title: "Advanced TypeScript Patterns",
    body: "Dive deep into conditional types, mapped types, and template literal types. We'll explore how these features enable powerful type inference for our domain model system.",
    slug: "advanced-typescript",
    published: true,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    author: {
      id: "user-2",
      name: "Jordan Lee",
    },
    commentsCount: 18,
    likesCount: 95,
    isWatched: true,
  },
  {
    id: "post-3",
    title: "Draft: Upcoming Features",
    body: "A preview of what's coming next in the composable models library. We're working on support for async enhancers, validation behaviors, and more.",
    slug: "upcoming-features",
    published: false,
    createdAt: "2024-01-18T14:00:00Z",
    updatedAt: "2024-01-18T14:00:00Z",
    author: {
      id: "user-1",
      name: "Alex Smith",
    },
    commentsCount: 0,
    likesCount: 12,
    isWatched: false,
  },
];

// Create domain models from raw data
const tasks = taskData.map(createWatchableTask);
const posts = postData.map(createPostListItem);

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Composable Domain Models</h1>
        <p className="subtitle">Type-safe, flexible data modeling for React</p>
      </header>

      <main className="app-main">
        <section className="section">
          <h2 className="section-title">
            <span className="section-icon">📋</span>
            Tasks
          </h2>
          <div className="card-grid">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">
            <span className="section-icon">📝</span>
            Posts
          </h2>
          <div className="card-grid card-grid--posts">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
