const mongoose = require('mongoose');

const MovimientoSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['entrada', 'salida'], required: true },
  cantidad: { type: Number, required: true },
  fecha: { type: Date, default: Date.now }
});

const ProductoSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  precio: Number,
  stock: { type: Number, default: 0 },
  codigo: { type: String, unique: true, required: true },
  movimientos: [MovimientoSchema]
});

module.exports = mongoose.model('Producto', ProductoSchema);
