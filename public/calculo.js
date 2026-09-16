const campoDias = document.getElementById("dias");
const campoTotal = document.getElementById("total");

function mostrarTotal() {
  const dias = Number(campoDias.value);
  const total = dias * window.precoDiaria;

  campoTotal.textContent = total.toFixed(2).replace(".", ",");
}

campoDias.addEventListener("input", mostrarTotal);
mostrarTotal();
