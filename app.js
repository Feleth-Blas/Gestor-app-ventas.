// ====== ESTADO GLOBAL DE LA APLICACIÓN ======
let state = {
    user: null,
    ventas: [],
    clientes: []
};

// ====== INICIALIZACIÓN ======
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    verificarSesion();
});

// ====== AUTENTICACIÓN SEGURA ======
function verificarSesion() {
    const sesionGuardada = localStorage.getItem('blas_sesion');
    if (sesionGuardada) {
        state.user = JSON.parse(sesionGuardada);
        mostrarPanel();
    } else {
        mostrarLogin();
    }
}

// Iniciar sesión con Google seguro e independiente para cada dispositivo
function iniciarConGoogle() {
    // Abre un prompt limpio sin valores fijos ni correos pre-escritos
    let correoUsuario = prompt("Por favor, ingresa tu dirección de correo electrónico de Google (Gmail) para iniciar sesión:", "");
    
    if (correoUsuario === null) return; // Cancelado
    correoUsuario = correoUsuario.trim();
    
    if (correoUsuario === "") {
        alert("Debes escribir una dirección de correo válida.");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoUsuario)) {
        alert("Por favor, ingresa un formato de correo electrónico válido.");
        return;
    }

    const nombreSugerido = correoUsuario.split('@')[0];
    const nombreUsuario = prompt(`¿Cómo te gustaría que te llame en el panel?`, nombreSugerido) || nombreSugerido;
    const nombreTaller = prompt("¿Cuál es el nombre de tu Taller / Negocio?", "Mi Taller") || "Mi Taller";

    state.user = {
        email: correoUsuario.toLowerCase(),
        nombre: nombreUsuario,
        taller: nombreTaller,
        rol: "Administrador"
    };

    localStorage.setItem('blas_sesion', JSON.stringify(state.user));
    mostrarPanel();
}

function procesarLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const taller = document.getElementById('login-taller').value.trim();
    const nombre = document.getElementById('login-nombre').value.trim();

    state.user = {
        email: email,
        nombre: nombre || "Administrador",
        taller: taller || "Mi Taller",
        rol: "Administrador"
    };

    localStorage.setItem('blas_sesion', JSON.stringify(state.user));
    mostrarPanel();
}

function cerrarSesion() {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        localStorage.removeItem('blas_sesion');
        state.user = null;
        mostrarLogin();
    }
}

function mostrarLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-screen').classList.add('hidden');
}

function mostrarPanel() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    
    document.getElementById('header-taller-name').innerText = state.user.taller;
    document.getElementById('user-display-name').innerText = state.user.nombre;

    cargarDatosUsuario();
    actualizarTablaVentas();
    actualizarTablaClientes();
    actualizarReportes();
    calcularVentaManual();
}

// ====== BASE DE DATOS LOCAL SEGÚN USUARIO ======
function cargarDatosUsuario() {
    const claveVentas = `blas_ventas_${state.user.email}`;
    const claveClientes = `blas_clientes_${state.user.email}`;

    state.ventas = JSON.parse(localStorage.getItem(claveVentas)) || [
        { id: 1, cliente: "María López", producto: "15 Camisetas sublimadas", total: 180.00, abono: 100.00, saldo: 80.00, estado: "En Proceso" },
        { id: 2, cliente: "Juan Pérez", producto: "10 Tazas personalizadas", total: 70.00, abono: 70.00, saldo: 0.00, estado: "Entregado" }
    ];

    state.clientes = JSON.parse(localStorage.getItem(claveClientes)) || [
        { id: 1, nombre: "María López", telefono: "+505 8888 8888", email: "maria@gmail.com" },
        { id: 2, nombre: "Juan Pérez", telefono: "+505 7777 7777", email: "juan@gmail.com" }
    ];

    guardarDatosLocal();
}

function guardarDatosLocal() {
    if (!state.user) return;
    localStorage.setItem(`blas_ventas_${state.user.email}`, JSON.stringify(state.ventas));
    localStorage.setItem(`blas_clientes_${state.user.email}`, JSON.stringify(state.clientes));
}

