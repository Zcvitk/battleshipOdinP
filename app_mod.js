import { Ship } from './ships.js';
import { Gameboard } from './gameboard.js';
import { Player } from './player.js';

document.addEventListener('DOMContentLoaded', () => {
    const gamesBoardContainer = document.querySelector('#gamesboard-container');
    const optionContainer = document.querySelector('.option-container');
    const flipButton = document.querySelector('#flip-button');
    const startButton = document.querySelector('#start-button');
    const infoDisplay = document.querySelector('#info');
    const turnDisplay = document.querySelector('#turn-display');

    let angle = 0;
    let gameOver = false;
    let playerTurn;

    function updateInfoDisplay(message) {
        infoDisplay.textContent = message;
    }

    function flip() {
        const optionShips = Array.from(optionContainer.children);
        angle = (angle === 0) ? 90 : 0;

        optionShips.forEach(optionShip => {
            optionShip.style.transform = `rotate(${angle}deg)`;
        });
    }

    flipButton.addEventListener('click', flip);

    const player = new Player('Player', 'rgb(240,230,140)', 10);
    const computer = new Player('Computer', 'rgb(165,166,168)', 10);

    const ships = createShips();
    const shipsC = createShips();

    function createShips() {
        return [
            new Ship('destroyer', 2),
            new Ship('submarine', 3),
            new Ship('cruiser', 3),
            new Ship('battleship', 4),
            new Ship('carrier', 5)
        ];
    }

    shipsC.forEach(ship => addShipPiece(computer, ship));

    function addShipPiece(player, ship, startId = null) {
        const randomBoolean = Math.random() < 0.5;
        const isHorizontal = player.name === 'Player' ? angle === 0 : randomBoolean;
        const startIndex = startId !== null ? startId : Math.floor(Math.random() * 100);

        if (player.name === 'Player') {
            if (!player.placeShip(ship, startIndex, isHorizontal, player.name)) {
                addShipPiece(player, ship, startId);
            }
        }

        if (player.name === 'Computer') {
            if (!computer.placeShip(ship, startIndex, isHorizontal, player.name)) {
                addShipPiece(player, ship, startId);
            }
        }
    }

    let draggedShip;
    const optionShips = Array.from(optionContainer.children);

    optionShips.forEach(optionShip => optionShip.addEventListener('dragstart', dragStart));
    const allPlayerBlocks = document.querySelectorAll('.game-board:first-child div');

    allPlayerBlocks.forEach(playerBlock => {
        playerBlock.addEventListener('dragover', dragOver);
        playerBlock.addEventListener('drop', dropShip);
    });

    function dragStart(e) {
        draggedShip = e.target;
    }

    function dragOver(e) {
        e.preventDefault();
        const ship = ships[draggedShip.id];
        highlightArea(e.target.id, ship);
    }

    function dropShip(e) {
        const startId = parseInt(e.target.id);
        const ship = ships[draggedShip.id];

        if (player.placeShip(ship, startId, angle === 0, player.name)) {
            draggedShip.remove();
        } else {
            updateInfoDisplay("Invalid placement. Try again.");
        }
    }

    function highlightArea(startIndex, ship) {
        const shipBlocks = [];
        const isHorizontal = angle === 0;

        for (let i = 0; i < ship.length; i++) {
            let index = isHorizontal ? parseInt(startIndex) + i : parseInt(startIndex) + i * 10;
            if (index < 100) {
                shipBlocks.push(index);
            }
        }

        shipBlocks.forEach(index => {
            if (index < 100) {
                document.getElementById(index).classList.add('hover');
            }
        });

        setTimeout(() => {
            shipBlocks.forEach(index => {
                if (index < 100) {
                    document.getElementById(index).classList.remove('hover');
                }
            });
        }, 500);
    }

    function startGame() {
        if (!playerTurn) {
            if (optionContainer.children.length !== 0) {
                updateInfoDisplay('Place all your ships first, then click Start Game.');
            } else {
                const allBoardBlocks = document.querySelectorAll('.game-board:last-child div');
                allBoardBlocks.forEach(block => block.addEventListener('click', handleClick));
                playerTurn = true;
                turnDisplay.textContent = "👦🏻 go";
                updateInfoDisplay("The game has started.");
            }
        }
    }

    startButton.addEventListener('click', startGame);

    function updateFeedback(message) {
        infoDisplay.textContent = message;
    }

    function handleClick(e) {
        if (!gameOver && playerTurn) {
            const index = parseInt(e.target.id);
            const result = computer.receiveAttack(index, true);

            if (result && result.message) {
                updateFeedback(result.message);
                return;
            }

            if (result && result.hit) {
                e.target.classList.add('boom', 'fire');
                updateFeedback("👦🏻 hit the computer's 🚢!");

                if (result.sunk) {
                    updateFeedback(result.sunkMessage);
                }

                if (computer.allSunk()) {
                    updateFeedback("All computer's ships are sunk, 👦🏻 won! 😊");
                    gameOver = true;
                    setTimeout(() => location.reload(), 2000);
                }
            } else {
                updateFeedback('🥱 Nothing hit this time.');
                e.target.classList.add('empty');
            }

            if (!gameOver) {
                playerTurn = false;
                setTimeout(computerGo, 1000);
            }
        }
    }

    function computerGo() {
        if (!gameOver) {
            turnDisplay.textContent = "💻 go";
            updateFeedback('💻 is thinking 🤔⏳');

            setTimeout(() => {
                let randomGo;
                let validAttack = false;

                if (computer.lastHit) {
                    const { index } = computer.lastHit;
                    randomGo = exploreAdjacentMoves(index);
                    if (randomGo !== false) {
                        validAttack = true;
                    }
                }

                if (!validAttack) {
                    while (!validAttack) {
                        randomGo = Math.floor(Math.random() * 100);
                        validAttack =
                            !player.gameboard.board[randomGo].classList.contains('boom') &&
                            !player.gameboard.board[randomGo].classList.contains('empty');
                    }
                }

                const result = player.receiveAttack(randomGo, false);
                const targetBlock = player.gameboard.board[randomGo];

                if (result && result.hit) {
                    computer.lastHit = { index: randomGo };
                    targetBlock.classList.add('boom', 'fire');

                    const shipHitMessage = `💻 hit your ${result.ship.id} 🚢!`;
                    updateFeedback(shipHitMessage);

                    if (result.sunk) {
                        setTimeout(() => {
                            updateFeedback(result.sunkMessage);
                        }, 1000);
                    }

                    setTimeout(() => {
                        if (player.allSunk()) {
                            updateFeedback("💻 sunk all your ships, sorry.....");
                            gameOver = true;
                            setTimeout(() => location.reload(), 2000);
                        } else {
                            setTimeout(() => {
                                playerTurn = true;
                                turnDisplay.textContent = '👦🏻 go';
                                updateFeedback('Please take your go');
                            }, 1000);
                        }
                    }, result.sunk ? 2000 : 1000);
                } else {
                
                    targetBlock.classList.add('empty');
                    updateFeedback("🧊 Nothing hit this time."); 
                    computer.lastHit = null; 

                    playerTurn = true;
                    turnDisplay.textContent = '👦🏻 go';
                    setTimeout(() => {
                        updateFeedback('Please take your go');
                    }, 1000);
                }
            }, 1500);
        }
    }

    function exploreAdjacentMoves(index) {
        const possibleMoves = [];
        const width = player.gameboard.width;

        // Check Up
        if (index - width >= 0 && 
            !player.gameboard.board[index - width].classList.contains('boom') && 
            !player.gameboard.board[index - width].classList.contains('empty')) {
            possibleMoves.push(index - width);
        }

        // Check Down
        if (index + width < width * width && 
            !player.gameboard.board[index + width].classList.contains('boom') && 
            !player.gameboard.board[index + width].classList.contains('empty')) {
            possibleMoves.push(index + width);
        }

        // Check Left
        if (index % width > 0 && 
            !player.gameboard.board[index - 1].classList.contains('boom') && 
            !player.gameboard.board[index - 1].classList.contains('empty')) {
            possibleMoves.push(index - 1);
        }

        // Check Right
        if (index % width < (width - 1) && 
            !player.gameboard.board[index + 1].classList.contains('boom') && 
            !player.gameboard.board[index + 1].classList.contains('empty')) {
            possibleMoves.push(index + 1);
        }

        if (possibleMoves.length > 0) {
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            return randomMove;
        }

        return false;
    }
});

