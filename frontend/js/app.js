/* =========================================================
   RESTORA - JAVASCRIPT PRINCIPAL
========================================================= */


/* =========================================================
   MODULO DE MESAS
========================================================= */

const listaMesas = document.getElementById('listaMesas');

const btnNuevaMesa = document.getElementById('btnNuevaMesa');
const formularioMesa = document.getElementById('formularioMesa');
const formMesa = document.getElementById('formMesa');
const btnCancelarMesa = document.getElementById('btnCancelarMesa');

const numeroMesaInput = document.getElementById('numeroMesa');
const capacidadMesaInput = document.getElementById('capacidadMesa');
const estadoMesaInput = document.getElementById('estadoMesa');

let mesaEditandoId = null;


/* =========================================================
   CARGAR MESAS
========================================================= */

async function cargarMesas() {
  if (!listaMesas) return;

  try {

    const respuesta = await fetch(
      'http://localhost:3000/api/mesas'
    );

    if (!respuesta.ok) {
      throw new Error(
        'No se pudieron obtener las mesas'
      );
    }

    const mesas = await respuesta.json();

    listaMesas.innerHTML = '';

    if (mesas.length === 0) {
      listaMesas.innerHTML =
        '<p>No existen mesas registradas.</p>';

      return;
    }


    mesas.forEach(mesa => {

      const tarjeta =
        document.createElement('div');

      let claseEstado = '';

      if (mesa.estado === 'Disponible') {
        claseEstado = 'available';
      }

      if (mesa.estado === 'Ocupada') {
        claseEstado = 'occupied';
      }

      if (mesa.estado === 'Reservada') {
        claseEstado = 'reserved';
      }


      tarjeta.className =
        `table-card ${claseEstado}`;


      tarjeta.innerHTML = `

        <h3>
          Mesa ${mesa.numero}
        </h3>

        <p>
          Capacidad:
          ${mesa.capacidad} personas
        </p>

        <span>
          ${mesa.estado}
        </span>


        <div class="table-actions">

          <button
            class="edit-button"
            data-id="${mesa.id}"
            data-numero="${mesa.numero}"
            data-capacidad="${mesa.capacidad}"
            data-estado="${mesa.estado}"
          >
            Editar
          </button>


          <button
            class="delete-button"
            data-id="${mesa.id}"
            data-numero="${mesa.numero}"
          >
            Eliminar
          </button>

        </div>

      `;


      listaMesas.appendChild(tarjeta);

    });


    activarBotonesEditar();
    activarBotonesEliminar();


  } catch (error) {

    listaMesas.innerHTML = `
      <p>
        No fue posible cargar las mesas.
      </p>
    `;

    console.error(error);

  }
}


/* =========================================================
   MOSTRAR FORMULARIO NUEVA MESA
========================================================= */

if (
  btnNuevaMesa &&
  formularioMesa
) {

  btnNuevaMesa.addEventListener(
    'click',
    () => {

      mesaEditandoId = null;

      formMesa.reset();

      formularioMesa.classList.remove(
        'hidden'
      );

    }
  );
}


/* =========================================================
   CANCELAR FORMULARIO MESA
========================================================= */

if (
  btnCancelarMesa &&
  formularioMesa
) {

  btnCancelarMesa.addEventListener(
    'click',
    () => {

      mesaEditandoId = null;

      formMesa.reset();

      formularioMesa.classList.add(
        'hidden'
      );

    }
  );
}


/* =========================================================
   CREAR O ACTUALIZAR MESA
========================================================= */

if (formMesa) {

  formMesa.addEventListener(
    'submit',
    async (e) => {

      e.preventDefault();


      const numero =
        parseInt(numeroMesaInput.value);

      const capacidad =
        parseInt(capacidadMesaInput.value);

      const estado =
        estadoMesaInput.value;


      const datosMesa = {
        numero,
        capacidad,
        estado
      };


      try {

        let url =
          'http://localhost:3000/api/mesas';

        let metodo = 'POST';


        if (mesaEditandoId !== null) {

          url =
            `http://localhost:3000/api/mesas/${mesaEditandoId}`;

          metodo = 'PUT';

        }


        const respuesta =
          await fetch(
            url,
            {
              method: metodo,

              headers: {
                'Content-Type':
                  'application/json'
              },

              body:
                JSON.stringify(
                  datosMesa
                )
            }
          );


        const resultado =
          await respuesta.json();


        if (!respuesta.ok) {

          alert(
            resultado.mensaje ||
            'No se pudo guardar la mesa'
          );

          return;
        }


        if (mesaEditandoId !== null) {

          alert(
            'Mesa actualizada correctamente'
          );

        } else {

          alert(
            'Mesa creada correctamente'
          );

        }


        mesaEditandoId = null;

        formMesa.reset();

        formularioMesa.classList.add(
          'hidden'
        );


        await cargarMesas();


      } catch (error) {

        console.error(error);

        alert(
          'Error al conectar con el servidor'
        );

      }

    }
  );
}


