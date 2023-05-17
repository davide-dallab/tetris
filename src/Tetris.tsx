import { useState } from "react";

const width = 10, height = 20;
const tileSize = window.innerHeight * .8 / height;

type Game = {
  gameState: "playing" | "pause" | "ended";
  fieldState: FieldType;
  currentPiece: GamePiece;
  nextPiece: Piece;
  score: number;
  width: number;
  height: number;
}

type FieldType = TileType[][];

type TileType = {
  color: string;
} | null

type GamePiece = {
  position: Coordinate;
  piece: Piece;
  rotation: number;
}

type Piece = {
  label: string;
  rotations: Shape[];
  color: string;
}

type Shape = Coordinate[];

type Coordinate = {
  x: number;
  y: number;
}

const pieces: Piece[] = [
  {
    label: "│",
    rotations: [
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 }
      ],
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 }
      ]
    ],
    color: "cyan"
  },
  {
    label: "└",
    rotations: [
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 }
      ]
    ],
    color: "red"
  },
  {
    label: "┘",
    rotations: [
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 1 }
      ]
    ],
    color: "purple"
  }
];

function randomPiece(){
  return pieces[Math.floor(Math.random() * pieces.length)];
}

function startingGame(width: number, height: number): Game {
  const startingPiece = randomPiece();
  const nextPiece = randomPiece();

  const field: FieldType = [];

  for(let y = 0; y < height; y++){
    const row: TileType[] = [];
    for(let x = 0; x < width; x++){
      row.push(null);
    }
    field.push(row);
  }
  
  return {
    gameState: "playing",
    fieldState: field,
    currentPiece: {
      piece: startingPiece,
      position: {
        x: Math.floor(width / 2),
        y: 1
      },
      rotation: Math.floor(Math.random() * startingPiece.rotations.length)
    },
    score: 0,
    width,
    height,
    nextPiece
  };
}

export default function Tetris() {
  const [game, setGame] = useState(startingGame(width, height));

  return <div className="app" style={{width: tileSize * width + tileSize * 5}}>
    <div className="header" style={{width: tileSize * width + tileSize * 5}}>
      <h1>tetris</h1>
    </div>
    <div className="game">
      <Field game={game} />
      <Display game={game} />
    </div>
  </div>
}

type DisplayProps = {
  game: Game;
}

function Display({game}: DisplayProps) {
  return <div className="display"
  style={{
    display: "grid",
    gridTemplateRows: `repeat(${game.height}, ${tileSize}px)`,
    width: tileSize * 5
  }}>
    <span className="value time"><span>time: 0</span></span>
    <span className="value score"><span>score: {game.score}</span></span>
    <span className="value next"><span>next:</span></span>
    <NextPiece nextPiece={game.nextPiece} />
  </div>
}

function NextPiece({nextPiece}: {nextPiece: Piece}){
  const coordinates = nextPiece.rotations[0];
  const minX = Math.min(...coordinates.map(coord => coord.x));
  const minY = Math.min(...coordinates.map(coord => coord.y));
  const maxX = Math.max(...coordinates.map(coord => coord.x));
  const maxY = Math.max(...coordinates.map(coord => coord.y));

  return <div className="next-piece"
  style={{
    display: "grid",
    gridTemplateColumns: `repeat(${Math.max(maxX - minX, maxY - minY) + 1}, ${tileSize}px)`,
    gridTemplateRows: `repeat(${Math.max(maxX - minX, maxY - minY) + 1}, ${tileSize}px)`
  }}>
    {
      coordinates.map((coord, index) => <span className="tile" key={index} style={{gridColumn: coord.x - minX + 1, gridRow: coord.y - minY + 1, backgroundColor: nextPiece.color}} />)
    }
  </div>
}

type FieldProps = {
  game: Game;
}

function Field({ game }: FieldProps) {
  return <div
    className="field"
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${game.width}, ${tileSize}px)`,
      gridTemplateRows: `repeat(${game.height}, ${tileSize}px)`,
      width: tileSize * width
    }}>
    {
      game.fieldState.map((column, columnIndex) => column.map((tile, rowIndex) => <Tile key={columnIndex * game.height + rowIndex} tile={tile} />))
    }
  </div>
}

type TileProps = {
  tile: TileType;
}
function Tile({ tile }: TileProps) {
  return <span className="tile" style={{ backgroundColor: tile?.color }} />
}