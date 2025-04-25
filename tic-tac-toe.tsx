"use client"

import { useState, useEffect } from "react"
import confetti from "canvas-confetti"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Sound effects
const useSound = () => {
  const [audio, setAudio] = useState<{
    move: HTMLAudioElement | null
    win: HTMLAudioElement | null
    draw: HTMLAudioElement | null
    click: HTMLAudioElement | null
  }>({
    move: null,
    win: null,
    draw: null,
    click: null,
  })

  useEffect(() => {
    setAudio({
      move: new Audio("/sounds/move.mp3"),
      win: new Audio("/sounds/win.mp3"),
      draw: new Audio("/sounds/draw.mp3"),
      click: new Audio("/sounds/click.mp3"),
    })
  }, [])

  const playSound = (sound: "move" | "win" | "draw" | "click") => {
    if (audio[sound]) {
      audio[sound]?.play().catch((e) => console.log("Audio play error:", e))
    }
  }

  return { playSound }
}

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
      className={`h-20 w-20 rounded-lg text-5xl font-bold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/70 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-md
        ${
          isWinningSquare
            ? "bg-gradient-to-br from-primary/40 to-primary/60 text-white"
            : "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-800"
        }
        ${value === "X" ? "text-blue-500" : value === "O" ? "text-rose-500" : ""}`}
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
  playSound,
}: {
  squares: (string | null)[]
  xIsNext: boolean
  onPlay: (nextSquares: (string | null)[]) => void
  playSound: (sound: "move" | "win" | "draw" | "click") => void
}) {
  const winner = calculateWinner(squares)
  const winningLine = winner ? winner.line : []

  function handleClick(i: number) {
    if (squares[i] || calculateWinner(squares)) {
      return
    }

    const nextSquares = squares.slice()
    nextSquares[i] = xIsNext ? "X" : "O"

    // Play move sound
    playSound("move")

    onPlay(nextSquares)

    // Check for winner or draw after the move
    setTimeout(() => {
      const newWinner = calculateWinner(nextSquares)
      if (newWinner) {
        playSound("win")
        triggerConfetti()
      } else if (nextSquares.every((square) => square !== null)) {
        playSound("draw")
      }
    }, 100)
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
    <div className="flex flex-col items-center gap-6">
      <div className="text-2xl font-bold py-2 px-6 rounded-full bg-gradient-to-r from-primary/20 to-primary/30 dark:from-primary/30 dark:to-primary/40 shadow-md">
        {status}
      </div>
      <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-lg">
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

function triggerConfetti() {
  const duration = 3000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 50 * (timeLeft / duration)

    // Burst confetti from both sides
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
    })

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
    })
  }, 250)
}

export default function TicTacToe() {
  const [history, setHistory] = useState<(string | null)[][]>([Array(9).fill(null)])
  const [currentMove, setCurrentMove] = useState(0)
  const xIsNext = currentMove % 2 === 0
  const currentSquares = history[currentMove]
  const { playSound } = useSound()

  function handlePlay(nextSquares: (string | null)[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares]
    setHistory(nextHistory)
    setCurrentMove(nextHistory.length - 1)
  }

  function jumpTo(move: number) {
    playSound("click")
    setCurrentMove(move)
  }

  function resetGame() {
    playSound("click")
    setHistory([Array(9).fill(null)])
    setCurrentMove(0)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md p-8 shadow-2xl border-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <h1 className="mb-8 text-center text-4xl font-extrabold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Tic Tac Toe
        </h1>

        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} playSound={playSound} />

        <div className="mt-8 flex justify-center">
          <Button
            onClick={resetGame}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Restart Game
          </Button>
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-xl font-bold text-center">Game History</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {history.map((_, move) => (
              <Button
                key={move}
                variant={move === currentMove ? "default" : "outline"}
                size="sm"
                className={`rounded-full transition-all duration-200 transform hover:scale-105 ${
                  move === currentMove
                    ? "bg-gradient-to-r from-primary to-purple-600 text-white"
                    : "hover:bg-primary/10"
                }`}
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
