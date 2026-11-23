// ==========================================
// SESIÓN Y DATOS DE NEGOCIO
// ==========================================
let sesionActual = JSON.parse(localStorage.getItem('blas_sesion')) || null;

let clientes = JSON.parse(localStorage.getItem('blas_clientes')) || [];
let pedidos = JSON.parse(localStorage.getItem('blas_pedidos')) || [];
let productos = JSON.parse(localStorage.getItem('blas_productos')) || [];
let gastos = JSON.parse(localStorage.getItem('blas_gastos')) || [];

let fechaActualCal = new Date();
let diaSeleccionadoStr = new Date().toISOString().split('T')[0];

function guardarDatos() {
  localStorage.setItem('blas_clientes', JSON.stringify(clientes));
  localStorage.setItem('blas_pedidos', JSON.stringify(pedidos));
  localStorage.setItem('blas_productos', JSON.stringify(productos));
  localStorage.setItem('blas_gastos', JSON.stringify(gastos));
}

// ==========================================
// 4. EFECTOS DE SONIDO SUTILES (AUDIO WEB API)
// ==========================================
let sonidosActivos = localStorage.getItem('blas_sonidos') !== 'false';
document.getElementById('toggle-sonidos').checked = sonidosActivos;

function toggleSonidosAudio() {
  sonidosActivos = document.getElementById('toggle-sonidos').checked;
  localStorage.setItem('blas_sonidos', sonidosActivos);
  if (sonidosActivos) reproducirSonidoClick();
}

function reproducirSonidoClick() {
  if (!sonidosActivos) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
}

function reproducirSonidoExito() {
  if (!sonidosActivos) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(659.25, now + 0.1);
    osc.frequency.setValueAtTime(880, now + 0.2);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(now + 0.35);
  } catch (e) {}
}

// ==========================================
// MODALES Y CALCULADORA
// ==========================================
function abrirModal(id) {
  reproducirSonidoClick();
  if (id === 'modal-perfil' && sesionActual) {
    document.getElementById('edit-empresa').value = sesionActual.empresa || '';
    document.getElementById('edit-usuario').value = sesionActual.usuario || '';
    document.getElementById('edit-rol').value = sesionActual.rol || 'Dueño/a (Administrador)';
    actualizarVisualFotoPerfil();
  }
  document.getElementById(id).classList.remove('hidden');
}

function cerrarModal(id) {
  reproducirSonidoClick();
  document.getElementById(id).classList.add('hidden');
}

function calcularPrecioSublimacion() {
  const costoBase = parseFloat(document.getElementById('calc-costo-base').value) || 0;
  const insumos = parseFloat(document.getElementById('calc-insumos').value) || 0;
  const porcentaje = parseFloat(document.getElementById('calc-porcentaje').value) || 0;

  const costoTotal = costoBase + insumos;
  const gananciaNeta = costoTotal * (porcentaje / 100);
  const precioSugerido = costoTotal + gananciaNeta;

  document.getElementById('calc-resultado-final').innerText = `$${precioSugerido.toFixed(2)}`;
  document.getElementById('calc-ganancia-neta').innerText = `Ganancia neta estimada: $${gananciaNeta.toFixed(2)} (${porcentaje}%)`;
}

function usarPrecioCalculado() {
  reproducirSonidoClick();
  const precioTexto = document.getElementById('calc-resultado-final').innerText.replace('$', '');
  const precioVal = parseFloat(precioTexto);
  if (precioVal > 0) {
    document.getElementById('ped-total').value = precioVal;
    document.getElementById('ped-abono').value = (precioVal / 2).toFixed(2);
    cerrarModal('modal-calculadora');
    irA('pedidos');
    toggleForm('form-pedido-box');
  } else {
    alert('Calcula primero un precio válido.');
  }
}

// ==========================================
// ESTILOS Y ANIMACIONES
// ==========================================
function aplicarTema(nombreClaseTema) {
  reproducirSonidoClick();
  const body = document.getElementById('body-app');
  body.className = nombreClaseTema;
  localStorage.setItem('blas_tema_activo', nombreClaseTema);
}

function seleccionarAnimacion(tipo) {
  reproducirSonidoClick();
  const capaAnim = document.getElementById('bg-animation-layer');
  capaAnim.className = 'bg-particles';
  if (tipo === 'none') {
    capaAnim.classList.add('hidden');
  } else {
    capaAnim.classList.add(`anim-${tipo}`);
  }
  localStorage.setItem('blas_animacion_tipo', tipo);
}

