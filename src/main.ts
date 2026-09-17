import "./style.css";

import { signIn } from "./auth";
import { createMap, view, currentLayers } from "./map";
import { loadCountry } from "./country";
import { COUNTRIES } from "./config";

import Editor from "@arcgis/core/widgets/Editor";
import Graphic from "@arcgis/core/Graphic";

console.log("MAIN.TS HAS STARTED");


// ==================================================
// START APPLICATION
// ==================================================

async function startApp() {

  try {

    console.log("Starting application...");
    console.log("startApp() HAS STARTED");


    // ----------------------------------------------
    // SIGN IN
    // ----------------------------------------------

    await signIn();

    console.log(
      "Successfully signed in to ArcGIS Online!"
    );


    // ----------------------------------------------
    // CREATE MAP
    // ----------------------------------------------

    await createMap();

    console.log(
      "Map created."
    );


    // ----------------------------------------------
    // COUNTRY DROPDOWN
    // ----------------------------------------------

    const countrySelect =
      document.getElementById(
        "countrySelect"
      ) as HTMLSelectElement;


    if (!countrySelect) {

      throw new Error(
        "countrySelect element was not found."
      );

    }


    // ----------------------------------------------
    // POPULATE COUNTRY DROPDOWN
    // ----------------------------------------------

    countrySelect.innerHTML = `
      <option value="">
        Select country...
      </option>
    `;


    for (
      const [key, country]
      of Object.entries(COUNTRIES)
    ) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        key;


      option.textContent =
        country.name;


      countrySelect.appendChild(
        option
      );

    }


    console.log(
      "Country dropdown populated."
    );


    // ----------------------------------------------
    // COUNTRY CHANGE
    // ----------------------------------------------

    countrySelect.addEventListener(
      "change",
      async () => {

        const country =
          countrySelect.value;


        if (!country) {

          return;

        }


        try {

          console.log(
            `Loading ${country}...`
          );


          // Load country layers

          await loadCountry(
            country
          );


          console.log(
            `${country} loaded.`
          );


          // Build left layer panel

          buildLayerPanel();


          // Build right-side point list

          await buildPointTable();


          // Add polygon editor

          addEditor();


        } catch (error) {

          console.error(
            `Failed to load ${country}:`,
            error
          );

        }

      }
    );


    // ----------------------------------------------
    // MAP CLICK
    // ----------------------------------------------

    view.on(
      "click",
      async (event) => {

        try {

          const response =
            await view.hitTest(
              event
            );


          // ----------------------------------------
          // FIND POINT GRAPHIC
          // ----------------------------------------

          const pointResult =
            response.results.find(
              (
                result
              ) => {

                if (
                  result.type !==
                  "graphic"
                ) {

                  return false;

                }


                return (
                  result.graphic.layer ===
                  currentLayers.points
                );

              }
            );


          if (
            !pointResult ||
            pointResult.type !==
              "graphic"
          ) {

            return;

          }


          const feature =
            pointResult.graphic;


          // ----------------------------------------
          // ZOOM TO POINT
          // ----------------------------------------

          if (
            feature.geometry
          ) {

            await view.goTo({

              target:
                feature.geometry,

              zoom:
                Math.max(
                  view.zoom,
                  18
                )

            });

          }


          // ----------------------------------------
          // SHOW FEATURE CONTROLS
          // ----------------------------------------

          showFeature(
            feature
          );


          // ----------------------------------------
          // HIGHLIGHT POINT ROW
          // ----------------------------------------

          highlightPointRow(
            feature
          );

        } catch (error) {

          console.error(
            "Map click failed:",
            error
          );

        }

      }
    );


  } catch (error) {

    console.error(
      "Application failed:",
      error
    );

  }

}


// ==================================================
// LEFT LAYER PANEL
// ==================================================

