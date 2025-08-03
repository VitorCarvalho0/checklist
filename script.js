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
Assinatura: ${dados.get("assinatura")}
`;

      const margin = 10;
      let y = 10;
      const lineHeight = 7;
      pdf.setFontSize(12);

      camposTexto.split("\n").forEach((linha) => {
        if (linha.trim() !== "") {
          pdf.text(linha, margin, y);
          y += lineHeight;
        }
      });

      // Salto antes das imagens
      y += 5;
      pdf.text("Fotos do Veículo:", margin, y);
      y += lineHeight;

      const maxWidth = 60;
      const maxHeight = 45;
      const spacing = 5;
      let col = 0;

      for (let i = 1; i <= 6; i++) {
        const input = form.querySelector(`[name="foto${i}"]`);
        if (input.files[0]) {
          const dataURL = await fileToDataURL(input.files[0]);

          if (col === 2) {
            col = 0;
            y += maxHeight + spacing;
          }

          if (y + maxHeight > 280) {
            pdf.addPage();
            y = 10;
          }

          const x = margin + col * (maxWidth + spacing);
          pdf.addImage(dataURL, "JPEG", x, y, maxWidth, maxHeight);
          col++;
        }
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