import { useEffect, useState } from "react";

const width = 10,
  height = 20;
const tileSize = (window.innerHeight * 0.8) / height;

type Game = {
  gameState: "playing" | "pause" | "ended";
  fieldState: FieldType;
  currentPiece: GamePiece;
  nextPiece: Piece;
  nextRotation: number;
  score: number;
  width: number;
  height: number;
};

type FieldType = TileType[][];

type TileType = {
  color: string;
} | null;

type GamePiece = {
  position: Coordinate;
  piece: Piece;
  rotation: number;
};

type Piece = {
  label: string;
  rotations: Shape[];
  color: string;
};

type Shape = Coordinate[];

type Coordinate = {
  x: number;
  y: number;
};

const pieces: Piece[] = [
  {
    label: "I",
    rotations: [
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
      ],
      [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
    ],
    color: "cyan",
  },
  {
    label: "L",
    rotations: [
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: -1, y: 1 },
      ],
      [
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ],
      [
        { x: 1, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 0 },
        { x: -1, y: 0 },
      ],
    ],
    color: "orange",
  },
  {
    label: "J",
    rotations: [
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 1 },
      ],
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: -1, y: -1 },
      ],
      [
        { x: 1, y: -1 },
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ],
      [
        { x: 1, y: 1 },
        { x: 1, y: 0 },
        { x: 0, y: 0 },
        { x: -1, y: 0 },
      ],
    ],
    color: "blue",
  },
  {
    label: "X",
    rotations: [
      [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ],
    ],
    color: "yellow",
  },
  {
    label: "T",
    rotations: [
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ],
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 0 },
      ],
      [
        { x: 0, y: 1 },
        { x: 0, y: 0 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ],
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
      ],
    ],
    color: "purple",
  },
  {
    label: "\\",
    rotations: [
      [
        { x: -1, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ],
      [
        { x: 1, y: 0 },
        { x: -1, y: 1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ],
    ],
    color: "green",
  },
  {
    label: "/",
    rotations: [
      [
        { x: 1, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ],
      [
        { x: -1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ],
    ],
    color: "red",
  }
];

function randomPiece() {
  return pieces[Math.floor(Math.random() * pieces.length)];
}

function getStartingGame(): Game {
  const startingPiece = randomPiece();
  const nextPiece = randomPiece();

  const field: FieldType = [];

  for (let y = 0; y < height; y++) {
    const row: TileType[] = [];
    for (let x = 0; x < width; x++) {
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
        x: Math.floor(Math.random() * (width - 4) + 2),
        y: 0,
      },
      rotation: Math.floor(Math.random() * startingPiece.rotations.length),
    },
    score: 0,
    width,
    height,
    nextPiece,
    nextRotation: Math.floor(Math.random() * nextPiece.rotations.length)
  };
}

const startingGame = getStartingGame();

let tickTimeout: number;
let deltaTime = 500;

export default function Tetris() {
  const [game, setGame] = useState(startingGame);
  
  useEffect(() => {
    tickTimeout = setTimeout(tick);

    document.addEventListener('keydown', evt => {
      if (evt.key === "ArrowUp" || evt.key === "w" || evt.key === "W") rotate();
      if (evt.key === "ArrowRight" || evt.key === "d" || evt.key === "D") move(1);
      if (evt.key === "ArrowLeft" || evt.key === "a" || evt.key === "A") move(-1);
      if (evt.key === "ArrowDown" || evt.key === "s" || evt.key === "S") speedUp();
    })

    return () => {
      clearTimeout(tickTimeout);
    }
  }, []);

  function tick() {
    setGame(game => {
      game.currentPiece.position.y += 1;

      if (checkCollisions(game))
        blockPiece(game);
      
      let poppedLines = 0;
      
      lineloop: for(let line = height - 1; line >= 0; line--){
        for(let tile = 0; tile < width; tile++){
          if(!game.fieldState[line][tile]) continue lineloop;
        }
        for(let lineToSwitch = line - 1; lineToSwitch >= 0; lineToSwitch--){
          for(let tile = 0; tile < width; tile++) game.fieldState[lineToSwitch + 1][tile] = game.fieldState[lineToSwitch][tile];
        }
        line++;
        poppedLines++;
      }

      game.score += poppedLines === 1 ? 100 : poppedLines === 2 ? 250 : poppedLines === 3 ? 500 : poppedLines === 4 ? 1000 : 0;

      return { ...game }
    });

    deltaTime *= .999;

    tickTimeout = setTimeout(tick, deltaTime);
  }

  function checkCollisions(game: Game) {
    const piecePositions = game.currentPiece.piece.rotations[game.currentPiece.rotation].map(coord => ({ x: coord.x + game.currentPiece.position.x, y: coord.y + game.currentPiece.position.y }));
    return piecePositions.findIndex(position => position.y < height && position.x < width && game.fieldState[position.y] && game.fieldState[position.y][position.x] || position.y >= height) !== -1;
  }

  function blockPiece(game: Game) {
    const piecePositions = game.currentPiece.piece.rotations[game.currentPiece.rotation].map(coord => ({ x: coord.x + game.currentPiece.position.x, y: coord.y + game.currentPiece.position.y }));
    piecePositions.forEach(position => game.fieldState[position.y - 1][position.x] = { color: game.currentPiece.piece.color });
    game.currentPiece = {
      piece: game.nextPiece,
      position: {
        x: Math.floor(Math.random() * (width - 4) + 2),
        y: 0,
      },
      rotation: game.nextRotation
    };

    if(checkCollisions(game)){
      game.gameState = "ended";
    }

    game.nextPiece = randomPiece();
    game.nextRotation = Math.floor(Math.random() * game.nextPiece.rotations.length);
  }

  function isOutLeft(game: Game) {
    const piecePositions = game.currentPiece.piece.rotations[game.currentPiece.rotation].map(coord => ({ x: coord.x + game.currentPiece.position.x, y: coord.y + game.currentPiece.position.y }));
    return piecePositions.findIndex(position => position.x < 0) !== -1;
  }

  function isOutRight(game: Game) {
    const piecePositions = game.currentPiece.piece.rotations[game.currentPiece.rotation].map(coord => ({ x: coord.x + game.currentPiece.position.x, y: coord.y + game.currentPiece.position.y }));
    return piecePositions.findIndex(position => position.x >= width) !== -1;
  }

  function isOut(game: Game) {
    return isOutLeft(game) || isOutRight(game);
  }

  function rotate() {
    setGame(game => {
      game.currentPiece.rotation = (game.currentPiece.rotation + 1) % game.currentPiece.piece.rotations.length;

      if(isOutLeft(game))
        game.currentPiece.position.x += 1;
      else if(isOutRight(game))
        game.currentPiece.position.x -= 1;

      return { ...game };
    })
  }

  function move(direction: number) {
    setGame(game => {
      game.currentPiece.position.x += direction;

      if(checkCollisions(game) || isOut(game)){
        game.currentPiece.position.x -= direction;
      }

      return { ...game };
    })
  }

  function speedUp(){
    clearTimeout(tickTimeout);
    tickTimeout = setTimeout(tick);
  }

  return (
    <div className="app" style={{ width: tileSize * width + tileSize * 4 }}>
      <div
        className="header"
        style={{ width: tileSize * width + tileSize * 4 }}
      >
        <h1>tetris</h1>
      </div>
      <div className="game">
        <Field game={game} />
        <Display game={game} />
      </div>
    </div>
  );
}

type DisplayProps = {
  game: Game;
};

function Display({ game }: DisplayProps) {
  return (
    <div
      className="display"
      style={{
        display: "grid",
        gridTemplateRows: `repeat(${game.height}, ${tileSize}px)`,
        width: tileSize * 4,
      }}
    >
      <span className="value time">
        <span>time: 0</span>
      </span>
      <span className="value score">
        <span>score: {game.score}</span>
      </span>
      <span className="value next">
        <span>next:</span>
      </span>
      <NextPiece nextPiece={game.nextPiece} nextRotation={game.nextRotation} />
    </div>
  );
}

function NextPiece({ nextPiece, nextRotation }: { nextPiece: Piece, nextRotation: number }) {
  const coordinates = nextPiece.rotations[nextRotation];
  const minX = Math.min(...coordinates.map((coord) => coord.x));
  const minY = Math.min(...coordinates.map((coord) => coord.y));
  const maxX = Math.max(...coordinates.map((coord) => coord.x));
  const maxY = Math.max(...coordinates.map((coord) => coord.y));
  const pieceWidth = maxX - minX + 1;
  const pieceHeight = maxY - minY + 1;
  const previewSize = Math.max(pieceWidth, pieceHeight);
  const pieceOffsetX = Math.floor((previewSize + 1) / 2);
  const pieceOffsetY = Math.floor((previewSize + 1) / 2);

  return (
    <div className="preview">
      <div
        className="next-piece"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${previewSize}, ${tileSize}px)`,
          gridTemplateRows: `repeat(${previewSize}, ${tileSize}px)`,
        }}
      >
        {coordinates.map((coord, index) => (
          <span
            className="tile"
            key={index}
            style={{
              gridColumn: coord.x + pieceOffsetX,
              gridRow: coord.y + pieceOffsetY,
              backgroundColor: nextPiece.color,
            }}
          />
        ))}
      </div>
    </div>
  );
}

type FieldProps = {
  game: Game;
};

function Field({ game }: FieldProps) {
  const piecePositions = game.currentPiece.piece.rotations[game.currentPiece.rotation].map(coord => ({ x: coord.x + game.currentPiece.position.x, y: coord.y + game.currentPiece.position.y }));

  return (
    <div
      className="field"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${game.width}, ${tileSize}px)`,
        gridTemplateRows: `repeat(${game.height}, ${tileSize}px)`,
        width: tileSize * width,
      }}
    >
      {game.fieldState.map((column, rowIndex) =>
        column.map((tile, columnIndex) => {
          return <Tile key={columnIndex * game.height + rowIndex}
            style={{ gridColumn: columnIndex + 1, gridRow: rowIndex + 1 }}
            tile={piecePositions.findIndex(position => position.x === columnIndex && position.y === rowIndex) === -1 ? tile : { color: game.currentPiece.piece.color }} />
        })
      )}
    </div>
  );
}

type TileProps = {
  tile: TileType;
  style?: React.CSSProperties;
};
function Tile({ tile, style }: TileProps) {
  return <span className="tile" style={{ ...style, backgroundColor: tile?.color }} />;
}
