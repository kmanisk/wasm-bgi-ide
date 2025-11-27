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

				if (iframeContainer) {
					iframeContainer.innerHTML = ""; // Clear previous iframe
					const iframe = document.createElement("iframe");
					iframe.src = url;
					iframe.width = "100%";
					iframe.height = "100%";
					iframe.style.border = "none";
					iframeContainer.appendChild(iframe);
				}
			} else {
				status.set("error");
				console.error("Compilation error:", data);
			}
		} catch (error) {
			status.set("error");
			console.error("Error:", error);
		}
	}

	// Theme toggle (unchanged)
	function toggleTheme() {
		theme = theme === "dark" ? "light" : "dark";
	}

	// Font size adjustment (unchanged)
	function increaseFontSize() {
		fontSize.update(n => n + 1);
	}

	function decreaseFontSize() {
		fontSize.update(n => (n > 1 ? n - 1 : n));
	}
</script>

<main class={theme}>
	<div class="editor-container">
		<div class="editor-header">
			<h1>WASM Code Editor</h1>
			<div class="actions">
				<button on:click={compileCode}>Compile</button>
				<button on:click={toggleTheme}>
					{#if theme === "dark"}🌙{:else}☀️{/if}
				</button>
			</div>
		</div>
		<div class="editor">
			<textarea
				bind:value={$code}
				style="font-size: {$fontSize}px; width:100%; height:100%;"
			></textarea>
		</div>
		<div class="output" bind:this={iframeContainer}></div>
		<div class="status">{$status}</div>
	</div>

	<style>
		main {
			font-family: Arial, sans-serif;
			background-color: {
				theme==="dark" ? "#121212" : "#ffffff";
			}
			color: {
				theme==="dark" ? "#ffffff" : "#121212";
			}
			padding: 0;
			margin: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100vh;
		}

		.editor-container {
			background-color: {
				theme==="dark" ? "#1e1e1e" : "#f5f5f5";
			}
			border-radius: 8px;
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
			width: 80%;
			max-width: 800px;
			overflow: hidden;
		}

		.editor-header {
			padding: 16px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			background-color: {
				theme==="dark" ? "#2c2c2c" : "#e0e0e0";
			}
		}

		.actions button {
			background-color: {
				theme==="dark" ? "#007acc" : "#0078d4";
			}
			color: #ffffff;
			border: none;
			padding: 8px 16px;
			border-radius: 4px;
			cursor: pointer;
			font-size: 14px;
		}

		.actions button:hover {
			background-color: {
				theme==="dark" ? "#005999" : "#005a9e";
			}
		}

		.editor {
			height: 300px;
			border-bottom: 1px solid {
				theme==="dark" ? "#444444" : "#cccccc";
			}
		}

		.output {
			height: 300px;
			padding: 16px;
			overflow: auto;
		}

		.status {
			padding: 8px 16px;
			text-align: center;
			background-color: {
				theme==="dark" ? "#2c2c2c" : "#e0e0e0";
			}
			color: {
				theme==="dark" ? "#00ff00" : "#ff0000";
			}
		}
	</style>
</main>
