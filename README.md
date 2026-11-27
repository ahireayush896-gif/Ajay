# Todo Web Application

A clean, sophisticated, dark-mode glassmorphic Todo web application built with vanilla HTML5, CSS3, and JavaScript with zero external dependencies or build tools.

## Features

- **Task Creation & Management**: Add tasks with titles, priorities (P0, P1, P2), categories (Work, Personal, Errands), and due dates.
- **Priority Management**: Color-coded badges for quick identification:
  - **P0** (High / Urgent - Red)
  - **P1** (Medium - Amber)
  - **P2** (Low - Blue)
- **Category Filtering & Management**: Organize tasks into Work, Personal, and Errands categories with instant filtering.
- **Task Summary & Statistics**: Real-time stats bar tracking Total, Active, and Completed tasks.
- **Due Date & Overdue Tracking**: Visual indicators highlighting upcoming or overdue tasks.
- **Inline Editing**: Click and edit task descriptions directly in the list.
- **Persistent Storage**: Client-side persistence via `localStorage` (key: `todo_app_state_v1`).
- **Responsive Design**: Elegant glassmorphic UI optimized for desktop and mobile devices.

## Running the Application

Because this is a pure static web application (HTML5, CSS3, Vanilla JS), no build step, bundler, or server is required.

1. Clone or download the repository.
2. Open `index.html` directly in any modern web browser (Chrome, Firefox, Safari, Edge).
   - Alternatively, serve locally using Python:
     ```bash
     python3 -m http.server 8000
     ```
     Then open `http://localhost:8000` in your browser.
