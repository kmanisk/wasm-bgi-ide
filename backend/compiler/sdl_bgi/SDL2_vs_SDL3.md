# SDL2_bgi vs SDL3_bgi

As of release 3.0.4, both SDL2 and SDL3 versions of `SDL_bgi`
are functionally equivalent. However, `SDL2_bgi` is the recommended
version to install; apparently, SDL3 still suffers from a few bugs -
at least, on Windows/MSYS2.

When you install either version, a symlink (or a physical copy on
MSYS2) is created that points to either `SDL2_bgi` or `SDL3_bgi`.
The `graphics.h` header will load either `SDL2_bgi` or `SDL3_bgi`.
If you install both versions, you will have to include the desired
header explicitely:

    #include <SDL2/SDL2_bgi.h>

or

    #include <SDL3/SDL3_bgi.h>

If you do want to install both, please bear in mind that `graphics.h`
will load only `SDL2_bgi` or `SDL3_bgi`.

`sdl_bgi.py` will work seamlessly with any `SDL_bgi` version installed.
