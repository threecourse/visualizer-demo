from queue import Queue

import numpy as np
import pandas as pd
from .problem import Problem


class Solver:

    def __init__(self):
        pass

    def solve(self, problem: Problem):

        # 初期化
        cells = problem.cells.copy()
        H, W = cells.shape
        sy, sx = -1, -1
        n_foods = 0
        for y in range(H):
            for x in range(W):
                if cells[y, x] == 'S':
                    sy, sx = y, x
                    cells[y, x] = '.'
                if cells[y, x] == 'o':
                    n_foods += 1

        y, x = sy, sx
        INF = 100000
        drs = [(-1, 0), (0, -1), (1, 0), (0, 1)]

        commands = []

        # solve
        for d in range(n_foods):
            print(f"solving.. {d}")

            # 幅優先探索を行う
            dists = np.full((H, W), INF)
            q = Queue()
            q.put((y, x, 0))

            while not q.empty():
                y, x, d = q.get()
                if dists[y, x] != INF:
                    continue

                dists[y, x] = d
                if cells[y, x] == 'o':
                    cells[y, x] = '.'
                    break

                for di, (dy, dx) in enumerate(drs):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < H and 0 <= xx < W and \
                            cells[yy, xx] != '#' and dists[yy, xx] == INF:
                        q.put((yy, xx, d + 1))

            # パスを再現する
            cmds = []
            yr, xr = y, x
            for d in range(dists[yr, xr] - 1, -1, -1):
                for di, (dy, dx) in enumerate(drs):
                    yy, xx = yr + dy, xr + dx
                    if (0 <= yy < H and 0 <= xx < W and
                            cells[yy, xx] != '#' and dists[yy, xx] == d):
                        cmds.append(di)
                        yr, xr = yy, xx
                        break

            cmds = reversed(cmds)
            cmds = [(di + 2) % 4 for di in cmds]

            commands += cmds

        return commands, None


if __name__ == "__main__":
    problem = Problem()
    solver = Solver()
    solver.solve(problem)
