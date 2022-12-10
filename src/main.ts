import './style.css'

const $ = <T extends HTMLElement>(selector: string) =>
	<T>document.querySelector(selector)

const canvas = <HTMLCanvasElement>$('.playfield')

const COLS = 10
const ROWS = 20
const SQUARE_SIZE = 25

canvas.width = COLS * SQUARE_SIZE
canvas.height = ROWS * SQUARE_SIZE
const ctx = canvas.getContext('2d')!

type Matrix<T> = T[][]

let map: Matrix<number | TetrominoName> = []

for (let row = 0; row < ROWS; row++) {
	map[row] = []
	for (let col = 0; col < COLS; col++) {
		map[row][col] = 0
	}
}

const TETROMINOS_MATRIX = {
	I: [
		[0, 0, 0, 0],
		[1, 1, 1, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
	],
	J: [
		[1, 0, 0],
		[1, 1, 1],
		[0, 0, 0],
	],
	L: [
		[0, 0, 1],
		[1, 1, 1],
		[0, 0, 0],
	],
	O: [
		[1, 1],
		[1, 1],
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

// color of each tetromino
const TETROMINO_COLORS = {
	I: 'cyan',
	O: 'yellow',
	T: 'purple',
	S: 'green',
	Z: 'red',
	J: 'blue',
	L: 'orange',
}

type TetrominoName = keyof typeof TETROMINOS_MATRIX

const TETROMINO_NAMES: TetrominoName[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z']

function getRandomInt(min: number, max: number) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min + 1)) + min
}

interface Tetromino {
	row: number
	col: number
	matrix: Matrix<number>
	name: TetrominoName
	color: string
}

const createTetromino = (): Tetromino => {
	const name = TETROMINO_NAMES[getRandomInt(0, TETROMINO_NAMES.length - 1)]
	// const name = 'O'
	const matrix = TETROMINOS_MATRIX[name]
	const color = TETROMINO_COLORS[name]
	return {
		row: -2,
		col: getRandomInt(0, COLS - matrix[0].length),
		matrix,
		name,
		color,
	}
}

let currentTetromino = createTetromino()
let gameOver = false
let intervalId: number

const isValidMove = (tetromino: Tetromino = currentTetromino) => {
	for (let row = 0; row < tetromino.matrix.length; row++) {
		for (let col = 0; col < tetromino.matrix[row].length; col++) {
			if (
				tetromino.matrix[row][col] &&
				(tetromino.col + col < 0 ||
					tetromino.col + col >= COLS ||
					tetromino.row + row >= ROWS ||
					map[tetromino.row + row]?.[tetromino.col + col])
			) {
				console.log(tetromino.col + col < 0, 'left bound')
				console.log(tetromino.col + col > COLS, 'right bound')
				console.log(tetromino.row + row > ROWS, 'bottom bound')
				console.log(tetromino.row + row >= ROWS, 'collide')
				return false
			}
		}
	}
	return true
}

const placeTetrominoOnMap = () => {
	console.log(currentTetromino)
	if (currentTetromino.row <= 0) {
		gameOver = true
		return
	}
	for (let row = 0; row < currentTetromino.matrix.length; row++) {
		for (let col = 0; col < currentTetromino.matrix[row].length; col++) {
			if (currentTetromino.matrix[row][col]) {
				if (map[currentTetromino.row + row])
					map[currentTetromino.row + row][currentTetromino.col + col] =
						currentTetromino.name
			}
		}
	}
	let clearedRow = 0
	//https://gist.github.com/straker/3c98304f8a6a9174efd8292800891ea1
	for (let row = 0; row < map.length; row++) {
		const cellsInRow = map[row]
		const clearable = cellsInRow.every((val) => val !== 0)
		if (clearable) {
			for (let col = 0; col < map[row].length; col++) {
				map[row][col] = 0
			}
			const rowToUnshift = map[row]
			map = map.filter((_, index) => index !== row)
			map.unshift(rowToUnshift)
			clearedRow++
		}
	}

	if (clearedRow) {
		ctx.clearRect(0, 0, canvas.width, canvas.height)
	}

	drawPlacedTetromino()

	currentTetromino = createTetromino()
}

const drawTetromino = () => {
	ctx.fillStyle = currentTetromino.color
	for (let row = 0; row < currentTetromino.matrix.length; row++) {
		for (let col = 0; col < currentTetromino.matrix[row].length; col++) {
			if (currentTetromino.matrix[row][col]) {
				ctx.fillRect(
					(col + currentTetromino.col) * SQUARE_SIZE,
					(row + currentTetromino.row) * SQUARE_SIZE,
					SQUARE_SIZE - 1,
					SQUARE_SIZE - 1
				)
			}
		}
	}
}

const drawPlacedTetromino = () => {
	for (let row = 0; row < map.length; row++) {
		for (let col = 0; col < map[row].length; col++) {
			if (map[row][col]) {
				const name = map[row][col] as TetrominoName
				ctx.fillStyle = TETROMINO_COLORS[name]
				ctx.fillRect(
					col * SQUARE_SIZE,
					row * SQUARE_SIZE,
					SQUARE_SIZE - 1,
					SQUARE_SIZE - 1
				)
			}
		}
	}
}

const moveDown = () => {
	if (gameOver) clearInterval(intervalId)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	drawPlacedTetromino()
	currentTetromino.row++
	const validMove = isValidMove()
	if (!validMove) {
		currentTetromino.row--
		placeTetrominoOnMap()
	}
	drawTetromino()
}

const moveLeft = () => {
	if (gameOver) return
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	drawPlacedTetromino()
	currentTetromino.col--
	const validMove = isValidMove()
	if (!validMove) {
		currentTetromino.col++
	}
	drawTetromino()
}

const moveRight = () => {
	if (gameOver) return
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	drawPlacedTetromino()
	currentTetromino.col++
	const validMove = isValidMove()
	if (!validMove) {
		currentTetromino.col--
	}
	drawTetromino()
}

const rotate = () => {
	if (gameOver || currentTetromino.name === 'O') return
	ctx.clearRect(0, 0, canvas.width, canvas.height)

	const N = currentTetromino.matrix.length - 1
	const newMatrix = currentTetromino.matrix.map((row, i) =>
		row.map((_, j) => currentTetromino.matrix[N - j][i])
	)
	const prevMatrix = currentTetromino.matrix.map((v) => v)
	drawPlacedTetromino()
	currentTetromino.matrix = newMatrix
	const validMove = isValidMove()
	if (!validMove) {
		currentTetromino.matrix = prevMatrix
	}
	drawTetromino()
}

const drop = () => {
	const ghostTetromino = { ...currentTetromino }

	for (let row = 0; row < map.length; row++) {
		ghostTetromino.row++
		if (!isValidMove(ghostTetromino)) {
			ghostTetromino.row--
			break
		}
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height)
	drawPlacedTetromino()
	currentTetromino.row = ghostTetromino.row
	placeTetrominoOnMap()
}

window.addEventListener('keydown', (e) => {
	if (e.key === 'ArrowLeft') moveLeft()
	if (e.key === 'ArrowRight') moveRight()
	if (e.key === 'ArrowDown') moveDown()
	if (e.key === 'ArrowUp') rotate()
	if (e.key === ' ') drop()
})

intervalId = setInterval(moveDown, 1000)
