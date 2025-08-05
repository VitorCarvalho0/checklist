async function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const form = document.getElementById("checklist-form");
  const dados = new FormData(form);

  const camposTexto = `
Checklist Veicular

Cliente: ${dados.get("cliente")}
Telefone: ${dados.get("telefone")}
Placa: ${dados.get("placa")}
KM: ${dados.get("km")}
Ano: ${dados.get("ano")}
Data: ${dados.get("data")}
Observações: ${dados.get("observacoes")}
`;

  const margin = 15;
  let y = 20;
  const lineHeight = 9;
  pdf.setFontSize(13);

  // Texto principal
  camposTexto.trim().split("\n").forEach((linha) => {
    if (linha.trim() !== "") {
      pdf.text(linha, margin, y);
      y += lineHeight;
    }
  });

  // Espaço extra antes das imagens
  y += 10;
  pdf.setFontSize(12);
  pdf.text("Fotos do Veículo:", margin, y);
  y += lineHeight;

  const maxWidth = 85;
  const maxHeight = 65;
  const spacing = 10;
  let col = 0;

  for (let i = 1; i <= 6; i++) {
    const input = form.querySelector(`[name="foto${i}"]`);
    if (input?.files[0]) {
      const dataURL = await fileToDataURL(input.files[0]);

      if (y + maxHeight > pdf.internal.pageSize.getHeight() - 30) {
        pdf.addPage();
        y = 20;
        pdf.text("Fotos do Veículo (continuação):", margin, y);
        y += lineHeight;
      }

      const x = margin + col * (maxWidth + spacing);
      pdf.addImage(dataURL, "JPEG", x, y, maxWidth, maxHeight);

      col++;
      if (col === 2) {
        col = 0;
        y += maxHeight + spacing;
      }
    }
  }

  // Assinatura
  if (signaturePad && !signaturePad.isEmpty()) {
    if (y + 70 > pdf.internal.pageSize.getHeight() - 20) {
      pdf.addPage();
      y = 20;
    } else {
      y += 15;
    }

    pdf.setFontSize(12);
    pdf.text("Assinatura do Cliente:", margin, y);
    y += 5;

    const assinaturaImg = signaturePad.toDataURL("image/png");
    pdf.addImage(assinaturaImg, "PNG", margin, y + 5, 100, 50);
  }

  pdf.save("checklist-veicular.pdf");
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

let canvas, signaturePad;

window.addEventListener("load", () => {
  canvas = document.getElementById("assinatura");
  if (canvas) {
    signaturePad = new SignaturePad(canvas);
  }
});

function limparAssinatura() {
  if (signaturePad) {
    signaturePad.clear();
  }
}