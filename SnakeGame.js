import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView
} from 'react-native';

const GRID_SIZE = 15;
const CELL_SIZE = Math.floor(Dimensions.get('window').width * 0.9 / GRID_SIZE);
const GRID_WIDTH = CELL_SIZE * GRID_SIZE;

// Direction constants
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  RIGHT: { x: 1, y: 0 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
};

const SnakeGame = () => {
  // Game state
  const [snake, setSnake] = useState([
    { x: 5, y: 5 },
  ]);
  const [food, setFood] = useState({ x: 10, y: 10 });
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const gameLoopRef = useRef(null);
  const directionRef = useRef(DIRECTIONS.RIGHT);
  
  // Use a ref to keep track of the current direction to prevent issues in the interval
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);
  
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);
  
  const resetGame = () => {
    setSnake([{ x: 5, y: 5 }]);
    setFood({ x: 10, y: 10 });
    setDirection(DIRECTIONS.RIGHT);
    directionRef.current = DIRECTIONS.RIGHT;
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  };
  
  const startGame = () => {
    resetGame();
    setGameStarted(true);
    gameLoopRef.current = setInterval(moveSnake, 200);
  };
  
  const generateFood = () => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    return newFood;
  };
  
  const moveSnake = () => {
    if (gameOver || isPaused) return;
    
    setSnake(prevSnake => {
      // Create new head based on current direction from the ref
      const head = prevSnake[0];
      const currentDirection = directionRef.current;
      
      const newHead = {
        x: head.x + currentDirection.x,
        y: head.y + currentDirection.y
      };
      
      // Check if the snake hits the wall
      if (
        newHead.x < 0 || 
        newHead.x >= GRID_SIZE || 
        newHead.y < 0 || 
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        clearInterval(gameLoopRef.current);
        return prevSnake;
      }
      
      // Check if the snake hits itself
      if (prevSnake.slice(0, -1).some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        clearInterval(gameLoopRef.current);
        return prevSnake;
      }
      
      // Create new snake body
      const newSnake = [newHead, ...prevSnake];
      
      // Check if snake eats food
      if (newHead.x === food.x && newHead.y === food.y) {
        // Food eaten, generate new food
        setFood(generateFood());
        setScore(prev => prev + 10);
      } else {
        // Remove the tail if no food eaten
        newSnake.pop();
      }
      
      return newSnake;
    });
  };
  
  const handleDirection = (newDirection) => {
    // Prevent 180-degree turns
    const currentDirection = directionRef.current;
    if (
      (newDirection === DIRECTIONS.UP && currentDirection === DIRECTIONS.DOWN) ||
      (newDirection === DIRECTIONS.DOWN && currentDirection === DIRECTIONS.UP) ||
      (newDirection === DIRECTIONS.LEFT && currentDirection === DIRECTIONS.RIGHT) ||
      (newDirection === DIRECTIONS.RIGHT && currentDirection === DIRECTIONS.LEFT)
    ) {
      return;
    }
    
    setDirection(newDirection);
  };
  
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };
  
  const renderGrid = () => {
    const grid = [];
    
    // Create cells for the grid
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isSnake = snake.some(segment => segment.x === x && segment.y === y);
        const isHead = snake.length > 0 && snake[0].x === x && snake[0].y === y;
        const isFood = food.x === x && food.y === y;
        
        let backgroundColor = '#f0f0f0'; // Empty cell
        if (isHead) backgroundColor = '#388E3C'; // Snake head
        else if (isSnake) backgroundColor = '#4CAF50'; // Snake body
        if (isFood) backgroundColor = '#F44336'; // Food
        
        grid.push(
          <View
            key={`${x},${y}`}
            style={[
              styles.cell,
              { backgroundColor }
            ]}
          />
        );
      }
    }
    
    return grid;
  };

  const renderWelcomeScreen = () => (
    <View style={styles.welcomeScreen}>
      <Text style={styles.welcomeTitle}>Snake Game</Text>
      <Text style={styles.welcomeSubtitle}>Ready to play?</Text>
      <TouchableOpacity 
        style={styles.startButton} 
        onPress={startGame}
      >
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGameOverScreen = () => (
    <View style={styles.gameOverScreen}>
      <Text style={styles.gameOverText}>Game Over!</Text>
      <Text style={styles.finalScoreText}>Final Score: {score}</Text>
      <TouchableOpacity 
        style={styles.playAgainButton}
        onPress={startGame}
      >
        <Text style={styles.playAgainText}>Play Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGameScreen = () => (
    <View style={styles.gameContainer}>
      <Text style={styles.title}>Snake Game</Text>
      <Text style={styles.score}>Score: {score}</Text>
      
      <View style={styles.gridContainer}>
        <View style={styles.grid}>{renderGrid()}</View>
      </View>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.controlButton, styles.upButton]} 
          onPress={() => handleDirection(DIRECTIONS.UP)}
        >
          <Text style={styles.buttonText}>↑</Text>
        </TouchableOpacity>
        
        <View style={styles.horizontalControls}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.leftButton]} 
            onPress={() => handleDirection(DIRECTIONS.LEFT)}
          >
            <Text style={styles.buttonText}>←</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.rightButton]} 
            onPress={() => handleDirection(DIRECTIONS.RIGHT)}
          >
            <Text style={styles.buttonText}>→</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.downButton]} 
          onPress={() => handleDirection(DIRECTIONS.DOWN)}
        >
          <Text style={styles.buttonText}>↓</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.menuButtons}>
        <TouchableOpacity 
          style={[styles.menuButton, styles.resetButton]} 
          onPress={resetGame}
        >
          <Text style={styles.menuButtonText}>Reset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.menuButton, styles.pauseButton]} 
          onPress={togglePause}
        >
          <Text style={styles.menuButtonText}>
            {isPaused ? 'Resume' : 'Pause'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      {!gameStarted && !gameOver && renderWelcomeScreen()}
      {gameStarted && !gameOver && renderGameScreen()}
      {gameOver && renderGameOverScreen()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  welcomeScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  welcomeTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  welcomeSubtitle: {
    fontSize: 24,
    color: 'white',
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  gameOverScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F44336',
  },
  gameOverText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  finalScoreText: {
    fontSize: 30,
    color: 'white',
    marginBottom: 40,
  },
  playAgainButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  playAgainText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
  },
  gameContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  score: {
    fontSize: 18,
    marginBottom: 20,
  },
  gridContainer: {
    width: GRID_WIDTH,
    height: GRID_WIDTH,
    backgroundColor: '#ccc',
    borderWidth: 2,
    borderColor: '#333',
  },
  grid: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  controlsContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  horizontalControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 160,
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 30,
  },
  upButton: {
    marginBottom: 5,
  },
  downButton: {
    marginTop: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuButtons: {
    flexDirection: 'row',
    marginTop: 30,
  },
  menuButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    margin: 5,
  },
  resetButton: {
    backgroundColor: '#FF9800',
  },
  pauseButton: {
    backgroundColor: '#9C27B0',
  },
  menuButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default SnakeGame;