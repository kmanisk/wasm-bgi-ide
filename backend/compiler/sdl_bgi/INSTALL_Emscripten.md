# `SDL2_bgi` and Emscripten

Unmodified `SDL2_bgi` programs can be compiled to WebAssembly using the
[Emscripten](https://emscripten.org/) compiler `emcc`. Use the following
tools to produce standalone `html` files that can be run in supported
browsers:

- `src/Makefile` provides a `wasm` target, only available when the
`EMSDK` environment variable is defined;
- `test/emcc.sh` can be used to compile a program;
- `test/Makefile.emcc` compiles the demo programs.

Emscripten support was tested with `emcc` 4.0.13 on GNU/Linux Mint 21.


## Installing Emscripten Support

Emscripten must be properly installed, and the `EMSDK` environment
variable must be defined; please consult the Emscripten [Download and
install](https://emscripten.org/docs/getting_started/downloads.html)
page.

To compile `SDL2_bgi` and install Emscripten support:

```
$ cd src/
src/$ make wasm
*** Building on Linux ***
...
src/$ make clean
```

Files will be installed in appropriate directories:

```
graphics.h     -> $EMSDK/upstream/emscripten/cache/sysroot/include
SDL2_bgi.h     -> $EMSDK/upstream/emscripten/cache/sysroot/include/SDL2
libSDL2_bgi.a  -> $EMSDK/upstream/emscripten/cache/sysroot/lib/wasm32-emscripten
```

To uninstall:

```
$ cd src/
src/$ make unwasm
```

