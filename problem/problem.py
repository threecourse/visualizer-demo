import numpy as np
import pandas as pd


# https://atcoder.jp/contests/rco-contest-2017-qual/tasks/rco_contest_2017_qual_b


class Problem:

    def __init__(self, seed: int = 71):

        # parameter
        MIN_H = 30
        MAX_H = 30
        MIN_W = 30
        MAX_W = 30
        MIN_N_RATIO = 0.1
        MAX_N_RATIO = 0.15
        MIN_DANCE_RATIO = 0.8
        MAX_DANCE_RATIO = 0.8

        DIRS = "UDLR-"
        dr = [-1, 1, 0, 0, 0]
        dc = [0, 0, -1, 1, 0]
        rand = np.random.RandomState(seed)

        # 壁の配置
        # マップ中央からstep回ランダムウォーク
        # 移動する前に、1/3の確率で方向をランダムに変える、移動の結果端に到達したら中央にワープする

        H = rand.randint(MIN_H, MAX_H + 1)
        W = rand.randint(MIN_W, MAX_W + 1)
        cells = np.full((H, W), '#')

        center_y = H // 2
        center_x = W // 2
        y = center_y
        x = center_x
        step = rand.randint((int)(H * W * MIN_DANCE_RATIO), (int)(H * W * MAX_DANCE_RATIO) + 1)
        dir = rand.randint(4)

        for i in range(step):
            cells[y, x] = '.'
            if rand.random() < 0.33:
                if rand.randint(H + W) < H:
                    dir = 0 + rand.randint(2)
                else:
                    dir = 2 + rand.randint(2)
            ny = y + dr[dir]
            nx = x + dc[dir]
            if 1 <= ny < H - 1 and 1 <= nx < W - 1:
                y, x = ny, nx
            else:
                y, x = center_y, center_x

        # 壁の無いセルの列挙
        empty_cells = []
        for y in range(H):
            for x in range(W):
                if cells[y, x] == '.':
                    empty_cells.append((y, x))

        # スタート地点の決定
        _si = rand.randint(len(empty_cells))
        start_y, start_x = empty_cells[_si]
        cells[start_y, start_x] = 'S'

        empty_cells.remove(empty_cells[_si])

        # foodの配置
        n_empty = len(empty_cells)
        n_food = rand.randint((int)(n_empty * MIN_N_RATIO), (int)(n_empty * MAX_N_RATIO))
        food_idxes = rand.permutation(np.arange(n_empty))
        for idx in food_idxes[:n_food]:
            y, x = empty_cells[idx]
            cells[y, x] = 'o'

        self.cells = cells
        self.start_y = start_y
        self.start_x = start_x

    def render(self) -> str:
        lines = ["".join([self.cells[y, x] for x in range(self.cells.shape[1])])
                 for y in range(self.cells.shape[0])]
        return "\n".join(lines)


if __name__ == "__main__":
    map = Problem()
    print(map.render())
