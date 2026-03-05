(function () {
  const defaultCenter = [13.7, -89.2];
  const defaultZoom = 8;

  const map = L.map("map", {
    center: defaultCenter,
    zoom: defaultZoom,
    zoomControl: true
  });

  L.control.scale({ imperial: false }).addTo(map);

  const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  const layerControl = L.control.layers({}, {}, { collapsed: false }).addTo(map);
  layerControl.addBaseLayer(osmLayer, "OpenStreetMap");

  let activeBaseLayer = osmLayer;
  let googleLayersAdded = false;

  const hasGoogleKey = typeof window.GOOGLE_MAPS_API_KEY === "string" && window.GOOGLE_MAPS_API_KEY.trim().length > 0;
  const googleWarning = document.getElementById("google-warning");

  if (hasGoogleKey && L.gridLayer && typeof L.gridLayer.googleMutant === "function") {
    const googleRoadmap = L.gridLayer.googleMutant({
      type: "roadmap"
    });
    const googleSatellite = L.gridLayer.googleMutant({
      type: "satellite"
    });

    layerControl.addBaseLayer(googleRoadmap, "Google Roadmap");
    layerControl.addBaseLayer(googleSatellite, "Google Satellite");

    googleRoadmap.addTo(map);
    activeBaseLayer = googleRoadmap;
    googleLayersAdded = true;
  }

  if (!googleLayersAdded) {
    osmLayer.addTo(map);
    googleWarning.classList.remove("hidden");
  }

  const markers = [];
  let markerGroup = null;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatEstudios(estudios) {
    return escapeHtml(estudios).replace(/\r?\n/g, "<br>");
  }

  function createPopupHtml(properties) {
    const playa = escapeHtml(properties.Playa || "Sin nombre");
    const lat = escapeHtml(properties.Latitud ?? "N/D");
    const lon = escapeHtml(properties.Longitud ?? "N/D");
    const estudios = formatEstudios(properties.Estudios || "N/D");

    return `
      <h3>${playa}</h3>
      <b>Lat:</b> ${lat}<br>
      <b>Lon:</b> ${lon}<br>
      <b>Estudios:</b><br>${estudios}
    `;
  }

  function buildSidebarItems() {
    const beachList = document.getElementById("beach-list");
    beachList.innerHTML = "";

    markers.forEach((item) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = item.name;
      btn.addEventListener("click", () => {
        map.setView(item.latlng, 12);
        item.marker.openPopup();
      });
      li.appendChild(btn);
      beachList.appendChild(li);
    });
  }

  function fitAll() {
    if (markerGroup && markerGroup.getLayers().length > 0) {
      map.fitBounds(markerGroup.getBounds().pad(0.2));
    }
  }

  document.getElementById("fit-all-btn").addEventListener("click", fitAll);

  fetch("data/playas.geojson")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`No se pudo cargar data/playas.geojson (${response.status})`);
      }
      return response.json();
    })
    .then((geojson) => {
      markerGroup = L.geoJSON(geojson, {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 7,
            weight: 1,
            color: "#0f4c81",
            fillColor: "#1e88e5",
            fillOpacity: 0.85
          });
        },
        onEachFeature: function (feature, layer) {
          const props = feature.properties || {};
          layer.bindPopup(createPopupHtml(props));

          const lat = Number(props.Latitud ?? feature.geometry?.coordinates?.[1]);
          const lon = Number(props.Longitud ?? feature.geometry?.coordinates?.[0]);

          markers.push({
            name: props.Playa || "Playa sin nombre",
            marker: layer,
            latlng: L.latLng(lat, lon)
          });
        }
      }).addTo(map);

      buildSidebarItems();
      fitAll();
    })
    .catch((error) => {
      console.error(error);
      alert("No se pudieron cargar los puntos de playas. Verifica data/playas.geojson.");
      if (activeBaseLayer) {
        activeBaseLayer.addTo(map);
      }
    });
})();
