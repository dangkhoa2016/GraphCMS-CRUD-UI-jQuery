# GraphCMS CRUD UI (jQuery)

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](readme.vi.md)

A static single-page application providing full CRUD (Create, Read, Update, Delete) functionality for managing **Authors**, **Posts**, and **Comments** via the [Hygraph](https://hygraph.com/) (formerly GraphCMS) GraphQL API.

## Features

- **Authentication** — Client-side cookie-based login (admin panel access)
- **Authors Management** — Create, edit, delete authors with name, email, state, points, birthday, phone
- **Posts Management** — Create, edit, delete posts with title, content (RichText AST), summary, photo, author assignment, and publication state
- **Comments Management** — Create, edit, delete comments linked to posts and authors
- **DataTables Integration** — Sortable, searchable, paginated tables for each entity
- **Image Fallback** — Automatic image preloading with fallback to default placeholder
- **Modal Forms** — SweetAlert2 loading indicators + Bootstrap modals for create/edit/delete confirmation
- **SPA Routing** — Dynamic layout/content loading via custom HTML tags (`<layout>`, `<sidebar>`, `<header>`, `<content>`, `<modals>`)

## Technologies Used

| Category | Library |
|----------|---------|
| Core | Vanilla JS (ES6+), jQuery 3.6 |
| UI Framework | Bootstrap 4.6, AdminLTE 3 |
| Templating | Handlebars 4.7 |
| Tables | DataTables (with Bootstrap 4 theme) |
| Alerts | SweetAlert2 |
| Utilities | accounting-js, dayjs |
| Icons | Font Awesome |
| API | GraphQL (Hygraph/GraphCMS) |

**No build step** — no bundler, transpiler, or package manager. All dependencies load via CDN `<script>` tags.

## Project Structure

```
GraphCMS-CRUD-UI-jQuery/
├── index.html                    # Root entry point — loads CDN libs, config, and main script
├── pages/
│   ├── login.html                # Standalone login page
│   ├── users.html                # Authors listing page (loads users.js)
│   ├── posts.html                # Posts listing page (loads posts.js)
│   └── comments.html             # Comments listing page (loads comments.js)
├── parts/
│   ├── layout.html               # AdminLTE main layout wrapper
│   ├── sidebar.html              # Dark sidebar with navigation menu
│   ├── header.html               # Top navbar with user menu, notifications
│   └── modals.html               # Bootstrap modals (form, confirm, notice)
├── content/
│   ├── index.html                # Dashboard placeholder
│   ├── users.html                # Users DataTable template
│   ├── posts.html                # Posts DataTable template
│   ├── comments.html             # Comments DataTable template
│   ├── user_form.html            # Handlebars form: name, email, state, points, birthday, phone
│   ├── post_form.html            # Handlebars form: title, content, state, summary, photo, author
│   └── comment_form.html         # Handlebars form: comment, post, state, author
├── assets/
│   ├── css/
│   │   └── styles.css            # Custom styles (loader animation, overrides)
│   ├── images/
│   │   ├── favicon.ico
│   │   ├── favicon.png
│   │   └── default.jpg           # Fallback image for broken post photos
│   └── js/
│       ├── config.js             # Central config: API endpoint, credentials, CDN paths
│       ├── script.js             # Main orchestrator: auth, layout loading, routing
│       ├── api-service.js        # GraphQL query service (fetch-based)
│       ├── helper.js             # Cookie utils, form serializer, Handlebars helpers, image helpers
│       ├── crud-base.js          # Reusable CRUD controller (DataTable + save/delete logic)
│       ├── form.js               # ModalForm class (modal show/hide, form binding)
│       ├── users.js              # Authors entity config (queries, columns, validation)
│       ├── posts.js              # Posts entity config (queries, columns, validation)
│       └── comments.js           # Comments entity config (queries, columns, validation)
```

## Architecture

### Application Flow

1. **Entry** — `index.html` loads CDN libraries sequentially, then `config.js`, then `script.js`
2. **Auth Check** — `script.js` checks for admin cookie; if absent, redirects to `/pages/login.html`
3. **Login** — Credentials validated against hardcoded values in `config.js`; on success, sets base64-encoded auth cookie and redirects
4. **Layout Assembly** — Custom HTML tags (`<layout>`, `<sidebar>`, `<header>`, `<modals>`) are replaced by fetching HTML partials from `/parts/`
5. **Content Injection** — The `<content>` tag is populated based on the current URL path (e.g., `/pages/users.html` → `/content/users.html`)
6. **Module Initialization** — Entity-specific JS files declare `window.addition_libs` which are dynamically loaded; each entity instantiates `CrudBase` with its GraphQL queries and DataTable configuration

### Key Modules

- **`ApiService`** (`api-service.js`) — Wraps `fetch` for GraphQL POST requests. Exposes `query()`, `queryAjax()`, `getEndpoint()`.
- **`CrudBase`** (`crud-base.js`) — Reusable controller that initializes a DataTable, wires Add/Edit/Delete buttons, handles form submission via `ModalForm`, and executes GraphQL mutations with SweetAlert2 feedback.
- **`ModalForm`** (`form.js`) — Manages Bootstrap modals for create/edit/delete. Compiles Handlebars templates, binds form submission, and delegates save logic to `CrudBase`.
- **`helper.js`** — Cookie management (`SetCookie`/`GetCookie`/`EraseCookie`), form serialization (`GetFormData`), URL query parsing, base64 auth encoding, string truncation, Handlebars helpers (`formatTime`, `ifCond`, `select`), and image preload/fallback utilities.

### Entity-Specific Modules

Each entity (`users.js`, `posts.js`, `comments.js`) exports a config object to `CrudBase`:

| Entity | GraphQL Queries | DataTable Columns | Form Fields |
|--------|----------------|-------------------|-------------|
| **Authors** | `authors`, `author` (by ID), `createAuthor`, `updateAuthor`, `deleteAuthor` | Name, Email, Posts count, Points, Dates, Actions | Name, Email, State, Points, Birthday, Phone |
| **Posts** | `posts`, `post` (by ID), `authors` (dropdown), `createPost`, `updatePost`, `deletePost` | Title, Summary, Photo, Author, Dates, Actions | Title, Content, State, Summary, Photo URL, Author |
| **Comments** | `comments`, `authors` (dropdown), `posts` (dropdown), `createComment`, `updateComment`, `deleteComment` | Comment, Post, Author, Dates, Actions | Comment, Post, State, Author |

## Configuration

Edit `assets/js/config.js` to customize:

```js
const config = {
  API_ENDPOINT: 'https://eu-central-1.cdn.hygraph.com/content/.../master',
  AUTH: { user: 'admin', password: 'admin' },
  CDN: { /* library CDN URLs */ },
  LOGIN_PATH: '/pages/login',
  LAYOUT_FILES: ['/parts/layout.html', '/parts/sidebar.html', ...]
};
```

## Deployment

Since this is a purely static application, it can be served by any static file server:

```bash
# Python
python3 -m http.server 8000

# Node (npx)
npx serve .

# PHP
php -S localhost:8000
```

**CORS**: The Hygraph/GraphCMS endpoint must allow CORS requests from the serving origin.

## Code Conventions

- 2-space indentation for JS and CSS
- Semicolons required
- Single quotes for strings
- jQuery objects prefixed with `$` (e.g., `$form`, `$table`)
- Modules expose globals via IIFE pattern: `window.ModuleName = (function() { ... return { ... }; })();`

## Security Notes

> This project uses client-side only authentication and has known security limitations:

- **Hardcoded credentials** — `admin`/`admin` in `config.js`
- **Base64 auth in cookie** — Uses `btoa()` (encoding, not encryption); cookie lacks `Secure`, `HttpOnly`, `SameSite` flags
- **Unescaped Handlebars output** — `{{{content}}}`, `{{{summary}}}`, `{{{comment}}}` in form templates render raw HTML
- **No CSRF protection** on POST requests
- **CDN dependency** — AdminLTE theme loads from `admin-lte-cdn.surge.sh` (third-party CDN)

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
