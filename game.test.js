import { Ship } from './ships.js';
import { Gameboard } from './gameboard.js';
import { Player } from './player.js';



beforeAll(() => {
    const container = document.createElement('div');
    container.id = 'gamesboard-container';
    document.body.appendChild(container);
 });

describe('Ship', () => {
    test('should initialize with correct properties', () => {
        const ship = new Ship('destroyer', 2);
        expect(ship.id).toBe('destroyer');
        expect(ship.length).toBe(2);
        expect(ship.hits).toBe(0);
        expect(ship.hitSegments).toEqual([false, false]);
    });

    test('should register a hit correctly', () => {
        const ship = new Ship('destroyer', 2);
        expect(ship.hit(0)).toBe(1);
        expect(ship.hits).toBe(1);
        expect(ship.hitSegments).toEqual([true, false]);
    });

    test('should not increase hits for already hit segment', () => {
        const ship = new Ship('destroyer', 2);
        ship.hit(0);
        expect(ship.hit(0)).toBe(1);
    });

    test('should determine if the ship is sunk', () => {
        const ship = new Ship('destroyer', 2);
        ship.hit(0);
        expect(ship.isSunk()).toBe(false);
        ship.hit(1);
        expect(ship.isSunk()).toBe(true);
    });

    test('should get the index of the first unhit segment', () => {
        const ship = new Ship('destroyer', 2);
        expect(ship.getFirstUnhitSegment()).toBe(0);
        ship.hit(0);
        expect(ship.getFirstUnhitSegment()).toBe(1);
        ship.hit(1);
        expect(ship.getFirstUnhitSegment()).toBe(-1);
    });
});

describe('Gameboard', () => {
    let gameboard;
    test('should place ship correctly', () => {
        const gameboard = new Gameboard('red', 10);
        const ship = new Ship('destroyer', 2);
        expect(gameboard.placeShip(ship, 0, true)).toBe(true);
        expect(gameboard.ships).toContain(ship);
        expect(gameboard.board[0].classList.contains('taken')).toBe(true);
        expect(gameboard.board[1].classList.contains('taken')).toBe(true);
    });

    test('should return false if ship placement is invalid', () => {
        const gameboard = new Gameboard('red', 10);
        const ship = new Ship('destroyer', 2);
        gameboard.placeShip(ship, 7, true);
        expect(gameboard.placeShip(new Ship('submarine', 3), 7, true)).toBe(false);
    });

    test('should receive attack and return correct response', () => {
        const gameboard = new Gameboard('red', 10);
        const ship = new Ship('destroyer', 2);
        gameboard.placeShip(ship, 0, true);
        expect(gameboard.receiveAttack(0)).toEqual({
            hit: true,
            ship: ship,
            sunk: false,
            sunkMessage: ''
        });
        expect(gameboard.receiveAttack(0).message).toBe("🤌 No need to hit the same spot again! Take another shot!");
    });

    test('should detect if all ships are sunk', () => {
        const gameboard = new Gameboard('red', 10);
        const ship = new Ship('destroyer', 2);
        gameboard.placeShip(ship, 0, true);
        ship.hit(0);
        ship.hit(1);
        expect(gameboard.allSunk()).toBe(true);
    });
});

describe('Player', () => {
    test('should create Player with a Gameboard', () => {
        const player = new Player('Player1', 'blue', 10);
        expect(player.name).toBe('Player1');
        expect(player.gameboard).toBeInstanceOf(Gameboard);
    });

    test('should place ship', () => {
        const player = new Player('Player1', 'blue', 10);
        const ship = new Ship('destroyer', 2);
        expect(player.placeShip(ship, 0, true)).toBe(true);
    });

    test('should receive attack', () => {
        const player = new Player('Player1', 'blue', 10);
        const ship = new Ship('destroyer', 2);
        player.placeShip(ship, 0, true);  
        const result = player.receiveAttack(0); 
        expect(result.hit).toBe(true);
    });

    test('should detect if all ships are sunk', () => {
        const player = new Player('Player1', 'blue', 10);
        const ship = new Ship('destroyer', 2);
        player.placeShip(ship, 0, true);
        ship.hit(0);
        ship.hit(1);
        expect(player.allSunk()).toBe(true);
    });
});