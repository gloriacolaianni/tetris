class Piece {
  x;
  y;
  color;
  shape;
  ctx;
  typeId;

  constructor(ctx) {
    this.ctx = ctx;
    this.spawn();
  }

  /**
   * Genera il tetronimo.
   *
   * @memberof Piece
   */
  spawn() {
    this.typeId = this.randomizeTetronimoType(COLORS.length - 1);
    this.color = COLORS[this.typeId];
    this.shape = SHAPES[this.typeId];
    this.x = 0;
    this.y = 0;
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        // this.x e this.y forniscono l'angolo in alto a sinistra.
        // x e y forniscono la posizione del blocco nella forma
        // this.x + x è la posizione del blocco nella tavola da gioco.
        if (value > 0) {
          this.ctx.fillRect(this.x + x, this.y + y, 1, 1);
        }
      })
    })
  }

  setStartingPosition() {
    this.x = this.typeId === 4 ? 4 : 3;
  }

  /**
   * Muove il tetronimo nella board di gioco.
   *
   * @param {Object} p Tetronimo da spostare
   * @memberof Piece
   */
  move(p) {
    this.x = p.x;
    this.y = p.y;
    this.shape = p.shape;
  }

  /**
   * Genera un numero random in base al parametro fornito.
   *
   * @param {Number} noOfType Numero massimo da generare
   * @returns {Number} Il numero random.
   * @memberof Piece
   */
  randomizeTetronimoType(noOfType) {
    return Math.floor(Math.random() * noOfType + 1);
  }
}