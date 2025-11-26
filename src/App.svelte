<script lang="ts">
	import { writable, get } from "svelte/store";
	import { onMount, onDestroy } from "svelte";

	// --- Editor state ---
	const code = writable(`#include "graphics.h"
int main() {
  initwindow(600, 400, "WASM Test");
  setcolor(RED);
  circle(300, 200, 150);
  setcolor(WHITE);
  outtextxy(250, 190, "WASM LIVE!");
  // Note: getch() can block in some WASM builds; click the canvas to interact.
  closegraph();
  return 0;
}`);

	const status = writable("Idle"); // "Idle" | "Compiling..." | "Compilation successful!" | "Compilation failed"
	const fontSize = writable(15);
	let theme: "light" | "dark" = "dark";

	// --- Split state (vertical) ---
	// leftWidth is percentage of container used by editor pane
	let leftWidth = 50; // start 50%
	let dragging = false;
	let startX = 0;
	let startWidth = 0;
	let containerEl: HTMLDivElement;

	// --- Output iframe container ref ---
	let outputContainer: HTMLDivElement;

	// --- Compile function (API unchanged) ---
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
				status.set("Compilation successful!");
				showCompiledHTML(data.html);
			} else {
				status.set("Compilation failed");
				alert(data.message);
			}
		} catch (err) {
			console.error("Compilation error:", err);
			status.set("Compilation failed");
			alert("Compilation error: " + (err?.message ?? err));
		}
	}

	// Insert compiled HTML into an iframe (blob URL)
	function showCompiledHTML(html: string) {
		try {
			const blob = new Blob([html], { type: "text/html" });
			const url = URL.createObjectURL(blob);

			// create iframe and fill container (responsive)
			const iframe = document.createElement("iframe");
			iframe.src = url;
			iframe.style.width = "100%";
			iframe.style.height = "100%";
			iframe.style.border = "0";
			iframe.setAttribute("title", "RetroRaster output");

			// clear and append
			outputContainer.innerHTML = "";
			outputContainer.appendChild(iframe);

			// revoke url on unload of iframe later if needed (kept simple)
		} catch (err) {
			console.error("Failed to render compiled HTML", err);
			alert("Failed to render compiled output.");
		}
	}

	// --- Drag handlers for split resizing ---
	function handleMouseDown(e: MouseEvent) {
		dragging = true;
		startX = e.clientX;
		startWidth = leftWidth;
		document.body.style.cursor = "col-resize";
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
		e.preventDefault();
	}

	function handleMouseMove(e: MouseEvent) {
		if (!dragging || !containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		const dx = e.clientX - startX;
		// convert dx px -> percentage
		const widthPx = (startWidth / 100) * rect.width + dx;
		const newPct = Math.max(20, Math.min(80, (widthPx / rect.width) * 100)); // clamp 20%-80%
		leftWidth = newPct;
	}

	function handleMouseUp() {
		dragging = false;
		document.body.style.cursor = "";
		window.removeEventListener("mousemove", handleMouseMove);
		window.removeEventListener("mouseup", handleMouseUp);
	}

	// --- keyboard shortcut: Ctrl/Cmd+Enter to compile ---
	function onKeyDown(e: KeyboardEvent) {
		const mac = navigator.platform.toUpperCase().includes("MAC");
		if (
			(mac && e.metaKey && e.key === "Enter") ||
			(!mac && e.ctrlKey && e.key === "Enter")
		) {
			e.preventDefault();
			compileCode();
		}
	}

	onMount(() => {
		window.addEventListener("keydown", onKeyDown);
	});
	onDestroy(() => {
		window.removeEventListener("keydown", onKeyDown);
	});
</script>

<!-- <!-- <script lang="ts"> --> -->
<!-- <!-- 	import { writable, get } from "svelte/store"; --> -->
<!-- <!----> -->
<!-- <!-- 	// Code editor content --> -->
<!-- <!-- 	const code = writable(`#include "graphics.h" --> -->
<!-- <!-- int main() { --> -->
<!-- <!--   initwindow(600, 400, "WASM Test"); --> -->
<!-- <!--   setcolor(RED); --> -->
<!-- <!--   circle(300, 200, 150); --> -->
<!-- <!--   setcolor(WHITE); --> -->
<!-- <!--   outtextxy(250, 190, "WASM LIVE!"); --> -->
<!-- <!--   getch(); --> -->
<!-- <!--   closegraph(); --> -->
<!-- <!--   return 0; --> -->
<!-- <!-- }`); --> -->
<!-- <!----> -->
<!-- <!-- 	const status = writable("Idle"); --> -->
<!-- <!-- 	const fontSize = writable(14); --> -->
<!-- <!-- 	let theme: "light" | "dark" = "light"; --> -->
<!-- <!----> -->
<!-- <!-- 	let iframeContainer: HTMLDivElement; --> -->
<!-- <!----> -->
<!-- <!-- 	async function compileCode() { --> -->
<!-- <!-- 		status.set("Compiling..."); --> -->
<!-- <!-- 		const codeValue = get(code); --> -->
<!-- <!----> -->
<!-- <!-- 		try { --> -->
<!-- <!-- 			const res = await fetch("/api/compile", { --> -->
<!-- <!-- 				method: "POST", --> -->
<!-- <!-- 				headers: { "Content-Type": "application/json" }, --> -->
<!-- <!-- 				body: JSON.stringify({ code: codeValue }), --> -->
<!-- <!-- 			}); --> -->
<!-- <!----> -->
<!-- <!-- 			if (!res.ok) throw new Error(`HTTP error: ${res.status}`); --> -->
<!-- <!-- 			const data = await res.json(); --> -->
<!-- <!----> -->
<!-- <!-- 			if (data.status === "success") { --> -->
<!-- <!-- 				status.set("Compilation successful!"); --> -->
<!-- <!----> -->
<!-- <!-- 				// Create blob URL for the compiled HTML --> -->
<!-- <!-- 				const blob = new Blob([data.html], { type: "text/html" }); --> -->
<!-- <!-- 				const url = URL.createObjectURL(blob); --> -->
<!-- <!----> -->
<!-- <!-- 				const iframe = document.createElement("iframe"); --> -->
<!-- <!-- 				iframe.src = url; --> -->
<!-- <!-- 				iframe.width = "600"; --> -->
<!-- <!-- 				iframe.height = "400"; --> -->
<!-- <!-- 				iframe.style.border = "1px solid #333"; --> -->
<!-- <!----> -->
<!-- <!-- 				iframeContainer.innerHTML = ""; --> -->
<!-- <!-- 				iframeContainer.appendChild(iframe); --> -->
<!-- <!-- 			} else { --> -->
<!-- <!-- 				status.set("Compilation failed"); --> -->
<!-- <!-- 				alert(data.message); --> -->
<!-- <!-- 			} --> -->
<!-- <!-- 		} catch (err) { --> -->
<!-- <!-- 			console.error("Compilation error:", err); --> -->
<!-- <!-- 			status.set("Error during compilation"); --> -->
<!-- <!-- 			alert("Compilation error: " + err); --> -->
<!-- <!-- 		} --> -->
<!-- <!-- 	} --> -->
<!-- <!-- </script> --> -->
<!-- <!----> -->
<!-- <!-- <main class={theme}> --> -->
<!-- <!-- 	<div class="sidebar"> --> -->
<!-- <!-- 		<h2>RetroRaster</h2> --> -->
<!-- <!-- 		<p>Status: {$status}</p> --> -->
<!-- <!----> -->
<!-- <!-- 		<label> --> -->
<!-- <!-- 			Font Size: --> -->
<!-- <!-- 			<input type="number" bind:value={$fontSize} min="10" max="24" /> --> -->
<!-- <!-- 		</label> --> -->
<!-- <!----> -->
<!-- <!-- 		<label> --> -->
<!-- <!-- 			Theme: --> -->
<!-- <!-- 			<select bind:value={theme}> --> -->
<!-- <!-- 				<option value="light">Light</option> --> -->
<!-- <!-- 				<option value="dark">Dark</option> --> -->
<!-- <!-- 			</select> --> -->
<!-- <!-- 		</label> --> -->
<!-- <!----> -->
<!-- <!-- 		<button on:click={compileCode}>Compile & Run</button> --> -->
<!-- <!-- 		<p>Click inside canvas for getch() input.</p> --> -->
<!-- <!-- 	</div> --> -->
<!-- <!----> -->
<!-- <!-- 	<div class="editor"> --> -->
<!-- <!-- 		<textarea bind:value={$code} style="font-size:{$fontSize}px"></textarea> -->
-->
<!-- <!-- 		<div class="iframe-container" bind:this={iframeContainer}></div> --> -->
<!-- <!-- 	</div> --> -->
<!-- <!-- </main> --> -->
<!-- <!----> -->
<!-- <!-- <style> --> -->
<!-- <!-- 	main { --> -->
<!-- <!-- 		display: flex; --> -->
<!-- <!-- 		height: 100vh; --> -->
<!-- <!-- 		font-family: "Fira Code", monospace; --> -->
<!-- <!-- 		background: #f0f0f0; --> -->
<!-- <!-- 		color: #111; --> -->
<!-- <!-- 	} --> -->
<!-- <!----> -->
<!-- <!-- 	.sidebar { --> -->
<!-- <!-- 		width: 250px; --> -->
<!-- <!-- 		border-right: 1px solid #ddd; --> -->
<!-- <!-- 		padding: 1rem; --> -->
<!-- <!-- 		background: #fafafa; --> -->
<!-- <!-- 	} --> -->
<!-- <!----> -->
<!-- <!-- 	.editor { --> -->
<!-- <!-- 		flex: 1; --> -->
<!-- <!-- 		display: flex; --> -->
<!-- <!-- 		flex-direction: column; --> -->
<!-- <!-- 		padding: 0.5rem; --> -->
<!-- <!-- 	} --> -->
<!-- <!----> -->
<!-- <!-- 	textarea { --> -->
<!-- <!-- 		flex: 1; --> -->
<!-- <!-- 		font-family: "Fira Code", monospace; --> -->
<!-- <!-- 		background: #1e1e1e; --> -->
<!-- <!-- 		color: #d4d4d4; --> -->
<!-- <!-- 		border: none; --> -->
<!-- <!-- 		padding: 0.5rem; --> -->
<!-- <!-- 		resize: none; --> -->
<!-- <!-- 	} --> -->
<!-- <!----> -->
<!-- <!-- 	.iframe-container { --> -->
<!-- <!-- 		flex: 1; --> -->
<!-- <!-- 		border: 1px solid #333; --> -->
<!-- <!-- 		margin-top: 1rem; --> -->
<!-- <!-- 		background: #000; --> -->
<!-- <!-- 	} --> -->
<!-- <!----> -->
<!-- <!-- 	button { --> -->
<!-- <!-- 		margin-top: 0.5rem; --> -->
<!-- <!-- 		padding: 0.5rem 1rem; --> -->
<!-- <!-- 		background: #4caf50; --> -->
<!-- <!-- 		color: white; --> -->
<!-- <!-- 		border: none; --> -->
<!-- <!-- 		border-radius: 4px; --> -->
<!-- <!-- 		cursor: pointer; --> -->
<!-- <!-- 	} --> -->
<!-- <!-- 	button:hover { --> -->
<!-- <!-- 		background: #45a049; --> -->
<!-- <!-- 	} --> -->
<!-- <!-- </style> --> -->
<!-- <!----> -->
<!-- <script lang="ts"> -->
<!-- 	import { writable, get } from "svelte/store"; -->
<!---->
<!-- 	const code = writable(`#include "graphics.h" -->
<!-- int main() { -->
<!--   initwindow(600, 400, "WASM Test"); -->
<!--   setcolor(RED); -->
<!--   circle(300, 200, 150); -->
<!--   setcolor(WHITE); -->
<!--   outtextxy(250, 190, "WASM LIVE!"); -->
<!--   getch(); -->
<!--   closegraph(); -->
<!--   return 0; -->
<!-- }`); -->
<!---->
<!-- 	const status = writable("Idle"); -->
<!-- 	const fontSize = writable(15); -->
<!-- 	let theme: "light" | "dark" = "dark"; -->
<!---->
<!-- 	let iframeContainer: HTMLDivElement; -->
<!---->
<!-- 	async function compileCode() { -->
<!-- 		status.set("Compiling..."); -->
<!-- 		const codeValue = get(code); -->
<!---->
<!-- 		try { -->
<!-- 			const res = await fetch("/api/compile", { -->
<!-- 				method: "POST", -->
<!-- 				headers: { "Content-Type": "application/json" }, -->
<!-- 				body: JSON.stringify({ code: codeValue }), -->
<!-- 			}); -->
<!---->
<!-- 			if (!res.ok) throw new Error(`HTTP error: ${res.status}`); -->
<!-- 			const data = await res.json(); -->
<!---->
<!-- 			if (data.status === "success") { -->
<!-- 				status.set("Compilation successful!"); -->
<!---->
<!-- 				const blob = new Blob([data.html], { type: "text/html" }); -->
<!-- 				const url = URL.createObjectURL(blob); -->
<!---->
<!-- 				const iframe = document.createElement("iframe"); -->
<!-- 				iframe.src = url; -->
<!-- 				iframe.style.width = "100%"; -->
<!-- 				iframe.style.height = "100%"; -->
<!-- 				iframe.style.border = "0"; -->
<!---->
<!-- 				iframeContainer.innerHTML = ""; -->
<!-- 				iframeContainer.appendChild(iframe); -->
<!-- 			} else { -->
<!-- 				status.set("Compilation failed"); -->
<!-- 				alert(data.message); -->
<!-- 			} -->
<!-- 		} catch (err) { -->
<!-- 			console.error("Compilation error:", err); -->
<!-- 			status.set("Error during compilation"); -->
<!-- 			alert("Compilation error: " + err); -->
<!-- 		} -->
<!-- 	} -->
<!-- </script> -->
<!---->
<!-- <main class={theme}> -->
<!-- 	<!-- Sidebar --> -->
<!-- 	<div class="sidebar"> -->
<!-- 		<h1>RetroRaster</h1> -->
<!-- 		<p class="status">Status: {$status}</p> -->
<!---->
<!-- 		<div class="control"> -->
<!-- 			<label>Font Size</label> -->
<!-- 			<input type="number" bind:value={$fontSize} min="10" max="28" /> -->
<!-- 		</div> -->
<!---->
<!-- 		<div class="control"> -->
<!-- 			<label>Theme</label> -->
<!-- 			<select bind:value={theme}> -->
<!-- 				<option value="light">Light</option> -->
<!-- 				<option value="dark">Dark</option> -->
<!-- 			</select> -->
<!-- 		</div> -->
<!---->
<!-- 		<button class="run-btn" on:click={compileCode}>⚡ Compile & Run</button> -->
<!---->
<!-- 		<p class="hint">Click inside canvas for getch() input.</p> -->
<!-- 	</div> -->
<!---->
<!-- 	<!-- Editor + Preview --> -->

<main class={theme}>
	<!-- Left column: sidebar with brand and controls -->
	<div class="sidebar">
		<div class="brand">
			<div class="logo" aria-hidden>RR</div>
			<div>
				<div class="title">RetroRaster</div>
				<small class="hint">C → WASM graphics IDE</small>
			</div>
		</div>

		<div class="controls">
			<div
				class="status {$status === 'Compilation successful!'
					? 'success'
					: $status === 'Compilation failed'
						? 'error'
						: ''}"
			>
				<div class="dot"></div>
				<div class="small">Status</div>
			</div>

			<div class="control-row">
				<label class="small" title="Editor font size">Font</label>
				<input type="number" bind:value={$fontSize} min="10" max="28" />
			</div>

			<div class="control-row">
				<label class="small" title="Toggle theme">Theme</label>
				<select bind:value={theme} aria-label="Theme">
					<option value="dark">Dark</option>
					<option value="light">Light</option>
				</select>
			</div>

			<button class="run" on:click={compileCode} aria-label="Compile and Run">
				Compile & Run
			</button>

			<div class="hint">
				Tip: press <strong>Ctrl/Cmd + Enter</strong> to run.
			</div>
		</div>
	</div>

	<!-- Workspace: two panes with draggable gutter -->
	<div class="workspace" bind:this={containerEl}>
		<!-- Editor pane -->
		<div class="pane editor-pane" style="width: {leftWidth}%; min-width:20%;">
			<div class="editor-top">
				<div class="meta">Editor</div>
				<div style="flex:1"></div>
				<div
					class="status-text {$status === 'Compilation successful!'
						? 'success'
						: $status === 'Compilation failed'
							? 'error'
							: ''}"
				>
					{$status}
				</div>
			</div>

			<textarea
				bind:value={$code}
				style="font-size: {$fontSize}px;"
				spellcheck="false"
				aria-label="C code editor"
			></textarea>
		</div>

		<!-- Gutter -->
		<div
			class="gutter"
			on:mousedown={handleMouseDown}
			title="Drag to resize panes"
		>
			<div class="bar" />
		</div>

		<!-- Preview pane -->
		<div
			class="pane preview-pane"
			style="width: calc(100% - {leftWidth}% - 10px); min-width:20%;"
		>
			<div class="preview-top">
				<div class="meta">Output</div>
				<div style="flex:1"></div>
				<div class="small hint">Click canvas to focus for keyboard input</div>
			</div>

			<div class="preview-body" bind:this={outputContainer}></div>
		</div>
	</div>
