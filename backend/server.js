import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import cors from "cors"; // Allow cross-origin requests

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow requests from frontend
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Static files

// Compiler directories
const COMPILER_DIR = path.join(__dirname, "compiler");
const EMSDK = path.join(COMPILER_DIR, "emsdk", "upstream", "emscripten");

// POST /api/compile
app.post("/api/compile", async (req, res) => {
	const code = req.body.code;
	if (!code) return res.status(400).json({ status: "error", message: "No code provided" });

	const tempC = path.join(__dirname, "temp.c"); // Temp C file
	const outputHTML = path.join(__dirname, "compiled.html"); // Output HTML

	try {
		fs.writeFileSync(tempC, code, "utf-8");
		const cmd = `"${path.join(EMSDK, "emcc")}" "${tempC}" "${path.join(COMPILER_DIR, "sdl_bgi", "src", "SDL2_bgi.c")}" -I "${path.join(COMPILER_DIR, "sdl_bgi", "src")}" -sUSE_SDL=2 -sALLOW_MEMORY_GROWTH=1 -sSINGLE_FILE=1 -sASYNCIFY -O3 -o "${outputHTML}"`;

		// const cmd = `"${path.join(EMSDK, "emcc")}" "${tempC}" "${path.join(COMPILER_DIR, "sdl_bgi", "src", "SDL2_bgi.c")}" -I "${path.join(COMPILER_DIR, "sdl_bgi", "src")}" -sUSE_SDL=2 -sALLOW_MEMORY_GROWTH=1 -sSINGLE_FILE=1 -O3 -o "${outputHTML}"`;

		exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
			if (error) {
				console.error("Compilation stderr:", stderr);
				return res.status(500).json({ status: "error", message: stderr || "Compilation failed" });
			}

			try {
				const html = fs.readFileSync(outputHTML, "utf-8");
				// Return full HTML as a string
				res.json({ status: "success", html });
			} catch (readErr) {
				console.error("Failed to read compiled HTML:", readErr);
				res.status(500).json({ status: "error", message: "Failed to read compiled HTML" });
			}
		});
	} catch (err) {
		console.error("Unexpected error:", err);
		res.status(500).json({ status: "error", message: "Internal server error" });
	}
});

app.listen(PORT, () => {
	console.log(`Backend running at http://localhost:${PORT}`);
});
