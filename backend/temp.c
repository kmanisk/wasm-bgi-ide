#include "graphics.h"
int main() {
  initwindow(600, 400, "WASM Test");
  setcolor(RED);
  circle(300, 200, 150);
  setcolor(WHITE);
  outtextxy(250, 190, "WASM LIVE!");
  // Note: getch() can block in some WASM builds; click the canvas to interact.
  closegraph();
  return 0;
}