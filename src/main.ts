import './style.css'

function cn(className: string) {
	return className
}
function getRandomInt(min: number, max: number) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min + 1)) + min
}

function createCellElement(x: number, y: number) {
	const el = document.createElement('span')
	el.id = `${x}-${y}`
	el.style.width = CELL_SIZE + 'px'
	el.style.height = CELL_SIZE + 'px'
	el.className = cn('border border-gray-800')

	return el
}

interface ICoord {
	x: number
	y: number
}

function getCellFromMatrix(
	matrix: number[][],
	startRow: number,
	startCol: number
) {
	const cellCoords: ICoord[] = []
	matrix.forEach((row, x) => {
		row.forEach((col, y) => {
			if (col) {
				cellCoords.push({
					x: x + startRow + 1,
					y: y + startCol + 1,
				})
			}
		})
	})

	return cellCoords
}

function rotateMatrix(matrix: number[][]) {
	const N = matrix.length - 1
	const result = matrix.map((row, i) => row.map((_, j) => matrix[N - j][i]))

	return result
}

function paintCell(x: number, y: number, color: string) {
	const el = <HTMLSpanElement>document.getElementById(`${x}-${y}`)
	if (el) el.style.background = color
}

function clearCell(x: number, y: number) {
	const el = <HTMLSpanElement>document.getElementById(`${x}-${y}`)
	if (el) el.style.background = 'transparent'
}

function drawCells(rows: number, cols: number, parent: HTMLElement) {
	for (let row = 1; row <= rows; row++) {
		for (let col = 1; col <= cols; col++) {
			const cellElement = createCellElement(col, row)
			parent.appendChild(cellElement)
		}
	}
}

function drawPlayfield(width: number, height: number, parent: HTMLElement) {
	const playfieldElement = document.createElement('div')
	playfieldElement.style.width = width + 'px'
	playfieldElement.style.height = height + 'px'
	playfieldElement.className = cn(
		'bg-gray-900 outline outline-gray-600 flex flex-wrap'
	)
	parent.appendChild(playfieldElement)
	return playfieldElement
}

const appElement = <HTMLDivElement>document.querySelector('#app')

appElement.className = cn('w-screen h-screen bg-black grid place-items-center')

const COLS = 10
const ROWS = 24
const CELL_SIZE = 25
const PLAYFIELD_WIDTH = CELL_SIZE * COLS
const PLAYFIELD_HEIGHT = CELL_SIZE * ROWS

const playfieldElement = drawPlayfield(
	PLAYFIELD_WIDTH,
	PLAYFIELD_HEIGHT,
	appElement
)

drawCells(ROWS, COLS, playfieldElement)

const Tetromino = {
	O: [
		[1, 1],
		[1, 1],
	],
	I: [
		[0, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 0],
	],
	L: [
		[0, 0, 1],
		[1, 1, 1],
		[0, 0, 0],
	],
	J: [
		[1, 0, 0],
		[1, 1, 1],
		[0, 0, 0],
	],
	S: [
		[0, 1, 1],
		[1, 1, 0],
		[0, 0, 0],
	],
	Z: [
		[1, 1, 0],
		[0, 1, 1],
		[0, 0, 0],
	],
	T: [
		[0, 1, 0],
		[1, 1, 1],
		[0, 0, 0],
	],
}

type Shapes = keyof typeof Tetromino

const Colors: Record<Shapes, string> = {
	I: 'aqua',
	J: 'darkblue',
	L: 'orange',
	O: 'yellow',
	S: 'green',
	Z: 'red',
	T: 'magenta',
}

function createTetromino() {
	const shapes = ['I', 'J', 'L', 'O', 'S', 'Z', 'T'] as const
	const shape = shapes[getRandomInt(0, shapes.length - 1)]

	return {
		matrix: Tetromino[shape],
		color: Colors[shape],
		row: -2,
		col: getRandomInt(1, COLS - Tetromino.O[0].length),
	}
}

type ITetromino = ReturnType<typeof createTetromino>

function drawTetromino(t: ITetromino) {
	t.matrix.forEach((row, index) => {
		let y = t.row + index
		row.forEach((val, i) => {
			if (val) {
				paintCell(i + t.col, y, t.color)
			}
		})
	})
}

function clearTetromino(t: ITetromino) {
	t.matrix.forEach((row, index) => {
		let y = tetromino.row + index
		row.forEach((val, i) => {
			if (val) {
				clearCell(i + tetromino.col, y)
			}
		})
	})
}

let tetromino = createTetromino()
let tetrominos: ITetromino[] = []
let gameOver = false
let timerId: number
let timerSpeed = 1000

function placeTetromino(t: ITetromino) {
	if (t.row < 1) {
		gameOver = true
	}

	tetrominos.push(t)
	t.matrix.forEach((row, index) => {
		let y = t.row + index
		row.forEach((val, i) => {
			if (val) {
				paintCell(i + t.col, y, t.color)
			}
		})
	})
}

function occupied() {
	const tetrominoCoords = getCellFromMatrix(
		tetromino.matrix,
		tetromino.row,
		tetromino.col
	)
	const placedTetrominosCoords = tetrominos
		.map((t) => getCellFromMatrix(t.matrix, t.row, t.col))
		.flat()

	const result = {
		bottom: tetrominoCoords.some(
			(v) =>
				v.x - 1 === ROWS ||
				placedTetrominosCoords.some((pt) => pt.x - 1 === v.x && pt.y === v.y)
		),
		left: tetrominoCoords.some(
			(v) =>
				v.y - 1 === 1 ||
				placedTetrominosCoords.some((pt) => pt.y + 1 === v.y && pt.x === v.x)
		),
		right: tetrominoCoords.some(
			(v) =>
				v.y - 1 === COLS ||
				placedTetrominosCoords.some((pt) => pt.y - 1 === v.y && pt.x === v.x)
		),
	}

	return result
}

function moveDown() {
	clearTetromino(tetromino)
	tetromino.row++
	drawTetromino(tetromino)
	if (occupied().bottom) {
		placeTetromino(tetromino)
		if (gameOver) clearInterval(timerId)
		else tetromino = createTetromino()
	}
}

function moveLeft() {
	if (!occupied().left) {
		clearTetromino(tetromino)
		tetromino.col--
		drawTetromino(tetromino)
	}
}

function moveRight() {
	if (!occupied().right) {
		clearTetromino(tetromino)
		tetromino.col++
		drawTetromino(tetromino)
	}
}

function rotate() {
	if (!occupied().right) {
		clearTetromino(tetromino)
		tetromino.matrix = rotateMatrix(tetromino.matrix)
		drawTetromino(tetromino)
	}
}

window.addEventListener('keydown', (e) => {
	if (e.code === 'ArrowLeft') moveLeft()
	if (e.code === 'ArrowRight') moveRight()
	if (e.code === 'ArrowDown') moveDown()
	if (e.code === 'ArrowDown') moveDown()
	if (e.code === 'KeyR') rotate()
})

timerId = setInterval(moveDown, timerSpeed)
