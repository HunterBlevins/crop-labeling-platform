import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";

import "@arcgis/core/assets/esri/themes/light/main.css";

export let map: Map;

export let view: MapView;

export const currentLayers = {
  fields: null as any,
  points: null as any,

  imagery: [] as any[],

  planetGroup: null as any,
  planetLayers: [] as any[],

  waybackLayers: [] as any[]
};


export async function createMap() {

  console.log(
    "Creating map..."
  );


  // ============================================================
  // CREATE MAP
  // ============================================================

  map = new Map({

    basemap:
      "satellite"

  });


  console.log(
    "Map object created."
  );


  // ============================================================
  // CREATE MAP VIEW
  // ============================================================

  view = new MapView({

    container:
      "map",

    map:
      map,

    center:
      [-30, 20],

    zoom:
      3

  });


  console.log(
    "MapView object created."
  );


  await view.when();


  console.log(
    "MapView loaded."
  );


  // ============================================================
  // NORTH ARROW
  // ============================================================

  createNorthArrow();


  // ============================================================
  // RIGHT-CLICK TO COPY COORDINATES
  // ============================================================

  view.on(
    "immediate-click",
    async (event) => {

      // Only respond to right-click

      if (
        event.button !== 2
      ) {

        return;

      }


      const point =
        view.toMap(event);


      if (
        !point
      ) {

        return;

      }


      const longitude =
        point.longitude;


      const latitude =
        point.latitude;


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

    }
  );


  return view;

}


// ============================================================
// NORTH ARROW
// ============================================================

function createNorthArrow() {

  // ----------------------------------------------
  // Remove an existing arrow if one already exists
  // ----------------------------------------------

  const existing =
    document.getElementById(
      "north-arrow"
    );


  if (
    existing
  ) {

    existing.remove();

  }


  // ----------------------------------------------
  // CREATE NORTH ARROW
  // ----------------------------------------------

  const northArrow =
    document.createElement(
      "button"
    );


  northArrow.id =
    "north-arrow";


  northArrow.type =
    "button";


  northArrow.title =
    "Reset map orientation to north";


  northArrow.setAttribute(
    "aria-label",
    "Reset map orientation to north"
  );


  // ----------------------------------------------
  // ARROW SYMBOL
  // ----------------------------------------------

  northArrow.innerHTML = `

    <div class="north-arrow-symbol">

      <div class="north-arrow-letter">
        N
      </div>

      <div class="north-arrow-shape">
        ▲
      </div>

    </div>

  `;


  // ----------------------------------------------
  // POSITION
  // ----------------------------------------------

  northArrow.style.position =
    "absolute";


  northArrow.style.top =
    "15px";


  northArrow.style.right =
    "15px";


  // ----------------------------------------------
  // SIZE
  // ----------------------------------------------

  northArrow.style.width =
    "46px";


  northArrow.style.height =
    "46px";


  // ----------------------------------------------
  // APPEARANCE
  // ----------------------------------------------

  northArrow.style.background =
    "rgba(255, 255, 255, 0.95)";


  northArrow.style.border =
    "1px solid rgba(0, 0, 0, 0.25)";


  northArrow.style.borderRadius =
    "6px";


  northArrow.style.boxShadow =
    "0 1px 4px rgba(0, 0, 0, 0.3)";


  northArrow.style.cursor =
    "pointer";


  northArrow.style.padding =
    "0";


  northArrow.style.zIndex =
    "100";


  northArrow.style.display =
    "flex";


  northArrow.style.alignItems =
    "center";


  northArrow.style.justifyContent =
    "center";


  // ----------------------------------------------
  // ARROW CONTENT
  // ----------------------------------------------

  const arrowSymbol =
    northArrow.querySelector(
      ".north-arrow-symbol"
    ) as HTMLElement;


  if (
    arrowSymbol
  ) {

    arrowSymbol.style.display =
      "flex";


    arrowSymbol.style.flexDirection =
      "column";


    arrowSymbol.style.alignItems =
      "center";


    arrowSymbol.style.justifyContent =
      "center";


    arrowSymbol.style.lineHeight =
      "1";

  }


  const northLetter =
    northArrow.querySelector(
      ".north-arrow-letter"
    ) as HTMLElement;


  if (
    northLetter
  ) {

    northLetter.style.fontSize =
      "11px";


    northLetter.style.fontWeight =
      "700";


    northLetter.style.marginBottom =
      "1px";

  }


  const arrowShape =
    northArrow.querySelector(
      ".north-arrow-shape"
    ) as HTMLElement;


  if (
    arrowShape
  ) {

    arrowShape.style.fontSize =
      "19px";


    arrowShape.style.lineHeight =
      "16px";

  }


  // ----------------------------------------------
  // CLICK
  // ----------------------------------------------

  northArrow.addEventListener(
    "click",
    () => {

      // Reset the map orientation to north.

      // We intentionally set rotation directly
      // instead of using view.goTo(), because
      // rotation is a property of MapView rather
      // than a GoToTarget2D geometry.

      view.rotation =
        0;

    }
  );


  // ----------------------------------------------
  // ADD TO MAP CONTAINER
  // ----------------------------------------------

  const mapContainer =
    document.getElementById(
      "map"
    );


  if (
    mapContainer
  ) {

    mapContainer.appendChild(
      northArrow
    );

  }

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


  if (
    existing
  ) {

    existing.remove();

  }


  const message =
    document.createElement(
      "div"
    );


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


  setTimeout(
    () => {

      message.remove();

    },
    2000
  );

}