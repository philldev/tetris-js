import './style.css'

const COLS = 10
const ROWS = 20
const SQUARE_SIZE = 25
const GAME_SPEED = 1000

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

type Matrix<T> = T[][]

interface Tetromino {
	row: number
	col: number
	matrix: Matrix<number>
	name: TetrominoName
	color: string
}

const $ = <T extends HTMLElement>(selector: string) =>
	<T>document.querySelector(selector)

function getRandomInt(min: number, max: number) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min + 1)) + min
}

const playfieldCanvas = <HTMLCanvasElement>$('#playfield')
const sequenceCanvas = <HTMLCanvasElement>$('#next_piece')
const restartBtn1 = <HTMLButtonElement>$('#restart_btn_1')
const restartBtn2 = <HTMLButtonElement>$('#restart_btn_2')
const pauseBtn = <HTMLButtonElement>$('#pause_btn')
const resumeBtn = <HTMLButtonElement>$('#resume_btn')
const helpBtn = <HTMLButtonElement>$('#help_btn')
const helpBackBtn = <HTMLButtonElement>$('#help_back_btn')

const sequenceCtx = sequenceCanvas.getContext('2d')!
const playfieldCtx = playfieldCanvas.getContext('2d')!

playfieldCanvas.width = COLS * SQUARE_SIZE
playfieldCanvas.height = ROWS * SQUARE_SIZE

sequenceCanvas.width = SQUARE_SIZE * 4
sequenceCanvas.height = SQUARE_SIZE * 3

const resetMap = () => {
	for (let row = 0; row < ROWS; row++) {
		map[row] = []
		for (let col = 0; col < COLS; col++) {
			map[row][col] = 0
		}
	}
}

const checkMapForClearedRows = () => {
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
	return clearedRow
}

const calculateScore = (clearedRow: number, hardDrop?: boolean) => {
	const dropScore = hardDrop ? 2 : 1
	const clearScore =
		clearedRow === 1
			? 40
			: clearedRow === 2
			? 100
			: clearedRow === 3
			? 300
			: clearedRow > 3
			? 1200
			: 0

	return score + dropScore + clearScore
}

