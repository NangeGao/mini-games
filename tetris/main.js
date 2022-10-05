const $box = $('#wrapper');
const $score = $('#score');

function getCell(index) {
	return $box.find(`.cell[data-index=${index}]`);
}
function genRandomColor() {
	return '#' + Math.floor(Math.random()*16777215).toString(16);
}

const ROW = 20;
const COLUMN = 10;
const CELL_WIDTH = 30;
const CELL_GAP = 2;
class Puzzle {
	_timer = null;
	_speed = 1000;
	_cells = Array(ROW * COLUMN).fill().map((_, i) => i);
	_score = 0;
	_data = [];
	_cookie = -1;
	_shapes = [
		{
			name: 'square',
			layout: [
				Math.floor(COLUMN/2) - 1,
				Math.floor(COLUMN/2),
				Math.floor(COLUMN/2) - 1 - COLUMN,
				Math.floor(COLUMN/2) - COLUMN,
			],
		},
		{
			name: 'vertical',
			layout: [
				Math.floor(COLUMN/2) - COLUMN * 3,
				Math.floor(COLUMN/2) - COLUMN * 2,
				Math.floor(COLUMN/2) - COLUMN,
				Math.floor(COLUMN/2),
			],
		},
		{
			name: 'horizon',
			layout: [
				Math.floor(COLUMN/2) - 2,
				Math.floor(COLUMN/2) - 1,
				Math.floor(COLUMN/2),
				Math.floor(COLUMN/2) + 1,
			],
		},
		{
			name: 'T',
			layout: [
				Math.floor(COLUMN/2) - 1,
				Math.floor(COLUMN/2),
				Math.floor(COLUMN/2) + 1,
				Math.floor(COLUMN/2) - COLUMN,
			],
		},
		{
			name: 'T1',
			layout: [
				Math.floor(COLUMN/2) - 1,
				Math.floor(COLUMN/2),
				Math.floor(COLUMN/2) + COLUMN,
				Math.floor(COLUMN/2) - COLUMN,
			],
		},
		{
			name: 'T2',
			layout: [
				Math.floor(COLUMN/2) - 1,
				Math.floor(COLUMN/2),
				Math.floor(COLUMN/2) + 1,
				Math.floor(COLUMN/2) - COLUMN,
			],
		},
		{
			name: 'T3',
			layout: [
				Math.floor(COLUMN/2) + COLUMN,
				Math.floor(COLUMN/2),
				Math.floor(COLUMN/2) + 1,
				Math.floor(COLUMN/2) - COLUMN,
			],
		},
		{
			name: 'L',
			layout: [
				Math.floor(COLUMN/2) - COLUMN * 2 - 1,
				Math.floor(COLUMN/2) - COLUMN - 1,
				Math.floor(COLUMN/2) - 1,
				Math.floor(COLUMN/2),
			],
		},
		{
			name: 'L1',
			layout: [
				Math.floor(COLUMN/2) - COLUMN - 1,
				Math.floor(COLUMN/2) - COLUMN,
				Math.floor(COLUMN/2) - COLUMN + 1,
				Math.floor(COLUMN/2) - 1,
			],
		},
		{
			name: 'L2',
			layout: [
				Math.floor(COLUMN/2) - COLUMN * 2 - 1,
				Math.floor(COLUMN/2) - COLUMN * 2,
				Math.floor(COLUMN/2) - COLUMN,
				Math.floor(COLUMN/2),
			],
		},
		{
			name: 'L3',
			layout: [
				Math.floor(COLUMN/2) - COLUMN + 1,
				Math.floor(COLUMN/2) - 1,
				Math.floor(COLUMN/2),
				Math.floor(COLUMN/2) + 1,
			],
		},
	];
	_tiles = this.genRandomTiles('vertical');

	init() {
		if (!this._speed) {
			this._speed = $('input[name=speed]:checked').val();
		}
		this.initCells();
		this.draw();
		$score.text(this._score);

		this.initTimer();
	}

