/* ==========================================================================
   1. ESTADO GLOBAL DEL SISTEMA (Base de datos simulada)
   ========================================================================== */
const estadoVotacion = {
    activo: true,
    votos: {
        "Juan Perez": 0,
        "Maria Gomez": 0,
        "Blanco": 0
    },
    totalVotos: 0,
    // Registro de estudiantes que ya votaron para evitar fraude
    padronElectoral: new Set(), 
    // Credenciales del Panel de Administración
    adminContrasena: "admin123" 
};

/* ==========================================================================
   2. CAPTURA DE ELEMENTOS DEL DOM
   ========================================================================== */
// Formulario de votación
const formVoto = document.getElementById('formulario-voto');
const estudianteIdInput = document.getElementById('estudiante-id');
const estudiantePinInput = document.getElementById('estudiante-pin');
const mensajeVotacion = document.getElementById('mensaje-votacion');

// Elementos de Resultados
const totalVotosTxt = document.getElementById('total-votos');
const votosC1 = document.getElementById('votos-c1');
const porcetajeC1 = document.getElementById('porcentaje-c1');
const votosC2 = document.getElementById('votos-c2');
const porcetajeC2 = document.getElementById('porcentaje-c2');
const votosBlanco = document.getElementById('votos-blanco');
const porcetajeBlanco = document.getElementById('porcentaje-blanco');

// Elementos de Administración
const formAdmin = document.getElementById('formulario-admin');
const adminPassInput = document.getElementById('admin-pass');
const controlesAdmin = document.getElementById('controles-admin');
const btnDetener = document.getElementById('btn-detener-votacion');
const btnReiniciar = document.getElementById('btn-reiniciar-votos');
const logActividad = document.getElementById('log-actividad');

// Ocultar controles de administrador al iniciar la página
controlesAdmin.style.display = 'none';

/* ==========================================================================
   3. PROCESAMIENTO DEL VOTO (VOTACIÓN SEGURA)
   ========================================================================== */
formVoto.addEventListener('submit', function(e) {
    e.preventDefault(); // Evita que la página se recargue

    // 1. Verificar si las votaciones están abiertas
    if (!estadoVotacion.activo) {
        mostrarMensaje("❌ El proceso de votación está cerrado por el comité.", "red");
        return;
    }

    const estudianteId = estudianteIdInput.value.trim().toUpperCase();
    const pin = estudiantePinInput.value.trim();
    
    // Obtener la opción seleccionada por el estudiante
    const opcionSeleccionada = document.querySelector('input[name="opcion-voto"]:checked');

    // 2. Validación de seguridad básica
    if (pin.length < 4) {
        mostrarMensaje("⚠️ El PIN de seguridad debe tener 4 dígitos.", "orange");
        return;
    }

    // 3. Control de Doble Voto (Seguridad)
    if (estadoVotacion.padronElectoral.has(estudianteId)) {
        mostrarMensaje("🚫 Error: Este código de estudiante ya registró un voto.", "red");
        formVoto.reset();
        return;
    }

    // 4. Registrar voto de manera exitosa
    const candidato = opcionSeleccionada.value;
    estadoVotacion.votos[candidato]++;
    estadoVotacion.totalVotos++;
    estadoVotacion.padronElectoral.add(estudianteId); // Bloquear ID para el futuro

    // 5. Actualizar interfaz
    mostrarMensaje("🎉 ¡Voto emitido y registrado de forma segura!", "green");
    actualizarResultadosEnVivo();
    agregarLog(`Estudiante ${estudianteId} emitió su voto correctamente.`);
    
    // Limpiar formulario para el siguiente estudiante
    formVoto.reset();
});

// Función auxiliar para alertas visuales rápidas
function mostrarMensaje(texto, color) {
    mensajeVotacion.innerText = texto;
    mensajeVotacion.style.backgroundColor = color === "green" ? "#d1fae5" : color === "orange" ? "#fef3c7" : "#fee2e2";
    mensajeVotacion.style.color = color === "green" ? "#065f46" : color === "orange" ? "#92400e" : "#991b1b";
}

/* ==========================================================================
   4. CÁLCULO Y ACTUALIZACIÓN DE RESULTADOS EN VIVO
   ========================================================================== */
function actualizarResultadosEnVivo() {
    const total = estadoVotacion.totalVotos;
    totalVotosTxt.innerText = total;

    // Calcular porcentajes evitando división entre cero
    const calcularPorcentaje = (votos) => total === 0 ? 0 : ((votos / total) * 100).toFixed(1);

    // Actualizar textos en la tabla HTML
    votosC1.innerText = estadoVotacion.votos["Juan Perez"];
    porcetajeC1.innerText = `${calcularPorcentaje(estadoVotacion.votos["Juan Perez"])}%`;

    votosC2.innerText = estadoVotacion.votos["Maria Gomez"];
    porcetajeC2.innerText = `${calcularPorcentaje(estadoVotacion.votos["Maria Gomez"])}%`;

    votosBlanco.innerText = estadoVotacion.votos["Blanco"];
    porcetajeBlanco.innerText = `${calcularPorcentaje(estadoVotacion.votos["Blanco"])}%`;
}

/* ==========================================================================
   5. PANEL DE ADMINISTRACIÓN Y AUDITORÍA
   ========================================================================== */
// Acceso al panel administrativo
formAdmin.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (adminPassInput.value === estadoVotacion.adminContrasena) {
        controlesAdmin.style.display = 'block';
        formAdmin.style.display = 'none'; // Esconde el login de admin
        agregarLog("Comité Electoral ingresó al panel administrativo.");
    } else {
        alert("Contraseña incorrecta. Acceso denegado.");
        adminPassInput.value = "";
    }
});

// Botón: Pausar / Reanudar Votaciones
btnDetener.addEventListener('click', function() {
    estadoVotacion.activo = !estadoVotacion.activo;
    
    if (estadoVotacion.activo) {
        btnDetener.innerText = "Pausar Votación";
        btnDetener.style.backgroundColor = "#f59e0b"; // Ámbar
        agregarLog("El proceso de votación ha sido REANUDADO.");
    } else {
        btnDetener.innerText = "Abrir Votación";
        btnDetener.style.backgroundColor = "#10b981"; // Verde
        agregarLog("El proceso de votación ha sido PAUSADO.");
    }
});

// Botón: Reiniciar Sistema completo
btnReiniciar.addEventListener('click', function() {
    if (confirm("🚨 ¿Estás seguro de reiniciar todo el sistema? Se borrarán todos los votos actuales.")) {
        estadoVotacion.votos["Juan Perez"] = 0;
        estadoVotacion.votos["Maria Gomez"] = 0;
        estadoVotacion.votos["Blanco"] = 0;
        estadoVotacion.totalVotos = 0;
        estadoVotacion.padronElectoral.clear();
        
        actualizarResultadosEnVivo();
        agregarLog("SISTEMA REINICIADO. Conteo de votos en cero.");
        alert("El sistema ha sido restablecido con éxito.");
    }
});

// Función para registrar auditoría en el cuadro de texto (Logs)
function agregarLog(mensaje) {
    const ahora = new Date();
    const horaFormateada = ahora.toLocaleTimeString();
    logActividad.value += `[${horaFormateada}] ${mensaje}\n`;
    // Auto-scroll del textarea hacia abajo
    logActividad.scrollTop = logActividad.scrollHeight;
}