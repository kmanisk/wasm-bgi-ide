<script lang="ts">
	import { writable, get } from "svelte/store";

	// Stores
	const code = writable(`#include "graphics.h"
int main() {
  initwindow(600, 400, "WASM Test");
  setcolor(RED);
  circle(300, 200, 150);
  outtextxy(250, 190, "WASM LIVE!");
  getch();
  closegraph();
  return 0;
}`);
	const status = writable("Idle");
	const fontSize = writable(16);
	let theme: "light" | "dark" = "dark";

	let iframeContainer: HTMLDivElement;

	// Compile Function (unchanged)
	async function compileCode() {
		status.set("Compiling...");
		const codeValue = get(code);

		try {
			const res = await fetch("/api/compile", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code: codeValue }),
			});

			if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
			const data = await res.json();

			if (data.status === "success") {
				status.set("success");

				const blob = new Blob([data.html], { type: "text/html" });
				const url = URL.createObjectURL(blob);

				const iframe = document.createElement("iframe");
				iframe.src = url;
				iframe.style.border = "none";
				iframe.width = "100%";
				iframe.height = "100%";

				iframeContainer.innerHTML = "";
				iframeContainer.appendChild(iframe);
			} else {
				status.set("failed");
				alert(data.message);
			}
		} catch (err) {
			console.error("Compilation error:", err);
			status.set("error");
			alert("Compilation error: " + err);
		}
	}

	// --- Resize Logic ---
	let isResizing = false;
	let startX = 0;
	let startWidth = 0;

	function startResize(e: MouseEvent) {
		isResizing = true;
		startX = e.clientX;

		const editorElem = document.getElementById("editor-pane");
		startWidth = editorElem!.getBoundingClientRect().width;

		document.addEventListener("mousemove", resizeDrag);
		document.addEventListener("mouseup", stopResize);
	}

	function resizeDrag(e: MouseEvent) {
		if (!isResizing) return;
		const editorElem = document.getElementById("editor-pane");
		editorElem!.style.width = startWidth + (e.clientX - startX) + "px";
	}

	function stopResize() {
		isResizing = false;
		document.removeEventListener("mousemove", resizeDrag);
		document.removeEventListener("mouseup", stopResize);
	}
</script>

<!-- ===================== UI ===================== -->

<main class="app {theme}">
	<header class="topbar">
		<h1>RetroRaster</h1>

		<div class="settings">
			<label title="Editor Font Size">
				Font:
				<input type="number" bind:value={$fontSize} min="10" max="28" />
			</label>

			<label title="Theme Mode">
				Theme:
				<select bind:value={theme}>
					<option value="dark">Dark</option>
					<option value="light">Light</option>
				</select>
			</label>

			<button on:click={compileCode}>Compile & Run</button>

			<span class="status {$status === 'success' ? 'ok' : ''}">
				{$status === "success" ? "Compilation Successful" : $status}
			</span>
		</div>
	</header>

	<div class="workspace">
		<div id="editor-pane" class="pane editor-pane">
			<textarea bind:value={$code} style="font-size: {$fontSize}px;"></textarea>
		</div>

		<div class="divider" on:mousedown={startResize}></div>

		<div class="pane output-pane">
			<div class="iframe-wrapper" bind:this={iframeContainer}></div>
		</div>
	</div>
</main>

<!-- ===================== STYLE ===================== -->

<style>
	@import url("https://cdn.jsdelivr.net/npm/iosevka@27.3.0/dist/iosevka-web.css");

	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		font-family: "Iosevka Web", monospace;
	}

	.app {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* Top Bar */
	.topbar {
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 1rem;
		border-bottom: 1px solid #333;
		background: #1d1d1d;
		color: white;
	}

	.topbar h1 {
		font-size: 20px;
		font-weight: 600;
		letter-spacing: 1px;
		text-shadow: 0 0 4px #00f2ff;
	}

	.settings {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.settings input,
	.settings select {
		padding: 2px 6px;
	}

	.status {
		padding: 4px 8px;
		border-radius: 4px;
		background: #444;
		color: #ddd;
	}

	.status.ok {
		background: #0f0;
		color: #000;
		font-weight: bold;
	}

	/* Workspace Split */
	.workspace {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	.pane {
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	/* Editor pane */
	.editor-pane {
		width: 50%;
		background: #121212;
	}

	textarea {
		flex: 1;
		background: #121212;
		color: #eee;
		border: none;
		outline: none;
		padding: 1rem;
		resize: none;
		width: 100%;
		height: 100%;
	}

	/* Divider */
	.divider {
		width: 6px;
		cursor: col-resize;
		background: #333;
	}
	.divider:hover {
		background: #555;
	}

	/* Output pane */
	.output-pane {
		flex: 1;
		background: #000;
		display: flex;
	}

	.iframe-wrapper {
		width: 100%;
		height: 100%;
		border: none;
	}

	.iframe-wrapper iframe {
		width: 100%;
		height: 100%;
	}

	/* Light Theme */
	.light {
		background: #f0f0f0;
		color: #111;
	}

	.light textarea {
		background: #fff;
		color: #111;
	}

	.light .topbar {
		background: #e3e3e3;
		color: #111;
	}
</style>
