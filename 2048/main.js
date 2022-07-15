const ROW = 5;
const $box = $('#wrapper');
const $score = $('#score');

function getCell(index) {
	return $box.find(`.cell[data-index=${index}]`);
}

class Puzzle {
	_data = Array(25).fill();
	_score = 0;

	init() {
		this.genRandomNum();
		this.draw();

		$(document).on('keydown', (event) => {
			if (
				event.key === 'ArrowUp' ||
				event.key === 'ArrowDown' ||
				event.key === 'ArrowLeft' ||
				event.key === 'ArrowRight'
			) {
				switch (event.key) {
					case 'ArrowUp': {
						this.handleKeyUp();
						break;
					}
					case 'ArrowDown': {
						this.handleKeyDown();
						break;
					}
					case 'ArrowLeft': {
						this.handleKeyLeft();
						break;
					}
					case 'ArrowRight': {
						this.handleKeyRight();
						break;
					}
				}
				setTimeout(() => {
					const randomPos = this.genRandomNum();
					this.draw(randomPos);

					if (!this.checkPass()) {
						alert("完了！芭比Q了...");
						return;
					}
				}, 100);	
			}
		});
	}

	handleKeyUp() {
		this.mixCluster([20, 15, 10, 5, 0]);
		this.mixCluster([21, 16, 11, 6, 1]);
		this.mixCluster([22, 17, 12, 7, 2]);
		this.mixCluster([23, 18, 13, 8, 3]);
		this.mixCluster([24, 19, 14, 9, 4]);
	}

	handleKeyDown() {
		this.mixCluster([0, 5, 10, 15, 20]);
		this.mixCluster([1, 6, 11, 16, 21]);
		this.mixCluster([2, 7, 12, 17, 22]);
		this.mixCluster([3, 8, 13, 18, 23]);
		this.mixCluster([4, 9, 14, 19, 24]);
	}

	handleKeyLeft() {
		this.mixCluster([4, 3, 2, 1, 0]);
		this.mixCluster([9, 8, 7, 6, 5]);
		this.mixCluster([14, 13, 12, 11, 10]);
		this.mixCluster([19, 18, 17, 16, 15]);
		this.mixCluster([24, 23, 22, 21, 20]);
	}

	handleKeyRight() {
		this.mixCluster([0, 1, 2, 3, 4]);
		this.mixCluster([5, 6, 7, 8, 9]);
		this.mixCluster([10, 11, 12, 13, 14]);
		this.mixCluster([15, 16, 17, 18, 19]);
		this.mixCluster([20, 21, 22, 23, 24]);
	}

	genRandomNum(amount = 1) {

		this.calScores()

		const emptyPosArray = [];
		this._data.map((n, index) => {
			if(n === undefined) {
				emptyPosArray.push(index);
			}
		});
		const randomPos = Math.floor(Math.random() * emptyPosArray.length);
		// const randomPool = [2, 4, 8, 16, 32, 64, 128];
		const randomPool = [2, 4];
		const randomNumberPos = Math.floor(Math.random() * randomPool.length);
		this._data[emptyPosArray[randomPos]] = randomPool[randomNumberPos];
		return emptyPosArray[randomPos];
	}

	calScores() {
		if(!this.checkPass()) {
			return;
		}
		const all = this._data.reduce((pre, cur) => (pre || 0) + (cur || 0));
		this._score += all;
		console.log(this._score, all);
		$score.text(Math.floor(this._score / 10));
	}

	checkPass() {
		let passed = false;
		for (let n = 0; n < this._data.length; n++) {
			const needCheckPosArray = [n - ROW, n + ROW];
			if (n % ROW) {
				// 行头不检查上一个
				needCheckPosArray.push(n - 1);
			}
			if ((n + 1) % ROW) {
				// 行尾不检查下一个
				needCheckPosArray.push(n + 1);
			}
			for (let j = 0, len = needCheckPosArray.length; j < len; j++) {
				const curCheckedPos = needCheckPosArray[j];
				if(
					(curCheckedPos < Math.pow(ROW, 2) && curCheckedPos >= 0) &&
					(!this._data[curCheckedPos] || this._data[curCheckedPos] === this._data[n])
				)	{
					passed = true;
					return passed;
				}	
			}
		}
		return passed;
	}

	draw(newPos) {
		$box.empty();
		this._data.forEach((n, index) => {
			if ((newPos !== undefined) && (newPos === index)) {
				$box.append(`<div class="cell hot" data-index=${index} data-content=${n || 0}>${n === undefined ? '' : n}</div>`);
			} else {
				$box.append(`<div class="cell" data-index=${index} data-content=${n || 0}>${n === undefined ? '' : n}</div>`);	
			}
		})
	}

	mixCluster(posArr) {
		// 取出所有位置上的数字
		const numbers = posArr.map(n => this._data[n]);
		// 数字沉底
		const sinkedNumbers = numbers.filter(num => num !== undefined);
		// 不足位数补齐占位
		Array(5 - sinkedNumbers.length).fill().forEach(() => {
			sinkedNumbers.unshift(undefined);
		})

		const newCluster = [];

		if(!sinkedNumbers[4]) {
			return sinkedNumbers;
		} else {
			if(sinkedNumbers[4] === sinkedNumbers[3]) {
				sinkedNumbers[4] *= 2;
				sinkedNumbers[3] = sinkedNumbers[2];
				sinkedNumbers[2] = sinkedNumbers[1];
				sinkedNumbers[1] = sinkedNumbers[0];
				sinkedNumbers[0] = undefined;
			}
			if(sinkedNumbers[3] && sinkedNumbers[3] === sinkedNumbers[2]) {
				sinkedNumbers[3] *= 2;
				sinkedNumbers[2] = sinkedNumbers[1];
				sinkedNumbers[1] = sinkedNumbers[0];
				sinkedNumbers[0] = undefined;
			}
			if(sinkedNumbers[2] && sinkedNumbers[2] === sinkedNumbers[1]) {
				sinkedNumbers[2] *= 2;
				sinkedNumbers[1] = sinkedNumbers[0];
				sinkedNumbers[0] = undefined;
			}
			if(sinkedNumbers[1] && sinkedNumbers[1] === sinkedNumbers[0]) {
				sinkedNumbers[1] *= 2;
				sinkedNumbers[0] = undefined;
			}
		}
		posArr.forEach((pos, index) => {
			this._data[pos] = sinkedNumbers[index];
		})
	}

	autoRun() {
		this._timer = setInterval(() => {
			const ran = Math.floor(Math.random() * 4);
			switch(ran) {
				case 0:
					this.handleKeyUp();
					break;
				case 1:
					this.handleKeyDown();
					break;
				case 2:
					this.handleKeyLeft();
					break;
				case 3:
					this.handleKeyRight();
					break;
			}

			setTimeout(() => {
				const randomPos = this.genRandomNum();
				this.draw(randomPos);

				setTimeout(() => {
					if (!this.checkPass()) {
						alert("完了！芭比Q了...");
						clearInterval(this._timer);
					}
				}, 10);
			}, 50);
		}, 100);
	}
}

$(function(){
	const puzzle = new Puzzle();
	puzzle.init();
	// puzzle.autoRun();
})
