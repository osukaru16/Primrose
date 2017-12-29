const DATA_START = 1,
  DATA_LENGTH = 80000000,
  PTR = Symbol("PTR"),
  DV = Symbol("DV");

export default class RPCBuffer {
  constructor(buffer) {
    if(buffer) {
      this.buffer = buffer;
    }
    else {
      this.buffer = new ArrayBuffer(DATA_LENGTH);
      this.rewind();
    }
  }

  set buffer(v) {
    this[DV] = new Float64Array(v);
    this[PTR] = DATA_START;
  }

  get buffer() {
    return this[DV].buffer;
  }

  get ready() {
    return this.buffer.byteLength > 0;
  }

  get length() {
    if(this.ready) {
      return this[DV][0];
    }
  }

  set length(v) {
    if(this.ready) {
      this[DV][0] = v;
    }
  }

  get available() {
    return this[PTR] < this.length;
  }

  get full() {
    return this.length === DATA_LENGTH;
  }

  add(v) {
    if(this.ready && !this.full) {
      this[DV][this.length++] = v;
    }
  }

  remove() {
    if(this.ready && this.available) {
      return this[DV][this[PTR]++];
    }
  }

  rewind() {
    this[PTR] = DATA_START;
    this.length = DATA_START;
  }
};