function buildLayerPanel() {

  const panel =
    document.getElementById(
      "layerList"
    );


  if (!panel) {

    return;

  }


  panel.innerHTML =
    "";


  // ==================================================
  // FIELDS
  // ==================================================

  if (
    currentLayers.fields
  ) {

    const fieldsRow =
      createLayerToggle(

        "fieldsLayer",

        "Fields",

        currentLayers.fields.visible

      );


    panel.appendChild(
      fieldsRow
    );


    const fieldsCheckbox =
      fieldsRow.querySelector(
        "input"
      ) as HTMLInputElement;


    fieldsCheckbox.addEventListener(
      "change",
      () => {

        if (
          currentLayers.fields
        ) {

          currentLayers.fields.visible =
            fieldsCheckbox.checked;

        }

      }
    );

  }


  // ==================================================
  // POINTS
  // ==================================================

  if (
    currentLayers.points
  ) {

    const pointsRow =
      createLayerToggle(

        "pointsLayer",

        "Points",

        currentLayers.points.visible

      );


    panel.appendChild(
      pointsRow
    );


    const pointsCheckbox =
      pointsRow.querySelector(
        "input"
      ) as HTMLInputElement;


    pointsCheckbox.addEventListener(
      "change",
      () => {

        if (
          currentLayers.points
        ) {

          currentLayers.points.visible =
            pointsCheckbox.checked;

        }

      }
    );

  }


  // ==================================================
  // PLANET MONTHLY IMAGERY
  // ==================================================

  if (
    currentLayers.imagery &&
    currentLayers.imagery.length > 0
  ) {

    // ----------------------------------------------
    // SECTION HEADING
    // ----------------------------------------------

    const imageryHeading =
      document.createElement(
        "div"
      );


    imageryHeading.className =
      "layer-section-title";


    imageryHeading.textContent =
      "Planet Monthly Imagery";


    panel.appendChild(
      imageryHeading
    );


    // ----------------------------------------------
    // CREATE ONE TOGGLE PER MONTH
    //
    // REVERSED SO NEWEST MONTH IS ON TOP
    // ----------------------------------------------

    [
      ...currentLayers.imagery
    ].reverse().forEach(

      (
        imageryLayer: any,
        index: number
      ) => {

        const row =
          createLayerToggle(

            `planetLayer-${index}`,

            imageryLayer.title.replace(
              "Planet - ",
              ""
            ),

            imageryLayer.visible

          );


        panel.appendChild(
          row
        );


        const checkbox =
          row.querySelector(
            "input"
          ) as HTMLInputElement;


        checkbox.addEventListener(
          "change",
          () => {

            imageryLayer.visible =
              checkbox.checked;

          }
        );

      }

    );

  }

}


// ==================================================
// CREATE LAYER TOGGLE
// ==================================================

function createLayerToggle(
  id: string,
  label: string,
  checked: boolean
): HTMLLabelElement {

  const row =
    document.createElement(
      "label"
    );


  row.className =
    "layer-toggle";


  row.htmlFor =
    id;


  row.innerHTML = `

    <input
      type="checkbox"
      id="${id}"
      ${checked ? "checked" : ""}
    />

    <span>
      ${label}
    </span>

  `;


  return row;

}


// ==================================================
// BUILD POINT TABLE
// ==================================================

async function buildPointTable() {

  const tableContainer =
    document.getElementById(
      "pointList"
    );


  const countElement =
    document.getElementById(
      "pointCount"
    );


  const featurePanel =
    document.getElementById(
      "featureInfo"
    );


  if (
    !tableContainer
  ) {

    console.warn(
      "pointList element not found."
    );

    return;

  }


  const pointsLayer =
    currentLayers.points;


  if (
    !pointsLayer
  ) {

    tableContainer.innerHTML = `

      <p class="point-list-empty">
        No points layer loaded.
      </p>

    `;

    return;

  }


  // ----------------------------------------------
  // RESET FEATURE PANEL
  // ----------------------------------------------

  if (
    featurePanel
  ) {

    featurePanel.innerHTML = `

      <div class="no-feature-selected">

        <h3>
          Feature
        </h3>

        <p>
          Click a point to select it.
        </p>

      </div>

    `;

  }


  // ----------------------------------------------
  // QUERY ALL POINTS
  // ----------------------------------------------

  try {

    const result =
      await pointsLayer.queryFeatures({

        where:
          "1=1",

        outFields:
          ["*"],

        returnGeometry:
          true

      });


    console.log(
      `Loaded ${result.features.length} points.`
    );


    // ----------------------------------------------
    // UPDATE POINT COUNT
    // ----------------------------------------------

    if (
      countElement
    ) {

      countElement.textContent =
        String(
          result.features.length
        );

    }


    // ----------------------------------------------
    // CLEAR POINT LIST
    // ----------------------------------------------

    tableContainer.innerHTML =
      "";


    // ----------------------------------------------
    // CREATE POINT ROWS
    // ----------------------------------------------

    result.features.forEach(
      (
        feature: Graphic
      ) => {

        const row =
          createPointRow(
            feature
          );


        tableContainer.appendChild(
          row
        );

      }
    );


  } catch (error) {

    console.error(
      "Failed to query points:",
      error
    );


    tableContainer.innerHTML = `

      <p class="point-list-empty">
        Failed to load points.
      </p>

    `;

  }

}


// ==================================================
// CREATE POINT ROW
// ==================================================

