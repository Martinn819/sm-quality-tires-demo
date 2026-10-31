/* SM Quality Tires · Demo conceptual v0.1
   JavaScript sin frameworks. No guarda ni envía datos. No usa cookies ni analítica. */

/* ============================================================
   CONFIGURACIÓN CENTRAL
   Cambia aquí los datos del negocio y el modo demostración.
   ============================================================ */
const CONFIG = {
  nombre: "SM Quality Tires",
  whatsapp: "593980099210",          // formato internacional, solo dígitos
  numeroVisible: "098 009 9210",
  direccion: "Av. Río Coca E10-100, Isla Pinzón, 170138 Quito, Ecuador",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=" +
           encodeURIComponent("Av. Río Coca E10-100, Isla Pinzón, 170138 Quito, Ecuador"),
  fechaConsulta: "29 de octubre de 2026",
  horarios: [
    { dia: "Lunes a viernes", horas: "09:00–17:30" },
    { dia: "Sábado", horas: "09:00–15:00" },
    { dia: "Domingo", horas: "Cerrado" }
  ],
  modoDemo: true                      // true: mensajes con prefijo [DEMO]
};

/* Mensajes de consulta rápida (tarjetas y botones de WhatsApp) */
const MENSAJES = {
  general: "Hola, quisiera hacer una consulta.",
  llantas: "Hola, quisiera consultar sobre llantas.",
  aceites: "Hola, quisiera consultar sobre aceites y lubricantes.",
  aros: "Hola, quisiera consultar sobre aros.",
  baterias: "Hola, quisiera consultar sobre baterías.",
  aditivos: "Hola, quisiera consultar sobre aditivos.",
  promos: "Hola, quisiera saber si tienen promociones vigentes y cuáles son sus condiciones."
};

const LIMITES = {
  ancho: [115, 355],
  perfil: [25, 85],
  rin: [12, 24],
  anio: [1980, 2027],
  comentario: 200
};

/* ============================================================
   UTILIDADES
   ============================================================ */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const prefijo = () => (CONFIG.modoDemo ? "[DEMO] " : "");
const limpiar = (v) => (v || "").replace(/\s+/g, " ").trim();
const reducirMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function irA(el) {
  el.scrollIntoView({ behavior: reducirMovimiento() ? "auto" : "smooth", block: "start" });
}

function enlaceWhatsApp(mensaje) {
  return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(mensaje);
}

/* ============================================================
   APLICAR CONFIGURACIÓN AL DOCUMENTO
   ============================================================ */
function aplicarConfig() {
  $$('[data-cfg="fecha"]').forEach((el) => (el.textContent = CONFIG.fechaConsulta));
  $$('[data-cfg="direccion"]').forEach((el) => (el.textContent = CONFIG.direccion));
  $$('[data-cfg="numero"]').forEach((el) => (el.textContent = CONFIG.numeroVisible));
  $$("[data-cfg-tel]").forEach((el) => (el.href = "tel:+" + CONFIG.whatsapp));
  $$("[data-cfg-maps]").forEach((el) => (el.href = CONFIG.mapsUrl));

  const horas = $("#hours-list");
  if (horas) {
    horas.textContent = "";
    CONFIG.horarios.forEach((h) => {
      const li = document.createElement("li");
      const a = document.createElement("span");
      const b = document.createElement("span");
      a.textContent = h.dia;
      b.textContent = h.horas;
      li.append(a, b);
      horas.append(li);
    });
  }
  const nota = $("#wa-demo-note");
  if (nota) nota.hidden = !CONFIG.modoDemo;
}

/* ============================================================
   MENÚ MÓVIL
   ============================================================ */
function iniciarMenu() {
  const btn = $("#menu-btn");
  const nav = $("#site-nav");
  const texto = $("#menu-btn-text");
  const escritorio = window.matchMedia("(min-width: 62rem)");

  function abrir(estado, devolverFoco) {
    btn.setAttribute("aria-expanded", String(estado));
    nav.classList.toggle("is-open", estado);
    texto.textContent = estado ? "Cerrar" : "Menú";
    if (estado) {
      const primero = $("a, button", nav);
      if (primero) primero.focus();
    } else if (devolverFoco) {
      btn.focus();
    }
  }

  btn.addEventListener("click", () => abrir(btn.getAttribute("aria-expanded") !== "true", true));

  // Cierra al pulsar un enlace
  $$("a", nav).forEach((a) => a.addEventListener("click", () => {
    if (!escritorio.matches) abrir(false, false);
  }));
  // Cierra con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true" && !$("#wa-dialog").open) {
      abrir(false, true);
    }
  });
  // Cierra si el foco sale del menú
  nav.addEventListener("focusout", (e) => {
    if (escritorio.matches || btn.getAttribute("aria-expanded") !== "true") return;
    const destino = e.relatedTarget;
    if (destino && !nav.contains(destino) && destino !== btn) abrir(false, false);
  });
  // Al pasar a escritorio, reinicia el estado
  escritorio.addEventListener("change", () => {
    btn.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    texto.textContent = "Menú";
  });
}

