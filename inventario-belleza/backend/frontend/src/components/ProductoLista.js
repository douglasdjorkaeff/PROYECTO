import React, { useEffect, useState } from 'react';
import api from '../api';
import JsBarcode from 'jsbarcode';

const ProductoLista = ({ nuevoProducto }) => {
  const [productos, setProductos] = useState([]);

  const cargarProductos = async () => {
    const res = await api.get('/productos');
    setProductos(res.data);
  };

  useEffect(() => {
    cargarProductos();
  }, [nuevoProducto]);

  useEffect(() => {
    productos.forEach((producto, index) => {
      if (producto.codigo) {
        JsBarcode(`#barcode-${index}`, producto.codigo, { format: "CODE128", width: 2, height: 40 });
      }
    });
  }, [productos]);

  return (
    <div>
      <h3>Productos</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th><th>Precio</th><th>Stock</th><th>Código de barras</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p, i) => (
            <tr key={p._id}>
              <td>{p.nombre}</td>
              <td>${p.precio}</td>
              <td>{p.stock}</td>
              <td><svg id={`barcode-${i}`}></svg></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductoLista;
