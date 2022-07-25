const $box = $('#wrapper');
const $score = $('#score');

function getCell(index) {
	return $box.find(`.cell[data-index=${index}]`);
}

const ROW = 30;
const CELL_WIDTH = 20;
const CELL_GAP = 2;
class Puzzle {
	_timer = null;
	_direction = 'RIGHT';
	_speed = 0;
	_cells = Array(ROW * ROW).fill().map((_, i) => i);
	_score = 0;
	_data = [3,2,1,0];
	_cookie = 88;

	init() {
		if (!this._speed) {
			this._speed = $('input[name=speed]:checked').val();
		}
		$box.attr('class', this._direction.toLowerCase());
		this.initCells();
		this.draw();
		$score.text(this._score);

		this.initTimer();
	}

	initTimer(speed) {
		clearInterval(this._timer);
		this._timer = setInterval(() => {
			this.goStep();
			this.draw();
		}, speed || this._speed);
	}

	initAction() {
		$(document).on('keydown', (event) => {
			if (
				event.key === 'ArrowUp' ||
				event.key === 'ArrowDown' ||
				event.key === 'ArrowLeft' ||
				event.key === 'ArrowRight'
			) {
				const direction = event.key.substr('Arrow'.length).toUpperCase();
				if (direction === this._direction) {
					// Click the same direction key to add speed
					this.goStep();
					this.draw();
				}
				this._direction = direction;
				$box.attr('class', this._direction.toLowerCase());
			}
		});
	}

	failed() {
		clearInterval(this._timer);
		alert('芭比Q了...');
	}

	dropNewCookie() {
		const blankCells = this._cells.filter(n => !this._data.includes(n));
		const randomPos = Math.floor(Math.random() * blankCells.length);
		this._cookie = blankCells[randomPos];
	}

	getCellPosByIndex(i) {
		return (i % ROW) + '-' + Math.floor(i / ROW);
	}
	getCellIndexByPos(pos) {
		const [x,y] = pos.split('-');
		return parseInt(y) * ROW + parseInt(x);
	}

	initCells() {
		let cellFragment = '';
		this._cells.forEach((n, i) => {
			cellFragment +=`
				<div
					class="cell"
					data-i=${i}
					data-pos='${this.getCellPosByIndex(i)}'
				>
				</div>
			`;
		});
		$box.append(cellFragment);
		const boxWidth = (CELL_WIDTH + CELL_GAP) * ROW + CELL_GAP;
		$box.css('width', boxWidth);
	}

	goStep() {
		const snakeHeadIndex = this._data[0];
		const [headPosX, headPosY] = this.getCellPosByIndex(snakeHeadIndex).split('-');
		let nextStepIndex, nextStepPos;
		let nextStepX, nextStepY;
		switch(this._direction) {
			case 'LEFT':
				nextStepX = parseInt(headPosX) - 1;
				if (nextStepX < 0) {
					return this.failed();
				}
				nextStepIndex = this.getCellIndexByPos(`${nextStepX}-${headPosY}`);
				break;
			case 'UP':
				nextStepY = parseInt(headPosY) - 1;
				if (nextStepY < 0) {
					return this.failed();
				}
				nextStepIndex = this.getCellIndexByPos(`${headPosX}-${nextStepY}`);
				break;
			case 'RIGHT':
				nextStepX = parseInt(headPosX) + 1;
				if (nextStepX >= ROW) {
					return this.failed();
				}
				nextStepIndex = this.getCellIndexByPos(`${nextStepX}-${headPosY}`);
				break;
			case 'DOWN':
				nextStepY = parseInt(headPosY) + 1;
				if (nextStepY >= ROW) {
					return this.failed();
				}
				nextStepIndex = this.getCellIndexByPos(`${headPosX}-${nextStepY}`);
				break;
		}

		this._data.unshift(nextStepIndex);
		if (nextStepIndex === this._cookie) {
			this.dropNewCookie()

			this._score += 100;
			$score.text(this._score);
		} else {
			this._data.pop();
		}
	}

	draw() {
		// Draw the snaker
		$('.cell-snaker').removeClass('cell-snaker');
		$('.cell-snaker-head').removeClass('cell-snaker-head');
		this._data.forEach((i, index) => {
			if (!index) {
				$(`.cell[data-i=${i}]`).addClass('cell-snaker-head');
			}
			$(`.cell[data-i=${i}]`).addClass('cell-snaker');
		})

		// Draw the cookie
		$('.cell-cookie').removeClass('cell-cookie');
		$(`.cell[data-i=${this._cookie}]`).addClass('cell-cookie');
	}
}

$(function(){
	const puzzle = new Puzzle();
	$('#start').on('click', () => {
		puzzle.init();
		puzzle.initAction();
		$('#start').hide();
		$('#refresh').show();
	});
	$('#refresh').on('click', () => {
		location.reload();
	});
})
