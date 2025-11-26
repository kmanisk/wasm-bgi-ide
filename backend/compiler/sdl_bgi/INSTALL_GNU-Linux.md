# Installing `SDL2_bgi` on GNU/Linux

The easiest way to install `SDL2_bgi` is by using the binary packages
provided at <http://sdl-bgi.sourceforge.io/#download> in `.deb` and
`.rpm` format.

Alternatively, you can easily compile `SDL2_bgi` yourself, as shown
below.

The following sections were tested with `SDL2-2.32.10` on a GNU/Linux
Mint 21.


## Compiling from sources

Please make sure you have SDL2 development packages. On Debian, Mint,
Ubuntu and similar distributions, please install `libsdl2-dev` and its
dependencies; in Fedora, please install `SDL2-devel`. Obviously,
you'll also need `make` and a C compiler; `gcc` or `clang` are fine.


### Using `make`

To compile and install `SDL2_bgi`, run the following commands:

    $ VERSION=3.0.4
    $ tar zxvf SDL2_bgi-$VERSION.tar.gz
    $ cd SDL2_bgi-$VERSION/src
    $ make
    $ sudo make install

Files will be installed in appropriate directories:

    SDL2_bgi.h      ->  /usr/include/SDL2/
    graphics.h      ->  /usr/include/
    libSDL2_bgi.so  ->  /usr/lib/
    libSDL_bgi.so   ->  /usr/lib/libSDL2_bgi.so  # symlink
    sdl_bgi.py      ->  last entry in Python sys.path

The `libSDL_bgi.so` symlink will ensure compatibility with previous
versions of `SDL_bgi`. 


### Using `cmake`

This only works if `cmake` and `cpack` are installed.

To compile the `SDL2_bgi` library and make `.deb` or `.rpm` packages:

    $ VERSION=3.0.4
    $ tar zxvf SDL2_bgi-$VERSION.tar.gz
    $ cd SDL2_bgi-$VERSION
    $ ./mkpkg.sh

which creates a subdirectory called `build/`, moves to it, runs
`cmake`, then `cpack`. In a few seconds, in directory `build/` you
will find a package that should be suitable for your system (`.deb` or
`.rpm`). You'll want to install that.

If you prefer the usual way:

    $ mkdir build && cd build
    $ cmake ..
    $ make && sudo make install 

To uninstall:

    $ make uninstall


## Test Programs

Once `SDL2_bgi` is installed, you can compile some test programs you
can find in the `test/` directory. Type:

    $ cd test && make

Please file see file `doc/using.pdf`.

Enjoy!

Guido =8-)
