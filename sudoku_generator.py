# sudoku_generator.py
import random


def is_valid(board, row, col, num):
    # 检查行是否合法
    if num in board[row]:
        return False

    # 检查列是否合法
    if num in [board[i][col] for i in range(9)]:
        return False

    # 检查3x3子网格是否合法
    start_row, start_col = 3 * (row // 3), 3 * (col // 3)
    for i in range(start_row, start_row + 3):
        for j in range(start_col, start_col + 3):
            if board[i][j] == num:
                return False

    return True


def is_complete(board):
    for row in range(9):
        for col in range(9):
            if board[row][col] == 0:
                return False
    return True


def solve_sudoku(board):
    for row in range(9):
        for col in range(9):
            if board[row][col] == 0:
                for num in range(1, 10):
                    if is_valid(board, row, col, num):
                        board[row][col] = num
                        if solve_sudoku(board):
                            return True
                        board[row][col] = 0
                return False
    return True


def solve_sudoku_1(board):
    for row in range(9):
        for col in range(9):
            if board[row][col] == 0:
                for num in range(1, 10):
                    if is_valid(board, row, col, num):
                        board[row][col] = num
                        if solve_sudoku(board):
                            return board  # 返回解决后的数独矩阵
                        board[row][col] = 0
                return None  # 返回 None 表示解决失败
    return board  # 返回解决后的数独矩阵


def generate_sudoku():
    # 创建一个9x9的空数独谜题
    board = [[0 for _ in range(9)] for _ in range(9)]

    # 使用回溯算法解决空数独谜题
    if solve_sudoku(board):
        # 随机挖洞，生成题目
        num_holes = random.randint(40, 60)  # 谜题难度可以根据挖洞数量调整
        for _ in range(num_holes):
            row, col = random.randint(0, 8), random.randint(0, 8)
            while board[row][col] == 0:
                row, col = random.randint(0, 8), random.randint(0, 8)
            board[row][col] = 0

        return board
    else:
        # 如果没有解决方案，返回一个空矩阵
        return [[0] * 9 for _ in range(9)]


def is_valid_solution(initial_board, user_solution):
    # 创建一个副本以防止修改原始数独
    board = [row[:] for row in initial_board]

    # 填充用户答案到数独中
    for row in range(9):
        for col in range(9):
            if board[row][col] == 0:
                num = user_solution[row * 9 + col]
                if not is_valid(board, row, col, num):
                    return False
                board[row][col] = num

    # 检查用户答案是否解决数独
    if solve_sudoku(board) and is_complete(board) and is_valid_numbers(board):
        return True
    return False


def is_valid_numbers(board):
    # 检查每行
    for row in range(9):
        num_set = set()
        for col in range(9):
            num = board[row][col]
            if num != 0:
                if num in num_set:
                    return False
                num_set.add(num)

    # 检查每列
    for col in range(9):
        num_set = set()
        for row in range(9):
            num = board[row][col]
            if num != 0:
                if num in num_set:
                    return False
                num_set.add(num)

    # 检查每个3x3子网格
    for start_row in range(0, 9, 3):
        for start_col in range(0, 9, 3):
            num_set = set()
            num_sum = 0  # 用于检查数字和是否为45
            for row in range(start_row, start_row + 3):
                for col in range(start_col, start_col + 3):
                    num = board[row][col]
                    if num != 0:
                        if num in num_set:
                            return False
                        num_set.add(num)
                        num_sum += num
            if num_sum != 45:  # 检查数字和是否为45
                return False

    # 检查每个3x3子网格中是否有重复数字
    for start_row in range(0, 9, 3):
        for start_col in range(0, 9, 3):
            num_set = set()
            for row in range(start_row, start_row + 3):
                for col in range(start_col, start_col + 3):
                    num = board[row][col]
                    if num != 0:
                        if num in num_set:
                            return False
                        num_set.add(num)

    return True
