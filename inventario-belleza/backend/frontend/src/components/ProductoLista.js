import React, { useEffect, useState, useRef } from 'react';
import api from '../api';
import JsBarcode from 'jsbarcode';
import { Table, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ProductoLista.css';

const ProductoLista = ({ nuevoProducto, onVender }) => {
  const [productos, setProductos] = useState([]);
  const barcodeRefs = useRef([]);

  const cargarProductos = async () => {
    try {
      const res = await api.get('/productos');
      setProductos(res.data);
    } catch (error) {
      toast.error("Error cargando productos");
      console.error("Error cargando productos:", error);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, [nuevoProducto]);

  useEffect(() => {
    productos.forEach((producto, index) => {
      const ref = barcodeRefs.current[index];
      if (ref && producto.codigoBarras) {
        JsBarcode(ref, producto.codigoBarras, {
          format: 'CODE128',
          width: 2,
          height: 40,
          displayValue: true,
        });
      }
    });
  }, [productos]);

  const venderProducto = (producto) => {
    if (producto.stock > 0) {
      onVender(producto);
      toast.success(`Producto "${producto.nombre}" vendido correctamente.`);
    } else {
      toast.warning(`El producto "${producto.nombre}" está sin stock.`);
    }
  };

  if (productos.length === 0) {
    return (
      <div className="producto-lista-empty text-center mt-4">
        <p>No hay productos disponibles aún. ¡Agrega uno para comenzar!</p>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="producto-lista-container">
      <h3 className="mb-3">Productos disponibles</h3>

      {/* Tabla visible en pantallas medianas o mayores */}
      <div className="d-none d-md-block">
        <Table striped bordered hover size="sm" className="text-center align-middle producto-lista-table">
          <thead className="table-dark">
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Código de Barras</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p, i) => (
              <tr key={p._id}>
                <td>{p.nombre}</td>
                <td>${p.precio.toFixed(2)}</td>
                <td>{p.stock ?? 0}</td>
                <td className="barcode-cell">
                  <svg ref={el => (barcodeRefs.current[i] = el)} />
                </td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => venderProducto(p)}>
                    ➖ Vender
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Cards para pantallas pequeñas */}
      <div className="d-md-none">
        {productos.map((p, i) => (
          <div key={p._id} className="producto-card shadow-sm mb-3 p-3 rounded">
            <h5>{p.nombre}</h5>
            <p><strong>Precio:</strong> ${p.precio.toFixed(2)}</p>
            <p><strong>Stock:</strong> {p.stock ?? 0}</p>
            <div className="barcode-card">
              <svg ref={el => (barcodeRefs.current[i] = el)} />
            </div>
            <Button variant="warning" size="sm" onClick={() => venderProducto(p)} className="mt-2">
              ➖ Vender
            </Button>
          </div>
        ))}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ProductoLista;
