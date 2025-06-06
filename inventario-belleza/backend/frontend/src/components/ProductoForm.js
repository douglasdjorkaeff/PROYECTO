import api from '../api';
import React, { useState, useEffect } from 'react';

function ProductoForm({ onProductoCreado, codigoInicial = '' }) {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [codigoBarras, setCodigoBarras] = useState(codigoInicial);
  const [esCodigoEscaneado, setEsCodigoEscaneado] = useState(false);

  useEffect(() => {
    if (codigoInicial) {
      setCodigoBarras(codigoInicial);
      setEsCodigoEscaneado(true);
    }
  }, [codigoInicial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevoProducto = { nombre, precio, cantidad, codigoBarras };

    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProducto),
      });

      if (res.ok) {
        const productoGuardado = await res.json();
        onProductoCreado(productoGuardado);
        setNombre('');
        setPrecio('');
        setCantidad('');
        setCodigoBarras('');
        setEsCodigoEscaneado(false);
        alert('✅ Producto registrado correctamente');
      } else {
        alert('❌ Error al registrar producto');
      }
    } catch (err) {
      console.error('Error en el envío del producto:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Registrar nuevo producto</h4>

      <div>
        <label>Nombre:</label><br />
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Precio:</label><br />
        <input
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Cantidad:</label><br />
        <input
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Código de Barras:</label><br />
        <input
          type="text"
          value={codigoBarras}
          onChange={(e) => setCodigoBarras(e.target.value)}
          required
          readOnly={esCodigoEscaneado} // 👈 Solo lectura si vino del escáner
          style={{ backgroundColor: esCodigoEscaneado ? '#eee' : 'white' }}
        />
      </div>

      <button type="submit" style={{ marginTop: '1rem' }}>Guardar producto</button>
    </form>
  );
}

export default ProductoForm;