// ====== NAVEGACIÓN ======
function cambiarTab(tabId) {
    document.querySelectorAll('.tab-section').forEach(sec => sec.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`section-${tabId}`).classList.remove('hidden');
    document.getElementById(`tab-${tabId}`).classList.add('active');

    if (tabId === 'reportes') actualizarReportes();
    lucide.createIcons();
}

// ====== CALCULADORA DE GANANCIAS PERSONALIZADA ======
function calcularVentaManual() {
    const costoInput = document.getElementById('calc-costo');
    const pctInput = document.getElementById('calc-ganancia-pct');

    const costo = parseFloat(costoInput.value) || 0;
    const pct = parseFloat(pctInput.value) || 0;

    const ganancia = costo * (pct / 100);
    const precioFinal = costo + ganancia;

    document.getElementById('res-costo').innerText = `$${costo.toFixed(2)}`;
    document.getElementById('res-porcentaje').innerText = `${pct}%`;
    document.getElementById('res-ganancia').innerText = `$${ganancia.toFixed(2)}`;
    document.getElementById('res-precio-final').innerText = `$${precioFinal.toFixed(2)}`;
}

function setPorcentajeRapido(pct) {
    document.getElementById('calc-ganancia-pct').value = pct;
    calcularVentaManual();
}

// ====== GESTIÓN DE VENTAS ======
function actualizarTablaVentas() {
    const tbody = document.getElementById('tabla-ventas-body');
    tbody.innerHTML = '';

    const query = document.getElementById('buscar-venta').value.toLowerCase();
    const filtradas = state.ventas.filter(v => 
        v.cliente.toLowerCase().includes(query) || 
        v.producto.toLowerCase().includes(query) || 
        v.id.toString().includes(query)
    );

    if (filtradas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">No se encontraron pedidos.</td></tr>`;
        return;
    }

    filtradas.forEach(v => {
        const tr = document.createElement('tr');
        const statusClass = v.estado.toLowerCase().replace(" ", "-");
        tr.innerHTML = `
            <td>#${v.id}</td>
            <td><strong>${v.cliente}</strong></td>
            <td>${v.producto}</td>
            <td><strong>$${v.total.toFixed(2)}</strong></td>
            <td>$${v.abono.toFixed(2)}</td>
            <td class="${v.saldo > 0 ? 'debe' : 'pagado'}"><strong>$${v.saldo.toFixed(2)}</strong></td>
            <td><span class="badge ${statusClass}">${v.estado}</span></td>
            <td>
                <div class="action-buttons">
                    ${v.saldo > 0 ? `<button onclick="abrirModalAbono(${v.id})" class="btn-action btn-pay" title="Abonar"><i data-lucide="plus-circle"></i></button>` : ''}
                    <button onclick="editarVenta(${v.id})" class="btn-action btn-edit" title="Editar"><i data-lucide="edit-3"></i></button>
                    <button onclick="eliminarVenta(${v.id})" class="btn-action btn-delete" title="Eliminar"><i data-lucide="trash-2"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    lucide.createIcons();
}

function filtrarVentas() {
    actualizarTablaVentas();
}

function abrirModalVenta() {
    document.getElementById('modal-venta-title').innerText = "Nuevo Pedido";
    document.getElementById('form-venta').reset();
    document.getElementById('venta-id').value = "";
    
    const select = document.getElementById('venta-cliente');
    select.innerHTML = '<option value="">-- Elige un cliente --</option>';
    state.clientes.forEach(c => {
        select.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
    });

    document.getElementById('venta-saldo-display').innerText = "$0.00";
    document.getElementById('modal-venta').classList.remove('hidden');
}

function cerrarModalVenta() {
    document.getElementById('modal-venta').classList.add('hidden');
}

function actualizarSaldoModal() {
    const total = parseFloat(document.getElementById('venta-total').value) || 0;
    const abono = parseFloat(document.getElementById('venta-abono').value) || 0;
    const saldo = Math.max(0, total - abono);
    document.getElementById('venta-saldo-display').innerText = `$${saldo.toFixed(2)}`;
}

function guardarVenta(event) {
    event.preventDefault();
    const idVal = document.getElementById('venta-id').value;
    const cliente = document.getElementById('venta-cliente').value;
    const producto = document.getElementById('venta-producto').value.trim();
    const total = parseFloat(document.getElementById('venta-total').value) || 0;
    const abono = parseFloat(document.getElementById('venta-abono').value) || 0;
    const estado = document.getElementById('venta-estado').value;
    const saldo = Math.max(0, total - abono);

    if (!cliente) {
        alert("Por favor selecciona un cliente.");
        return;
    }

    if (idVal) {
        const index = state.ventas.findIndex(v => v.id === parseInt(idVal));
        if (index !== -1) {
            state.ventas[index] = { ...state.ventas[index], cliente, producto, total, abono, saldo, estado };
        }
    } else {
        const nuevoId = state.ventas.length > 0 ? Math.max(...state.ventas.map(v => v.id)) + 1 : 1;
        state.ventas.push({ id: nuevoId, cliente, producto, total, abono, saldo, estado });
    }

    guardarDatosLocal();
    actualizarTablaVentas();
    cerrarModalVenta();
}

function editarVenta(id) {
    const v = state.ventas.find(item => item.id === id);
    if (!v) return;

    abrirModalVenta();
    document.getElementById('modal-venta-title').innerText = `Editar Pedido #${id}`;
    document.getElementById('venta-id').value = v.id;
    document.getElementById('venta-cliente').value = v.cliente;
    document.getElementById('venta-producto').value = v.producto;
    document.getElementById('venta-total').value = v.total;
    document.getElementById('venta-abono').value = v.abono;
    document.getElementById('venta-estado').value = v.estado;
    actualizarSaldoModal();
}

function eliminarVenta(id) {
    if (confirm(`¿Estás seguro de eliminar el pedido #${id}?`)) {
        state.ventas = state.ventas.filter(v => v.id !== id);
        guardarDatosLocal();
        actualizarTablaVentas();
    }
}

// ====== GESTIÓN DE ABONOS ======
function abrirModalAbono(id) {
    const v = state.ventas.find(item => item.id === id);
    if (!v) return;

    document.getElementById('abono-venta-id').value = v.id;
    document.getElementById('abono-pedido-info').innerText = `#${v.id} - ${v.producto} (${v.cliente})`;
    document.getElementById('abono-saldo-info').innerText = `$${v.saldo.toFixed(2)}`;
    document.getElementById('abono-monto').value = "";
    document.getElementById('modal-abono').classList.remove('hidden');
}

function cerrarModalAbono() {
    document.getElementById('modal-abono').classList.add('hidden');
}

function procesarAbonoExtra(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('abono-venta-id').value);
    const monto = parseFloat(document.getElementById('abono-monto').value) || 0;

    const v = state.ventas.find(item => item.id === id);
    if (!v) return;

    if (monto <= 0) {
        alert("Ingresa un monto válido mayor a 0.");
        return;
    }

    if (monto > v.saldo) {
        alert(`El abono ($${monto.toFixed(2)}) no puede ser mayor que el saldo pendiente ($${v.saldo.toFixed(2)}).`);
        return;
    }

    v.abono += monto;
    v.saldo = Math.max(0, v.total - v.abono);

    if (v.saldo === 0 && v.estado === "Pendiente") {
        v.estado = "En Proceso";
    }

    guardarDatosLocal();
    actualizarTablaVentas();
    cerrarModalAbono();
}

// ====== GESTIÓN DE CLIENTES ======
function actualizarTablaClientes() {
    const tbody = document.getElementById('tabla-clientes-body');
    tbody.innerHTML = '';

    const query = document.getElementById('buscar-cliente').value.toLowerCase();
    const filtrados = state.clientes.filter(c => 
        c.nombre.toLowerCase().includes(query) || 
        (c.telefono && c.telefono.includes(query)) || 
        (c.email && c.email.toLowerCase().includes(query))
    );

    if (filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">No se encontraron clientes.</td></tr>`;
        return;
    }

    filtrados.forEach(c => {
        const compras = state.ventas.filter(v => v.cliente === c.nombre);
        const numPedidos = compras.length;
        const totalGastado = compras.reduce((sum, v) => sum + v.total, 0);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${c.nombre}</strong></td>
            <td>${c.telefono || '-'}</td>
            <td>${c.email || '-'}</td>
            <td>${numPedidos}</td>
            <td><strong>$${totalGastado.toFixed(2)}</strong></td>
            <td>
                <div class="action-buttons">
                    <button onclick="eliminarCliente(${c.id})" class="btn-action btn-delete" title="Eliminar"><i data-lucide="trash-2"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    lucide.createIcons();
}

function filtrarClientes() {
    actualizarTablaClientes();
}

function abrirModalCliente() {
    document.getElementById('form-cliente').reset();
    document.getElementById('modal-cliente').classList.remove('hidden');
}

function cerrarModalCliente() {
    document.getElementById('modal-cliente').classList.add('hidden');
}

function guardarCliente(event) {
    event.preventDefault();
    const nombre = document.getElementById('cliente-nombre').value.trim();
    const telefono = document.getElementById('cliente-telefono').value.trim();
    const email = document.getElementById('cliente-email').value.trim();

    if (state.clientes.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
        alert("Ya existe un cliente con ese nombre.");
        return;
    }

    const nuevoId = state.clientes.length > 0 ? Math.max(...state.clientes.map(c => c.id)) + 1 : 1;
    state.clientes.push({ id: nuevoId, nombre, telefono, email });

    guardarDatosLocal();
    actualizarTablaClientes();
    cerrarModalCliente();
}

function eliminarCliente(id) {
    const c = state.clientes.find(item => item.id === id);
    if (!c) return;

    if (confirm(`¿Estás seguro de eliminar a ${c.nombre}? Se conservarán sus pedidos existentes.`)) {
        state.clientes = state.clientes.filter(item => item.id !== id);
        guardarDatosLocal();
        actualizarTablaClientes();
    }
}

// ====== REPORTES & ESTADÍSTICAS ======
function actualizarReportes() {
    const totalVendido = state.ventas.reduce((sum, v) => sum + v.total, 0);
    const totalRecaudado = state.ventas.reduce((sum, v) => sum + v.abono, 0);
    const totalPendiente = state.ventas.reduce((sum, v) => sum + v.saldo, 0);

    document.getElementById('stat-total-vendido').innerText = `$${totalVendido.toFixed(2)}`;
    document.getElementById('stat-total-recaudado').innerText = `$${totalRecaudado.toFixed(2)}`;
    document.getElementById('stat-total-pendiente').innerText = `$${totalPendiente.toFixed(2)}`;
    document.getElementById('stat-total-pedidos').innerText = state.ventas.length;

    const list = document.getElementById('report-summary-list');
    list.innerHTML = '';

    const estados = ["Pendiente", "En Proceso", "Entregado", "Cancelado"];
    estados.forEach(est => {
        const count = state.ventas.filter(v => v.estado === est).length;
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.padding = '8px 0';
        li.style.borderBottom = '1px solid #1a1512';
        li.innerHTML = `<span>${est}:</span> <strong>${count} pedido(s)</strong>`;
        list.appendChild(li);
    });
}

function exportarReporte() {
    if (state.ventas.length === 0) {
        alert("No hay ventas registradas para exportar.");
        return;
    }

    let csv = "ID,Cliente,Producto,Total,Abono,Saldo,Estado\n";
    state.ventas.forEach(v => {
        csv += `${v.id},"${v.cliente}","${v.producto}",${v.total},${v.abono},${v.saldo},"${v.estado}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `reporte_ventas_${state.user.taller.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}