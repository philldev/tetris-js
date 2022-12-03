import './style.css'

function cn(className: string) {
	return className
}
function getRandomInt(min: number, max: number) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min + 1)) + min
}

function rotateMatrix(matrix: number[][]) {
	const N = matrix.length - 1
	const result = matrix.map((row, i) => row.map((_, j) => matrix[N - j][i]))
	return result
}

function drawPlayfield(width: number, height: number) {
	const playfieldElement = <HTMLDivElement>document.getElementById('play-field')
	playfieldElement.style.width = width + 'px'
	playfieldElement.style.height = height + 'px'
	return playfieldElement
}

function setSidebarSize(height: number, width: number) {
	const sidebarElement = <HTMLDivElement>document.getElementById('sidebar')
	sidebarElement.style.height = height + 'px'
	sidebarElement.style.width = width + 'px'
}

function drawSequence(sequence: string[]) {
	const sequenceElement = <HTMLDivElement>document.getElementById('sequence')
	sequenceElement.innerText = ''
	sequence.forEach((s) => {
		const el = document.createElement('span')
		el.innerText = s
		sequenceElement.appendChild(el)
	})
}

const COLS = 10
const ROWS = 24
const CELL_SIZE = 25
const PLAYFIELD_WIDTH = CELL_SIZE * COLS
const PLAYFIELD_HEIGHT = CELL_SIZE * ROWS

const playfieldElement = drawPlayfield(PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT)

setSidebarSize(PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH / 2)

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

function getRandomShape() {
	const shapes = ['I', 'J', 'L', 'O', 'S', 'Z', 'T'] as const
	const shape = shapes[getRandomInt(0, shapes.length - 1)]
	return shape
}

function createTetromino(shape?: Shapes) {
	const shapeToRender = shape ?? getRandomShape()
	return {
		matrix: Tetromino[shapeToRender],
		color: Colors[shapeToRender],
		shape: shapeToRender,
		row: 0,
		col: getRandomInt(1, COLS - Tetromino.O[0].length),
	}
}

type ITetromino = ReturnType<typeof createTetromino>

let sequence = [getRandomShape(), getRandomShape(), getRandomShape()]
let tetromino = createTetromino()
let gameOver = false
let timerId: number
let timerSpeed = 1000

let playfield: (number | Shapes)[][] = []

for (let row = 0; row < ROWS; row++) {
	playfield[row] = []
	for (let col = 0; col < COLS; col++) {
		playfield[row][col] = 0
	}
}

for (let row = 0; row < ROWS; row++) {
	for (let col = 0; col < COLS; col++) {
		const el = document.createElement('div')
		el.style.width = CELL_SIZE + 'px'
		el.style.height = CELL_SIZE + 'px'
		el.classList.add(cn('border'))
		el.classList.add(cn('border-gray-800'))
		el.id = `${row}-${col}`
		playfieldElement.appendChild(el)
	}
}

tetromino.matrix.forEach((row, i) => {
	row.forEach((col, j) => {
		if (col) {
			playfield[tetromino.row + i][tetromino.col + j] = tetromino.shape
		}
	})
})

function drawCells() {
	for (let row = 0; row < ROWS; row++) {
		for (let col = 0; col < COLS; col++) {
			if (playfield[row][col]) {
				let name = playfield[row][col] as Shapes
				let color = Colors[name]
				let el = <HTMLDivElement>document.getElementById(`${row}-${col}`)
				el.style.background = color
			}
		}
	}
}

drawCells()

drawSequence(sequence)
