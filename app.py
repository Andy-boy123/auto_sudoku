import threading
from flask import Flask, render_template, jsonify, request
from sudoku_generator import generate_sudoku, is_valid_solution, solve_sudoku_1

app = Flask(__name__)

# 创建一个锁，用于确保在多线程中生成数独时不会出现竞争条件
sudoku_lock = threading.Lock()

# 初始数独谜题
initial_sudoku = generate_sudoku()

# 创建一个锁，用于确保在多线程中求解数独时不会出现竞争条件
solve_lock = threading.Lock()


@app.route('/index')
def index():
    return render_template('index.html')


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/solve_sudoku')
def solve_sudoku():
    return render_template('solve_sudoku.html')


@app.route('/generate_sudoku')
def get_sudoku():
    # 使用锁以确保多个线程不会同时生成数独
    with sudoku_lock:
        sudoku_data = generate_sudoku()
    return jsonify(sudoku_data)


@app.route('/validate_solution', methods=['POST'])
def validate_solution():
    user_solution = request.json.get('solution')  # 获取用户提交的答案

    print(user_solution)  # 打印用户提交的答案

    # 在这里调用答案验证的函数，验证用户答案是否正确
    is_correct = is_valid_solution(initial_sudoku, user_solution)  # is_valid_solution 是验证函数

    return jsonify({'valid': is_correct})  # 返回验证结果


@app.route('/get_answer', methods=['POST'])
def get_answer_endpoint():
    user_sudoku = request.json.get('userSudoku')  # 获取用户当前的数独谜题

    print(user_sudoku)  # 打印数独谜题

    # 使用锁以确保多个线程不会同时求解数独
    with solve_lock:
        solved_sudoku = solve_sudoku_1(user_sudoku)

    print(solved_sudoku)  # 打印数独答案

    return jsonify({'answer': solved_sudoku})  # 返回数独答案


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
