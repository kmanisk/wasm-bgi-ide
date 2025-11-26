This is a comprehensive description of the **RetroRaster** project. To present this as a proper `README.md` file, I'll organize the information using standard Markdown conventions, including headings, lists, code blocks, and the final license section.

Here is the complete `README.md` content you can copy:

```markdown
# 🎨 RetroRaster: BGI Graphics in the Browser

RetroRaster is a modern, web-based Integrated Development Environment (IDE) that lets you compile and run classic **C programs with BGI (Borland Graphics Interface) graphics** directly in your browser. This is achieved by leveraging **WebAssembly (WASM)**, compiled using the Emscripten SDK and an SDL2-based BGI implementation.

---

## ✨ Features

* **WASM Compilation:** Compile C code with BGI graphics directly to WebAssembly using a Node.js backend and Emscripten.
* **Interactive Graphics:** Run compiled graphics programs instantly inside an interactive HTML `<canvas>` element in the browser.
* **Real-time Feedback:** Provides real-time compilation status, detailed error handling, and console logging.
* **Modern Interface:** Built with Svelte, featuring an editable font size and a toggle for light/dark themes.
* **Portable:** Operates entirely in any modern browser—no local compiler setup or installation is required for users.

---

## 🛠️ Project Structure

The project is split into a Node.js compilation **backend** and a Svelte **frontend**.

RetroRaster/
├─ backend/
│ ├─ compiler/ ← Emscripten SDK and SDL2_BGI sources (excluded from Git)
│ ├─ server.js ← Node.js server for handling compilation requests
│ └─ package.json
├─ frontend/
│ ├─ src/
│ │ └─ App.svelte ← Main Svelte application component
│ └─ package.json
└─ .gitignore

> **Note:** The `emsdk` and `sdl_bgi` directories are external dependencies that must be downloaded locally and are intentionally excluded from the repository (see `.gitignore`).

---

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repo_url>
cd RetroRaster
````

### 2\. Download Dependencies

The project relies on the **Emscripten SDK** for WASM compilation and the **SDL2\_BGI** library for BGI compatibility.

#### Emscripten SDK

```bash
git clone [https://github.com/emscripten-core/emsdk.git](https://github.com/emscripten-core/emsdk.git) backend/compiler/emsdk
cd backend/compiler/emsdk
./emsdk install latest
./emsdk activate latest
cd ../../.. # Return to RetroRaster root
```

#### SDL2\_BGI

```bash
git clone [https://github.com/tschaub/SDL2_bgi.git](https://github.com/tschaub/SDL2_bgi.git) backend/compiler/sdl_bgi
```

### 3\. Install Node Dependencies

Install dependencies for both the backend and the frontend using `pnpm` (or `npm`/`yarn`).

```bash
cd backend
pnpm install
cd ../frontend
pnpm install
```

-----

## ▶️ Running Locally

### Backend (Compilation Server)

```bash
cd backend
node server.js
```

The compilation server will start at `http://localhost:3000`.

### Frontend (Svelte App)

```bash
cd frontend
pnpm dev
```

The Svelte frontend runs at `http://localhost:5173` and automatically connects to the backend API for compilation.

-----

## 💻 Usage

1.  **Open** the frontend in your browser (`http://localhost:5173`).
2.  **Write or modify** C code in the editor (example code is preloaded).
3.  Click **"Compile & Run"**.
4.  The graphics output will appear inside the **interactive canvas**.
5.  **Press keys** inside the canvas to interact with BGI functions like `getch()`.

### Example C Code

The following simple program demonstrates drawing a circle and text:

```c
#include "graphics.h"

int main() {
    initwindow(600, 400, "WASM Test");
    setcolor(RED);
    circle(300, 200, 150);
    setcolor(WHITE);
    outtextxy(250, 190, "WASM LIVE!");
    getch();
    closegraph();
    return 0;
}
```

-----

## ⚙️ Technical Details

### Backend Features (Node.js)

  * **API Endpoint:** Accepts C code via `POST /api/compile`.
  * **Compilation:** Invokes the Emscripten toolchain, linking against the SDL2\_BGI library.
  * **Output:** Returns the compiled WASM-integrated HTML/JS to the frontend as a blob for dynamic embedding.
  * **Robustness:** Includes graceful handling for compilation errors and exceptions.

### Frontend Features (Svelte)

  * **Sidebar:** Includes controls for:
      * Real-time compilation status and logs.
      * Input to adjust code editor font size.
      * Toggle for Light/Dark theme.
  * **Code Editor:** A syntax-highlighted editor with an adjustable size.
  * **Canvas Container:** Dynamically loads and runs the compiled HTML output from the backend.

-----

## ⚠️ Notes

  * **Git Exclusion:** Do **not** push `emsdk` and `sdl_bgi` to GitHub. They are large, local dependencies. The `.gitignore` file should exclude:
    ```bash
    backend/compiler/emsdk/
    backend/compiler/sdl_bgi/
    node_modules/
    dist/
    ```
  * **Browser Compatibility:** A modern web browser with robust **WebAssembly execution** support is required.

-----
## License

MIT License © 2025 kmanisk.  
Permission is granted to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this software, under the condition that the copyright notice and this permission notice are included in all copies.  
The software is provided "as is", without any warranty.