const temaGuardado = localStorage.getItem('blas_tema_activo') || 'theme-orange-dark';
aplicarTema(temaGuardado);

const animGuardada = localStorage.getItem('blas_animacion_tipo') || 'orbs';
seleccionarAnimacion(animGuardada);

// ==========================================
// LOGIN, PERFIL Y SINCRONIZACIÓN
// ==========================================
function autocompletarGoogle() {
  reproducirSonidoClick();
  const correo = prompt('Escribe tu correo de Gmail para vincular:', '');
  if (correo) {
    const limpio = correo.trim();
    document.getElementById('auth-correo').value = limpio;
    document.getElementById('auth-pass').value = 'google-auth-ok';
    const nombreSugerido = limpio.includes('@') ? limpio.split('@')[0] : '';
    if (!document.getElementById('auth-usuario').value && nombreSugerido) {
      document.getElementById('auth-usuario').value = nombreSugerido;
    }
  }
}

document.getElementById('form-auth').addEventListener('submit', e => {
  e.preventDefault();
  reproducirSonidoExito();
  const correo = document.getElementById('auth-correo').value.trim();
  const empresa = document.getElementById('auth-empresa').value.trim() || 'El Taller de los Blas';
  const usuario = document.getElementById('auth-usuario').value.trim() || 'Felet';

  sesionActual = { correo, empresa, usuario, rol: 'Dueño/a (Administrador)', foto: '' };
  localStorage.setItem('blas_sesion', JSON.stringify(sesionActual));
  iniciarSesionApp();
});

function iniciarSesionApp() {
  document.getElementById('vista-auth').classList.add('hidden');
  document.getElementById('titulo-pantalla').innerText = sesionActual.empresa;
  const rolCorto = sesionActual.rol && sesionActual.rol.includes('Trabajador') ? '🛠️ Equipo' : '👑 Admin';
  document.getElementById('subtitulo-pantalla').innerText = `Hola, ${sesionActual.usuario} (${rolCorto})`;
  actualizarVisualFotoPerfil();
  actualizarInicio();
}

function cargarFotoPerfil(event) {
  const file = event.target.files[0];
  if (!file || !sesionActual) return;
  const reader = new FileReader();
  reader.onload = ev => {
    sesionActual.foto = ev.target.result;
    localStorage.setItem('blas_sesion', JSON.stringify(sesionActual));
    actualizarVisualFotoPerfil();
  };
  reader.readAsDataURL(file);
}

function actualizarVisualFotoPerfil() {
  if (!sesionActual) return;
  const headerImg = document.getElementById('header-avatar-img');
  const prevImg = document.getElementById('preview-foto-perfil');
  const placeIcon = document.getElementById('placeholder-foto-perfil');

  if (sesionActual.foto) {
    headerImg.src = sesionActual.foto; headerImg.classList.remove('hidden');
    prevImg.src = sesionActual.foto; prevImg.classList.remove('hidden'); placeIcon.classList.add('hidden');
  } else {
    headerImg.classList.add('hidden'); prevImg.classList.add('hidden'); placeIcon.classList.remove('hidden');
  }
}

document.getElementById('form-perfil-negocio').addEventListener('submit', e => {
  e.preventDefault();
  reproducirSonidoExito();
  if (!sesionActual) return;
  sesionActual.empresa = document.getElementById('edit-empresa').value.trim();
  sesionActual.usuario = document.getElementById('edit-usuario').value.trim();
  sesionActual.rol = document.getElementById('edit-rol').value;
  localStorage.setItem('blas_sesion', JSON.stringify(sesionActual));
  iniciarSesionApp();
  cerrarModal('modal-perfil');
});

