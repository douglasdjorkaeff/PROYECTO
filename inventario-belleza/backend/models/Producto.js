// backend/models/Producto.js
const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  precio: Number,
  stock: Number,
  codigo: String // para el código de barras
});

module.exports = mongoose.model('Producto', productoSchema);
