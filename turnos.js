let turnos = [];
        let fechaActual = new Date();
        let diaSeleccionado = new Date();

        // Cargar turnos al iniciar
        function cargarTurnos() {
            const turnosGuardados = localStorage.getItem('turnos');
            if (turnosGuardados) {
                turnos = JSON.parse(turnosGuardados);
                renderizarCalendario();
                renderizarTurnos();
            }
        }

        // Guardar turnos
        function guardarTurnos() {
            localStorage.setItem('turnos', JSON.stringify(turnos));
        }

        // Formatear fecha
        function formatearFecha(fecha) {
            const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', opciones);
        }

        // Obtener turnos de una fecha específica
        function getTurnosPorFecha(fecha) {
            const fechaStr = fecha.toISOString().split('T')[0];
            return turnos.filter(turno => turno.fecha === fechaStr);
        }

        // Renderizar calendario
        function renderizarCalendario() {
            const grid = document.getElementById('calendarioGrid');
            const año = fechaActual.getFullYear();
            const mes = fechaActual.getMonth();
            
            // Actualizar título del mes
            const nombreMes = fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
            document.getElementById('mesActual').textContent = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

            // Días de la semana
            const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            
            // Primer día del mes
            const primerDia = new Date(año, mes, 1);
            const ultimoDia = new Date(año, mes + 1, 0);
            
            // Días del mes anterior para completar la primera semana
            const diasMesAnterior = primerDia.getDay();
            
            let html = '';
            
            // Headers de días de la semana
            diasSemana.forEach(dia => {
                html += `<div class="dia-semana">${dia}</div>`;
            });

            // Días del mes anterior
            const ultimoDiaMesAnterior = new Date(año, mes, 0).getDate();
            for (let i = diasMesAnterior - 1; i >= 0; i--) {
                const dia = ultimoDiaMesAnterior - i;
                const fecha = new Date(año, mes - 1, dia);
                html += crearDiaHTML(dia, fecha, true);
            }

            // Días del mes actual
            for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
                const fecha = new Date(año, mes, dia);
                html += crearDiaHTML(dia, fecha, false);
            }

            // Días del mes siguiente
            const diasRestantes = 42 - (diasMesAnterior + ultimoDia.getDate());
            for (let dia = 1; dia <= diasRestantes; dia++) {
                const fecha = new Date(año, mes + 1, dia);
                html += crearDiaHTML(dia, fecha, true);
            }

            grid.innerHTML = html;
        }

        // Crear HTML de un día
        function crearDiaHTML(dia, fecha, otroMes) {
            const hoy = new Date();
            const esHoy = fecha.toDateString() === hoy.toDateString();
            const esSeleccionado = fecha.toDateString() === diaSeleccionado.toDateString();
            const turnosDelDia = getTurnosPorFecha(fecha);
            const conTurnos = turnosDelDia.length > 0;

            let clases = 'dia-calendario';
            if (otroMes) clases += ' otro-mes';
            if (esHoy) clases += ' hoy';
            if (esSeleccionado) clases += ' seleccionado';
            if (conTurnos) clases += ' con-turnos';

            const fechaStr = fecha.toISOString().split('T')[0];

            return `
                <div class="${clases}" onclick="seleccionarDia('${fechaStr}')">
                    <div class="dia-numero">${dia}</div>
                    ${conTurnos ? `<div class="turnos-count">${turnosDelDia.length}</div>` : ''}
                </div>
            `;
        }

        // Seleccionar día
        function seleccionarDia(fechaStr) {
            diaSeleccionado = new Date(fechaStr + 'T00:00:00');
            renderizarCalendario();
            renderizarTurnos();
        }

        // Renderizar turnos
        function renderizarTurnos() {
            const lista = document.getElementById('turnosList');
            const titulo = document.getElementById('turnosDelDiaTitulo');
            const turnosDelDia = getTurnosPorFecha(diaSeleccionado);
            
            // Actualizar título
            titulo.textContent = `Turnos del ${formatearFecha(diaSeleccionado.toISOString().split('T')[0])}`;
            
            if (turnosDelDia.length === 0) {
                lista.innerHTML = `
                    <div class="empty-state">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p>No hay turnos para este día</p>
                    </div>
                `;
                return;
            }

            // Ordenar por hora
            turnosDelDia.sort((a, b) => a.hora.localeCompare(b.hora));

            lista.innerHTML = turnosDelDia.map((turno) => {
                const index = turnos.findIndex(t => 
                    t.fecha === turno.fecha && 
                    t.hora === turno.hora && 
                    t.tarea === turno.tarea
                );
                
                return `
                    <div class="turno-item ${turno.prioridad}">
                        <div class="turno-header">
                            <div>
                                <div class="turno-titulo">${turno.tarea}</div>
                                <span class="prioridad-badge prioridad-${turno.prioridad}">
                                    ${turno.prioridad}
                                </span>
                            </div>
                            <button class="btn-eliminar" onclick="eliminarTurno(${index})">🗑️</button>
                        </div>
                        <div class="turno-info">
                            <div class="info-item">
                                <span class="info-label">🕒</span>
                                <span>${turno.hora}</span>
                            </div>
                            ${turno.persona ? `
                            <div class="info-item">
                                <span class="info-label">👤</span>
                                <span>${turno.persona}</span>
                            </div>
                            ` : ''}
                        </div>
                        ${turno.descripcion ? `
                        <div class="turno-descripcion">
                            ${turno.descripcion}
                        </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }

        // Agregar turno
        document.getElementById('turnoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const fechaTurno = document.getElementById('fecha').value;
            const nuevoTurno = {
                tarea: document.getElementById('tarea').value,
                fecha: fechaTurno,
                hora: document.getElementById('hora').value,
                persona: document.getElementById('persona').value,
                prioridad: document.getElementById('prioridad').value,
                descripcion: document.getElementById('descripcion').value
            };

            turnos.push(nuevoTurno);
            guardarTurnos();
            
            // Seleccionar el día del turno agregado
            diaSeleccionado = new Date(fechaTurno + 'T00:00:00');
            renderizarCalendario();
            renderizarTurnos();
            
            // Limpiar formulario
            e.target.reset();
        });

        // Eliminar turno
        function eliminarTurno(index) {
            if (confirm('¿Estás seguro de que quieres eliminar este turno?')) {
                turnos.splice(index, 1);
                guardarTurnos();
                renderizarCalendario();
                renderizarTurnos();
            }
        }

        // Navegación del calendario
        document.getElementById('btnMesAnterior').addEventListener('click', () => {
            fechaActual.setMonth(fechaActual.getMonth() - 1);
            renderizarCalendario();
        });

        document.getElementById('btnMesSiguiente').addEventListener('click', () => {
            fechaActual.setMonth(fechaActual.getMonth() + 1);
            renderizarCalendario();
        });

        document.getElementById('btnHoy').addEventListener('click', () => {
            fechaActual = new Date();
            diaSeleccionado = new Date();
            renderizarCalendario();
            renderizarTurnos();
        });

        // Establecer fecha mínima como hoy
        document.getElementById('fecha').min = new Date().toISOString().split('T')[0];

        // Cargar turnos al iniciar
        cargarTurnos();