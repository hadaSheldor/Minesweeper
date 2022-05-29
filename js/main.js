"use strict"

// TODO: Change neighbours colors according to colors obj
// TODO: Set MODAL for victory
// TODO: CSS: btn, radio buttons

const MINE = "💣"
const FLAG = "🚩"
const EMPTY = "🕸️"

var gameInterval
var gUsedFlagsCount
var gFirstMove = true

var gColors = {
  0: "",
  1: "blue",
  2: "green",
  3: "red",
  4: "purple",
  5: "pink",
}

var gBoard = [] // Contains all cell-objects

var gGame = {
  isOn: false,
  shownCount: 0, // How many cells are shown
  markedCount: 0, // How many cells are flaged
  secsPassed: 0,
}
var gLevel = {
  SIZE: 4,
  MINES_AMOUNT: 2,
}

// Prevents default browser menu to be shown when mouse is right clicked
window.oncontextmenu = (e) => {
  e.preventDefault()
}

function init() {
  clearInterval(gameInterval)
  gUsedFlagsCount = gLevel.MINES_AMOUNT

  gGame.isOn = false
  gGame.secsPassed = 0
  gGame.shownCount = 0
  gGame.markedCount = 0
  gFirstMove = true
  gBoard = buildBoard()
  renderBoard()
}

function buildBoard() {
  var board = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = []
    for (var j = 0; j < gLevel.SIZE; j++) {
      var cell = {
        isShown: false,
        isMine: false,
        isMarked: false,
        minesAroundCount: 0,
      }
      board[i][j] = cell
    }
  }

  console.table(board)
  return board
}

function renderBoard() {
  // Renders board as a <table> to the DOM
  // Each cell (<td>) should have an ONCLICKED that invokes cellClicked(elCell, i, j)
  var elFlags = document.querySelector(".flags")
  elFlags.innerText = gUsedFlagsCount

  var elTimer = document.querySelector(".timer")
  elTimer.innerText = gGame.secsPassed

  var strHTML = ""

  for (var i = 0; i < gLevel.SIZE; i++) {
    strHTML += `<tr>\n`
    for (var j = 0; j < gLevel.SIZE; j++) {
      var currCell = gBoard[i][j]
      var dataAttrib = `data-i=${i} data-j=${j}`
      var className

      if (currCell.isMine) {
        className = "MINE"
      } else if (currCell.isMarked) {
        className = "FLAG"
        currCell.isShown = false // Once flaged - don't reveal
      } else if (currCell.isShown) {
        currCell.isMarked = false
      } else {
        className = ""
      }
      strHTML += `\t<td ${dataAttrib}
      class="cell ${className}" 
     
      onclick="cellClicked(this,${i},${j})"
      oncontextmenu=setFlagOnCell(this,${i},${j})
      >\n`
      if (currCell.isShown) {
        if (currCell.isMine) {
          strHTML += `\t${MINE}</td>\n`
        } else {
          currCell.minesAroundCount === 0
            ? (strHTML += `\t${EMPTY}</td>\n`)
            : (strHTML += `\t${currCell.minesAroundCount}</td>\n`)
        }
      } else if (currCell.isMarked) {
        strHTML += `\t${FLAG}</td>\n`
      } else {
        strHTML += `</td>\n`
      }
    }
    strHTML += `</tr>\n`
  }
  var elCells = document.querySelector(".board")
  elCells.innerHTML = strHTML
}

function setMinesOnBoard(currentCellCol, currentCellRow) {
  // Sets mines in random locations. Amount determined according to gLevel.MINES_AMOUNT

  var mineCount = 0
  var max = gLevel.SIZE - 1

  while (mineCount < gLevel.MINES_AMOUNT) {
    var randNumCol = getRandomInt(0, max)
    var randNumRow = getRandomInt(0, max)
    // Verifies a mine's location is differ then current cell's
    if (randNumCol === currentCellCol && randNumRow === currentCellRow) {
      continue
      // Verifies that the selected cell does not contains a mine already
    } else if (gBoard[randNumCol][randNumRow].isMine === false) {
      gBoard[randNumCol][randNumRow].isMine = true
      mineCount++
    }
  }
}

function setMinesNegsCount() {
  // Runs through gBoard; invokes getCellsMinesCount; updates minesAroundCount
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      var count = getCellsMinesCount(i, j)
      gBoard[i][j].minesAroundCount = count
    }
  }
}

function getCellsMinesCount(cellR, cellC) {
  var minesAroundCount = 0
  for (var r = cellR - 1; r <= cellR + 1; r++) {
    if (r < 0 || r >= gBoard.length) continue // Exludes off-rows cells
    for (var c = cellC - 1; c <= cellC + 1; c++) {
      if (r === cellR && c === cellC) continue // Excludes cells that themselves contain mines
      if (c < 0 || c >= gBoard[r].length) continue // Exludes off-cols cells
      if (gBoard[r][c].isMine) minesAroundCount++ // Updates mines counter detected in each cell
    }
  }
  // console.log("cellR: ", cellR, "cellC: ", cellC, "Count: ", minesAroundCount)
  return minesAroundCount
}

