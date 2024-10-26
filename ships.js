export class Ship {
    constructor(id, length) {
        this.id = id; 
        this.length = length;
        this.hits = 0; 
        this.hitSegments = Array(length).fill(false);
    }

    hit(segmentIndex) {
        if (!this.hitSegments[segmentIndex]) {
            this.hitSegments[segmentIndex] = true; 
            this.hits += 1;
        }
        return this.hits;
    }

    isSunk() {
        return this.hits === this.length;
    }

    getFirstUnhitSegment() {
        return this.hitSegments.findIndex(hit => !hit); 
    }
} 