	shapeTransform() {
		console.log(3333, this._shape, this._tiles);
		switch(this._shape) {
			case 'vertical': {
				this._tiles = this._tiles.sort((a, b) => a - b).map((item, i) => {
					if(i === 0) {
						return item + COLUMN * 2 + 2;
					};
					if(i === 1) {
						return item + COLUMN + 1;
					};
					if(i === 3) {
						return item - COLUMN - 1;
					};
					return item;
				});
				this._shape = 'horizon';
				break;
			}
			case 'horizon': {
				this._tiles = this._tiles.sort((a, b) => a - b).map((item, i) => {
					if(i === 0) {
						return item - COLUMN * 2 + 2;
					};
					if(i === 1) {
						return item - COLUMN + 1;
					};
					if(i === 3) {
						return item + COLUMN - 1;
					};
					return item;
				});
				this._shape = 'vertical';
				break;
			}
			case 'L': {
				this._tiles = this._tiles.sort((a, b) => a - b).map((item, i) => {
					if(i === 0) {
						return item + COLUMN + 1;
					};
					if(i === 2) {
						return item - COLUMN - 1;
					};
					if(i === 3) {
						return item - 2;
					};
					return item;
				});
				this._shape = 'L1';
				break;
			}
			case 'L1': {
				this._tiles = this._tiles.sort((a, b) => a - b).map((item, i) => {
					if(i === 0) {
						return item - COLUMN + 1;
					};
					if(i === 2) {
						return item + COLUMN - 1;
					};
					if(i === 3) {
						return item - COLUMN * 2;
					};
					return item;
				});
				this._shape = 'L2';
				break;
			}
			case 'L2': {
				this._tiles = this._tiles.sort((a, b) => a - b).map((item, i) => {
					if(i === 0) {
						return item + 2;
					};
					if(i === 1) {
						return item + COLUMN + 1;
					};
					if(i === 3) {
						return item - COLUMN - 1;
					};
					return item;
				});
				this._shape = 'L3';
				break;
			}
			case 'L3': {
				this._tiles = this._tiles.sort((a, b) => a - b).map((item, i) => {
					if(i === 0) {
						return item + COLUMN * 2;
					};
					if(i === 1) {
						return item - COLUMN + 1;
					};
					if(i === 3) {
						return item + COLUMN - 1;
					};
					this._shape = 'L';
					return item;
				});
				break;
			}
		}
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
				event.key === 'ArrowDown' ||
				event.key === 'ArrowLeft' ||
				event.key === 'ArrowRight'
			) {
				const direction = event.key.substr('Arrow'.length).toUpperCase();
				this.goStep(direction);
				this.draw();
			} else if (event.key === ' ') {
				// 按空格键变换形状
				this.shapeTransform();
				this.draw();
			}
		});
	}

	genRandomTiles(name) {
		if (name) {
			const targetShape = this._shapes.find(item => item.name === name);
			this._shape = targetShape.name;
			return targetShape.layout;
		}
		const ran = Math.floor(Math.random() * this._shapes.length);
		this._shape = this._shapes[ran].name;
		return this._shapes[ran].layout;
	}

	failed() {
		clearInterval(this._timer);
		alert('芭比Q了...');
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
		const boxWidth = (CELL_WIDTH + CELL_GAP) * COLUMN + CELL_GAP;
		$box.css('width', boxWidth);
	}

	goStep(direction) {
		let overstep = false;
		let newTiles;
		switch(direction) {
			case 'LEFT':
				newTiles = this._tiles.map(tile => {
					if (Math.floor((tile - 1)/COLUMN) < Math.floor(tile/COLUMN)) {
						overstep = true;
					}
					return tile - 1;
				});
				this._tiles = overstep ? this._tiles : newTiles;
				break;
			case 'RIGHT':
				newTiles = this._tiles.map(tile => {
					if (Math.floor((tile + 1)/COLUMN) > Math.floor(tile/COLUMN)) {
						overstep = true;
					}
					return tile + 1;
				});
				this._tiles = overstep ? this._tiles : newTiles;
				break;
			case 'DOWN':
			default:
				let blocked = false;
				newTiles = this._tiles.map(tile => {
					if (
						Math.ceil((tile + 1)/COLUMN) >= ROW ||
						this._data.includes(tile + COLUMN)
					) {
						blocked = true;
					}
					return tile + COLUMN;
				});
				
				if (blocked) {
					this._data = this._data.concat(this._tiles);
					this._tiles = this.genRandomTiles();
					this.checkBoom();
				} else {
					this._tiles = newTiles;
				}
				break;
		}
	}

	checkBoom() {
		this._data = this._data.sort((a, b) => a - b);
		const boomData = [];
		let shadowCells = [...this._cells];
		if (this._data.length < COLUMN) {
			return;
		}
		for(let i = 0; i < this._data.length; i++) {
			if (shadowCells[this._data[i]] !== 'boom') {
				shadowCells[this._data[i]] = 'tile';
			}

			// 排序后，如果某个格子是排头，并且COLUMN-1后面恰好比它大COLUMN-1，说明这一排全占满
			if (this._data[i] % COLUMN === 0 && this._data[i + COLUMN - 1] === (this._data[i] + COLUMN - 1)) {
				(new Array(COLUMN)).fill().map((_, j) => {
					const boomItem = this._data[i] + j;
					shadowCells[boomItem] = 'boom';
					boomData.push(boomItem);
					$(`.cell[data-i=${boomItem}]`).addClass('boom');
				})
			}
		}
		if (boomData.length) {
			setTimeout(() => {
				shadowCells = shadowCells.filter(item => item !== 'boom');
				shadowCells = boomData.concat(shadowCells);
				this._data = shadowCells.map((item, index) => {
					return item === 'tile' ? index : undefined;
				}).filter(item => item);
				$('.boom').removeClass('boom');
				this.draw();
			}, 500);
		}
	}

	draw() {
		// Draw the tiles
		$('.tile').removeClass('tile');
		this._tiles.forEach((i, index) => {
			$(`.cell[data-i=${i}]`).addClass('tile');
		})
		this._data.forEach((i, index) => {
			$(`.cell[data-i=${i}]`).addClass('tile');
		})
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
