import "./style.css";

import { signIn } from "./auth";

import {
  createMap,
  view,
  currentLayers
} from "./map";

import {
  loadCountry
} from "./country";

import {
  COUNTRIES
} from "./config";

import Editor from "@arcgis/core/widgets/Editor";

import Graphic from "@arcgis/core/Graphic";


console.log(
  "MAIN.TS HAS STARTED"
);


// ==================================================
// START APPLICATION
// ==================================================

async function startApp() {

  try {

    console.log(
      "Starting application..."
    );


    console.log(
      "startApp() HAS STARTED"
    );


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


    if (
      !countrySelect
    ) {

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


        if (
          !country
        ) {

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


  if (
    !panel
  ) {

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
  // IMAGERY SECTION
  // ==================================================

  if (
    currentLayers.planetGroup ||
    currentLayers.waybackLayers.length > 0
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
      "Imagery";


    panel.appendChild(
      imageryHeading
    );


    // ==================================================
    // WAYBACK IMAGERY
    // ==================================================

    // Wayback intentionally appears ABOVE Planet.

    currentLayers.waybackLayers.forEach(
      (
        waybackLayer: any,
        index: number
      ) => {

        const row =
          createLayerToggle(

            `waybackLayer-${index}`,

            `Wayback - ${waybackLayer.title.replace(
              "Wayback - ",
              ""
            )}`,

            waybackLayer.visible

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

            waybackLayer.visible =
              checkbox.checked;

          }
        );

      }
    );


    // ==================================================
    // PLANET GROUP
    // ==================================================

    if (
      currentLayers.planetGroup &&
      currentLayers.planetLayers.length > 0
    ) {

      buildPlanetControls(
        panel
      );

    }

  }

}


// ==================================================
// PLANET CONTROLS
// ==================================================

function buildPlanetControls(
  panel: HTMLElement
) {

  const planetGroup =
    currentLayers.planetGroup;


  const planetLayers =
    currentLayers.planetLayers;


  if (
    !planetGroup ||
    planetLayers.length === 0
  ) {

    return;

  }


  // ==================================================
  // MAIN PLANET HEADER
  // ==================================================

  const planetHeader =
    document.createElement(
      "div"
    );


  planetHeader.className =
    "planet-group-header";


  planetHeader.style.display =
    "flex";


  planetHeader.style.alignItems =
    "center";


  planetHeader.style.gap =
    "6px";


  planetHeader.style.width =
    "100%";


  // ----------------------------------------------
  // COLLAPSE BUTTON
  // ----------------------------------------------

  const collapseButton =
    document.createElement(
      "button"
    );


  collapseButton.type =
    "button";


  collapseButton.textContent =
    "▼";


  collapseButton.className =
    "planet-collapse-button";


  collapseButton.style.border =
    "none";


  collapseButton.style.background =
    "transparent";


  collapseButton.style.cursor =
    "pointer";


  collapseButton.style.padding =
    "2px 4px";


  collapseButton.style.fontSize =
    "12px";


  // ----------------------------------------------
  // PLANET CHECKBOX
  // ----------------------------------------------

  const planetCheckbox =
    document.createElement(
      "input"
    );


  planetCheckbox.type =
    "checkbox";


  planetCheckbox.id =
    "planetGroupCheckbox";


  planetCheckbox.checked =
    planetGroup.visible;


  // ----------------------------------------------
  // PLANET LABEL
  // ----------------------------------------------

  const planetLabel =
    document.createElement(
      "label"
    );


  planetLabel.htmlFor =
    "planetGroupCheckbox";


  planetLabel.textContent =
    "Planet Monthly Imagery";


  planetLabel.style.cursor =
    "pointer";


  planetLabel.style.flex =
    "1";


  // ----------------------------------------------
  // BUILD HEADER
  // ----------------------------------------------

  planetHeader.appendChild(
    collapseButton
  );


  planetHeader.appendChild(
    planetCheckbox
  );


  planetHeader.appendChild(
    planetLabel
  );


  panel.appendChild(
    planetHeader
  );


  // ==================================================
  // PLANET CONTENT
  // ==================================================

  const planetContent =
    document.createElement(
      "div"
    );


  planetContent.className =
    "planet-group-content";


  planetContent.style.marginLeft =
    "22px";


  panel.appendChild(
    planetContent
  );


  // ==================================================
  // COLLAPSE / EXPAND
  // ==================================================

  collapseButton.addEventListener(
    "click",
    () => {

      const isCollapsed =
        planetContent.style.display ===
        "none";


      if (
        isCollapsed
      ) {

        planetContent.style.display =
          "";

        collapseButton.textContent =
          "▼";

      }

      else {

        planetContent.style.display =
          "none";

        collapseButton.textContent =
          "▶";

      }

    }
  );


  // ==================================================
  // MAIN PLANET VISIBILITY
  // ==================================================

  planetCheckbox.addEventListener(
    "change",
    () => {

      planetGroup.visible =
        planetCheckbox.checked;

    }
  );


  // ==================================================
  // MONTH LABEL
  // ==================================================

  const selectedMonthLabel =
    document.createElement(
      "div"
    );


  selectedMonthLabel.className =
    "planet-selected-month";


  selectedMonthLabel.style.fontWeight =
    "600";


  selectedMonthLabel.style.margin =
    "8px 0 4px 0";


  selectedMonthLabel.textContent =
    getPlanetMonthName(
      planetLayers,
      getVisiblePlanetIndex(
        planetLayers
      )
    );


  planetContent.appendChild(
    selectedMonthLabel
  );


  // ==================================================
  // SLIDER
  // ==================================================

  const slider =
    document.createElement(
      "input"
    );


  slider.type =
    "range";


  slider.min =
    "0";


  slider.max =
    String(
      planetLayers.length - 1
    );


  slider.step =
    "1";


  slider.value =
    String(
      getVisiblePlanetIndex(
        planetLayers
      )
    );


  slider.style.width =
    "100%";


  slider.title =
    "Move through Planet monthly imagery";


  planetContent.appendChild(
    slider
  );


  // ==================================================
  // SLIDER DATE RANGE
  // ==================================================

  const sliderLabels =
    document.createElement(
      "div"
    );


  sliderLabels.style.display =
    "flex";


  sliderLabels.style.justifyContent =
    "space-between";


  sliderLabels.style.fontSize =
    "11px";


  sliderLabels.style.opacity =
    "0.75";


  const firstMonth =
    document.createElement(
      "span"
    );


  firstMonth.textContent =
    getPlanetMonthName(
      planetLayers,
      0
    );


  const lastMonth =
    document.createElement(
      "span"
    );


  lastMonth.textContent =
    getPlanetMonthName(
      planetLayers,
      planetLayers.length - 1
    );


  sliderLabels.appendChild(
    firstMonth
  );


  sliderLabels.appendChild(
    lastMonth
  );


  planetContent.appendChild(
    sliderLabels
  );


  // ==================================================
  // SLIDER CHANGE
  // ==================================================

  slider.addEventListener(
    "input",
    () => {

      const index =
        Number(
          slider.value
        );


      // Turn every Planet month off

      planetLayers.forEach(
        (
          layer: any,
          layerIndex: number
        ) => {

          layer.visible =
            layerIndex === index;

        }
      );


      // Make sure the group is on

      planetGroup.visible =
        true;


      planetCheckbox.checked =
        true;


      // Update selected month text

      selectedMonthLabel.textContent =
        getPlanetMonthName(
          planetLayers,
          index
        );


      // Update individual checkboxes

      updatePlanetMonthCheckboxes(
        planetContent,
        planetLayers
      );

    }
  );


  // ==================================================
  // MONTHLY CHECKBOXES
  // ==================================================

  const monthHeading =
    document.createElement(
      "div"
    );


  monthHeading.textContent =
    "Months";


  monthHeading.style.fontWeight =
    "600";


  monthHeading.style.margin =
    "10px 0 4px 0";


  planetContent.appendChild(
    monthHeading
  );


  // --------------------------------------------------
  // MONTHS DISPLAYED IN REVERSE ORDER
  //
  // This only reverses the list in the UI.
  // The underlying Planet layer order and slider
  // order remain unchanged.
  // --------------------------------------------------

  [
    ...planetLayers
  ].reverse().forEach(
    (
      imageryLayer: any
    ) => {

      const index =
        planetLayers.indexOf(
          imageryLayer
        );


      const row =
        document.createElement(
          "label"
        );


      row.className =
        "planet-month-toggle";


      row.style.display =
        "flex";


      row.style.alignItems =
        "center";


      row.style.gap =
        "6px";


      row.style.cursor =
        "pointer";


      row.style.margin =
        "2px 0";


      const checkbox =
        document.createElement(
          "input"
        );


      checkbox.type =
        "checkbox";


      checkbox.dataset.planetIndex =
        String(
          index
        );


      checkbox.checked =
        imageryLayer.visible;


      const text =
        document.createElement(
          "span"
        );


      text.textContent =
        imageryLayer.title.replace(
          "Planet - ",
          ""
        );


      row.appendChild(
        checkbox
      );


      row.appendChild(
        text
      );


      planetContent.appendChild(
        row
      );


      // --------------------------------------------
      // MANUAL MONTH TOGGLE
      // --------------------------------------------

      checkbox.addEventListener(
        "change",
        () => {

          imageryLayer.visible =
            checkbox.checked;


          // If manually enabling a month,
          // make sure the Planet group is visible.

          if (
            checkbox.checked
          ) {

            planetGroup.visible =
              true;


            planetCheckbox.checked =
              true;


            selectedMonthLabel.textContent =
              getPlanetMonthName(
                planetLayers,
                index
              );


            slider.value =
              String(
                index
              );

          }


          // If everything is turned off,
          // turn off the group as well.

          const anyVisible =
            planetLayers.some(
              (
                layer: any
              ) => layer.visible
            );


          if (
            !anyVisible
          ) {

            planetGroup.visible =
              false;


            planetCheckbox.checked =
              false;

          }

        }
      );

    }
  );

}


// ==================================================
// GET PLANET MONTH NAME
// ==================================================

function getPlanetMonthName(
  layers: any[],
  index: number
): string {

  if (
    !layers.length
  ) {

    return "";

  }


  const safeIndex =
    Math.max(
      0,
      Math.min(
        index,
        layers.length - 1
      )
    );


  return layers[
    safeIndex
  ].title.replace(
    "Planet - ",
    ""
  );

}


// ==================================================
// GET CURRENTLY VISIBLE PLANET INDEX
// ==================================================

function getVisiblePlanetIndex(
  layers: any[]
): number {

  const index =
    layers.findIndex(
      (
        layer: any
      ) => layer.visible
    );


  if (
    index >= 0
  ) {

    return index;

  }


  // Default to newest month

  return Math.max(
    layers.length - 1,
    0
  );

}


// ==================================================
// UPDATE PLANET MONTH CHECKBOXES
// ==================================================

function updatePlanetMonthCheckboxes(
  container: HTMLElement,
  layers: any[]
) {

  const checkboxes =
    container.querySelectorAll(
      'input[data-planet-index]'
    );


  checkboxes.forEach(
    (
      checkboxElement
    ) => {

      const checkbox =
        checkboxElement as HTMLInputElement;


      const index =
        Number(
          checkbox.dataset.planetIndex
        );


      checkbox.checked =
        Boolean(
          layers[index]?.visible
        );

    }
  );

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