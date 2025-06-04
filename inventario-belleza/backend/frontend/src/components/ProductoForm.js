import React, { useState } from 'react';
import api from '../api';

const ProductoForm = ({ onProductoCreado }) => {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    codigo: '',
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/productos', form);
      onProductoCreado(res.data);
      setForm({ nombre: '', descripcion: '', precio: '', stock: '', codigo: '' });
    } catch (err) {
      alert('Error al guardar producto');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Crear Producto</h3>
      <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
      <input name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} />
      <input name="precio" type="number" placeholder="Precio" value={form.precio} onChange={handleChange} />
      <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} />
      <input name="codigo" placeholder="Código de barras" value={form.codigo} onChange={handleChange} />
      <button type="submit">Guardar</button>
    </form>
  );
};

export default ProductoForm;
