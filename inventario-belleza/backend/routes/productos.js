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

// Buscar producto por código
router.get('/buscar/:codigo', async (req, res) => {
  try {
    const producto = await Producto.findOne({ codigo: req.params.codigo });
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    console.error('Error al buscar producto:', error);
    res.status(500).json({ mensaje: 'Error al buscar producto' });
  }
});

// Registrar movimiento (entrada/salida)
router.post('/:codigo/movimiento', async (req, res) => {
  const { tipo, cantidad } = req.body;

  try {
    const producto = await Producto.findOne({ codigo: req.params.codigo });
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    const cantidadNumerica = parseInt(cantidad, 10);
    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
      return res.status(400).json({ mensaje: 'Cantidad inválida' });
    }

    if (tipo === 'entrada') {
      producto.stock += cantidadNumerica;
    } else if (tipo === 'salida') {
      if (producto.stock < cantidadNumerica) {
        return res.status(400).json({ mensaje: 'Stock insuficiente para salida' });
      }
      producto.stock -= cantidadNumerica;
    } else {
      return res.status(400).json({ mensaje: 'Tipo de movimiento inválido' });
    }

    producto.movimientos.push({ tipo, cantidad: cantidadNumerica });

    await producto.save();
    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar movimiento', error });
  }
});


module.exports = router;