</main>

<!-- Load Iosevka if available; fallback to monospace -->
<style>
	@import url("https://fonts.cdnfonts.com/css/iosevka");

	:global(html, body) {
		height: 100%;
		margin: 0;
	}

	/* Root theme variables */
	:root {
		--sidebar-w: 280px;
		--gap: 12px;
	}

	/* Theme specific */
	.light {
		--bg: #f5f7fa;
		--panel: #ffffff;
		--muted: #444;
		--border: #e3e6ea;
		--editor-bg: #fbfcfe;
		--editor-text: #0f1720;
		--accent: #0f62fe;
		--success: #1b8f3a;
	}

	.dark {
		--bg: #0f1418;
		--panel: #121416;
		--muted: #bfc7cc;
		--border: #262a2d;
		--editor-bg: #0b0c0d;
		--editor-text: #e6eef3;
		--accent: #2ea3ff;
		--success: #2ecc71;
	}

	/* Layout */
	main {
		display: flex;
		height: 100vh;
		width: 100vw;
		background: var(--bg);
		color: var(--muted);
		font-family:
			system-ui,
			-apple-system,
			"Segoe UI",
			Roboto,
			"Helvetica Neue",
			Arial;
	}

	/* Sidebar / Top toolbar area */
	.toolbar {
		position: absolute;
		top: 12px;
		left: calc(var(--sidebar-w) + 24px);
		right: 24px;
		height: 40px;
		display: flex;
		align-items: center;
		gap: 12px;
		z-index: 20;
		pointer-events: auto;
	}

	.brand {
		width: var(--sidebar-w);
		padding: 18px;
		display: flex;
		align-items: center;
		gap: 12px;
		background: transparent;
		color: var(--muted);
	}
	.brand .logo {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		background: linear-gradient(135deg, var(--accent), rgba(0, 0, 0, 0.2));
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 700;
		font-family: "Iosevka", monospace;
		letter-spacing: -0.02em;
	}
	.brand .title {
		font-size: 1.05rem;
		font-weight: 700;
		font-family: "Iosevka", monospace;
		color: var(--editor-text);
	}
	.brand small {
		display: block;
		font-size: 0.72rem;
		color: var(--muted);
	}

	/* Left sidebar (vertical) */
	.sidebar {
		width: var(--sidebar-w);
		box-sizing: border-box;
		padding: 18px;
		border-right: 1px solid var(--border);
		background: linear-gradient(180deg, rgba(0, 0, 0, 0.02), transparent);
	}
	.sidebar .controls {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.status {
		display: flex;
		gap: 8px;
		align-items: center;
		font-weight: 600;
		color: var(--muted);
	}
	.status .dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #999;
	}
	.status.success .dot {
		background: var(--success);
	}
	.status.error .dot {
		background: #ff6b6b;
	}

	.small {
		font-size: 0.9rem;
		color: var(--muted);
	}

	.control-row {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	input[type="number"],
	select {
		padding: 6px 8px;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: var(--panel);
		color: var(--editor-text);
	}

	button.run {
		margin-top: 6px;
		padding: 10px 12px;
		border-radius: 8px;
		border: none;
		background: var(--accent);
		color: white;
		font-weight: 700;
		cursor: pointer;
	}
	button.run:disabled {
		opacity: 0.6;
		cursor: default;
	}

	/* Workspace: left editor and right preview */
	.workspace {
		flex: 1;
		display: flex;
		height: 100vh;
		overflow: hidden;
		align-items: stretch;
	}

	.pane {
		height: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.editor-pane {
		background: var(--editor-bg);
		color: var(--editor-text);
	}

	/* Editor top bar */
	.editor-top {
		height: 46px;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 12px;
		border-bottom: 1px solid var(--border);
		background: linear-gradient(180deg, rgba(0, 0, 0, 0.02), transparent);
	}
	.editor-top .meta {
		font-size: 0.88rem;
		color: var(--muted);
	}

	/* The actual textarea editor */
	textarea {
		flex: 1;
		width: 100%;
		border: 0;
		resize: none;
		padding: 18px;
		font-size: var(--code-font-size, 15px);
		font-family: "Iosevka", ui-monospace, SFMono-Regular, Menlo, Monaco,
			"Roboto Mono", "Courier New", monospace;
		line-height: 1.5;
		color: var(--editor-text);
		background: transparent;
		outline: none;
	}

	/* Vertical drag gutter */
	.gutter {
		width: 10px;
		cursor: col-resize;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(0, 0, 0, 0.03),
			transparent
		);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.gutter .bar {
		width: 2px;
		height: 60%;
		background: var(--border);
		border-radius: 2px;
	}

	/* Preview pane */
	.preview-pane {
		background: #000;
		display: flex;
		align-items: stretch;
		justify-content: stretch;
	}
	.preview-top {
		height: 46px;
		display: flex;
		align-items: center;
		padding: 8px 12px;
		gap: 12px;
		border-bottom: 1px solid var(--border);
		background: linear-gradient(180deg, rgba(0, 0, 0, 0.03), transparent);
	}

	.preview-body {
		flex: 1;
		overflow: hidden;
	}

	/* status visuals */
	.status-text {
		font-weight: 600;
	}
	.status-text.success {
		color: var(--success);
	}
	.status-text.error {
		color: #ff6b6b;
	}

	/* tooltips simple */
	.hint {
		font-size: 0.85rem;
		color: var(--muted);
	}

	/* responsiveness */
	@media (max-width: 880px) {
		.sidebar {
			display: none;
		}
		.toolbar {
			left: 12px;
			right: 12px;
		}
	}
</style>