const createTetromino = (name: TetrominoName): Tetromino => {
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

const getRandomName = () => {
	return TETROMINO_NAMES[getRandomInt(0, TETROMINO_NAMES.length - 1)]
}

const placeTetrominoOnMap = (hardDrop?: boolean) => {
	if (currentTetromino.row <= 0) {
		gameOver = true
		showGameOver()
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

	const clearedRow = checkMapForClearedRows()

	if (clearedRow) {
		clearPlayfield()
	}

	drawPlacedTetromino()

	score = calculateScore(clearedRow, hardDrop)

	updateScoreUi()

	currentTetromino = createTetromino(sequence[0])

	sequence = [sequence[1], sequence[2], getRandomName()]

	drawNextSequence()
}

const drawPlayfieldCell = (params: {
	row: number
	col: number
	color: string
}) => {
	playfieldCtx.fillStyle = params.color
	playfieldCtx.fillRect(
		params.col * SQUARE_SIZE,
		params.row * SQUARE_SIZE,
		SQUARE_SIZE - 1,
		SQUARE_SIZE - 1
	)
}

const clearPlayfield = () =>
	playfieldCtx.clearRect(0, 0, playfieldCanvas.width, playfieldCanvas.height)

const drawTetromino = () => {
	playfieldCtx.fillStyle = currentTetromino.color
	for (let row = 0; row < currentTetromino.matrix.length; row++) {
		for (let col = 0; col < currentTetromino.matrix[row].length; col++) {
			if (currentTetromino.matrix[row][col]) {
				drawPlayfieldCell({
					row: row + currentTetromino.row,
					col: col + currentTetromino.col,
					color: currentTetromino.color,
				})
			}
		}
	}
}

const drawNextSequence = () => {
	sequenceCtx.clearRect(0, 0, sequenceCanvas.width, sequenceCanvas.height)

	const matrix = TETROMINOS_MATRIX[sequence[0]]
	const color = TETROMINO_COLORS[sequence[0]]

	for (let row = 0; row < matrix.length; row++) {
		for (let col = 0; col < matrix[row].length; col++) {
			if (matrix[row][col]) {
				sequenceCtx.fillStyle = color
				sequenceCtx.fillRect(
					col * SQUARE_SIZE,
					row * SQUARE_SIZE,
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
				playfieldCtx.fillStyle = TETROMINO_COLORS[name]
				drawPlayfieldCell({
					col,
					row,
					color: TETROMINO_COLORS[name],
				})
			}
		}
	}
}

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

const moveDown = () => {
	if (gameOver || paused) clearInterval(intervalId)
	clearPlayfield()
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
	clearPlayfield()
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
	clearPlayfield()
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
	clearPlayfield()
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

	clearPlayfield()
	drawPlacedTetromino()

	currentTetromino.row = ghostTetromino.row

	placeTetrominoOnMap(true)
}

const gameoverOverlayElement = <HTMLDivElement>$('.gameover_overlay')
const gameoverScoreElement = <HTMLSpanElement>$('#gameover_score')
const helpOverlayElement = <HTMLDivElement>$('.help_overlay')
const gameMenuOverlayElement = <HTMLDivElement>$('.game_menu_overlay')
const scoreElement = <HTMLParagraphElement>$('#score')

const setElementDisplay = (el: HTMLElement, val: string) =>
	(el.style.display = val)
const setElementInnerText = (el: HTMLElement, val: string) =>
	(el.innerText = val)

const updateScoreUi = () => {
	scoreElement.innerText = score + ''
}

const showGameOver = () => {
	setElementDisplay(gameoverOverlayElement, 'flex')
	setElementInnerText(gameoverScoreElement, score + '')
}

const hideGameOver = () => {
	setElementDisplay(gameoverOverlayElement, 'none')
}

const showHelp = () => {
	setElementDisplay(helpOverlayElement, 'flex')
}

const hideHelp = () => {
	setElementDisplay(helpOverlayElement, 'none')
}

const showGameMenu = () => {
	paused = true
	setElementDisplay(gameMenuOverlayElement, 'flex')
}

const hideGameMenu = () => {
	paused = false
	setElementDisplay(gameMenuOverlayElement, 'none')
	intervalId = setInterval(moveDown, GAME_SPEED)
}

// STATES
let sequence: TetrominoName[] = [
	getRandomName(),
	getRandomName(),
	getRandomName(),
]

let map: Matrix<number | TetrominoName> = []
let currentTetromino = createTetromino(getRandomName())
let gameOver = false
let paused = false
let score = 0
let intervalId: number

const resetState = () => {
	resetMap()
	gameOver = false
	currentTetromino = createTetromino(getRandomName())
	score = 0
	sequence = [getRandomName(), getRandomName(), getRandomName()]
	updateScoreUi()
	drawNextSequence()
	clearPlayfield()
	intervalId = setInterval(moveDown, GAME_SPEED)
}

resetMap()
updateScoreUi()
drawNextSequence()

intervalId = setInterval(moveDown, GAME_SPEED)

window.addEventListener('keydown', (e) => {
	if (e.key === 'ArrowLeft') moveLeft()
	if (e.key === 'ArrowRight') moveRight()
	if (e.key === 'ArrowDown') moveDown()
	if (e.key === 'ArrowUp') rotate()
	if (e.key === ' ') drop()
	if (e.key === 'Escape') showGameMenu()
})

restartBtn1.addEventListener('click', () => {
	resetState()
	hideGameOver()
})

restartBtn2.addEventListener('click', () => {
	resetState()
	hideGameMenu()
})

pauseBtn.addEventListener('click', () => {
	showGameMenu()
})

resumeBtn.addEventListener('click', () => {
	hideGameMenu()
})

helpBtn.addEventListener('click', () => {
	showHelp()
})
helpBackBtn.addEventListener('click', () => {
	hideHelp()
})
