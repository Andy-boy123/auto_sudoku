document.addEventListener('DOMContentLoaded', function() {
    var sudokuGrid = document.querySelector('.sudoku-grid');
    var getAnswerButton = document.getElementById('getAnswerButton');
    var clearButton = document.getElementById('clearButton');
    var backButton = document.getElementById('backButton');
    var currentSudokuData;
    var sudokuCells;

    function showValidationModal(message) {
        var validationResultElement = document.getElementById('validationResult');
        validationResultElement.innerHTML = message;
        $('#validationModal').modal('show');
    }

    // 函数：生成数独表格
    function generateSudokuGrid() {
        sudokuGrid.innerHTML = '';
        sudokuCells = [];

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

                    cell.appendChild(input);
                    row.appendChild(cell);
                    sudokuCells.push(input);
                }

                table.appendChild(row);
            }

            sudokuGrid.appendChild(table);
        }
    }

    // 函数：清空数独表格
    function clearSudoku() {
        sudokuCells.forEach(function(cell) {
            cell.value = '';
            cell.classList.remove('blue-text');
        });
    }

    // 函数：验证数独表格是否合法
    function isSudokuGridValid() {
        for (var i = 0; i < 9; i++) {
            var rowValues = new Set();
            var colValues = new Set();
            var subgridValues = new Set();

            for (var j = 0; j < 9; j++) {
                // 检查行
                var rowCell = sudokuCells[i * 9 + j];
                var rowCellValue = rowCell.value.trim();
                if (rowCellValue !== '' && rowValues.has(rowCellValue)) {
                    return false; // 数字重复，表格无效
                }
                rowValues.add(rowCellValue);

                // 检查列
                var colCell = sudokuCells[j * 9 + i];
                var colCellValue = colCell.value.trim();
                if (colCellValue !== '' && colValues.has(colCellValue)) {
                    return false; // 数字重复，表格无效
                }
                colValues.add(colCellValue);

                // 检查3x3子网格
                var subgridRow = Math.floor(i / 3) * 3 + Math.floor(j / 3);
                var subgridCol = (i % 3) * 3 + (j % 3);
                var subgridCell = sudokuCells[subgridRow * 9 + subgridCol];
                var subgridCellValue = subgridCell.value.trim();
                if (subgridCellValue !== '' && subgridValues.has(subgridCellValue)) {
                    return false; // 数字重复，表格无效
                }
                subgridValues.add(subgridCellValue);
            }
        }

        return true; // 数独表格合法
    }

    // 函数：获取用户填写的数独数据
    function getUserSudokuData() {
        var userSudokuData = [];

        sudokuCells.forEach(function(cell, index) {
            var rowIndex = Math.floor(index / 9);
            var colIndex = index % 9;

            if (!userSudokuData[rowIndex]) {
                userSudokuData[rowIndex] = [];
            }

            var cellValue = cell.value.trim();
            var parsedValue = parseInt(cellValue);

            if (cellValue !== '' && (isNaN(parsedValue) || parsedValue < 1 || parsedValue > 9)) {
                // 非法输入，显示提示并清空单元格
                showValidationModal('请输入合法的数字 (1-9) 或留空。');
                cell.value = '';
                cell.classList.remove('blue-text'); // 移除蓝色文字样式
                return;
            }

            userSudokuData[rowIndex][colIndex] = cellValue !== '' ? parsedValue : 0;

            // 如果单元格有值，且不是用户输入的（来自答案），则将文字颜色设为蓝色
            if (cellValue !== '' && !cell.classList.contains('user-input')) {
                cell.classList.add('blue-text');
            } else {
                cell.classList.remove('blue-text');
            }
        });

        return userSudokuData;
    }

    getAnswerButton.addEventListener('click', function() {
        // 首先获取用户填写的数独数据
        var userSudokuData = getUserSudokuData();

        // 检查数独表格是否合法
        if (!isSudokuGridValid()) {
            showValidationModal('请填写有效的数独题目。');
            return;
        }

        // 检查是否有非法数字
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                var cellValue = userSudokuData[i][j];
                if (cellValue !== 0 && (isNaN(cellValue) || cellValue < 1 || cellValue > 9)) {
                    showValidationModal('请输入合法的数字 (1-9) 或留空。');
                    return;
                }
            }
        }

        // 发送用户填写的数独数据给后端
        fetch('/get_answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userSudoku: userSudokuData })
        })
        .then(response => response.json())
        .then(data => {
            if (data.answer) {
                // 如果成功获取答案，将答案填入数独表格
                for (var k = 0; k < 9; k++) {
                    for (var i = 0; i < 3; i++) {
                        for (var j = 0; j < 3; j++) {
                            var index = k * 9 + i * 3 + j;
                            var cell = sudokuCells[index];
                            cell.value = data.answer[k][i * 3 + j];
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

    clearButton.addEventListener('click', function() {
        clearSudoku();
    });

    backButton.addEventListener('click', function() {
        window.location.href = '/'; // 返回到首页
    });

    // 初始化页面时生成空白数独表格
    generateSudokuGrid();
});
