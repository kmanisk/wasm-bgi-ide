# RetroRaster Deployment & Setup Documentation

RetroRaster is a browser-based IDE I created for running classic C programs with BGI graphics using WebAssembly. This guide explains deployment, dependencies, environment setup, and configuration for the public GitHub repository.

---

## Overview

RetroRaster compiles C graphics code in the browser using a Node.js backend and a Svelte frontend. It uses Emscripten to generate WebAssembly and renders output in an HTML canvas. In short, it lets you write classic BGI C graphics code and see it run directly in the browser.

---

## Demo Media
## Compile Example
![Compile GIF](/frontend/public/compile.gif)

## Recompile Example
![Recompile GIF](/frontend/public/re-compile.gif)

## Screenshot
![UI Screenshot](/frontend/public/pic.png)

---

## Deployment Steps

Follow these steps to run RetroRaster locally.

### 1. Clone the Repository

```bash
git clone https://github.com/kmanisk/wasm-bgi-ide.git
cd wasm-bgi-ide
```

### 2. Obtain Dependencies: Emscripten SDK & SDL2_BGI

RetroRaster needs Emscripten and SDL2_BGI for WASM compilation and BGI graphics.

#### Download and Set Up Emscripten SDK

```bash
git clone https://github.com/emscripten-core/emsdk.git backend/compiler/emsdk
cd backend/compiler/emsdk
./emsdk install latest
./emsdk activate latest
cd ../../..
```

#### Download SDL2_BGI

```bash
curl -L -o SDL2_bgi-3.0.4.tar.gz https://sourceforge.net/projects/sdl-bgi/files/SDL2_bgi-3.0.4.tar.gz/download
```

> **Note:** These libraries are intentionally excluded from source control by `.gitignore`.

### 3. Install Node.js Dependencies

Install dependencies for backend and frontend with `pnpm`, `npm`, or `yarn`.

#### Backend

```bash
cd backend
pnpm install
```

#### Frontend

```bash
cd ../frontend
pnpm install
```
### 4. Run the App
```bash
pnpm dev
```
<!-- 
---

## Environment Setup & Configuration

### Directory Structure

```plaintext
RetroRaster/
├─ backend/
│  ├─ compiler/
│  │  ├─ emsdk/         # Emscripten SDK (external)
│  │  └─ sdl_bgi/       # SDL2_BGI library (external)
│  ├─ server.js         # Node.js backend
│  └─ package.json
├─ frontend/
│  ├─ src/
│  │  └─ App.svelte
│  └─ package.json
└─ .gitignore
``` -->
<!-- 
### .gitignore Settings

Ensure these entries exist to avoid committing large or generated files.

```plaintext
backend/compiler/emsdk/
backend/compiler/sdl_bgi/
node_modules/
dist/
``` -->
<!-- 
---

## Running the Application Locally

### 1. Start the Backend (Compilation Server)

```bash
cd backend
node server.js
```

- Serves at `http://localhost:3000`.
- Compiles C code to WASM for the frontend. -->

<!-- ### 2. Start the Frontend (Svelte Application)

```bash
cd ../frontend
pnpm dev
```

- Runs at `http://localhost:5173`.
- Connects to the backend for compilation. -->

<!-- ---

## Usage Flow

1. Open `http://localhost:5173` in your browser.
2. Edit or paste C code in the editor.
3. Click **"Compile & Run"**.
4. View graphics in the canvas and interact as needed.

--- -->

## Example: C Code for Graphics

```c
#include "graphics.h"

int main()
{
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

---

## Backend API Endpoint

The frontend calls this endpoint to compile code.

```api
{
    "title": "Compile C Code to WASM",
    "description": "Compiles submitted C code with BGI graphics to WebAssembly and returns the result.",
    "method": "POST",
    "baseUrl": "http://localhost:3000",
    "endpoint": "/api/compile",
    "headers": [
        {
            "key": "Content-Type",
            "value": "application/json",
            "required": true
        }
    ],
    "queryParams": [],
    "pathParams": [],
    "bodyType": "json",
    "requestBody": "{\n  \"code\": \"#include \\\"graphics.h\\\"\\nint main() { ... }\"\n}",
    "responses": {
        "200": {
            "description": "Compilation successful",
            "body": "{\n  \"result\": \"<html>...compiled WASM output...</html>\"\n}"
        },
        "400": {
            "description": "Compilation error",
            "body": "{\n  \"error\": \"Compilation failed: [error details]\"\n}"
        }
    }
}
```

---

## Configuration Options

- **Frontend Port**: `5173` (Svelte dev server).
- **Backend Port**: `3000` (`server.js`).
- **Editor Options**: Font size and theme set in the frontend UI.
- **Toolchain Paths**: Emscripten and SDL2_BGI paths configured in backend compiler logic.

<!-- ---

## Project Structure Summary

| Directory                | Purpose                                  |
|--------------------------|------------------------------------------|
| backend/compiler/        | External toolchains and libraries        |
| backend/server.js        | Node.js compilation server               |
| frontend/src/App.svelte  | Main Svelte application component        |
| frontend/package.json    | Frontend dependencies and scripts        |
| .gitignore               | Excludes large and generated artifacts   |

--- -->

## Browser Compatibility

- Requires WebAssembly support.
- Works on current Chrome, Firefox, and Edge versions.

---

## License

RetroRaster uses the MIT License. Include the license text with distributions or substantial portions of the software.

---

```card
{
    "title": "Best Practice",
    "content": "Do not commit external dependencies or build artifacts to version control. Use .gitignore as described."
}
```

---

## Summary

Use this guide to install dependencies, configure the environment, and run RetroRaster locally for C BGI graphics.
