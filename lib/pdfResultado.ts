// PDF de resultados por CAPTURA DE BLOQUES (Opción A).
// Cada bloque marcado con [data-pdf-block] (encabezado, cada tarjeta de pregunta,
// cada card de resolución, etc.) se captura por separado con html2canvas y se
// agrega al PDF controlando un cursor vertical: si un bloque no entra en lo que
// queda de la página, se mueve ENTERO a la siguiente. Así ninguna tarjeta se
// parte y no hay contenido duplicado. Diseño intacto.

export async function descargarResultadoPDF(
  el: HTMLElement,
  filename: string
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const scale = 2;
  const bloques = Array.from(el.querySelectorAll<HTMLElement>("[data-pdf-block]"));
  const targets = bloques.length > 0 ? bloques : [el];

  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const gap = 3; // separación entre bloques (mm)
  const tol = 1; // tolerancia de redondeo (mm) para no saltar de página de más
  const imgW = pageW - margin * 2;
  const usableH = pageH - margin * 2;

  let cursorY = margin;
  let primera = true;

  for (const b of targets) {
    // Salto de página forzado ANTES de este bloque (p.ej. la resolución del caso),
    // para que el título no quede huérfano al pie y arranque junto a su contenido.
    const saltoAntes = b.hasAttribute("data-pdf-pagebreak-before");

    const canvas = await html2canvas(b, {
      scale,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
    const mmPerPx = imgW / canvas.width;
    const hMm = canvas.height * mmPerPx;

    if (hMm <= usableH) {
      if (!primera && saltoAntes && cursorY > margin) {
        // abrir página nueva para este bloque (y los que siguen)
        pdf.addPage();
        cursorY = margin;
      } else if (!primera && cursorY + hMm > pageH - margin + tol) {
        // ¿entra en lo que queda de la página? (con tolerancia de redondeo)
        pdf.addPage();
        cursorY = margin;
      }
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, cursorY, imgW, hMm);
      cursorY += hMm + gap;
      primera = false;
    } else {
      // Bloque más alto que una página entera (raro): se parte SOLO este bloque.
      if (!primera) { pdf.addPage(); }
      let startPx = 0;
      const pagePx = Math.floor(usableH / mmPerPx);
      let first = true;
      let ultimoSliceMm = 0;
      while (startPx < canvas.height - 1) {
        const sliceH = Math.min(pagePx, canvas.height - startPx);
        const tmp = document.createElement("canvas");
        tmp.width = canvas.width;
        tmp.height = sliceH;
        const ctx = tmp.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, tmp.width, sliceH);
          ctx.drawImage(canvas, 0, startPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        }
        if (!first) pdf.addPage();
        pdf.addImage(tmp.toDataURL("image/png"), "PNG", margin, margin, imgW, sliceH * mmPerPx);
        ultimoSliceMm = sliceH * mmPerPx;
        startPx += sliceH;
        first = false;
      }
      // el siguiente bloque continúa debajo del último tramo (sin página en blanco)
      cursorY = margin + ultimoSliceMm + gap;
      primera = false;
    }
  }

  pdf.save(filename);
}
