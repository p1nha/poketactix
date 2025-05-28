# 📖 PokeTactix: Real-Time Pokémon Strategy Game  
**PokeTactix** is an online multiplayer game project where players face off in tactical battles inspired by Pokémon types. This project sharpens your skills in **Node.js**, real-time communication with **Socket.io**, front-end JavaScript, and interactive UI/UX design.

---

## ✨ Project Overview  
The goal of **PokeTactix** is to create a dynamic two-player board game where each player places Pokémon-type pieces on a grid, aiming to control the board by exploiting type weaknesses.  
The server handles matchmaking, game state, and turn management, while the client provides an engaging drag-and-drop interface.

---

## 🔧 Key Features

### 🎮 Core Mechanics  
- A 6x6 board where players (blue vs. red) take turns placing pieces.  
- Each piece represents a Pokémon type (fire, water, rock, etc.) with strengths and weaknesses.  
- When a piece is placed next to an opponent’s piece it is strong against, it converts that piece.  

### 💻 Server-Side (Node.js + Socket.io)  
- **Express** serves static front-end files.  
- **Socket.io** manages real-time multiplayer connections.  
- Players enter a matchmaking queue and are automatically paired.  
- Game state is tracked with unique game IDs, player objects, board state, and turn counters.  
- Includes move validation (turn order, valid placements), type-based interactions, and win conditions.

### 🖥️ Front-End (HTML, CSS, JavaScript)  
- Main pages:  
  - **index.html** → landing page  
  - **online.html** → online game  
  - **tutorial.html** → interactive tutorial  
- Drag-and-drop system for placing pieces on the board.  
- Real-time visual updates: game state, current turn, and captured pieces.  
- Pop-up helpers like the type effectiveness chart assist players during matches.  
- Step-by-step tutorial system with dialog boxes and interactive guidance.

---

## 🚀 Example Workflow  

### 1️⃣ Install dependencies
```bash
npm install express socket.io
```

### 2️⃣ Run the server
```bash
node app.js
```

### 3️⃣ Access the game
Open your browser and go to:
```
http://192.168.x.x:3000
```

### 4️⃣ Play online
- Players enter their names, search for a match, and are automatically paired.  
- The game updates in real time as they play, tracking moves and applying type-based interactions.

---

## 💾 Code Highlights

### app.js
- Sets up the Express server.  
- Defines Socket.io events.  
- Handles game logic: matchmaking, turn validation, type interactions, and win conditions.
