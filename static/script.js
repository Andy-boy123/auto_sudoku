document.addEventListener('DOMContentLoaded', function() {
    var sudokuGrid = document.querySelector('.sudoku-grid');
    var submitButton = document.getElementById('submitButton');
    var getAnswerButton = document.getElementById('getAnswerButton');
    var clearButton = document.getElementById('clearButton'); // 清空按钮
    var refreshButton = document.getElementById('refreshButton'); // 获取题目按钮
    var solveButton = document.getElementById('solveButton'); // 数独求解按钮
    var currentSudokuData; // 用于存储当前数独数据
    var sudokuCells; // 用于存储数独单元格的引用

    function hideSubmitButton() {
        submitButton.style.display = 'none';
    }

    function showSubmitButton() {
        submitButton.style.display = 'block';
    }

    function hideGetAnswerButton() {
        getAnswerButton.style.display = 'none';
    }

    function showGetAnswerButton() {
        getAnswerButton.style.display = 'block';
    }

    function hideClearButton() {
        clearButton.style.display = 'none';
    }

    function showClearButton() {
        clearButton.style.display = 'block';
    }

    function hideValidationModal() {
        $('#validationModal').modal('hide');
    }

    function showValidationModal(message) {
        var validationResultElement = document.getElementById('validationResult');
        validationResultElement.innerHTML = message;
        $('#validationModal').modal('show');
    }

    function lockAllCells() {
        sudokuCells.forEach(function(cell) {
            cell.readOnly = true;
        });
    }

    function unlockAllCells() {
        sudokuCells.forEach(function(cell) {
            cell.readOnly = false;
        });
    }

    function refreshSudoku() {
        fetch('/generate_sudoku')
            .then(response => response.json())
            .then(data => {
                currentSudokuData = data; // 存储当前数独数据
                sudokuGrid.innerHTML = '';
                sudokuCells = []; // 清空数独单元格数组
                for (var k = 0; k < 9; k++) {
                    var table = document.createElement('table');
                    table.classList.add('sudoku-table');
                    for (var i = 0; i < 3; i++) {
                        var row = document.createElement('tr');
                        for (var j = 0; j < 3; j++) {
                            var cell = document.createElement('td');
                            var input = document.createElement('input');
                            input.classList.add('sudoku-cell');
                            input.type = 'number';
                            input.min = '1';
                            input.max = '9';
                            var value = data[k][i * 3 + j];
                            input.value = value !== 0 ? value : '';
                            input.readOnly = value !== 0;

                            if (value !== 0) {
                                input.style.color = '#007bff';
                                input.classList.add('sudoku-cell-readonly');
                            }

                            cell.appendChild(input);
                            row.appendChild(cell);
                            sudokuCells.push(input); // 将数独单元格添加到数组中
                        }
                        table.appendChild(row);
                    }
                    sudokuGrid.appendChild(table);
                }
                showSubmitButton();
                showGetAnswerButton();
                showClearButton(); // 显示清空按钮
            })
            .catch(error => {
                console.error('获取数据时出错:', error);
            });
    }

    refreshSudoku();

    function validateInput(inputElement) {
        var inputValue = inputElement.value;
        var minValue = parseInt(inputElement.min);
        var maxValue = parseInt(inputElement.max);

        if (isNaN(inputValue) || inputValue < minValue || inputValue > maxValue) {
            inputElement.classList.add('error-input');
            return false;
        } else {
            inputElement.classList.remove('error-input');
            return true;
        }
    }

    submitButton.addEventListener('click', function() {
        var userSolution = [];
        var isValidInput = true;

        sudokuCells.forEach(function(cell) {
            if (!validateInput(cell)) {
                isValidInput = false;
            }
            userSolution.push(parseInt(cell.value) || 0);
        });

        if (!isValidInput) {
            showValidationModal('请在提交前填写所有有效的数字（1-9）。');
            return;
        }

        fetch('/validate_solution', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ solution: userSolution })
        })
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                showValidationModal('恭喜！您的答案是正确的。');
                hideSubmitButton();
            } else {
                showValidationModal('抱歉，您的答案不正确。请重试。');
            }
        })
        .catch(error => {
            console.error('提交答案时出错:', error);
        });
    });

    clearButton.addEventListener('click', function() {
        sudokuCells.forEach(function(cell) {
            if (!cell.classList.contains('sudoku-cell-readonly')) { // 只清空非蓝色的单元格
                cell.value = '';
            }
        });
    });

    getAnswerButton.addEventListener('click', function() {
        if (!currentSudokuData) {
            // 如果没有数独数据可用，显示错误消息
            showValidationModal('请先生成数独谜题。');
            return;
        }

        lockAllCells(); // 锁定所有单元格
        hideSubmitButton(); // 隐藏提交按钮
        hideGetAnswerButton(); // 隐藏获取答案按钮
        hideClearButton(); // 隐藏清空按钮

        // 发送上次生成的数独谜题数据到后端获取答案
        fetch('/get_answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userSudoku: currentSudokuData })
        })
        .then(response => response.json())
        .then(data => {
            if (data.answer) {
                showValidationModal('已经获取答案。');
                // 将答案填充到数独单元格中
                for (var k = 0; k < 9; k++) {
                    for (var i = 0; i < 3; i++) {
                        for (var j = 0; j < 3; j++) {
                            var index = k * 9 + i * 3 + j;
                            var cell = sudokuCells[index];
                            if (!cell.classList.contains('sudoku-cell-readonly')) { // 只填充非蓝色的单元格
                                cell.value = data.answer[k][i * 3 + j];
                            }
                        }
                    }
                }
            } else {
                showValidationModal('无法获取答案。');
            }
        })
        .catch(error => {
            console.error('获取答案时出错:', error);
        });
    });

    solveButton.addEventListener('click', function() {
        // 在这里添加跳转到 /solve_sudoku 页面的代码
        window.location.href = '/solve_sudoku';
    });

    refreshButton.addEventListener('click', function() {
        document.getElementById('validationResult').textContent = '';
        hideValidationModal();
        refreshSudoku();
        unlockAllCells(); // 解锁所有单元格
        showSubmitButton();
        showGetAnswerButton();
        showClearButton(); // 显示清空按钮
    });
});