function revealEmptyNegCells(cellI, cellJ) {
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue
      console.log(gBoard[i][j])
      if (!gBoard[i][j].isShown) {
        gGame.shownCount++
        gBoard[i][j].isShown = true
      }
    }
  }
}

function cellClicked(elCell, i, j) {
  // TODO: Use a renderCell FN to prevent rendering the entire board
  console.log(
    "gGame.shownCount: ",
    gGame.shownCount,
    "gGame.markedCount: ",
    gGame.markedCount,
    "gLevel.SIZE: ",
    gLevel.SIZE,
    "gLevel.MINES_AMOUNT: ",
    gLevel.MINES_AMOUNT
  )

  if (!gGame.isOn && !gFirstMove) return
  var cellClicked = gBoard[i][j]
  var classAddValue = ""
  setGameTimer()

  if (gFirstMove) {
    gFirstMove = false
    gGame.isOn = true
    setMinesOnBoard(i, j)
    setMinesNegsCount()

    var elBtn = document.querySelector("button")
    elBtn.innerText = "🥸"
    renderBoard()
  }

  if (!cellClicked.isMarked) {
    if (cellClicked.isMine) {
      classAddValue = " MINE"
      gameOver(elCell)
    } else {
      cellClicked.isShown = true
      gGame.shownCount++

      if (gBoard[i][j].minesAroundCount === 0) {
        revealEmptyNegCells(i, j)
      }
      checkVictory()
    }
  }

  renderBoard()
}

function setGameTimer() {
  if (!gGame.isOn) {
    gameInterval = setInterval(() => {
      gGame.secsPassed++
      var elTimer = document.querySelector(".timer")
      elTimer.innerText = gGame.secsPassed
    }, 1000)
  }
}

function setFlagOnCell(btn, i, j) {
  var elCell = gBoard[i][j]

  if (!gGame.isOn) return
  if (elCell.isShown) return

  if (!elCell.isMarked) {
    if (elCell.isMine) gGame.markedCount++
    gUsedFlagsCount--
    elCell.isMarked = true
    elCell.isShown = false
    btn.classList.add("FLAG")
  } else {
    if (elCell.isMine) gGame.markedCount--
    gUsedFlagsCount++
    elCell.isMarked = false
    elCell.isShown = false
    btn.classList.remove("FLAG")
  }

  var elFlags = document.querySelector(".flags")
  elFlags.innerText = gUsedFlagsCount
  checkVictory()
  renderBoard()
}

function checkVictory() {
  var sum = gGame.shownCount + gGame.markedCount
  var elBtn = document.querySelector("button")

  if (
    sum === gLevel.SIZE * gLevel.SIZE &&
    gLevel.MINES_AMOUNT === gGame.markedCount
  ) {
    console.log(
      "gGame.shownCount: ",
      gGame.shownCount,
      "gGame.markedCount: ",
      gGame.markedCount,
      "gLevel.SIZE: ",
      gLevel.SIZE,
      "gLevel.MINES_AMOUNT: ",
      gLevel.MINES_AMOUNT
    )
    gGame.isOn = false
    clearInterval(gameInterval)
    elBtn.innerText = "😎"
    alert("Victorious!")
  }
}

function gameOver() {
  // Game ends when all mines are marked and all cells are shown
  // TEST: As indicator - compare num of mines to num of isMarked + cell's class MINE + FLAG
  alert("Game over!")
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      if (gBoard[i][j].isMine) gBoard[i][j].isShown = true
    }
  }
  // renderBoard()
  clearInterval(gameInterval)
  gGame.isOn = false

  var elBtn = document.querySelector("button")
  elBtn.innerText = "😫"
}

function setGameLevel(btn) {
  if (btn.value === "Beginner") {
    gLevel.SIZE = 4
    gLevel.MINES_AMOUNT = 2
    init()
  } else if (btn.value === "Medium") {
    gLevel.SIZE = 8
    gLevel.MINES_AMOUNT = 12
    init()
  } else if (btn.value === "Expert") {
    gLevel.SIZE = 12
    gLevel.MINES_AMOUNT = 30
    init()
  }
  return
}

function reload() {
  gGame.isOn = false
  clearInterval(gameInterval)
  gFirstMove = true
  gGame.secsPassed = 0
  gGame.shownCount = 0
  gGame.markedCount = 0

  // DOM: updates flags section
  var elFlags = document.querySelector(".flags")
  elFlags.innerText = gGame.markedCount

  // DOM: updates timer section
  var elTimer = document.querySelector(".timer")
  elTimer.innerText = gGame.secsPassed

  var elBtn = document.querySelector("button")
  elBtn.innerText = "🥸"
  init()
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min //The maximum is inclusive and the minimum is inclusive
}