/* ============================================================
   VISTA PREVIA DE WHATSAPP + COPIAR
   ============================================================ */
let disparador = null;

function copiarTexto(texto) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(texto);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.append(ta);
    ta.select();
    try {
      document.execCommand("copy") ? resolve() : reject(new Error("copy"));
    } catch (err) {
      reject(err);
    } finally {
      ta.remove();
    }
  });
}

function copiarConAviso(texto, destinoEstado) {
  copiarTexto(texto).then(
    () => (destinoEstado.textContent = "Mensaje copiado."),
    () => (destinoEstado.textContent = "No se pudo copiar automáticamente. Selecciona el texto y cópialo manualmente.")
  );
}

function iniciarDialogo() {
  const dlg = $("#wa-dialog");
  const area = $("#wa-text");
  const abrir = $("#wa-open");
  const estado = $("#wa-status");

  window.mostrarVistaPrevia = function (mensaje, origen) {
    disparador = origen || document.activeElement;
    area.value = mensaje;
    abrir.href = enlaceWhatsApp(mensaje);
    estado.textContent = "";
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
    $("#wa-close").focus();
  };

  function cerrar() {
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
    if (disparador && document.contains(disparador)) disparador.focus();
  }

  $("#wa-close").addEventListener("click", cerrar);
  $("#wa-copy").addEventListener("click", () => copiarConAviso(area.value, estado));
  dlg.addEventListener("click", (e) => { if (e.target === dlg) cerrar(); });
  dlg.addEventListener("cancel", () => { setTimeout(() => { if (disparador && document.contains(disparador)) disparador.focus(); }, 0); });
  abrir.addEventListener("click", () => {
    estado.textContent = "Se abrió WhatsApp en una pestaña nueva. El mensaje no se envía hasta que lo envíes tú.";
  });

  // Botones de consulta rápida
  $$("[data-wa-key]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const texto = MENSAJES[btn.dataset.waKey];
      if (texto) window.mostrarVistaPrevia(prefijo() + texto, btn);
    });
  });
}

/* ============================================================
   VALIDACIÓN COMPARTIDA
   ============================================================ */
function mostrarErrores(form, resumen, errores) {
  // Limpia errores previos
  $$(".field-error", form).forEach((p) => { p.hidden = true; p.textContent = ""; });
  $$('[aria-invalid="true"]', form).forEach((i) => i.removeAttribute("aria-invalid"));
  resumen.hidden = true;
  resumen.textContent = "";

  if (!errores.length) return true;

  errores.forEach((e) => {
    const campo = document.getElementById(e.id);
    const msg = document.getElementById(e.id + "-error");
    if (campo) campo.setAttribute("aria-invalid", "true");
    if (msg) { msg.textContent = e.mensaje; msg.hidden = false; }
  });

  const titulo = document.createElement("p");
  titulo.textContent = errores.length === 1 ? "Hay 1 campo por corregir:" : "Hay " + errores.length + " campos por corregir:";
  const ul = document.createElement("ul");
  errores.forEach((e) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#" + e.id;
    a.textContent = e.mensaje;
    a.addEventListener("click", (ev) => {
      ev.preventDefault();
      const c = document.getElementById(e.id);
      if (c) c.focus();
    });
    li.append(a);
    ul.append(li);
  });
  resumen.append(titulo, ul);
  resumen.hidden = false;
  resumen.focus();
  return false;
}

function enteroEnRango(valor, [min, max]) {
  if (!/^\d+$/.test(valor)) return null;
  const n = Number(valor);
  return n >= min && n <= max ? n : null;
}

function contadorCaracteres() {
  $$("[data-count-for]").forEach((span) => {
    const campo = document.getElementById(span.dataset.countFor);
    const act = () => (span.textContent = String(campo.value.length));
    campo.addEventListener("input", act);
    act();
  });
}

/* ============================================================
   BUSCADOR CONCEPTUAL DE LLANTAS
   ============================================================ */
