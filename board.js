class Board {
  ctx;
  grid;
  piece;
  next;
  ctxNext;
  time;
  requestId;

  constructor(ctx, ctxNext) {
    this.ctx = ctx;
    this.ctxNext = ctxNext;
    this.init();
  }

  /**
   * Inizializza la board di gioco.
   *
   * @memberof Board
   */
  init() {
    // Calcola le dimensioni del canvas dalle costanti.
    this.ctx.canvas.width = COLS * BLOCK_SIZE;
    this.ctx.canvas.height = ROWS * BLOCK_SIZE;

    // Scala in automatico così da non dovere dare una dimension
    // ad ogni disegno.
    this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
  }

  /**
   * Reimposta la board di gioco.
   *
   * @memberof Board
   */
  reset() {
    this.grid = this.getEmptyGrid();
    this.piece = new Piece(this.ctx);
    this.piece.setStartingPosition();
    this.getNewPiece();
  }

  getNewPiece() {
    this.next = new Piece(this.ctxNext);
    this.ctxNext.clearRect(0, 0, this.ctxNext.canvas.width, this.ctxNext.canvas.height);
    this.next.draw();
  }

  /**
   * Imposta la griglia a 0.
   *
   * @returns {Array} La griglia di gioco impostata a 0.
   * @memberof Board
   */
  getEmptyGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }

  valid(p) {
    return p.shape.every((row, dy) => {
      return row.every((value, dx) => {
        let x = p.x + dx;
        let y = p.y + dy;
        return (
          value === 0 || (this.insideWalls(x) && this.aboveFloor(y) && this.notOccupied(x, y))
        );
      });
    });
  }

  /**
   * Controlla se il tetronimo è all'interno
   * dell'area di gioco a destra e a sinistra.
   *
   * @param {Number} x La posizione del tetronimo
   * @returns {Boolean} Vero se la posizione è valida, Falso se la posizione
   * non è valida.
   * @memberof Board
   */
  insideWalls(x) {
    return x >= 0 && x < COLS;
  }

  /**
   * Controlla se il tetronimo è all'interno
   * dell'area di gioco sotto.
   *
   * @param {Number} y La posizione del tetronimo
   * @returns {Boolean} Vero se la posizione è valida, Falso se la posizione
   * non è valida.
   * @memberof Board
   */
  aboveFloor(y) {
    return y <= ROWS;
  }

  /**
   * Controlla se il tetronimo non sta occupando una posizione
   * già occupata.
   *
   * @param {Number} x Posizione x del tetronimo
   * @param {Number} y Posizione y del tetronimo
   * @returns {Boolean} Vero se la posizione è libera, Falso se la posizione
   * non è libera.
   * @memberof Board
   */
  notOccupied(x, y) {
    return this.grid[y] && this.grid[y][x] === 0;
  }


  /**
   * Ruota il tetronimo.
   *
   * @param {Array} piece Il tetronimo da ruotare.
   * @returns {Array} p Il tetronimo ruotato.
   * @memberof Board
   */
  rotate(piece) {

    // Viene clonato il pezzo.
    let p = JSON.parse(JSON.stringify(piece));

    // Trasposizione della matrice (il pezzo è una matrice 3x3)
    for (let y = 0; y < p.shape.length; y++) {
      for (let x = 0; x < y; x++) {
        [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
      }
    }

    p.shape.forEach(row => row.reverse());
    return p;
  }

  drop() {
    let p = moves[KEY.DOWN](this.piece);
    if (this.valid(p)) {
      this.piece.move(p);
    } else {
      this.freeze();
      this.clearLines();
      if (this.piece.y === 0) {
        // Game Over
        return false;
      }
      this.piece = this.next;
      this.piece.ctx = this.ctx;
      this.piece.setStartingPosition();
      this.getNewPiece();
    }
    return true;
  }

  freeze() {
    this.piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.grid[y + this.piece.y][x + this.piece.x] = value;
        }
      })
    })
  }

  clearLines() {

    let lines = 0;

    this.grid.forEach((row, y) => {

      // Se ogni valore è maggiore di 0
      if (row.every(value => value > 0)) {
        lines++;

        // Rimuovere la riga
        this.grid.splice(y, 1);

        // Aggiungere una nuova riga piena di 0 all'inizio della griglia
        this.grid.unshift(Array(COLS).fill(0));
      }

    });

    if (lines > 0) {
      // Calcolare il punteggio delle linee eliminate e il livello

      account.score += this.getLinesClearedPoints(lines);
      account.lines += lines;

      // Se abbiamo raggiunte le linee per il passaggio di livello
      if (account.lines >= LINES_PER_LEVEL) {
        // Aumentiamo di livello
        account.level++;

        // Rimuoviamo le linee così da partire nuovamente da 0 per il nuovo livello.
        account.lines -= LINES_PER_LEVEL;

        // Incremento la velocità di gioco
        time.level = LEVEL[account.level];
      }

    }

  }

  getLinesClearedPoints(lines, level) {
    const lineClearPoints =
      lines === 1
        ? POINTS.SINGLE
        : lines === 2
          ? POINTS.DOUBLE
          : lines === 3
            ? POINTS.TRIPLE
            : lines === 4
              ? POINTS.TETRIS
              : 0;

    return (account.level + 1) * lineClearPoints;
  }

  draw() {
    this.piece.draw();
    this.drawBoard();
  }

  drawBoard() {
    this.grid.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillStyle = COLORS[value];
          this.ctx.fillRect(x, y, 1, 1)
        }
      })
    })
  }

}