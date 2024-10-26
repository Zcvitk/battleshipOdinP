import { Gameboard } from './gameboard.js';

export class Player {
    constructor(name, color, width) {
        this.name = name;
        this.gameboard = new Gameboard(color, width);
    }

    placeShip(ship, startId, isHorizontal) {
        return this.gameboard.placeShip(ship, startId, isHorizontal, this.name);
    }

    receiveAttack(index, isPlayerAttack = true) {
        return this.gameboard.receiveAttack(index, isPlayerAttack);
    }

    allSunk() {
        return this.gameboard.allSunk();
    }
}