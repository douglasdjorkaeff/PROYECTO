// backend/routes/productos.js
const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');

// GET todos los productos
router.get('/', async (req, res) => {
  const productos = await Producto.find();
  res.json(productos);
});

// GET por ID
router.get('/:id', async (req, res) => {
  const producto = await Producto.findById(req.params.id);
  res.json(producto);
});

// POST - Crear producto
router.post('/', async (req, res) => {
  const nuevoProducto = new Producto(req.body);
  await nuevoProducto.save();
  res.status(201).json(nuevoProducto);
});

// PUT - Editar producto
router.put('/:id', async (req, res) => {
  const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(producto);
});

// DELETE
router.delete('/:id', async (req, res) => {
  await Producto.findByIdAndDelete(req.params.id);
  res.json({ mensaje: 'Producto eliminado' });
});

module.exports = router;
