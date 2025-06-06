import React, { useState } from 'react';
import ProductoForm from './components/ProductoForm';
import ProductoLista from './components/ProductoLista';
import BarcodeScanner from './components/BarcodeScanner';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [vistaPrincipal, setVistaPrincipal] = useState('inicio'); // 'inicio', 'productos', 'ventas'
  const [modoProducto, setModoProducto] = useState(null); // 'escanear' o 'manual'
  const [nuevoProducto, setNuevoProducto] = useState(null);
  const [codigoEscaneado, setCodigoEscaneado] = useState('');
  const [productoEncontrado, setProductoEncontrado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [historialMovimientos, setHistorialMovimientos] = useState([]);
  const [productosVersion, setProductosVersion] = useState(0); // 👈 NUEVO

  const handleScan = async (code) => {
    console.log('Código escaneado:', code);
    setCodigoEscaneado(code);
    setBuscando(true);
    setProductoEncontrado(null);
    setHistorialMovimientos([]);

    try {
      const respuesta = await fetch(`/api/productos/${code}`);
      if (respuesta.ok) {
        const data = await respuesta.json();
        setProductoEncontrado(data);

        const movimientosRes = await fetch(`/api/productos/${code}/movimientos`);
        if (movimientosRes.ok) {
          const historial = await movimientosRes.json();
          setHistorialMovimientos(historial);
        }
      } else {
        console.log('Producto no encontrado');
      }
    } catch (error) {
      console.error('Error al buscar producto:', error);
    } finally {
      setBuscando(false);
    }
  };

  const resetEscaneo = () => {
    setCodigoEscaneado('');
    setProductoEncontrado(null);
  };

  const registrarMovimiento = async (tipo, productoManual = null) => {
  const cantidadStr = prompt(`Ingresa la cantidad para registrar como ${tipo}:`);
  const cantidad = parseInt(cantidadStr, 10);
  if (!cantidad || cantidad <= 0) {
    toast.error('❌ Cantidad inválida');
    return;
  }

  const producto = productoManual || productoEncontrado;
  if (!producto?.codigo) {
    toast.error("❌ Código de barras no encontrado");
    return;
  }

  const confirmar = window.confirm(`¿Confirmas registrar ${cantidad} unidades como ${tipo}?`);
  if (!confirmar) return;

  try {
    const res = await fetch(`http://localhost:5000/api/productos/${producto.codigo}/movimiento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, cantidad }),
    });

    if (res.ok) {
      const actualizado = await res.json();
      if (!productoManual) setProductoEncontrado(actualizado);
      toast.success(`✔️ ${tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada con éxito`);
    } else {
      const error = await res.json();
      toast.error(`❌ Error: ${error.mensaje}`);
    }
  } catch (error) {
    toast.error('❌ Error de red al registrar el movimiento');
    console.error(error);
  }
};

  return (
  <>
    <Container className="mt-4">
      <h2 className="text-center mb-4">💄 Sistema de Inventario de Belleza</h2>

      {/* MENÚ PRINCIPAL */}
      {vistaPrincipal === 'inicio' && (
        <div className="text-center">
          <p className="mb-3">¿Qué deseas hacer?</p>
          <Button variant="primary" onClick={() => setVistaPrincipal('productos')}>
            📦 PRODUCTOS
          </Button>{' '}
          <Button variant="success" onClick={() => setVistaPrincipal('ventas')}>
            🛒 VENTAS
          </Button>
        </div>
      )}

      {/* SECCIÓN PRODUCTOS */}
      {vistaPrincipal === 'productos' && (
        <div className="mt-4">
          {!modoProducto && (
            <>
              <p className="mb-3">¿Cómo deseas ingresar un producto?</p>
              <Button variant="dark" onClick={() => setModoProducto('escanear')}>
                📷 Escanear producto
              </Button>{' '}
              <Button variant="outline-dark" onClick={() => setModoProducto('manual')}>
                📝 Ingreso manual
              </Button>
              <div className="mt-3">
                <Button variant="secondary" onClick={() => setVistaPrincipal('inicio')}>
                  ⬅️ Volver
                </Button>
              </div>
            </>
          )}

          {/* ESCANEAR PRODUCTO */}
          {modoProducto === 'escanear' && !codigoEscaneado && (
            <>
              <h4 className="mt-4">📷 Escanear producto</h4>
              <BarcodeScanner onScanSuccess={handleScan} />
              <Button
                className="mt-3"
                variant="secondary"
                onClick={() => {
                  setModoProducto(null);
                  resetEscaneo();
                }}
              >
                ⬅️ Volver
              </Button>
            </>
          )}

          {/* RESULTADO DE ESCANEO */}
          {modoProducto === 'escanear' && codigoEscaneado && (
            <>
              <p className="mt-3">
                <strong>Código leído:</strong> {codigoEscaneado}
              </p>

              {buscando ? (
                <Spinner animation="border" role="status" className="mt-3">
                  <span className="visually-hidden">Buscando...</span>
                </Spinner>
              ) : productoEncontrado ? (
                <div className="mt-3">
                  <Alert variant="success">✅ Producto registrado</Alert>
                  <p>
                    <strong>Nombre:</strong> {productoEncontrado.nombre}
                  </p>
                  <p>
                    <strong>Precio:</strong> ${productoEncontrado.precio}
                  </p>
                  <p>
                    <strong>Stock:</strong> {productoEncontrado.stock}
                  </p>

                  <div className="mb-3">
                    <Button variant="success" onClick={() => registrarMovimiento('entrada')}>
                      ➕ Registrar Entrada
                    </Button>{' '}
                    <Button variant="warning" onClick={() => registrarMovimiento('salida')}>
                      ➖ Registrar Salida
                    </Button>
                  </div>

                  <Button variant="secondary" onClick={resetEscaneo}>
                    🔄 Escanear otro
                  </Button>

                  <h5 className="mt-4">📋 Historial de Movimientos</h5>
                  {historialMovimientos.length === 0 ? (
                    <p>No hay movimientos registrados.</p>
                  ) : (
                    <Table striped bordered hover className="mt-2">
                      <thead>
                        <tr>
                          <th>Tipo</th>
                          <th>Cantidad</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historialMovimientos.map((mov, idx) => (
                          <tr key={idx}>
                            <td>{mov.tipo}</td>
                            <td>{mov.cantidad}</td>
                            <td>{new Date(mov.fecha).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              ) : (
                <div className="mt-3">
                  <Alert variant="danger">❌ Producto no registrado</Alert>
                  <p>Por favor completa el formulario para agregarlo:</p>
                  <ProductoForm
                    onProductoCreado={(producto) => {
                      setNuevoProducto(producto);
                      setProductoEncontrado(producto);
                      setProductosVersion((v) => v + 1);
                    }}
                    codigoInicial={codigoEscaneado}
                  />
                  <Button variant="secondary" className="mt-3" onClick={resetEscaneo}>
                    Cancelar y escanear otro
                  </Button>
                </div>
              )}
            </>
          )}

          {/* INGRESO MANUAL */}
          {modoProducto === 'manual' && (
            <div className="mt-3">
              <h4>📝 Ingreso Manual</h4>
              <ProductoForm
                onProductoCreado={(producto) => {
                  setNuevoProducto(producto);
                  setProductosVersion((v) => v + 1);
                  alert('✔️ Producto creado manualmente');
                }}
              />
              <Button variant="secondary" className="mt-3" onClick={() => setModoProducto(null)}>
                ⬅️ Volver
              </Button>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN VENTAS */}
      {vistaPrincipal === 'ventas' && (
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>🛒 Registrar Ventas</h4>
            <Button variant="secondary" onClick={() => setVistaPrincipal('inicio')}>
              ⬅️ Volver al menú
            </Button>
          </div>

          <ProductoLista
            nuevoProducto={nuevoProducto}
            onVender={(producto) => registrarMovimiento('salida', producto)}
          />
        </div>
      )}
    </Container>

    {/* Toast notifications */}
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
  </>
);

}

export default App;
