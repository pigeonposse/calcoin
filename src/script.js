let empleados = JSON.parse(localStorage.getItem('empleados')) || {};
let editando = false;
let empleadoEnEdicion = null;
let empleadoParaEliminar = null;
let sortState = { nombre: 0, horas: 0, group: 0, asset: 0, amount: 0, rounding: 0 };
let lastCalculation = null;

function guardarEmpleados() {
  localStorage.setItem('empleados', JSON.stringify(empleados));
}

function anadirNuevoEmpleado() {
  const nombre = document.getElementById('nombreEmpleado').value;
  const puesto = document.getElementById('puestoEmpleado').value;
  const horas = document.getElementById('horasEmpleado').value;
  if (nombre && puesto && horas) {
    empleados[nombre.toLowerCase()] = { nombre, puesto, horas, presencial: 'Yes' };
    guardarEmpleados();
    document.getElementById('empleadosForm').reset();
    sortTable('nombre', true); // Forzar orden ascendente
    actualizarTablaEmpleados();
    mostrarCalculateDistribution();
  }
}

document.getElementById('nombreEmpleado').addEventListener('input', function() {
  const nombre = this.value.toLowerCase();
  const addButton = document.getElementById('anadirEmpleado');
  if (empleados[nombre] && !editando) {
    this.classList.add('duplicate');
    addButton.disabled = true;
    addButton.classList.add('disabled-hover');
  } else {
    this.classList.remove('duplicate');
    addButton.disabled = false;
    addButton.classList.remove('disabled-hover');
  }
});

function editarEmpleado(nombre) {
  const empleado = empleados[nombre.toLowerCase()];
  empleadoEnEdicion = nombre.toLowerCase();
  document.getElementById('nombreEmpleado').value = empleado.nombre;
  document.getElementById('puestoEmpleado').value = empleado.puesto;
  document.getElementById('horasEmpleado').value = empleado.horas;
  document.getElementById('anadirEmpleado').textContent = 'Guardar Cambios';
  document.getElementById('anadirEmpleado').onclick = guardarCambiosEmpleado;
  editando = true;
}

function editarEmpleado(nombre) {
  const empleado = empleados[nombre.toLowerCase()];
  empleadoEnEdicion = nombre.toLowerCase();
  
  // Ocultar el empleado de la lista
  delete empleados[empleadoEnEdicion];
  actualizarTablaEmpleados();

  document.getElementById('nombreEmpleado').value = empleado.nombre;
  document.getElementById('puestoEmpleado').value = empleado.puesto;
  document.getElementById('horasEmpleado').value = empleado.horas;
  document.getElementById('anadirEmpleado').textContent = 'Guardar Cambios';
  document.getElementById('anadirEmpleado').onclick = guardarCambiosEmpleado;
}

function guardarCambiosEmpleado() {
  const nuevoNombre = document.getElementById('nombreEmpleado').value;
  const puesto = document.getElementById('puestoEmpleado').value;
  const horas = document.getElementById('horasEmpleado').value;
  
  if (nuevoNombre && puesto && horas) {
    const nuevoNombreLower = nuevoNombre.toLowerCase();

    // Crear un objeto con los datos actualizados
    empleados[nuevoNombreLower] = {
      nombre: nuevoNombre,
      puesto: puesto,
      horas: horas,
      presencial: 'Yes' // Asumimos que es 'Yes' por defecto, ajusta según sea necesario
    };

    guardarEmpleados();
    actualizarTablaEmpleados();
    reiniciarFormulario();

    const currentSortColumn = getCurrentSortColumn();
    if (currentSortColumn) {
      sortTable(currentSortColumn, true);
    }
  }
}

function reiniciarFormulario() {
  document.getElementById('empleadosForm').reset();
  document.getElementById('anadirEmpleado').textContent = 'Añadir Empleado';
  document.getElementById('anadirEmpleado').onclick = anadirNuevoEmpleado;
  empleadoEnEdicion = null;
}

function getCurrentSortColumn() {
  const headers = document.querySelectorAll('th[data-column]');
  for (let header of headers) {
    if (header.classList.contains('sort-asc') || header.classList.contains('sort-desc')) {
      return header.getAttribute('data-column');
    }
  }
  return null;
}