function createPointRow(
  feature: Graphic
): HTMLDivElement {

  const row =
    document.createElement(
      "div"
    );


  row.className =
    "point-row";


  // ----------------------------------------------
  // OBJECT ID
  // ----------------------------------------------

  const pointsLayer =
    currentLayers.points;


  let objectId =
    "";


  if (
    pointsLayer
  ) {

    objectId =
      String(
        feature.attributes[
          pointsLayer.objectIdField
        ]
      );

  }


  // ----------------------------------------------
  // CROP LABEL
  // ----------------------------------------------

  const cropLabel =
    feature.attributes[
      "crop_label"
    ];


  // ----------------------------------------------
  // APPLY COLOR
  // ----------------------------------------------

  applyCropLabelClass(
    row,
    cropLabel
  );


  // ----------------------------------------------
  // ROW CONTENT
  // ----------------------------------------------

  row.innerHTML = `

    <div class="point-objectid">
      ${objectId}
    </div>

    <div class="point-label">
      ${cropLabel || "—"}
    </div>

  `;


  // ----------------------------------------------
  // CLICK ROW
  // ----------------------------------------------

  row.addEventListener(
    "click",
    async () => {

      try {

        // Zoom to point

        if (
          feature.geometry
        ) {

          await view.goTo({

            target:
              feature.geometry,

            zoom:
              Math.max(
                view.zoom,
                18
              )

          });

        }


        // Show feature controls

        showFeature(
          feature
        );


        // Highlight selected row

        highlightPointRow(
          feature
        );


      } catch (error) {

        console.error(
          "Failed to select point:",
          error
        );

      }

    }
  );


  return row;

}


// ==================================================
// APPLY CROP LABEL CLASS
// ==================================================

function applyCropLabelClass(
  row: HTMLElement,
  cropLabel: unknown
) {

  row.classList.remove(

    "label-yes",

    "label-no",

    "label-review",

    "label-empty"

  );


  if (
    cropLabel ===
    "Yes"
  ) {

    row.classList.add(
      "label-yes"
    );

  }

  else if (
    cropLabel ===
    "No"
  ) {

    row.classList.add(
      "label-no"
    );

  }

  else if (
    cropLabel ===
    "Review"
  ) {

    row.classList.add(
      "label-review"
    );

  }

  else {

    row.classList.add(
      "label-empty"
    );

  }

}


// ==================================================
// HIGHLIGHT SELECTED POINT
// ==================================================

function highlightPointRow(
  feature: Graphic
) {

  const pointsLayer =
    currentLayers.points;


  if (
    !pointsLayer
  ) {

    return;

  }


  const objectId =
    feature.attributes[
      pointsLayer.objectIdField
    ];


  const rows =
    document.querySelectorAll(
      ".point-row"
    );


  rows.forEach(
    (
      row: Element
    ) => {

      row.classList.remove(
        "selected-point"
      );


      const rowObjectId =
        row.querySelector(
          ".point-objectid"
        )?.textContent?.trim();


      if (
        rowObjectId ===
        String(objectId)
      ) {

        row.classList.add(
          "selected-point"
        );


        row.scrollIntoView({

          behavior:
            "smooth",

          block:
            "nearest"

        });

      }

    }
  );

}


// ==================================================
// SHOW SELECTED FEATURE
// ==================================================

