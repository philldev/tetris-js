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

const map: Matrix<number | TetrominoName> = []

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

let tetromino = createTetromino()
let gameOver = false
let intervalId: number

const isValidMove = () => {
	for (let row = 0; row < tetromino.matrix.length; row++) {
		for (let col = 0; col < tetromino.matrix[row].length; col++) {
			if (
				tetromino.matrix[row][col] &&
				(tetromino.col + col <= 0 ||
					tetromino.col + col >= COLS ||
					tetromino.row + row >= ROWS ||
					map[tetromino.row + row]?.[tetromino.col + col])
			) {
				return false
			}
		}
	}
	return true
}

const placeTetrominoOnMap = () => {
	if (tetromino.row <= 0) {
		gameOver = true
		return
	}

	for (let row = 0; row < tetromino.matrix.length; row++) {
		for (let col = 0; col < tetromino.matrix[row].length; col++) {
			if (tetromino.matrix[row][col]) {
				if (map[tetromino.row + row])
					map[tetromino.row + row][tetromino.col + col] = tetromino.name
			}
		}
	}
}

const drawTetromino = () => {
	ctx.fillStyle = tetromino.color
	for (let row = 0; row < tetromino.matrix.length; row++) {
		for (let col = 0; col < tetromino.matrix[row].length; col++) {
			if (tetromino.matrix[row][col]) {
				ctx.fillRect(
					(col + tetromino.col) * SQUARE_SIZE,
					(row + tetromino.row) * SQUARE_SIZE,
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

intervalId = setInterval(() => {
	if (gameOver) clearInterval(intervalId)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	drawPlacedTetromino()
	tetromino.row++
	const validMove = isValidMove()
	if (!validMove) {
		tetromino.row--
		placeTetrominoOnMap()
		drawPlacedTetromino()
		tetromino = createTetromino()
	}
	drawTetromino()
}, 500)
