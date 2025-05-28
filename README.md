📖 PokeTactix: Real-Time Pokémon Strategy Game
PokeTactix is an online multiplayer game project where players face off in a tactical battle inspired by Pokémon types. This project sharpens your skills in Node.js, real-time communication with Socket.io, front-end JavaScript, and interactive UI/UX design.

✨ Project Overview
The goal of PokeTactix is to create a dynamic two-player board game where each player places Pokémon-type pieces on a grid, aiming to control the board by exploiting type weaknesses. The server handles matchmaking, game state, and turn management, while the client provides an engaging drag-and-drop interface.

🔧 Key Features

🎮 Core Mechanics
PokeTactix sets up a 6x6 board where players (blue vs. red) take turns placing pieces. Each piece represents a Pokémon type (e.g., fire, water, rock) with strengths and weaknesses. When a piece is placed next to an opponent’s piece it is strong against, it converts that piece.

💻 Server-Side (Node.js + Socket.io)

Express server serves static front-end files.

Socket.io manages real-time multiplayer connections.

Players enter a matchmaking queue and are paired when two are available.

Game state is tracked with unique game IDs, player objects, board state, and turn counters.

Includes handling of moves, validations (turn order, valid placements), interactions (type matchups), and game end conditions.

🖥️ Front-End (HTML, CSS, JavaScript)

Main pages: index.html (landing), online.html (game), tutorial.html (interactive tutorial).

Drag-and-drop system for placing pieces on the board.

Visual updates on game state, current turn, and captured pieces.

Pop-up guides like the type effectiveness chart help players during matches.

Tutorial system with step-by-step guidance and dialogue boxes.

🚀 Example Workflow
1️⃣ Run the server:
node app.js

2️⃣ Access the game:
Open the browser and go to 192.168.x.x:3000

3️⃣ Play online:
Players enter their names, search for a match, and are paired automatically. The game updates in real-time as they play, tracking moves and applying type-based interactions.

💾 Code Highlights

app.js → Sets up the server, Socket.io events, game logic.

online.js → Handles client-side game logic, board updates, and interaction with the server.

cajaTexto.js → Manages the tutorial dialogues and visual effects.

HTML/CSS → Provides structured and styled game interfaces.
