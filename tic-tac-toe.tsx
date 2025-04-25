"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

function Square({
  value,
  onSquareClick,
  isWinningSquare,
}: {
  value: string | null
  onSquareClick: () => void
  isWinningSquare: boolean
}) {
  return (
    <button
      className={`h-20 w-20 border-2 border-primary/20 text-4xl font-bold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors
        ${isWinningSquare ? "bg-primary/20" : "hover:bg-primary/10"}`}
      onClick={onSquareClick}
      aria-label={value ? `${value} is in this square` : "Empty square"}
    >
      {value}
    </button>
  )
}

function Board({
  squares,
  xIsNext,
  onPlay,
}: {
  squares: (string | null)[]
  xIsNext: boolean
  onPlay: (nextSquares: (string | null)[]) => void
}) {
  const winner = calculateWinner(squares)
  const winningLine = winner ? winner.line : []

  function handleClick(i: number) {
    if (squares[i] || calculateWinner(squares)) {
      return
    }

    const nextSquares = squares.slice()
    nextSquares[i] = xIsNext ? "X" : "O"
    onPlay(nextSquares)
  }

  let status
  if (winner) {
    status = `Winner: ${winner.player}`
  } else if (squares.every((square) => square !== null)) {
    status = "Draw! Game over"
  } else {
    status = `Next player: ${xIsNext ? "X" : "O"}`
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-xl font-medium">{status}</div>
      <div className="grid grid-cols-3 gap-1">
        {Array(9)
          .fill(null)
          .map((_, i) => (
            <Square
              key={i}
              value={squares[i]}
              onSquareClick={() => handleClick(i)}
              isWinningSquare={winningLine.includes(i)}
            />
          ))}
      </div>
    </div>
  )
}

export default function TicTacToe() {
  const [history, setHistory] = useState<(string | null)[][]>([Array(9).fill(null)])
  const [currentMove, setCurrentMove] = useState(0)
  const xIsNext = currentMove % 2 === 0
  const currentSquares = history[currentMove]

  function handlePlay(nextSquares: (string | null)[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares]
    setHistory(nextHistory)
    setCurrentMove(nextHistory.length - 1)
  }

  function jumpTo(move: number) {
    setCurrentMove(move)
  }

  function resetGame() {
    setHistory([Array(9).fill(null)])
    setCurrentMove(0)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold">Tic Tac Toe</h1>

        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />

        <div className="mt-6 flex justify-center">
          <Button onClick={resetGame} variant="outline">
            Restart Game
          </Button>
        </div>

        <div className="mt-6">
          <h2 className="mb-2 text-lg font-medium">Game History</h2>
          <div className="flex flex-wrap gap-2">
            {history.map((_, move) => (
              <Button
                key={move}
                variant={move === currentMove ? "default" : "outline"}
                size="sm"
                onClick={() => jumpTo(move)}
              >
                {move === 0 ? "Start" : `Move #${move}`}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

function calculateWinner(squares: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: lines[i] }
    }
  }

  return null
}
