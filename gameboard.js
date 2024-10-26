import { Ship } from './ships.js';

export class Gameboard {
    constructor(color, width) {
        this.color = color;
        this.ships = [];
        this.missedAttacks = [];
        this.width = width;
        this.board = Array(this.width * this.width).fill(null);
        this.createBoard();
    }

createBoard() {
    const gameBoardContainer = document.createElement('div');
    gameBoardContainer.classList.add('game-board');

    for (let i = 0; i < this.width * this.width; i++) {
        const block = document.createElement('div');
        block.classList.add('block');
        block.id = i;
        gameBoardContainer.append(block);
        this.board[i] = block;
    }

    document.querySelector('#gamesboard-container').append(gameBoardContainer);
}

placeShip(ship, start, isHorizontal, playerName) {
    const shipLength = ship.length;

    if (isHorizontal) {
        if (start % this.width + shipLength > this.width || start + shipLength > this.board.length) {
            return false;
        }
    } else {
        if (start + (shipLength - 1) * this.width >= this.board.length) {
            return false;
        }
    }

    for (let i = 0; i < shipLength; i++) {
        let index = isHorizontal ? start + i : start + i * this.width;

        if (index >= this.board.length || this.board[index]?.classList.contains('taken')) {
            return false;
        }
    }

    for (let i = 0; i < shipLength; i++) {
        let index = isHorizontal ? start + i : start + i * this.width;
        this.board[index].classList.add('taken', ship.id);
        if (playerName === "Computer") {
            this.board[index].classList.add('computer');
        }
    }

    this.ships.push(ship);
    return true;
}

receiveAttack(index, isPlayerAttack = true) {
    const targetBlock = this.board[index];

    if (targetBlock.classList.contains('boom') || targetBlock.classList.contains('empty')) {
        return { message: "🤌 No need to hit the same spot again! Take another shot!" };
    }

    if (!targetBlock.classList.contains('taken')) {
        this.missedAttacks.push(index);
        targetBlock.classList.add('empty');
        return { hit: false };
    }

    const hitShipId = [...targetBlock.classList].find(cls => cls !== 'block' && cls !== 'empty' && cls !== 'taken');
    const hitShip = this.ships.find(ship => ship.id === hitShipId);
    const segmentIndex = this.board.reduce((acc, block, idx) => {
        if (block.classList.contains(hitShip.id)) {
            acc.push(idx);
        }
        return acc;
    }, []).indexOf(index);

    hitShip.hit(segmentIndex);
    targetBlock.classList.add('boom');

    const sunkMessage = hitShip.isSunk()
        ? (isPlayerAttack ? `Congratulations! 👦🏻 sunk the computer's ${hitShip.id} 🚢 😊` : `Oh no! The computer has sunk your ${hitShip.id} 🚢!`)
        : '';

    return { hit: true, ship: hitShip, sunk: hitShip.isSunk(), sunkMessage: sunkMessage };
}

allSunk() {
    return this.ships.every(ship => ship.isSunk());
}
}