function exportarDatosEquipo() {
  reproducirSonidoClick();
  const paqueteDatos = { empresa: sesionActual ? sesionActual.empresa : 'El Taller', clientes, pedidos, productos, gastos };
  const blob = new Blob([JSON.stringify(paqueteDatos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `Respaldo_${paqueteDatos.empresa.replace(/\s+/g, '_')}.json`;
  a.click(); URL.revokeObjectURL(url);
  alert('¡Respaldo descargado para enviar por WhatsApp!');
}

function importarDatosEquipo(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const datos = JSON.parse(ev.target.result);
      if (datos.clientes && datos.pedidos) {
        clientes = datos.clientes; pedidos = datos.pedidos; productos = datos.productos || []; gastos = datos.gastos || [];
        guardarDatos(); actualizarInicio(); cerrarModal('modal-perfil');
        reproducirSonidoExito();
        alert(`¡Sincronización exitosa! Se cargaron ${clientes.length} clientes y ${pedidos.length} pedidos.`);
      } else { alert('Archivo no válido.'); }
    } catch (err) { alert('Error al leer el archivo.'); }
  };
  reader.readAsText(file);
}

function cerrarSesion() {
  reproducirSonidoClick();
  if (confirm('¿Cerrar sesión?')) { localStorage.removeItem('blas_sesion'); location.reload(); }
}

if (sesionActual) iniciarSesionApp();

// ==========================================
// NAVEGACIÓN
// ==========================================
const titulosVistas = {
  inicio: () => sesionActual ? sesionActual.empresa : 'El Taller de los Blas',
  clientes: 'Clientes', 'perfil-cliente': 'Ficha del Cliente', pedidos: 'Pedidos',
  historial: 'Historial', productos: 'Productos', ventas: 'Ventas', calendario: 'Calendario', gastos: 'Gastos'
};

function irA(vista) {
  reproducirSonidoClick();
  document.querySelectorAll('.vista').forEach(v => v.classList.remove('active'));
  document.getElementById(`vista-${vista}`).classList.add('active');

  const topBar = document.getElementById('top-bar');
  const btnVolver = document.getElementById('btn-volver');
  const subtitulo = document.getElementById('subtitulo-pantalla');

  const tituloFn = titulosVistas[vista];
  document.getElementById('titulo-pantalla').innerText = typeof tituloFn === 'function' ? tituloFn() : tituloFn;

  if (vista === 'inicio') {
    topBar.classList.remove('accent-mode'); btnVolver.classList.add('hidden'); subtitulo.classList.remove('hidden');
  } else {
    topBar.classList.add('accent-mode'); btnVolver.classList.remove('hidden'); subtitulo.classList.add('hidden');
  }

  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active-nav'));
  const navBtn = document.getElementById(`nav-${vista}`);
  if (navBtn) navBtn.classList.add('active-nav');

  if (vista === 'inicio') actualizarInicio();
  if (vista === 'clientes') renderClientes();
  if (vista === 'pedidos') { llenarSelectsPedido(); renderPedidos(); }
  if (vista === 'historial') renderHistorial();
  if (vista === 'productos') renderProductos();
  if (vista === 'ventas') renderVentas();
  if (vista === 'calendario') renderCalendario();
  if (vista === 'gastos') renderGastos();
}

function toggleForm(id) { reproducirSonidoClick(); document.getElementById(id).classList.toggle('hidden'); }
function contarComprasCliente(clienteId) { return pedidos.filter(p => p.clienteId == clienteId).length; }

// ==========================================
// 1. PANEL PRINCIPAL CON GRÁFICAS Y FILTRO
// ==========================================
function actualizarInicio() {
  const periodo = document.getElementById('filtro-periodo').value;
  const hoyStr = new Date().toISOString().split('T')[0];
  const mesActualStr = hoyStr.slice(0, 7);

  let ingresos = 0, gastosTotal = 0, porCobrar = 0, pendientesCount = 0;

  pedidos.forEach(p => {
    let cumpleFecha = false;
    if (periodo === 'hoy') cumpleFecha = (p.fecha === hoyStr);
    else if (periodo === 'semana') {
      const diffTime = Math.abs(new Date() - new Date(p.fecha));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      cumpleFecha = diffDays <= 7;
    } else if (periodo === 'mes') cumpleFecha = p.fecha.startsWith(mesActualStr);
    else if (periodo === 'historico') cumpleFecha = true;

    if (cumpleFecha) ingresos += Number(p.abono);
    if (!p.entregado) {
      pendientesCount++;
      porCobrar += (Number(p.total) - Number(p.abono));
    }
  });

  gastos.forEach(g => {
    let cumpleGasto = false;
    if (periodo === 'hoy') cumpleGasto = (g.fecha === hoyStr);
    else if (periodo === 'semana') {
      const diffTime = Math.abs(new Date() - new Date(g.fecha));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      cumpleGasto = diffDays <= 7;
    } else if (periodo === 'mes') cumpleGasto = g.fecha.startsWith(mesActualStr);
    else if (periodo === 'historico') cumpleGasto = true;

    if (cumpleGasto) gastosTotal += Number(g.monto);
  });

  const balanceNeta = ingresos - gastosTotal;

  document.getElementById('dash-ingresos').innerText = `$${ingresos.toFixed(2)}`;
  document.getElementById('dash-gastos').innerText = `$${gastosTotal.toFixed(2)}`;
  document.getElementById('dash-balance').innerText = `$${balanceNeta.toFixed(2)}`;
  document.getElementById('dash-cobrar').innerText = `$${porCobrar.toFixed(2)}`;

  document.getElementById('count-clientes').innerText = clientes.length;
  document.getElementById('count-pedidos').innerText = pendientesCount;
  document.getElementById('count-historial').innerText = pedidos.length;
  document.getElementById('count-productos').innerText = productos.length;

  // Actualizar Gráficas Visuales (Opción 1)
  document.getElementById('chart-val-ingresos').innerText = `$${ingresos.toFixed(0)}`;
  document.getElementById('chart-val-gastos').innerText = `$${gastosTotal.toFixed(0)}`;
  document.getElementById('chart-val-ganancia').innerText = `$${balanceNeta.toFixed(0)}`;

  const maxVal = Math.max(ingresos, gastosTotal, balanceNeta, 10);
  const alturaIngresos = Math.min(Math.round((ingresos / maxVal) * 100), 100);
  const alturaGastos = Math.min(Math.round((gastosTotal / maxVal) * 100), 100);
  const alturaGanancia = Math.min(Math.round((Math.max(balanceNeta, 0) / maxVal) * 100), 100);

  document.getElementById('bar-ingresos').style.height = `${alturaIngresos}%`;
  document.getElementById('bar-gastos').style.height = `${alturaGastos}%`;
  document.getElementById('bar-ganancia').style.height = `${alturaGanancia}%`;
}

// ==========================================
// CLIENTES
// ==========================================
document.getElementById('form-cliente').addEventListener('submit', e => {
  e.preventDefault();
  reproducirSonidoExito();
  clientes.push({
    id: Date.now(),
    nombre: document.getElementById('cli-nombre').value.trim(),
    telefono: document.getElementById('cli-telefono').value.replace(/\D/g, ''),
    direccion: document.getElementById('cli-direccion').value.trim(),
    notas: document.getElementById('cli-notas').value.trim()
  });
  guardarDatos(); e.target.reset(); toggleForm('form-cliente-box'); renderClientes();
});

async function importarContactoTelefono() {
  reproducirSonidoClick();
  if ('contacts' in navigator && 'ContactsManager' in window) {
    try {
      const contactos = await navigator.contacts.select(['name', 'tel'], { multiple: true });
      contactos.forEach(c => {
        const nombre = (c.name && c.name[0]) ? c.name[0] : 'Sin Nombre';
        const tel = (c.tel && c.tel[0]) ? c.tel[0].replace(/\D/g, '') : '';
        if (tel) clientes.push({ id: Date.now() + Math.random(), nombre, telefono: tel, direccion: '', notas: 'Importado' });
      });
      guardarDatos(); renderClientes(); reproducirSonidoExito(); alert(`¡Se importaron ${contactos.length} contacto(s)!`);
    } catch (err) { console.log(err); }
  } else {
    alert('En PC usa "Registrar nuevo cliente". La importación directa funciona en Android.');
    toggleForm('form-cliente-box');
  }
}

function renderClientes() {
  const filtro = document.getElementById('buscar-cliente').value.toLowerCase();
  const cont = document.getElementById('lista-clientes'); cont.innerHTML = '';
  const filtrados = clientes.filter(c => c.nombre.toLowerCase().includes(filtro));
  
  if (filtrados.length === 0) { cont.innerHTML = '<p style="text-align:center; color:var(--muted);">No hay clientes.</p>'; return; }

  filtrados.forEach(c => {
    const totalCompras = contarComprasCliente(c.id);
    const badgeVip = totalCompras >= 3 ? `<span class="vip-badge">⭐ VIP (${totalCompras})</span>` : `<span style="font-size:0.75rem; color:var(--accent);">(${totalCompras})</span>`;
    cont.innerHTML += `
      <div class="item-card">
        <div class="item-info" onclick="verPerfilCliente(${c.id})" style="cursor:pointer;">
          <h4>👤 ${c.nombre} ${badgeVip}</h4><p>📱 ${c.telefono}</p>
        </div>
        <div class="item-actions">
          <button class="mini-btn btn-done" onclick="verPerfilCliente(${c.id})">Ficha</button>
          <button class="mini-btn btn-del" onclick="eliminarCliente(${c.id})">Borrar</button>
        </div>
      </div>`;
  });
}

function verPerfilCliente(id) {
  reproducirSonidoClick();
  const cli = clientes.find(c => c.id === id); if (!cli) return;
  const pedidosCli = pedidos.filter(p => p.clienteId == id);
  let pagado = 0, deuda = 0;
  pedidosCli.forEach(p => { pagado += Number(p.abono); deuda += (Number(p.total) - Number(p.abono)); });

  document.getElementById('perfil-nombre').innerText = cli.nombre;
  document.getElementById('perfil-tel').innerText = cli.telefono;
  document.getElementById('perfil-total-compras').innerText = pedidosCli.length;
  document.getElementById('perfil-pagado').innerText = `$${pagado.toFixed(2)}`;
  document.getElementById('perfil-deuda').innerText = `$${deuda.toFixed(2)}`;
  document.getElementById('perfil-notas').innerText = cli.notas || 'Sin notas';

  const badgeVip = document.getElementById('perfil-badge-vip');
  if (pedidosCli.length >= 3) badgeVip.classList.remove('hidden'); else badgeVip.classList.add('hidden');

  const empresa = sesionActual ? sesionActual.empresa : 'El Taller';
  document.getElementById('perfil-wa-btn').href = `https://wa.me/${cli.telefono}?text=Hola%20${encodeURIComponent(cli.nombre)},%20te%20saludamos%20de%20${encodeURIComponent(empresa)}.`;

  const hist = document.getElementById('perfil-historial-pedidos');
  hist.innerHTML = pedidosCli.length ? '' : '<p style="color:var(--muted);">Sin compras.</p>';
  pedidosCli.forEach(p => {
    hist.innerHTML += `<div class="item-card"><div class="item-info"><h4>🛍️ ${p.descripcion}</h4><p>Total: $${Number(p.total).toFixed(2)} | Abonó: $${Number(p.abono).toFixed(2)}</p><p>📅 ${p.fecha} - ${p.entregado ? '✅ Entregado' : '⏳ En proceso'}</p></div></div>`;
  });
  irA('perfil-cliente');
}

function eliminarCliente(id) {
  reproducirSonidoClick();
  if (confirm('¿Eliminar cliente?')) { clientes = clientes.filter(c => c.id !== id); guardarDatos(); renderClientes(); }
}

// ==========================================
// PEDIDOS Y 3. ABONOS MÚLTIPLES
// ==========================================
function llenarSelectsPedido() {
  const selCli = document.getElementById('ped-cliente-select');
  selCli.innerHTML = '<option value="">-- Elige un cliente --</option>';
  clientes.forEach(c => {
    const compras = contarComprasCliente(c.id);
    const tag = compras >= 3 ? ' ⭐ VIP' : '';
    selCli.innerHTML += `<option value="${c.id}">${c.nombre}${tag}</option>`;
  });

  const selProd = document.getElementById('ped-producto-select');
  selProd.innerHTML = '<option value="">-- Elegir producto del catálogo --</option>';
  productos.forEach(pr => {
    selProd.innerHTML += `<option value="${pr.id}">${pr.nombre} ($${pr.precio})</option>`;
  });
}

function autocompletarProducto() {
  const idProd = document.getElementById('ped-producto-select').value;
  const prod = productos.find(p => p.id == idProd);
  if (prod) {
    document.getElementById('ped-descripcion').value = `${prod.nombre} ${prod.color ? '('+prod.color+')' : ''}`.trim();
    document.getElementById('ped-total').value = prod.precio;
  }
}

document.getElementById('form-pedido').addEventListener('submit', e => {
  e.preventDefault();
  reproducirSonidoExito();
  const clienteId = document.getElementById('ped-cliente-select').value;
  const cli = clientes.find(c => c.id == clienteId);

  pedidos.push({
    id: Date.now(), clienteId,
    clienteNombre: cli ? cli.nombre : 'Cliente',
    clienteTel: cli ? cli.telefono : '',
    descripcion: document.getElementById('ped-descripcion').value,
    total: parseFloat(document.getElementById('ped-total').value),
    abono: parseFloat(document.getElementById('ped-abono').value),
    fecha: document.getElementById('ped-fecha').value,
    hora: document.getElementById('ped-hora').value,
    entregado: false
  });

  guardarDatos(); e.target.reset(); toggleForm('form-pedido-box'); renderPedidos();
});

// Modal de Abonos Múltiples
function abrirModalAbono(id) {
  reproducirSonidoClick();
  const p = pedidos.find(item => item.id === id);
  if (!p) return;
  const deuda = p.total - p.abono;
  document.getElementById('abono-pedido-id').value = p.id;
  document.getElementById('abono-cliente-titulo').innerText = `Pedido de ${p.clienteNombre} (Debe: $${deuda.toFixed(2)})`;
  document.getElementById('abono-monto-extra').value = '';
  document.getElementById('modal-abonos').classList.remove('hidden');
}

document.getElementById('form-registrar-abono').addEventListener('submit', e => {
  e.preventDefault();
  reproducirSonidoExito();
  const id = Number(document.getElementById('abono-pedido-id').value);
  const montoExtra = parseFloat(document.getElementById('abono-monto-extra').value) || 0;
  const p = pedidos.find(item => item.id === id);

  if (p) {
    p.abono += montoExtra;
    if (p.abono > p.total) p.abono = p.total; // Tope
    guardarDatos();
    cerrarModal('modal-abonos');
    renderPedidos();
    alert(`¡Abono registrado con éxito! Nuevo abonado: $${p.abono.toFixed(2)}`);
  }
});

function renderPedidos() {
  const filtro = document.getElementById('buscar-pedido').value.toLowerCase();
  const cont = document.getElementById('lista-pedidos'); cont.innerHTML = '';
  const pendientes = pedidos.filter(p => !p.entregado && (p.clienteNombre.toLowerCase().includes(filtro) || p.descripcion.toLowerCase().includes(filtro)));
  document.getElementById('pedidos-badge-pendientes').innerText = pedidos.filter(p => !p.entregado).length;

  if (pendientes.length === 0) { cont.innerHTML = '<p style="text-align:center; color:var(--muted);">No hay pedidos pendientes.</p>'; return; }

  pendientes.forEach(p => {
    const deuda = p.total - p.abono;
    const empresa = sesionActual ? sesionActual.empresa : 'El Taller';
    
    const reciboWa = `*🧾 RECIBO DE PEDIDO - ${empresa}*
----------------------------------
👤 *Cliente:* ${p.clienteNombre}
🛍️ *Artículo:* ${p.descripcion}
💵 *Precio Total:* $${p.total.toFixed(2)}
💳 *Abono Realizado:* $${p.abono.toFixed(2)}
⏳ *Saldo Pendiente:* $${deuda.toFixed(2)}
📅 *Entrega:* ${p.fecha} a las ${p.hora}
----------------------------------
¡Gracias por tu preferencia! ✨`;

    const urlWa = `https://wa.me/${p.clienteTel}?text=${encodeURIComponent(reciboWa)}`;

    cont.innerHTML += `
      <div class="item-card">
        <div class="item-info">
          <h4>👤 ${p.clienteNombre}</h4>
          <p><strong>${p.descripcion}</strong></p>
          <p>Total: $${p.total.toFixed(2)} | Abono: $${p.abono.toFixed(2)}</p>
          <p class="${deuda > 0 ? 'text-amber' : 'text-emerald'}" style="font-weight:700;">${deuda > 0 ? `Debe: $${deuda.toFixed(2)}` : 'Pagado completo'}</p>
          <p>📅 ${p.fecha} - ${p.hora}</p>
        </div>
        <div class="item-actions">
          <a href="${urlWa}" target="_blank" class="mini-btn btn-wa">Recibo WA</a>
          ${deuda > 0 ? `<button class="mini-btn btn-abono" onclick="abrirModalAbono(${p.id})">+ Abono</button>` : ''}
          <button class="mini-btn btn-done" onclick="marcarEntregado(${p.id})">Entregar</button>
          <button class="mini-btn btn-del" onclick="eliminarPedido(${p.id})">Borrar</button>
        </div>
      </div>`;
  });
}

function marcarEntregado(id) {
  reproducirSonidoExito();
  const ped = pedidos.find(p => p.id === id);
  if (ped) { ped.entregado = true; ped.abono = ped.total; guardarDatos(); renderPedidos(); alert('¡Pedido entregado con éxito!'); }
}

function eliminarPedido(id) {
  reproducirSonidoClick();
  if (confirm('¿Eliminar pedido?')) { pedidos = pedidos.filter(p => p.id !== id); guardarDatos(); renderPedidos(); }
}

// ==========================================
// HISTORIAL Y RANKING VIP
// ==========================================
function renderHistorial() {
  const filtro = document.getElementById('buscar-historial').value.toLowerCase();
  const cont = document.getElementById('lista-historial');
  const rankCont = document.getElementById('ranking-frecuentes');
  cont.innerHTML = ''; rankCont.innerHTML = '';

  const conteo = {};
  pedidos.forEach(p => {
    if (!conteo[p.clienteNombre]) conteo[p.clienteNombre] = { cantidad: 0, gastado: 0 };
    conteo[p.clienteNombre].cantidad++;
    conteo[p.clienteNombre].gastado += Number(p.total);
  });

  const ranking = Object.entries(conteo).sort((a, b) => b[1].cantidad - a[1].cantidad);
  if (ranking.length === 0) {
    rankCont.innerHTML = '<p style="font-size:0.85rem; color:var(--muted);">Aún no hay suficientes compras para VIP.</p>';
  } else {
    ranking.forEach(([nombre, datos]) => {
      const esVip = datos.cantidad >= 3;
      rankCont.innerHTML += `
        <div class="vip-row">
          <div><strong>${nombre}</strong> ${esVip ? '<span class="vip-badge">⭐ VIP</span>' : ''}<small style="display:block; color:var(--muted);">Invertido: $${datos.gastado.toFixed(2)}</small></div>
          <span style="font-weight:800; color:var(--primary-light);">${datos.cantidad} compra(s)</span>
        </div>`;
    });
  }

  const filtrados = [...pedidos].reverse().filter(p => p.clienteNombre.toLowerCase().includes(filtro) || p.descripcion.toLowerCase().includes(filtro));
  if (filtrados.length === 0) { cont.innerHTML = '<p style="text-align:center; color:var(--muted);">Sin registros.</p>'; return; }

  filtrados.forEach(p => {
    cont.innerHTML += `
      <div class="item-card">
        <div class="item-info"><h4>🛍️ ${p.clienteNombre}:</h4><p style="color:var(--text); font-weight:600;">${p.descripcion}</p><p>📅 ${p.fecha} | ${p.entregado ? '✅ Entregado' : '⏳ Pendiente'}</p></div>
        <strong class="text-emerald" style="font-size:1.05rem;">$${Number(p.total).toFixed(2)}</strong>
      </div>`;
  });
}

function renderVentas() {
  const cont = document.getElementById('lista-ventas'); cont.innerHTML = '';
  const completados = pedidos.filter(p => p.entregado);
  let sumaTotal = 0; completados.forEach(v => sumaTotal += Number(v.total));
  document.getElementById('ventas-total-historico').innerText = `$${sumaTotal.toFixed(2)}`;

  if (completados.length === 0) { cont.innerHTML = '<p style="text-align:center; color:var(--muted);">No hay ventas cerradas.</p>'; return; }

  completados.forEach(v => {
    cont.innerHTML += `<div class="item-card"><div class="item-info"><h4>✅ ${v.clienteNombre}</h4><p>${v.descripcion}</p><p>📅 ${v.fecha}</p></div><strong class="text-emerald" style="font-size:1.1rem;">+$${v.total.toFixed(2)}</strong></div>`;
  });
}

// ==========================================
// 2. EXPORTAR REPORTE A EXCEL (CSV)
// ==========================================
function exportarReporteExcel() {
  reproducirSonidoClick();
  const completados = pedidos.filter(p => p.entregado);
  if (completados.length === 0) {
    alert('No hay ventas entregadas para exportar.');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,Cliente,Descripcion,Total,Fecha\n";
  completados.forEach(v => {
    csvContent += `"${v.clienteNombre}","${v.descripcion}",${v.total},"${v.fecha}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "Reporte_Ventas_Taller.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================
// PRODUCTOS
// ==========================================
document.getElementById('form-producto').addEventListener('submit', e => {
  e.preventDefault();
  reproducirSonidoExito();
  const nombre = document.getElementById('prod-nombre').value;
  const color = document.getElementById('prod-color').value;
  const talla = document.getElementById('prod-talla').value;
  const precio = parseFloat(document.getElementById('prod-precio').value);
  const stock = document.getElementById('prod-stock').value;
  const fileInput = document.getElementById('prod-foto');

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = ev => guardarProducto(nombre, color, talla, precio, stock, ev.target.result);
    reader.readAsDataURL(fileInput.files[0]);
  } else { guardarProducto(nombre, color, talla, precio, stock, ''); }
  e.target.reset(); toggleForm('form-producto-box');
});

function guardarProducto(nombre, color, talla, precio, stock, foto) {
  productos.push({ id: Date.now(), nombre, color, talla, precio, stock, foto });
  guardarDatos(); renderProductos();
}

function renderProductos() {
  const filtro = document.getElementById('buscar-producto').value.toLowerCase();
  const cont = document.getElementById('lista-productos'); cont.innerHTML = '';
  const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(filtro));

  if (filtrados.length === 0) { cont.innerHTML = '<p style="text-align:center; color:var(--muted);">No hay productos.</p>'; return; }

  filtrados.forEach(p => {
    const imgHtml = p.foto ? `<img src="${p.foto}" class="prod-thumb">` : `<div class="prod-thumb" style="display:flex;align-items:center;justify-content:center;"><i class='bx bx-image' style="font-size:1.5rem;"></i></div>`;
    cont.innerHTML += `
      <div class="item-card">
        ${imgHtml}
        <div class="item-info"><h4>${p.nombre}</h4><p>Stock: ${p.stock} ${p.color ? '| '+p.color : ''} ${p.talla ? '| '+p.talla : ''}</p><strong class="text-accent">$${p.precio.toFixed(2)}</strong></div>
        <button class="mini-btn btn-del" onclick="eliminarProducto(${p.id})">Borrar</button>
      </div>`;
  });
}

function eliminarProducto(id) {
  reproducirSonidoClick();
  if (confirm('¿Eliminar producto?')) { productos = productos.filter(p => p.id !== id); guardarDatos(); renderProductos(); }
}

// ==========================================
// CALENDARIO
// ==========================================
function cambiarMes(delta) { reproducirSonidoClick(); fechaActualCal.setMonth(fechaActualCal.getMonth() + delta); renderCalendario(); }

function renderCalendario() {
  const anio = fechaActualCal.getFullYear();
  const mes = fechaActualCal.getMonth();
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  document.getElementById('cal-mes-titulo').innerText = `${meses[mes]} de ${anio}`;

  const primerDiaSemana = new Date(anio, mes, 1).getDay();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const grid = document.getElementById('cal-dias-grid'); grid.innerHTML = '';

  for (let i = 0; i < primerDiaSemana; i++) { grid.innerHTML += `<div></div>`; }

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fechaStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const tienePedido = pedidos.some(p => p.fecha === fechaStr && !p.entregado);
    const esSeleccionado = fechaStr === diaSeleccionadoStr;

    const celda = document.createElement('div');
    celda.className = `cal-day ${esSeleccionado ? 'selected' : ''} ${tienePedido ? 'has-event' : ''}`;
    celda.innerText = dia;
    celda.onclick = () => { reproducirSonidoClick(); diaSeleccionadoStr = fechaStr; renderCalendario(); };
    grid.appendChild(celda);
  }

  document.getElementById('cal-fecha-seleccionada').innerText = `Agenda: ${diaSeleccionadoStr}`;
  const listaDia = document.getElementById('cal-lista-dia');
  const pedidosDia = pedidos.filter(p => p.fecha === diaSeleccionadoStr);

  listaDia.innerHTML = pedidosDia.length ? '' : '<p style="color:var(--muted);">No hay entregas este día.</p>';
  pedidosDia.forEach(p => {
    listaDia.innerHTML += `<div class="item-card"><div class="item-info"><p>🕒 ${p.hora}</p><h4>${p.clienteNombre} - ${p.descripcion}</h4></div></div>`;
  });
}

// ==========================================
// GASTOS
// ==========================================
document.getElementById('form-gasto').addEventListener('submit', e => {
  e.preventDefault();
  reproducirSonidoExito();
  gastos.push({
    id: Date.now(),
    descripcion: document.getElementById('gasto-desc').value,
    monto: parseFloat(document.getElementById('gasto-monto').value),
    fecha: document.getElementById('gasto-fecha').value
  });
  guardarDatos(); e.target.reset(); renderGastos();
});

function renderGastos() {
  const cont = document.getElementById('lista-gastos'); cont.innerHTML = '';
  if (gastos.length === 0) { cont.innerHTML = '<p style="text-align:center; color:var(--muted);">No hay gastos.</p>'; return; }
  gastos.forEach(g => {
    cont.innerHTML += `
      <div class="item-card">
        <div class="item-info"><h4>💸 ${g.descripcion}</h4><p>📅 ${g.fecha}</p></div>
        <div style="text-align:right;"><strong class="text-accent" style="display:block; margin-bottom:4px;">-$${g.monto.toFixed(2)}</strong><button class="mini-btn btn-del" onclick="eliminarGasto(${g.id})">Borrar</button></div>
      </div>`;
  });
}

function eliminarGasto(id) {
  reproducirSonidoClick();
  if (confirm('¿Eliminar gasto?')) { gastos = gastos.filter(g => g.id !== id); guardarDatos(); renderGastos(); }
}

document.getElementById('gasto-fecha').value = new Date().toISOString().split('T')[0];
if (sesionActual) actualizarInicio();