function sortTable(column, forceAscending = false) {
  if (!forceAscending) {
    sortDirection[column] = sortDirection[column] === 'asc' ? 'desc' : 'asc';
  } else {
    sortDirection[column] = 'asc';
  }

  const sortedEmpleados = Object.keys(empleados).sort((a, b) => {
    const empleadoA = empleados[a];
    const empleadoB = empleados[b];
    let comparison = 0;

    switch (column) {
      case 'asset':
        comparison = empleadoB.presencial.localeCompare(empleadoA.presencial);
        break;
      case 'nombre':
        comparison = empleadoA.nombre.localeCompare(empleadoB.nombre);
        break;
      case 'group':
        const groupA = parseInt(empleadoA.puesto.replace(/\D/g, ''));
        const groupB = parseInt(empleadoB.puesto.replace(/\D/g, ''));
        comparison = groupA - groupB;
        break;
      case 'horas':
        comparison = parseFloat(empleadoB.horas) - parseFloat(empleadoA.horas);
        break;
      case 'amount':
        const amountA = parseFloat(empleadoA.amount || 0) + parseFloat(empleadoA.rounding || 0);
        const amountB = parseFloat(empleadoB.amount || 0) + parseFloat(empleadoB.rounding || 0);
        comparison = amountB - amountA;
        break;
      default:
        return 0;
    }

    return sortDirection[column] === 'asc' ? comparison : -comparison;
  });

  empleados = sortedEmpleados.reduce((acc, key) => {
    acc[key] = empleados[key];
    return acc;
  }, {});

  guardarEmpleados();
  actualizarTablaEmpleados();
  updateSortIndicators(column);
}

function eliminarEmpleado(nombre) {
  empleadoParaEliminar = nombre.toLowerCase();
  const mensaje = `¿Está seguro de que desea eliminar a ${nombre}?`;
  document.getElementById('mensajeConfirmacion').textContent = mensaje;
  document.getElementById('popupEliminarEmpleado').style.display = 'block';
}

function confirmarEliminarEmpleado() {
  if (empleadoParaEliminar) {
    delete empleados[empleadoParaEliminar];
    guardarEmpleados();
    actualizarTablaEmpleados();
    reiniciarFormulario();
    empleadoParaEliminar = null;
    mostrarCalculateDistribution();
  }
  document.getElementById('popupEliminarEmpleado').style.display = 'none';
}

function reiniciarFormulario() {
  document.getElementById('empleadosForm').reset();
  document.getElementById('anadirEmpleado').textContent = 'Añadir Empleado';
  document.getElementById('anadirEmpleado').onclick = anadirNuevoEmpleado;
  editando = false;
  empleadoEnEdicion = null;
}

