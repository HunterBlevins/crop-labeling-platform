import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";

import "@arcgis/core/assets/esri/themes/light/main.css";

export let map: Map;

export let view: MapView;

export const currentLayers = {
  fields: null as any,
  points: null as any,
  imagery: [] as any[]
};

export async function createMap() {

  console.log("Creating map...");

  map = new Map({
    basemap: "satellite"
  });

  console.log("Map object created.");

  view = new MapView({
    container: "map",
    map: map,
    center: [-30, 20],
    zoom: 3
  });

  console.log("MapView object created.");

  await view.when();

  console.log("MapView loaded.");

  // ============================================================
  // RIGHT-CLICK TO COPY COORDINATES
  // ============================================================

view.on("immediate-click", async (event) => {

  // Only respond to right-click
  if (event.button !== 2) {
    return;
  }

  const point = view.toMap(event);

  if (!point) {
    return;
  }

  const longitude = point.longitude;
  const latitude = point.latitude;

  if (
    latitude == null ||
    longitude == null
  ) {
    return;
  }

  const coordinateText =
    `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

  try {

    await navigator.clipboard.writeText(
      coordinateText
    );

    console.log(
      `Copied coordinates: ${coordinateText}`
    );

    showCoordinateMessage(
      coordinateText
    );

  } catch (error) {

    console.error(
      "Failed to copy coordinates:",
      error
    );

  }

});

  return view;
}


// ============================================================
// SHOW COPY MESSAGE
// ============================================================

function showCoordinateMessage(
  coordinates: string
) {

  const existing =
    document.getElementById(
      "coordinate-copy-message"
    );

  if (existing) {
    existing.remove();
  }

  const message =
    document.createElement("div");

  message.id =
    "coordinate-copy-message";

  message.textContent =
    `Copied: ${coordinates}`;

  message.style.position =
    "fixed";

  message.style.bottom =
    "20px";

  message.style.left =
    "50%";

  message.style.transform =
    "translateX(-50%)";

  message.style.background =
    "rgba(0, 0, 0, 0.85)";

  message.style.color =
    "white";

  message.style.padding =
    "10px 16px";

  message.style.borderRadius =
    "6px";

  message.style.fontSize =
    "14px";

  message.style.zIndex =
    "9999";

  message.style.pointerEvents =
    "none";

  document.body.appendChild(
    message
  );

  setTimeout(() => {

    message.remove();

  }, 2000);

}