function iniciarBuscador() {
  const form = $("#tire-form");
  const resumen = $("#tire-summary");
  const estado = $("#tire-status");
  const f = {
    ancho: $("#t-ancho"), perfil: $("#t-perfil"), rin: $("#t-rin"), completa: $("#t-completa"),
    marca: $("#t-marca"), vehiculo: $("#t-vehiculo"), anio: $("#t-anio"), comentario: $("#t-comentario")
  };

  // Devuelve { errores, mensaje }
  function evaluar() {
    const errores = [];
    let medida = "";
    const completa = limpiar(f.completa.value);
    const hayTres = [f.ancho, f.perfil, f.rin].some((c) => limpiar(c.value));
    const vehiculo = limpiar(f.vehiculo.value);
    const anio = limpiar(f.anio.value);

    if (completa) {
      const m = completa.match(/^(\d{3})\s*\/\s*(\d{2})\s*(?:R|-)?\s*(\d{2})$/i);
      if (!m) {
        errores.push({ id: "t-completa", mensaje: "Escribe la medida completa así: 205/55 R16." });
      } else {
        const [a, p, r] = [Number(m[1]), Number(m[2]), Number(m[3])];
        const fuera = [];
        if (a < LIMITES.ancho[0] || a > LIMITES.ancho[1]) fuera.push("ancho entre 115 y 355");
        if (p < LIMITES.perfil[0] || p > LIMITES.perfil[1]) fuera.push("perfil entre 25 y 85");
        if (r < LIMITES.rin[0] || r > LIMITES.rin[1]) fuera.push("rin entre 12 y 24");
        if (fuera.length) errores.push({ id: "t-completa", mensaje: "Revisa la medida: " + fuera.join(", ") + "." });
        else medida = a + "/" + p + " R" + r;
      }
    } else if (hayTres) {
      const a = enteroEnRango(limpiar(f.ancho.value), LIMITES.ancho);
      const p = enteroEnRango(limpiar(f.perfil.value), LIMITES.perfil);
      const r = enteroEnRango(limpiar(f.rin.value), LIMITES.rin);
      if (a === null) errores.push({ id: "t-ancho", mensaje: "El ancho debe ser un número entre 115 y 355." });
      if (p === null) errores.push({ id: "t-perfil", mensaje: "El perfil debe ser un número entre 25 y 85." });
      if (r === null) errores.push({ id: "t-rin", mensaje: "El rin debe ser un número entre 12 y 24." });
      if (a !== null && p !== null && r !== null) medida = a + "/" + p + " R" + r;
    } else if (!vehiculo) {
      errores.push({ id: "t-completa", mensaje: "Indica la medida completa o los datos de tu vehículo." });
    }

    if (anio && enteroEnRango(anio, LIMITES.anio) === null) {
      errores.push({ id: "t-anio", mensaje: "El año debe estar entre 1980 y 2027." });
    }
    if (f.comentario.value.length > LIMITES.comentario) {
      errores.push({ id: "t-comentario", mensaje: "El comentario admite hasta 200 caracteres." });
    }

    const vehiculoTxt = vehiculo ? vehiculo + (anio && !errores.some((e) => e.id === "t-anio") ? " (" + anio + ")" : "") : "No indicado";
    const mensaje = [
      prefijo() + "Hola, quisiera consultar disponibilidad y precio de llantas.",
      "",
      "Medida: " + (medida || "No indicada") + ".",
      "Marca de preferencia: " + (limpiar(f.marca.value) || "Sin preferencia") + ".",
      "Vehículo: " + vehiculoTxt + ".",
      "Comentario: " + (limpiar(f.comentario.value) || "-") + "."
    ].join("\n");
    return { errores, mensaje };
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    estado.textContent = "";
    const { errores, mensaje } = evaluar();
    if (mostrarErrores(form, resumen, errores)) {
      window.mostrarVistaPrevia(mensaje, form.querySelector('[type="submit"]'));
    }
  });

  $('[data-copy-form="tire"]').addEventListener("click", () => {
    estado.textContent = "";
    const { errores, mensaje } = evaluar();
    if (mostrarErrores(form, resumen, errores)) copiarConAviso(mensaje, estado);
  });

  // Medidas observadas (chips)
  const chips = $$(".chip");
  const estadoChips = $("#chips-status");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const m = chip.dataset.medida.match(/^(\d{3})\/(\d{2}) R(\d{2})$/);
      if (!m) return;
      f.ancho.value = m[1];
      f.perfil.value = m[2];
      f.rin.value = m[3];
      f.completa.value = chip.dataset.medida;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      mostrarErrores(form, resumen, []);
      estadoChips.textContent = "Medida " + chip.dataset.medida + " cargada en el buscador. Pulsa «Preparar consulta por WhatsApp» para revisar el mensaje.";
      irA($("#llantas"));
    });
  });

  // Si se editan los campos, se limpia la selección de chips y se mantiene coherente la medida completa
  [f.ancho, f.perfil, f.rin].forEach((c) => c.addEventListener("input", () => {
    f.completa.value = "";
    chips.forEach((x) => x.setAttribute("aria-pressed", "false"));
  }));
  f.completa.addEventListener("input", () => chips.forEach((x) => x.setAttribute("aria-pressed", "false")));
}