/* =========================================================
   EDITAR MESA
========================================================= */

function activarBotonesEditar() {

  const botonesEditar =
    document.querySelectorAll(
      '.edit-button'
    );


  botonesEditar.forEach(
    boton => {

      boton.addEventListener(
        'click',
        () => {

          mesaEditandoId =
            boton.dataset.id;


          numeroMesaInput.value =
            boton.dataset.numero;

          capacidadMesaInput.value =
            boton.dataset.capacidad;

          estadoMesaInput.value =
            boton.dataset.estado;


          formularioMesa.classList.remove(
            'hidden'
          );


          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });

        }
      );

    }
  );
}


/* =========================================================
   ELIMINAR MESA
========================================================= */

function activarBotonesEliminar() {

  const botonesEliminar =
    document.querySelectorAll(
      '.delete-button'
    );


  botonesEliminar.forEach(
    boton => {

      boton.addEventListener(
        'click',
        async () => {

          const id =
            boton.dataset.id;

          const numero =
            boton.dataset.numero;


          const confirmar =
            confirm(
              `¿Deseas eliminar la Mesa ${numero}?`
            );


          if (!confirmar) {
            return;
          }


          try {

            const respuesta =
              await fetch(
                `http://localhost:3000/api/mesas/${id}`,
                {
                  method: 'DELETE'
                }
              );


            const resultado =
              await respuesta.json();


            if (!respuesta.ok) {

              alert(
                resultado.mensaje ||
                'No se pudo eliminar la mesa'
              );

              return;
            }


            alert(
              'Mesa eliminada correctamente'
            );


            await cargarMesas();


          } catch (error) {

            console.error(error);

            alert(
              'Error al conectar con el servidor'
            );

          }

        }
      );

    }
  );
}


/* =========================================================
   INICIAR MODULO MESAS
========================================================= */

if (listaMesas) {
  cargarMesas();
}



/* =========================================================
   MODULO DE RESERVAS
========================================================= */

const listaReservas =
  document.getElementById(
    'listaReservas'
  );

const btnNuevaReserva =
  document.getElementById(
    'btnNuevaReserva'
  );

const formularioReserva =
  document.getElementById(
    'formularioReserva'
  );

const formReserva =
  document.getElementById(
    'formReserva'
  );

const btnCancelarReserva =
  document.getElementById(
    'btnCancelarReserva'
  );


const clienteReservaInput =
  document.getElementById(
    'clienteReserva'
  );

const telefonoReservaInput =
  document.getElementById(
    'telefonoReserva'
  );

const fechaReservaInput =
  document.getElementById(
    'fechaReserva'
  );

const horaReservaInput =
  document.getElementById(
    'horaReserva'
  );

const personasReservaInput =
  document.getElementById(
    'personasReserva'
  );

const mesaReservaInput =
  document.getElementById(
    'mesaReserva'
  );

const estadoReservaInput =
  document.getElementById(
    'estadoReserva'
  );


let reservaEditandoId = null;


/* =========================================================
   CARGAR MESAS DISPONIBLES
   PARA EL FORMULARIO DE RESERVAS
========================================================= */

async function cargarMesasReserva(
  mesaActualId = null
) {

  if (!mesaReservaInput) return;


  try {

    const respuesta =
      await fetch(
        'http://localhost:3000/api/mesas'
      );


    if (!respuesta.ok) {

      throw new Error(
        'No fue posible obtener las mesas'
      );

    }


    const mesas =
      await respuesta.json();


    mesaReservaInput.innerHTML = `
      <option value="">
        Seleccione una mesa
      </option>
    `;


    mesas.forEach(mesa => {

      /*
        Para una reserva nueva:
        solo mostramos mesas disponibles.

        Para editar una reserva:
        también permitimos mostrar
        la mesa que ya pertenece
        a esa reserva.
      */

      const esMesaActual =
        Number(mesa.id) ===
        Number(mesaActualId);


      if (
        mesa.estado !== 'Disponible' &&
        !esMesaActual
      ) {
        return;
      }


      const opcion =
        document.createElement(
          'option'
        );


      opcion.value =
        mesa.id;


      opcion.textContent =
        `Mesa ${mesa.numero} - ${mesa.capacidad} personas`;


      if (esMesaActual) {

        opcion.selected = true;

      }


      mesaReservaInput.appendChild(
        opcion
      );

    });


  } catch (error) {

    console.error(error);

  }
}


