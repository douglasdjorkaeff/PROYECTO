import React, { useState } from 'react';
import ProductoForm from './components/ProductoForm';
import ProductoLista from './components/ProductoLista';
import BarcodeScanner from './components/BarcodeScanner';

function App() {
  const [modo, setModo] = useState('inicio');
  const [nuevoProducto, setNuevoProducto] = useState(null);
  const [codigoEscaneado, setCodigoEscaneado] = useState('');
  const [productoEncontrado, setProductoEncontrado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [historialMovimientos, setHistorialMovimientos] = useState([]);

  const handleScan = async (code) => {
  console.log('Código escaneado:', code);
  setCodigoEscaneado(code);
  setBuscando(true);
  setProductoEncontrado(null);
  setHistorialMovimientos([]); // Limpiar historial anterior

  try {
    const respuesta = await fetch(`/api/productos/${code}`);
    if (respuesta.ok) {
      const data = await respuesta.json();
      setProductoEncontrado(data); // ✅ Producto encontrado

      // ✅ Obtener historial de movimientos
      const movimientosRes = await fetch(`/api/productos/${code}/movimientos`);
      if (movimientosRes.ok) {
        const historial = await movimientosRes.json();
        setHistorialMovimientos(historial);
      } else {
        console.warn('No se pudo obtener el historial de movimientos');
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

//REGISTRAR MOVIMIENTOS DE INVENTARIOS
const registrarMovimiento = async (tipo) => {
  const cantidad = parseInt(prompt(`Ingresa la cantidad para registrar como ${tipo}:`), 10);
  if (!cantidad || cantidad <= 0) {
    alert('❌ Cantidad inválida');
    return;
  }

  try {
    if (!productoEncontrado?.codigoBarras) {
      alert("Código de barras no encontrado");
      return;}

    const res = await fetch(`/api/productos/${productoEncontrado.codigoBarras}/movimiento`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, cantidad }),
    });

    if (res.ok) {
      const actualizado = await res.json();
      setProductoEncontrado(actualizado); // Actualiza vista
      alert(`✔️ ${tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada con éxito`);
    } else {
      const error = await res.json();
      alert(`❌ Error: ${error.mensaje}`);
    }
  } catch (error) {
    alert('❌ Error de red al registrar el movimiento');
    console.error(error);
  }
};

// ANCLAR NUEVA FUNCION AQUI //

console.log("App render OK");

  return (
    <div style={{ padding: '2rem' }}>
  <h2>Sistema de Inventario de Belleza</h2>

  {modo === 'inicio' && (
    <div>
      <h4>¿Qué deseas hacer?</h4>
      <button onClick={() => setModo('manual')}>✍️ Ingresar producto manualmente</button>
      <button onClick={() => setModo('escanear')} style={{ marginLeft: '1rem' }}>
        📷 Escanear código de barras
      </button>
    </div>
  )}

  {modo === 'manual' && (
    <div>
      <h4>Formulario de Producto</h4>
      <ProductoForm
        onProductoCreado={(producto) => {
          setNuevoProducto(producto);
          alert('✅ Producto registrado correctamente');
          setModo('inicio');
        }}
      />
      <button onClick={() => setModo('inicio')} style={{ marginTop: '1rem' }}>← Volver</button>
    </div>
  )}

  {modo === 'escanear' && (
    <>
      {!codigoEscaneado ? (
        <>
          <h4>Escanear producto:</h4>
          <BarcodeScanner onScanSuccess={handleScan} />
          <button onClick={() => setModo('inicio')} style={{ marginTop: '1rem' }}>← Volver</button>
        </>
      ) : (
        <>
          <p><strong>Código leído:</strong> {codigoEscaneado}</p>

          {buscando ? (
            <p>🔍 Buscando producto...</p>
          ) : productoEncontrado ? (
            <div>
              <h4>✅ Producto registrado</h4>
              <p><strong>Nombre:</strong> {productoEncontrado.nombre}</p>
              <p><strong>Precio:</strong> ${productoEncontrado.precio}</p>
              <p><strong>Cantidad:</strong> {productoEncontrado.cantidad}</p>

              <div style={{ marginTop: '1rem' }}>
                <button onClick={() => registrarMovimiento('entrada')}>➕ Registrar Entrada</button>
                <button onClick={() => registrarMovimiento('salida')} style={{ marginLeft: '1rem' }}>
                  ➖ Registrar Salida
                </button>
              </div>

              <button onClick={resetEscaneo} style={{ marginTop: '1rem' }}>
                Escanear otro
              </button>

              <h5 style={{ marginTop: '1.5rem' }}>📋 Historial de Movimientos</h5>
              {historialMovimientos.length === 0 ? (
                <p>No hay movimientos registrados.</p>
              ) : (
                <table border="1" cellPadding="5" style={{ marginTop: '0.5rem' }}>
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
                </table>
              )}

              <button onClick={resetEscaneo} style={{ marginTop: '1rem' }}>Escanear otro</button>
              <button onClick={() => setModo('inicio')} style={{ marginTop: '1rem', marginLeft: '1rem' }}>← Volver</button>
            </div>
          ) : (
            <div>
              <p>❌ Producto no registrado.</p>
              <p>Por favor completa el formulario para agregarlo:</p>
              <ProductoForm
                onProductoCreado={(producto) => {
                  setNuevoProducto(producto);
                  setProductoEncontrado(producto);
                }}
                codigoInicial={codigoEscaneado}
              />
              <button onClick={resetEscaneo} style={{ marginTop: '1rem' }}>Cancelar y escanear otro</button>
              <button onClick={() => setModo('inicio')} style={{ marginTop: '1rem', marginLeft: '1rem' }}>← Volver</button>
            </div>
          )}
        </>
      )}
    </>
  )}

  <hr />
  <ProductoLista nuevoProducto={nuevoProducto} />
</div>

  );
}

export default App;
