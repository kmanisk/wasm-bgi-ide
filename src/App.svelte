<script lang="ts">
	import { writable, get } from "svelte/store";

	// Code editor content
	const code = writable(`#include "graphics.h"
int main() {
  initwindow(600, 400, "WASM Test");
  setcolor(RED);
  circle(300, 200, 150);
  setcolor(WHITE);
  outtextxy(250, 190, "WASM LIVE!");
  getch();
  closegraph();
  return 0;
}`);

	const status = writable("Idle");
	const fontSize = writable(14);
	let theme: "light" | "dark" = "light";

	let iframeContainer: HTMLDivElement;

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

				// Create blob URL for the compiled HTML
				const blob = new Blob([data.html], { type: "text/html" });
				const url = URL.createObjectURL(blob);

				const iframe = document.createElement("iframe");
				iframe.src = url;
				iframe.width = "600";
				iframe.height = "400";
				iframe.style.border = "1px solid #333";

				iframeContainer.innerHTML = "";
				iframeContainer.appendChild(iframe);
			} else {
				status.set("Compilation failed");
				alert(data.message);
			}
		} catch (err) {
			console.error("Compilation error:", err);
			status.set("Error during compilation");
			alert("Compilation error: " + err);
		}
	}
</script>

<main class={theme}>
	<div class="sidebar">
		<h2>RetroRaster</h2>
		<p>Status: {$status}</p>

		<label>
			Font Size:
			<input type="number" bind:value={$fontSize} min="10" max="24" />
		</label>

		<label>
			Theme:
			<select bind:value={theme}>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		</label>

		<button on:click={compileCode}>Compile & Run</button>
		<p>Click inside canvas for getch() input.</p>
	</div>

	<div class="editor">
		<textarea bind:value={$code} style="font-size:{$fontSize}px"></textarea>
		<div class="iframe-container" bind:this={iframeContainer}></div>
	</div>
</main>

<style>
	main {
		display: flex;
		height: 100vh;
		font-family: "Fira Code", monospace;
		background: #f0f0f0;
		color: #111;
	}

	.sidebar {
		width: 250px;
		border-right: 1px solid #ddd;
		padding: 1rem;
		background: #fafafa;
	}

	.editor {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
	}

	textarea {
		flex: 1;
		font-family: "Fira Code", monospace;
		background: #1e1e1e;
		color: #d4d4d4;
		border: none;
		padding: 0.5rem;
		resize: none;
	}

	.iframe-container {
		flex: 1;
		border: 1px solid #333;
		margin-top: 1rem;
		background: #000;
	}

	button {
		margin-top: 0.5rem;
		padding: 0.5rem 1rem;
		background: #4caf50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
	button:hover {
		background: #45a049;
	}
</style>
