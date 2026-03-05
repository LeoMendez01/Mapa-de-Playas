(function () {
  const defaultCenter = [13.7, -89.2];
  const defaultZoom = 8;
  const expectedMinimumBeaches = 7;

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

  let googleLayersAdded = false;
  const hasGoogleKey = typeof window.GOOGLE_MAPS_API_KEY === "string" && window.GOOGLE_MAPS_API_KEY.trim().length > 0;
  const googleWarning = document.getElementById("google-warning");
  const beachCountEl = document.getElementById("beach-count");

  if (hasGoogleKey && L.gridLayer && typeof L.gridLayer.googleMutant === "function") {
    const googleRoadmap = L.gridLayer.googleMutant({ type: "roadmap" });
    const googleSatellite = L.gridLayer.googleMutant({ type: "satellite" });

    layerControl.addBaseLayer(googleRoadmap, "Google Roadmap");
    layerControl.addBaseLayer(googleSatellite, "Google Satellite");

    googleRoadmap.addTo(map);
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

    if (beachCountEl) {
      beachCountEl.textContent = `Playas cargadas: ${markers.length}`;
      beachCountEl.classList.toggle("is-warning", markers.length < expectedMinimumBeaches);
    }
  }

  function fitAll() {
    if (markerGroup && markerGroup.getLayers().length > 0) {
      map.fitBounds(markerGroup.getBounds().pad(0.2));
    }
  }

  document.getElementById("fit-all-btn").addEventListener("click", fitAll);

  async function fetchBestGeoJSON() {
    const basePath = window.location.pathname.includes("/docs/") ? "../" : "";
    const urls = [
      `${basePath}data/playas.geojson`,
      "data/playas.geojson",
      "docs/data/playas.geojson"
    ];

    let best = null;

    for (const url of urls) {
      try {
        const response = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) continue;

        const data = await response.json();
        if (data?.type !== "FeatureCollection" || !Array.isArray(data.features)) continue;

        if (!best || data.features.length > best.features.length) {
          best = data;
        }
      } catch (error) {
        console.warn(`Fallo al intentar ${url}:`, error);
      }
    }

    if (!best) {
      throw new Error("No se pudo cargar ningún archivo GeoJSON válido.");
    }

    return best;
  }

  fetchBestGeoJSON()
    .then((geojson) => {
      markerGroup = L.geoJSON(geojson, {
        pointToLayer: function (_feature, latlng) {
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
    });
})();