/* =========================================================
   CARGAR RESERVAS
========================================================= */

async function cargarReservas() {

  if (!listaReservas) return;


  try {

    const respuesta =
      await fetch(
        'http://localhost:3000/api/reservas'
      );


    if (!respuesta.ok) {

      throw new Error(
        'No fue posible obtener las reservas'
      );

    }


    const reservas =
      await respuesta.json();


    listaReservas.innerHTML = '';


    if (reservas.length === 0) {

      listaReservas.innerHTML = `
        <p>
          No existen reservas registradas.
        </p>
      `;

      return;
    }


    reservas.forEach(reserva => {

      const tarjeta =
        document.createElement(
          'div'
        );


      tarjeta.className =
        'reservation-card';


      const fecha =
        new Date(
          reserva.fecha
        ).toLocaleDateString(
          'es-DO'
        );


      let claseEstado =
        'reservation-status';


      if (
        reserva.estado === 'Confirmada'
      ) {

        claseEstado +=
          ' reservation-confirmed';

      }


      if (
        reserva.estado === 'Pendiente'
      ) {

        claseEstado +=
          ' reservation-pending';

      }


      if (
        reserva.estado === 'Cancelada'
      ) {

        claseEstado +=
          ' reservation-cancelled';

      }


      tarjeta.innerHTML = `

        <div class="reservation-header">

          <div>

            <h3>
              ${reserva.cliente}
            </h3>

            <p>
              ${reserva.telefono}
            </p>

          </div>


          <span class="${claseEstado}">
            ${reserva.estado}
          </span>

        </div>


        <div class="reservation-info">

          <p>
            <strong>
              Fecha:
            </strong>

            ${fecha}
          </p>


          <p>
            <strong>
              Hora:
            </strong>

            ${reserva.hora}
          </p>


          <p>
            <strong>
              Personas:
            </strong>

            ${reserva.personas}
          </p>


          <p>
            <strong>
              Mesa:
            </strong>

            ${reserva.mesa_numero}
          </p>

        </div>


        <div class="table-actions">

          <button
            class="edit-button edit-reserva"
            data-id="${reserva.id}"
            data-cliente="${reserva.cliente}"
            data-telefono="${reserva.telefono}"
            data-fecha="${reserva.fecha}"
            data-hora="${reserva.hora}"
            data-personas="${reserva.personas}"
            data-mesa="${reserva.mesa_id}"
            data-estado="${reserva.estado}"
          >
            Editar
          </button>


          <button
            class="delete-button delete-reserva"
            data-id="${reserva.id}"
          >
            Eliminar
          </button>

        </div>

      `;


      listaReservas.appendChild(
        tarjeta
      );

    });


    activarEditarReservas();

    activarEliminarReservas();


  } catch (error) {

    listaReservas.innerHTML = `
      <p>
        No fue posible cargar las reservas.
      </p>
    `;


    console.error(error);

  }
}


/* =========================================================
   NUEVA RESERVA
========================================================= */

if (
  btnNuevaReserva &&
  formularioReserva
) {

  btnNuevaReserva.addEventListener(
    'click',
    async () => {

      reservaEditandoId = null;

      formReserva.reset();


      await cargarMesasReserva();


      formularioReserva.classList.remove(
        'hidden'
      );

    }
  );
}


/* =========================================================
   CANCELAR RESERVA
========================================================= */

if (
  btnCancelarReserva &&
  formularioReserva
) {

  btnCancelarReserva.addEventListener(
    'click',
    () => {

      reservaEditandoId = null;

      formReserva.reset();

      formularioReserva.classList.add(
        'hidden'
      );

    }
  );
}


/* =========================================================
   CREAR O ACTUALIZAR RESERVA
========================================================= */

