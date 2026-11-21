// For every clue (a given cell or an edge hint) a bitset says which boards satisfy it.
// "How many boards fit these clues" is then an AND of a few bitsets and a bit count.
// A cell clue has two bitsets (cat, dog), an edge clue has two (different, same).

const BITS_PER_WORD = 32;
const CELLS_ON_BOARD = 36;

export class ClueIndex {
  constructor(boards, edges) {
    this.wordCount = Math.ceil(boards.length / BITS_PER_WORD);
    this.cellBitsets = this.createBitsets(CELLS_ON_BOARD * 2);
    this.edgeBitsets = this.createBitsets(edges.length * 2);

    boards.forEach((board, boardIndex) => {
      for (let cell = 0; cell < CELLS_ON_BOARD; cell++) {
        this.setBit(this.cellBitsets[cell * 2 + board[cell]], boardIndex);
      }
      edges.forEach(([firstCell, secondCell], edgeIndex) => {
        const isSame = board[firstCell] === board[secondCell] ? 1 : 0;
        this.setBit(this.edgeBitsets[edgeIndex * 2 + isSame], boardIndex);
      });
    });
  }

  createBitsets(count) {
    return Array.from({ length: count }, () => new Uint32Array(this.wordCount));
  }

  setBit(bitset, boardIndex) {
    bitset[Math.floor(boardIndex / BITS_PER_WORD)] |=
      1 << (boardIndex % BITS_PER_WORD);
  }

  // Number of boards that satisfy every clue, counting stops at the limit.
  countMatchingBoards(clueBitsets, limit) {
    let count = 0;

    for (let word = 0; word < this.wordCount; word++) {
      let combined = 0xffffffff;
      for (const clueBitset of clueBitsets) {
        combined &= clueBitset[word];
      }
      count += countSetBits(combined >>> 0);

      if (count >= limit) {
        return count;
      }
    }

    return count;
  }
}

function countSetBits(value) {
  let remaining = value;
  let count = 0;

  while (remaining !== 0) {
    remaining &= remaining - 1;
    count++;
  }

  return count;
}