/* ============================================================
   SOLICITUD DE SERVICIO
   ============================================================ */
function iniciarSolicitud() {
  const form = $("#service-form");
  const resumen = $("#service-summary");
  const estado = $("#service-status");
  const f = {
    nombre: $("#s-nombre"), servicio: $("#s-servicio"), vehiculo: $("#s-vehiculo"), anio: $("#s-anio"),
    fecha: $("#s-fecha"), horario: $("#s-horario"), mensaje: $("#s-mensaje")
  };

  function hoyLocal() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
  }
  f.fecha.min = hoyLocal();

  function formatearFecha(iso) {
    const [y, m, d] = iso.split("-");
    return d + "/" + m + "/" + y;
  }

  function evaluar() {
    const errores = [];
    const nombre = limpiar(f.nombre.value);
    const vehiculo = limpiar(f.vehiculo.value);
    const anio = limpiar(f.anio.value);

    if (!nombre) errores.push({ id: "s-nombre", mensaje: "Escribe tu nombre." });
    if (!f.servicio.value) errores.push({ id: "s-servicio", mensaje: "Selecciona el servicio requerido." });
    if (!vehiculo) errores.push({ id: "s-vehiculo", mensaje: "Indica la marca y el modelo del vehículo." });
    if (anio && enteroEnRango(anio, LIMITES.anio) === null) errores.push({ id: "s-anio", mensaje: "El año debe estar entre 1980 y 2027." });
    if (f.fecha.value && f.fecha.value < hoyLocal()) errores.push({ id: "s-fecha", mensaje: "La fecha preferida no puede ser anterior a hoy." });
    if (f.mensaje.value.length > LIMITES.comentario) errores.push({ id: "s-mensaje", mensaje: "El mensaje admite hasta 200 caracteres." });

    const veh = vehiculo + (anio && !errores.some((e) => e.id === "s-anio") ? " (" + anio + ")" : "");
    const lineas = [
      prefijo() + "Hola, quisiera solicitar una cita para: " + f.servicio.value + ".",
      "",
      "Vehículo: " + (veh || "No indicado") + ".",
      "Fecha preferida: " + (f.fecha.value ? formatearFecha(f.fecha.value) : "Sin preferencia") + ".",
      "Horario preferido: " + (f.horario.value || "Sin preferencia") + ".",
      "Nombre: " + nombre + "."
    ];
    const extra = limpiar(f.mensaje.value);
    if (extra) lineas.push("Mensaje: " + extra);
    lineas.push("", "Entiendo que la cita queda sujeta a confirmación.");
    return { errores, mensaje: lineas.join("\n") };
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    estado.textContent = "";
    const { errores, mensaje } = evaluar();
    if (mostrarErrores(form, resumen, errores)) {
      window.mostrarVistaPrevia(mensaje, form.querySelector('[type="submit"]'));
    }
  });

  $('[data-copy-form="service"]').addEventListener("click", () => {
    estado.textContent = "";
    const { errores, mensaje } = evaluar();
    if (mostrarErrores(form, resumen, errores)) copiarConAviso(mensaje, estado);
  });

  // Botones "Solicitar cita" de las tarjetas de servicio
  $$("[data-service]").forEach((btn) => {
    btn.addEventListener("click", () => {
      f.servicio.value = btn.dataset.service;
      irA($("#cita"));
      setTimeout(() => f.nombre.focus({ preventScroll: true }), reducirMovimiento() ? 0 : 450);
    });
  });
}

/* ============================================================
   INICIO
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  aplicarConfig();
  iniciarMenu();
  iniciarDialogo();
  contadorCaracteres();
  iniciarBuscador();
  iniciarSolicitud();
});