if (formReserva) {

  formReserva.addEventListener(
    'submit',
    async (e) => {

      e.preventDefault();


      const datosReserva = {

        cliente:
          clienteReservaInput.value.trim(),

        telefono:
          telefonoReservaInput.value.trim(),

        fecha:
          fechaReservaInput.value,

        hora:
          horaReservaInput.value,

        personas:
          parseInt(
            personasReservaInput.value
          ),

        mesa_id:
          parseInt(
            mesaReservaInput.value
          ),

        estado:
          estadoReservaInput.value

      };


      let url =
        'http://localhost:3000/api/reservas';


      let metodo =
        'POST';


      if (
        reservaEditandoId !== null
      ) {

        url =
          `http://localhost:3000/api/reservas/${reservaEditandoId}`;

        metodo =
          'PUT';

      }


      try {

        const respuesta =
          await fetch(
            url,
            {

              method:
                metodo,

              headers: {
                'Content-Type':
                  'application/json'
              },

              body:
                JSON.stringify(
                  datosReserva
                )

            }
          );


        const resultado =
          await respuesta.json();


        if (!respuesta.ok) {

          alert(
            resultado.mensaje ||
            'No se pudo guardar la reserva'
          );

          return;
        }


        if (
          reservaEditandoId !== null
        ) {

          alert(
            'Reserva actualizada correctamente'
          );

        } else {

          alert(
            'Reserva creada correctamente'
          );

        }


        reservaEditandoId =
          null;


        formReserva.reset();


        formularioReserva.classList.add(
          'hidden'
        );


        /*
          Recargamos las reservas
          y las mesas disponibles.

          Esto permite que una mesa
          confirmada desaparezca
          inmediatamente del selector.
        */

        await cargarReservas();

        await cargarMesasReserva();


      } catch (error) {

        console.error(error);


        alert(
          'Error al conectar con el servidor'
        );

      }

    }
  );
}


/* =========================================================
   EDITAR RESERVA
========================================================= */

function activarEditarReservas() {

  const botones =
    document.querySelectorAll(
      '.edit-reserva'
    );


  botones.forEach(
    boton => {

      boton.addEventListener(
        'click',
        async () => {

          reservaEditandoId =
            boton.dataset.id;


          clienteReservaInput.value =
            boton.dataset.cliente;


          telefonoReservaInput.value =
            boton.dataset.telefono;


          personasReservaInput.value =
            boton.dataset.personas;


          estadoReservaInput.value =
            boton.dataset.estado;


          fechaReservaInput.value =
            boton.dataset.fecha
              .split('T')[0];


          horaReservaInput.value =
            boton.dataset.hora
              .substring(0, 5);


          /*
            Primero cargamos las mesas.

            Permitimos mostrar la mesa
            actual aunque esté marcada
            como Reservada.
          */

          await cargarMesasReserva(
            boton.dataset.mesa
          );


          mesaReservaInput.value =
            boton.dataset.mesa;


          formularioReserva.classList.remove(
            'hidden'
          );


          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });

        }
      );

    }
  );
}


/* =========================================================
   ELIMINAR RESERVA
========================================================= */

function activarEliminarReservas() {

  const botones =
    document.querySelectorAll(
      '.delete-reserva'
    );


  botones.forEach(
    boton => {

      boton.addEventListener(
        'click',
        async () => {

          const confirmar =
            confirm(
              '¿Deseas eliminar esta reserva?'
            );


          if (!confirmar) {
            return;
          }


          try {

            const respuesta =
              await fetch(
                `http://localhost:3000/api/reservas/${boton.dataset.id}`,
                {
                  method:
                    'DELETE'
                }
              );


            const resultado =
              await respuesta.json();


            if (!respuesta.ok) {

              alert(
                resultado.mensaje ||
                'No se pudo eliminar la reserva'
              );

              return;
            }


            alert(
              'Reserva eliminada correctamente'
            );


            /*
              Cuando eliminamos una reserva,
              el backend libera la mesa.

              Recargamos las reservas y
              las mesas disponibles.
            */

            await cargarReservas();

            await cargarMesasReserva();


          } catch (error) {

            console.error(error);


            alert(
              'Error al conectar con el servidor'
            );

          }

        }
      );

    }
  );
}


/* =========================================================
   INICIAR MODULO RESERVAS
========================================================= */

if (listaReservas) {

  cargarMesasReserva();

  cargarReservas();

}