function showFeature(
  feature: Graphic
) {

  const panel =
    document.getElementById(
      "featureInfo"
    );


  if (
    !panel
  ) {

    return;

  }


  const pointsLayer =
    currentLayers.points;


  if (
    !pointsLayer
  ) {

    return;

  }


  // ----------------------------------------------
  // OBJECT ID
  // ----------------------------------------------

  const objectIdField =
    pointsLayer.objectIdField;


  const objectId =
    feature.attributes[
      objectIdField
    ];


  // ----------------------------------------------
  // CURRENT LABEL
  // ----------------------------------------------

  const cropLabel =
    feature.attributes[
      "crop_label"
    ];


  // ----------------------------------------------
  // BUILD FIXED FEATURE PANEL
  // ----------------------------------------------

  panel.innerHTML = `

    <div class="selected-feature">

      <div class="feature-id">
        OBJECTID
      </div>


      <div class="feature-object-id">
        ${objectId}
      </div>


      <div class="crop-label-title">
        Crop Label
      </div>


      <div class="crop-label-options">

        <label class="crop-label-option">

          <input
            type="radio"
            name="cropLabel"
            value="Yes"
            ${
              cropLabel ===
              "Yes"
                ? "checked"
                : ""
            }
          />

          <span>
            Yes
          </span>

        </label>


        <label class="crop-label-option">

          <input
            type="radio"
            name="cropLabel"
            value="No"
            ${
              cropLabel ===
              "No"
                ? "checked"
                : ""
            }
          />

          <span>
            No
          </span>

        </label>


        <label class="crop-label-option">

          <input
            type="radio"
            name="cropLabel"
            value="Review"
            ${
              cropLabel ===
              "Review"
                ? "checked"
                : ""
            }
          />

          <span>
            Review
          </span>

        </label>

      </div>


      <div
        id="saveStatus"
        class="save-status"
      ></div>

    </div>

  `;


  // ----------------------------------------------
  // LABEL CHANGE HANDLERS
  // ----------------------------------------------

  const inputs =
    panel.querySelectorAll(
      'input[name="cropLabel"]'
    );


  inputs.forEach(
    (
      input: Element
    ) => {

      input.addEventListener(
        "change",
        async (
          event: Event
        ) => {

          const target =
            event.target as
            HTMLInputElement;


          const value =
            target.value;


          // ----------------------------------------
          // SAVE STATUS
          // ----------------------------------------

          const saveStatus =
            document.getElementById(
              "saveStatus"
            );


          if (
            saveStatus
          ) {

            saveStatus.textContent =
              "Saving...";

          }


          // ----------------------------------------
          // CREATE UPDATED GRAPHIC
          // ----------------------------------------

          const updatedFeature =
            feature.clone();


          updatedFeature.attributes[
            "crop_label"
          ] =
            value;


          // ----------------------------------------
          // SAVE TO AGOL
          // ----------------------------------------

          try {

            console.log(
              "Saving crop_label:",
              value
            );


            const result =
              await pointsLayer.applyEdits({

                updateFeatures: [
                  updatedFeature
                ]

              });


            // --------------------------------------
            // CHECK EDIT RESULT
            // --------------------------------------

            const editResult =
              result
                .updateFeatureResults
                ?.at(0);


            if (
              editResult?.error
            ) {

              throw editResult.error;

            }


            // --------------------------------------
            // UPDATE LOCAL FEATURE
            // --------------------------------------

            feature.attributes[
              "crop_label"
            ] =
              value;


            // --------------------------------------
            // UPDATE STATUS
            // --------------------------------------

            if (
              saveStatus
            ) {

              saveStatus.textContent =
                "Saved.";

            }


            console.log(
              "Crop label saved successfully."
            );


            // --------------------------------------
            // UPDATE ONLY THIS ROW
            // --------------------------------------

            updatePointRow(
              feature
            );


            // --------------------------------------
            // REFRESH MAP
            // --------------------------------------

            await pointsLayer.refresh();


          } catch (error) {

            console.error(
              "Failed to save crop label:",
              error
            );


            if (
              saveStatus
            ) {

              saveStatus.textContent =
                "Failed to save.";

            }

          }

        }
      );

    }
  );

}


// ==================================================
// UPDATE ONE POINT ROW
// ==================================================

function updatePointRow(
  feature: Graphic
) {

  const pointsLayer =
    currentLayers.points;


  if (
    !pointsLayer
  ) {

    return;

  }


  const objectId =
    String(
      feature.attributes[
        pointsLayer.objectIdField
      ]
    );


  const rows =
    document.querySelectorAll(
      ".point-row"
    );


  rows.forEach(
    (
      row: Element
    ) => {

      const rowObjectId =
        row.querySelector(
          ".point-objectid"
        )?.textContent?.trim();


      if (
        rowObjectId ===
        objectId
      ) {

        const labelElement =
          row.querySelector(
            ".point-label"
          );


        if (
          labelElement
        ) {

          labelElement.textContent =
            String(
              feature.attributes[
                "crop_label"
              ] || "—"
            );

        }


        applyCropLabelClass(

          row as HTMLElement,

          feature.attributes[
            "crop_label"
          ]

        );

      }

    }
  );

}


// ==================================================
// ADD ARCGIS EDITOR
// ==================================================

function addEditor() {

  const existingEditor =
    document.getElementById(
      "editorContainer"
    );


  if (
    existingEditor
  ) {

    existingEditor.innerHTML =
      "";

  }


  if (
    !currentLayers.fields
  ) {

    console.warn(
      "No fields layer is currently loaded."
    );

    return;

  }


  const editor =
    new Editor({

      view:
        view,

      container:
        "editorContainer",

      layerInfos: [

        {

          layer:
            currentLayers.fields,

          enabled:
            true

        }

      ]

    });


  console.log(
    "Editor added.",
    editor
  );

}


// ==================================================
// RUN APPLICATION
// ==================================================

startApp();