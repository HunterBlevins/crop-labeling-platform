import {
  currentLayers
} from "./map";


// ==================================================
// BUILD LAYER PANEL
// ==================================================

export function buildLayerPanel() {

  const panel =
    document.getElementById(
      "layerList"
    );


  if (!panel) {
    return;
  }


  panel.innerHTML = "";


  // ---------------------------------------
  // FIELDS
  // ---------------------------------------

  if (currentLayers.fields) {

    addLayerControl(

      panel,

      "Fields",

      currentLayers.fields

    );

  }


  // ---------------------------------------
  // POINTS
  // ---------------------------------------

  if (currentLayers.points) {

    addLayerControl(

      panel,

      "Points",

      currentLayers.points

    );

  }


  // ---------------------------------------
  // IMAGERY
  // ---------------------------------------

  if (currentLayers.imagery) {

    addLayerControl(

      panel,

      "Imagery",

      currentLayers.imagery

    );

  }

}


// ==================================================
// ADD LAYER CONTROL
// ==================================================

function addLayerControl(

  container:
    HTMLElement,

  name:
    string,

  layer:
    any

) {

  const row =
    document.createElement(
      "div"
    );


  row.className =
    "layer-row";


  // ---------------------------------------
  // CHECKBOX
  // ---------------------------------------

  const checkbox =
    document.createElement(
      "input"
    );


  checkbox.type =
    "checkbox";


  checkbox.checked =
    layer.visible;


  checkbox.addEventListener(
    "change",
    () => {

      layer.visible =
        checkbox.checked;

    }
  );


  // ---------------------------------------
  // LABEL
  // ---------------------------------------

  const label =
    document.createElement(
      "span"
    );


  label.textContent =
    name;


  // ---------------------------------------
  // ADD TO ROW
  // ---------------------------------------

  row.appendChild(
    checkbox
  );

  row.appendChild(
    label
  );


  container.appendChild(
    row
  );

}