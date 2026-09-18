export interface ImagerySeason {
  name: string;
  start: string;
  end: string;
}

export interface WaybackImagery {
  name: string;
  date: string;
  url: string;
}

export interface CountryConfig {
  name: string;

  fieldsUrl: string;
  pointsUrl: string;

  imagery?: {
    provider: "planet";

    seasons: ImagerySeason[];

    wayback?: WaybackImagery;
  };

  center: [
    number,
    number
  ];

  zoom: number;
}

export const COUNTRIES:
  Record<string, CountryConfig> = {

  // ==================================================
  // Colombia
  // ==================================================

  colombia: {

    name:
      "Colombia",

    fieldsUrl:
      "https://services3.arcgis.com/0OPQIK59PJJqLK0A/arcgis/rest/services/Colombia_thematic_disagreements/FeatureServer/1",

    pointsUrl:
      "https://services3.arcgis.com/0OPQIK59PJJqLK0A/arcgis/rest/services/Colombia_thematic_disagreements/FeatureServer/0",

    imagery: {

      provider:
        "planet",

      seasons: [

        {
          name:
            "Colombia Agricultural Season",

          start:
            "2024-01-01",

          end:
            "2024-09-30"
        }

      ],

      wayback: {

        name:
          "2024-09-19 Wayback",

        date:
          "2024-09-19",

        url:
          "https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/20337/{level}/{row}/{col}"

      }

    },

    center: [
      -74,
      4
    ],

    zoom:
      5

  },


  // ==================================================
  // Argentina
  // ==================================================

  argentina: {

    name:
      "Argentina",

    fieldsUrl:
      "https://services3.arcgis.com/0OPQIK59PJJqLK0A/arcgis/rest/services/Argentina_thematic_disagreements/FeatureServer/0",

    pointsUrl:
      "https://services3.arcgis.com/0OPQIK59PJJqLK0A/arcgis/rest/services/Argentina_thematic_disagreements/FeatureServer/1",

    imagery: {

      provider:
        "planet",

      seasons: [

        {
          name:
            "Argentina Agricultural Season",

          start:
            "2023-07-01",

          end:
            "2024-07-31"
        }

      ],

      wayback: {

        name:
          "2024-08-15 Wayback",

        date:
          "2024-08-15",

        url:
          "https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/32553/{level}/{row}/{col}"

      }

    },

    center: [
      -64,
      -34
    ],

    zoom:
      4

  },


  // ==================================================
  // Venezuela
  // ==================================================

  venezuela: {

    name:
      "Venezuela",

    fieldsUrl:
      "https://services3.arcgis.com/0OPQIK59PJJqLK0A/arcgis/rest/services/Venezuela_thematic_disagreements/FeatureServer/1",

    pointsUrl:
      "https://services3.arcgis.com/0OPQIK59PJJqLK0A/arcgis/rest/services/Venezuela_thematic_disagreements/FeatureServer/0",

    imagery: {

      provider:
        "planet",

      seasons: [

        {
          name:
            "Venezuela Agricultural Season",

          start:
            "2024-02-01",

          end:
            "2024-12-31"
        }

      ],

      wayback: {

        name:
          "2024-12-12 Wayback",

        date:
          "2024-12-12",

        url:
          "https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/16453/{level}/{row}/{col}"

      }

    },

    center: [
      -66,
      7
    ],

    zoom:
      5

  },


  // ==================================================
  // Ecuador
  // ==================================================

  ecuador: {

    name:
      "Ecuador",

    fieldsUrl:
      "https://services3.arcgis.com/0OPQIK59PJJqLK0A/arcgis/rest/services/Ecuador_thematic_disagreements/FeatureServer/0",

    pointsUrl:
      "https://services3.arcgis.com/0OPQIK59PJJqLK0A/arcgis/rest/services/Ecuador_thematic_disagreements/FeatureServer/1",

    imagery: {

      provider:
        "planet",

      seasons: [

        {
          name:
            "Ecuador Agricultural Season",

          start:
            "2023-10-01",

          end:
            "2024-09-30"
        }

      ],

      wayback: {

        name:
          "2024-10-10 Wayback",

        date:
          "2024-10-10",

        url:
          "https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/56450/{level}/{row}/{col}"

      }

    },

    center: [
      -78.5,
      -1.5
    ],

    zoom:
      6

  }

};