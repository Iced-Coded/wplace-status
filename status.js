function updateStatus() {
  fetch("status.json?cache=" + Date.now())
    .then(res => {
      if (!res.ok) {
        throw new Error("HTTP error, status = " + res.status);
      }
      return res.json();
    })
    .then(data => {
      document.querySelector("#last-checked").textContent =
        new Date(data.last_checked).toLocaleString();

      function updateLabel(id, status, latency) {
        const el = document.querySelector(id);
        el.classList.remove("bg-success", "bg-danger", "bg-warning");

        if (status === "up") {
          if (latency !== null && latency > 3500) {
            el.classList.add("bg-warning");
            el.textContent = `High latency (${latency} ms)`;
          } else {
            el.classList.add("bg-success");
            el.textContent = "Up";
          }
        } else {
          el.classList.add("bg-danger");
          el.textContent = "Down";
        }
      }

      const front = data.services.frontend;
      const back = data.services.backend;
      const draw = data.services.tiles;
      const map = data.services.maps;

      updateLabel("#front-label", front.status, front.latency_ms);
      updateLabel("#back-label", back.status, back.latency_ms);
      updateLabel("#draw-label", draw.status, draw.latency_ms);
      updateLabel("#map-label", map.status, map.latency_ms);

      const statusText = document.querySelector("#status");
      if (front.status === "up" && back.status === "up" && draw.status === "up" && map.status === "up") {
        statusText.textContent = "All systems are up";
        statusText.className = "text-success";
      } else if (front.status === "down" && back.status === "down" && draw.status === "down" && map.status === "down") {
        statusText.textContent = "All systems are down";
        statusText.className = "text-danger";
      } else {
        statusText.textContent = "Some systems are experiencing issues";
        statusText.className = "text-warning";
      }
    })
    .catch(err => {
      console.error("Status check failed:", err);

      document.querySelector("#last-checked").textContent = "Error";

      const statusText = document.querySelector("#status");
      statusText.textContent = "Unable to determine system status";
      statusText.className = "text-danger";

      ["#front-label", "#back-label", "#draw-label", "#map-label"].forEach(id => {
        const el = document.querySelector(id);
        el.classList.remove("bg-success", "bg-danger", "bg-warning");
        el.classList.add("bg-warning");
        el.textContent = "Down";
      });
    });
}

updateStatus();
setInterval(updateStatus, 2 * 60 * 1000);
