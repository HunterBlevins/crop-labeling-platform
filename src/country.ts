import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";

import { map, view, currentLayers } from "./map";
import { COUNTRIES } from "./config";
import { PLANET_MOSAICS } from "./planetmosaics";

const PLANET_API_KEY =
  import.meta.env.VITE_PLANET_API_KEY;


export async function loadCountry(
  countryKey: string
) {

  const config =
    COUNTRIES[countryKey];


  if (!config) {

    throw new Error(
      `Unknown country: ${countryKey}`
    );

  }


  console.log(
    `Loading ${config.name}`
  );


  // ============================================================
  // REMOVE PREVIOUS COUNTRY
  // ============================================================

  map.removeAll();

  currentLayers.fields = null;

  currentLayers.points = null;

  currentLayers.imagery = [];


  // ============================================================
  // FIELDS
  // ============================================================

  const fieldsLayer =
    new FeatureLayer({

      url:
        config.fieldsUrl,

      title:
        `${config.name} Fields`,

      opacity:
        0.45,

      outFields:
        ["*"],

      popupEnabled:
        false

    });


  // ============================================================
  // POINTS
  // ============================================================

  const pointsLayer =
    new FeatureLayer({

      url:
        config.pointsUrl,

      title:
        `${config.name} Points`,

      outFields:
        ["*"],

      popupEnabled:
        false,

      renderer: {

        type:
          "unique-value",

        field:
          "crop_label",

        defaultSymbol: {

          type:
            "simple-marker",

          size:
            9

        },

        uniqueValueInfos: [

          {

            value:
              "Yes",

            symbol: {

              type:
                "simple-marker",

              size:
                10,

              color:
                "#2ca25f",

              outline: {

                color:
                  "white",

                width:
                  1

              }

            },

            label:
              "Yes"

          },

          {

            value:
              "No",

            symbol: {

              type:
                "simple-marker",

              size:
                10,

              color:
                "#de2d26",

              outline: {

                color:
                  "white",

                width:
                  1

              }

            },

            label:
              "No"

          },

          {

            value:
              "Review",

            symbol: {

              type:
                "simple-marker",

              size:
                10,

              color:
                "#feb24c",

              outline: {

                color:
                  "black",

                width:
                  1

              }

            },

            label:
              "Review"

          }

        ]

      }

    });


  // ============================================================
  // PLANET MONTHLY IMAGERY
  // ============================================================

  const planetLayers:
    WebTileLayer[] = [];


  if (!PLANET_API_KEY) {

    console.warn(
      "VITE_PLANET_API_KEY is not configured."
    );

  }

  else if (
    config.imagery?.provider === "planet" &&
    config.imagery.seasons.length > 0
  ) {

    // ----------------------------------------------------------
    // Only use Planet mosaics that fall within one of the
    // country's configured imagery seasons.
    // ----------------------------------------------------------

    const allowedMosaics =
      PLANET_MOSAICS.filter(
        mosaic => {

          const mosaicDate =
            `${mosaic.date}-01`;


          return config.imagery!.seasons.some(
            season => {

              return (
                mosaicDate >= season.start &&
                mosaicDate <= season.end
              );

            }
          );

        }
      );


    console.log(
      `Preparing ${allowedMosaics.length} Planet mosaics for ${config.name}...`
    );


    // ----------------------------------------------------------
    // Create one WebTileLayer for each allowed month.
    // ----------------------------------------------------------

    for (
      const mosaic of allowedMosaics
    ) {

      const tileUrl =
        `https://tiles.planet.com/basemaps/v1/planet-tiles/` +
        `${mosaic.id}/gmap/{z}/{x}/{y}.png` +
        `?api_key=${PLANET_API_KEY}`;


      const planetLayer =
        new WebTileLayer({

          urlTemplate:
            tileUrl,

          title:
            `Planet - ${mosaic.name}`,

          opacity:
            1,

          visible:
            false

        });


      planetLayers.push(
        planetLayer
      );

    }


    console.log(
      `Created ${planetLayers.length} Planet monthly layers.`
    );

  }

  else {

    console.log(
      `No Planet imagery seasons configured for ${config.name}.`
    );

  }


  // ============================================================
  // WAYBACK IMAGERY
  // ============================================================

  const waybackLayers:
    WebTileLayer[] = [];


  if (
    config.imagery?.wayback
  ) {

    const wayback =
      config.imagery.wayback;


    console.log(
      `Preparing Wayback imagery: ${wayback.name}`
    );


    const waybackLayer =
      new WebTileLayer({

        urlTemplate:
          wayback.url,

        title:
          `Wayback - ${wayback.date}`,

        opacity:
          1,

        visible:
          false

      });


    waybackLayers.push(
      waybackLayer
    );

  }


  // ============================================================
  // STORE IMAGERY LAYERS
  // ============================================================

  currentLayers.imagery = [

    ...planetLayers,

    ...waybackLayers

  ];


  // ============================================================
  // ADD IMAGERY TO MAP
  // ============================================================

  // Older Planet layers are added first.
  // Newer Planet layers are added later.
  // Wayback is added after Planet imagery.

  for (
    const layer of planetLayers
  ) {

    map.add(
      layer
    );

  }


  for (
    const layer of waybackLayers
  ) {

    map.add(
      layer
    );

  }


  // ============================================================
  // ADD VECTOR LAYERS
  // ============================================================

  map.add(
    fieldsLayer
  );

  map.add(
    pointsLayer
  );


  // ============================================================
  // SAVE REFERENCES
  // ============================================================

  currentLayers.fields =
    fieldsLayer;

  currentLayers.points =
    pointsLayer;


  // ============================================================
  // LOAD VECTOR LAYERS
  // ============================================================

  console.log(
    "Loading fields layer..."
  );

  await fieldsLayer.load();

  console.log(
    "Fields layer loaded."
  );


  console.log(
    "Loading points layer..."
  );

  await pointsLayer.load();

  console.log(
    "Points layer loaded."
  );


  // ============================================================
  // LOAD PLANET LAYERS
  // ============================================================

  if (
    planetLayers.length > 0
  ) {

    console.log(
      "Loading Planet imagery..."
    );


    await Promise.all(

      planetLayers.map(
        layer =>
          layer.load()
      )

    );


    console.log(
      "Planet imagery loaded."
    );

  }


  // ============================================================
  // LOAD WAYBACK LAYERS
  // ============================================================

  if (
    waybackLayers.length > 0
  ) {

    console.log(
      "Loading Wayback imagery..."
    );


    await Promise.all(

      waybackLayers.map(
        layer =>
          layer.load()
      )

    );


    console.log(
      "Wayback imagery loaded."
    );

  }


  // ============================================================
  // ZOOM TO COUNTRY
  // ============================================================

  await view.goTo({

    center:
      config.center,

    zoom:
      config.zoom

  });


  console.log(
    `${config.name} loaded successfully`
  );


  return {

    fieldsLayer,

    pointsLayer,

    planetLayers,

    waybackLayers

  };

}