function actualizarTablaEmpleados() {
  const empleadosCuerpo = document.getElementById('empleadosCuerpo');
  empleadosCuerpo.innerHTML = '';
  for (let empleado in empleados) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <label class="toggle-switch">
          <input type="checkbox" ${empleados[empleado].presencial === 'Yes' ? 'checked' : ''} onchange="toggleAsset('${empleados[empleado].nombre.toLowerCase()}')">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>${empleados[empleado].nombre}</td>
      <td>${empleados[empleado].puesto}</td>
      <td>${empleados[empleado].horas}</td>
      <td>${empleados[empleado].presencial === 'Yes' && lastCalculation ? (empleados[empleado].amount || '—') : '—'}</td>
      <td>${empleados[empleado].presencial === 'Yes' && lastCalculation ? (empleados[empleado].rounding || '—') : '—'}</td>
      <td>
        <button class="icon-btn editar-btn" onclick="editarEmpleado('${empleados[empleado].nombre.toLowerCase()}')">
          <img src="https://www.svgrepo.com/show/502642/edit-clipboard.svg" alt="Editar">
        </button>
        <button class="icon-btn eliminar-btn" onclick="eliminarEmpleado('${empleados[empleado].nombre.toLowerCase()}')">
          <img src="https://www.svgrepo.com/show/487269/delete-profile.svg" alt="Eliminar">
        </button>
      </td>
    `;
    if (empleados[empleado].presencial === 'No') {
      tr.querySelectorAll('td:not(:first-child):not(:last-child)').forEach(td => {
        td.classList.add('asset-disabled');
      });
    }
    empleadosCuerpo.appendChild(tr);
  }
  mostrarCalculateDistribution();
  if (lastCalculation) {
    aplicarUltimoCalculo();
  }
}

function toggleAsset(nombre) {
  empleados[nombre].presencial = empleados[nombre].presencial === 'Yes' ? 'No' : 'Yes';
  if (empleados[nombre].presencial === 'No') {
    empleados[nombre].amount = '';
    empleados[nombre].rounding = '';
  }
  guardarEmpleados();
  actualizarTablaEmpleados();
  if (lastCalculation) {
    calcularReparto(new Event('submit'));
  }
}

let sortDirection = {
  asset: 'asc',
  nombre: 'asc',
  group: 'asc',
  horas: 'desc',
  amount: 'desc'
};

function updateSortIndicators(column) {
  document.querySelectorAll('th').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
  });

  const th = document.querySelector(`th[data-column="${column}"]`);
  if (th) {
    th.classList.add(sortDirection[column] === 'asc' ? 'sort-asc' : 'sort-desc');
  }
}

function initializeTable() {
  sortTable('nombre', true);

  document.querySelectorAll('th[data-column]').forEach(th => {
    th.addEventListener('click', () => {
      const column = th.getAttribute('data-column');
      sortTable(column);
    });
  });
}

window.addEventListener('load', initializeTable);

function borrarTodosEmpleados() {
  if (confirm('Are you sure you want to delete all employees?')) {
    empleados = {};
    guardarEmpleados();
    actualizarTablaEmpleados();
    reiniciarFormulario();
    lastCalculation = null;
  }
}

function redondeo_personalizado(cantidad) {
    const centimos = Math.round(cantidad * 100);
    const ultimo_digito = centimos % 10;

    if (ultimo_digito >= 1 && ultimo_digito <= 4) {
        return Math.floor(cantidad * 20) / 20;
    } else if (ultimo_digito >= 6 && ultimo_digito <= 9) {
        return Math.floor(cantidad * 20) / 20;
    }

    return cantidad;
}

function calcularReparto(event) {
  event.preventDefault();
  const totalDinero = parseFloat(document.getElementById('totalDinero').value) || 0;
  const pointGroup1 = parseFloat(document.getElementById('pointGroup1').value) || 0;
  const pointGroup2 = parseFloat(document.getElementById('pointGroup2').value) || 0;
  const pointGroup3 = parseFloat(document.getElementById('pointGroup3').value) || 0;
  const semanaReparto = document.getElementById('semanaReparto').value;
  const empleadosCuerpo = document.getElementById('empleadosCuerpo');
  let totalPuntos = 0;
  let empleadosGrupo = { 'Group 1': 0, 'Group 2': 0, 'Group 3': 0 };
  let horasGrupo = { 'Group 1': 0, 'Group 2': 0, 'Group 3': 0 };
  for (let empleado in empleados) {
    if (empleados[empleado].presencial === 'Yes') {
      let puntos = 0;
      if (empleados[empleado].puesto === 'Group 1') {
        puntos = empleados[empleado].horas * pointGroup1;
        horasGrupo['Group 1'] += parseFloat(empleados[empleado].horas);
      } else if (empleados[empleado].puesto === 'Group 2') {
        puntos = empleados[empleado].horas * pointGroup2;
        horasGrupo['Group 2'] += parseFloat(empleados[empleado].horas);
      } else if (empleados[empleado].puesto === 'Group 3') {
        puntos = empleados[empleado].horas * pointGroup3;
        horasGrupo['Group 3'] += parseFloat(empleados[empleado].horas);
      }
      totalPuntos += puntos;
      empleadosGrupo[empleados[empleado].puesto]++;
    }
  }
  let totalRounding = 0;
  let maxAmount = 0;
  lastCalculation = {};
  for (let empleado in empleados) {
    if (empleados[empleado].presencial === 'Yes') {
      let puntos = 0;
      if (empleados[empleado].puesto === 'Group 1') puntos = empleados[empleado].horas * pointGroup1;
      else if (empleados[empleado].puesto === 'Group 2') puntos = empleados[empleado].horas * pointGroup2;
      else if (empleados[empleado].puesto === 'Group 3') puntos = empleados[empleado].horas * pointGroup3;
      const cantidad = (puntos / totalPuntos) * totalDinero;
      const cantidadRedondeada = redondeo_personalizado(cantidad);
      const rounding = cantidad - cantidadRedondeada;
      totalRounding += rounding;
      maxAmount = Math.max(maxAmount, cantidad);
      lastCalculation[empleado] = {
        amount: cantidad.toFixed(2),
        rounding: cantidadRedondeada.toFixed(2)
      };
      empleados[empleado].amount = cantidad.toFixed(2);
      empleados[empleado].rounding = cantidadRedondeada.toFixed(2);
    }
  }
  guardarEmpleados();
  actualizarTablaEmpleados();
  const numeroEmpleados = Object.values(empleados).filter(empleado => empleado.presencial === "Yes").length;
  const distribucionG1 = (totalDinero * pointGroup1 / (pointGroup1 + pointGroup2 + pointGroup3)).toFixed(2);
  const distribucionG2 = (totalDinero * pointGroup2 / (pointGroup1 + pointGroup2 + pointGroup3)).toFixed(2);
  const distribucionG3 = (totalDinero * pointGroup3 / (pointGroup1 + pointGroup2 + pointGroup3)).toFixed(2);
  const totalCalculatedDistribution = document.getElementById('totalCalculatedDistribution');
  totalCalculatedDistribution.innerHTML = `
    <span>💰 ${totalDinero.toFixed(2)}</span>
    <span>👤 ${numeroEmpleados}</span>
    <span>📅 ${semanaReparto}</span>
    <span>🥇 ${distribucionG1} 🥈 ${distribucionG2} 🥉 ${distribucionG3}</span>
    <span>🎯 ${totalRounding.toFixed(2)}</span>
  `;
  totalCalculatedDistribution.style.display = 'flex';
  document.getElementById('download-buttons').style.display = 'flex';
}

function aplicarUltimoCalculo() {
  if (!lastCalculation) return;
  const empleadosCuerpo = document.getElementById('empleadosCuerpo');
  let index = 0;
  for (let empleado in empleados) {
    if (lastCalculation[empleado]) {
      const row = empleadosCuerpo.rows[index];
      if (empleados[empleado].presencial === 'Yes') {
        row.cells[4].textContent = lastCalculation[empleado].amount;
        row.cells[5].textContent = lastCalculation[empleado].rounding;
      } else {
        row.cells[4].textContent = '—';
        row.cells[5].textContent = '—';
      }
    }
    index++;
  }
}

function searchEmployees() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const rows = document.querySelectorAll('#empleadosCuerpo tr');
  rows.forEach(row => {
    const name = row.cells[1].textContent.toLowerCase();
    if (name.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx, .xls';
  input.onchange = function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, {type: 'array'});
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      empleados = {};
      jsonData.forEach(row => {
        empleados[row.Name.toLowerCase()] = {
          nombre: row.Name,
          puesto: row.Group,
          horas: row.Workday,
          presencial: row.Asset
        };
      });
      guardarEmpleados();
      actualizarTablaEmpleados();
    };
    reader.readAsArrayBuffer(file);
  };
  input.click();
}

function exportData() {
  const wb = XLSX.utils.book_new();
  const ws_data = Object.values(empleados).map(emp => ({
    Name: emp.nombre,
    Group: emp.puesto,
    Workday: emp.horas,
    Asset: emp.presencial,
    Amount: emp.amount || '',
    Rounding: emp.rounding || ''
  }));
  const ws = XLSX.utils.json_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "Employees");
  XLSX.writeFile(wb, "Calcoin_Employees.xlsx");
}

function mostrarCalculateDistribution() {
  const calculateDistribution = document.getElementById('calculateDistribution');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const totalCalculatedDistribution = document.getElementById('totalCalculatedDistribution');
  if (Object.keys(empleados).length > 0) {
    calculateDistribution.style.display = 'block';
    welcomeMessage.style.display = 'none';
  } else {
    calculateDistribution.style.display = 'none';
    welcomeMessage.style.display = 'block';
  }
  if (!lastCalculation) {
    totalCalculatedDistribution.style.display = 'none';
    document.getElementById('download-buttons').style.display = 'none';
  }
}

function descargarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setTextColor(255, 148, 0);
  doc.text("Calcoin", 105, 15, null, null, "center");
  
  const totalDistribution = document.getElementById('totalCalculatedDistribution').innerText;
  const formattedDistribution = totalDistribution.replace(/💰/g, 'Total: ')
                                                 .replace(/👤/g, 'Employees: ')
                                                 .replace(/📅/g, 'Week: ')
                                                 .replace(/🥇/g, 'Group 1: ')
                                                 .replace(/🥈/g, 'Group 2: ')
                                                 .replace(/🥉/g, 'Group 3: ')
                                                 .replace(/🎯/g, 'Rounding: ');
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  const lines = doc.splitTextToSize(formattedDistribution, 180);
  doc.text(lines, 14, 25);
  
  const headers = [["Asset", "Name", "Group", "Workday", "Amount", "Rounding"]];
  const data = Object.values(empleados)
    .filter(emp => emp.presencial === 'Yes' && emp.amount && emp.rounding)
    .map(emp => [
      emp.presencial,
      emp.nombre,
      emp.puesto,
      emp.horas,
      emp.amount,
      emp.rounding
    ]);
  
  doc.autoTable({
    head: headers,
    body: data,
    startY: 25 + (lines.length * 5),
    theme: 'grid',
    styles: { fontSize: 12, cellPadding: 2 },
    headStyles: { fillColor: [255, 148, 0], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30 }
    }
  });
  
  doc.save("Calcoin_Report.pdf");
}

function descargarXLS() {
  exportData();
}

function imprimirPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(255, 148, 0);
    doc.text("Calcoin", 105, 15, null, null, "center");

    const totalDistribution = document.getElementById('totalCalculatedDistribution').innerText;
    const formattedDistribution = totalDistribution.replace(/💰/g, 'Total: ')
                                                 .replace(/👤/g, 'Employees: ')
                                                 .replace(/📅/g, 'Week: ')
                                                 .replace(/🥇/g, 'Group 1: ')
                                                 .replace(/🥈/g, 'Group 2: ')
                                                 .replace(/🥉/g, 'Group 3: ')
                                                 .replace(/🎯/g, 'Rounding: ');

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    const lines = doc.splitTextToSize(formattedDistribution, 180);
    doc.text(lines, 14, 25);

    const headers = [["Asset", "Name", "Group", "Workday", "Amount", "Rounding"]];
    const data = Object.values(empleados)
        .filter(emp => emp.presencial === 'Yes' && emp.amount && emp.rounding)
        .map(emp => [
            emp.presencial,
            emp.nombre,
            emp.puesto,
            emp.horas,
            emp.amount,
            emp.rounding
        ]);

    doc.autoTable({
        head: headers,
        body: data,
        startY: 25 + (lines.length * 5),
        theme: 'grid',
        styles: { fontSize: 12, cellPadding: 2 },
        headStyles: { fillColor: [255, 148, 0], textColor: [255, 255, 255] },
        columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 40 },
            2: { cellWidth: 30 },
            3: { cellWidth: 25 },
            4: { cellWidth: 30 },
            5: { cellWidth: 30 }
        }
    });

    const pdfUrl = doc.output('dataurlstring');

    const embed = document.createElement('embed');
    embed.src = pdfUrl;
    embed.type = 'application/pdf';
    embed.style.width = '100%';
    embed.style.height = '100%';
    
    const printWindow = window.open('');
    printWindow.document.body.appendChild(embed);

    printWindow.onload = function() {
        printWindow.print();
    };
}

function compartir() {
  if (navigator.share) {
    navigator.share({
      title: 'Calcoin Report',
      text: 'Check out this Calcoin report!',
      url: window.location.href
    }).then(() => {
      console.log('Thanks for sharing!');
    })
    .catch(console.error);
  } else {
    alert('Web Share API not supported in your browser');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('anadirEmpleado').addEventListener('click', anadirNuevoEmpleado);
  document.getElementById('boteForm').addEventListener('submit', calcularReparto);
  document.getElementById('borrarTodosEmpleados').addEventListener('click', borrarTodosEmpleados);
  document.getElementById('confirmarEliminar').addEventListener('click', confirmarEliminarEmpleado);
  document.getElementById('closePopupEliminar').addEventListener('click', () => {
    document.getElementById('popupEliminarEmpleado').style.display = 'none';
  });
  document.getElementById('cancelarEliminar').addEventListener('click', () => {
    document.getElementById('popupEliminarEmpleado').style.display = 'none';
  });
  document.getElementById('searchInput').addEventListener('input', searchEmployees);
  document.getElementById('importarDatos').addEventListener('click', importData);
  document.getElementById('exportarDatos').addEventListener('click', exportData);
  document.getElementById('descargarPDF').addEventListener('click', descargarPDF);
  document.getElementById('descargarXLS').addEventListener('click', descargarXLS);
  document.getElementById('imprimir').addEventListener('click', imprimirPDF);
  document.getElementById('compartir').addEventListener('click', compartir);
  const toggleButton = document.getElementById('toggleMode');
  if (localStorage.getItem('dark-mode') === 'enabled') {
    document.body.classList.add('dark-mode');
  }
  toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
  });
  actualizarTablaEmpleados();
  sortTable('nombre', true);
});