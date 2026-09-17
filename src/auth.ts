import OAuthInfo from
  "@arcgis/core/identity/OAuthInfo.js";

import identityManager from
  "@arcgis/core/identity/IdentityManager.js";


const oauthInfo =
  new OAuthInfo({

    appId:
      "rLbjPBqgKW3z140u",

    portalUrl:
      "https://www.arcgis.com",

    popup:
      false

  });


identityManager.registerOAuthInfos([
  oauthInfo
]);


export async function signIn() {

  console.log(
    "Starting ArcGIS Online sign-in..."
  );


  await identityManager.getCredential(
    "https://www.arcgis.com/sharing/rest"
  );


  console.log(
    "ArcGIS Online sign-in complete."
  );

}