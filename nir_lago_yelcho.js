// ----------------------------------------------
// PARÁMETROS GENERALES
// ----------------------------------------------
var roi = ee.Geometry.Rectangle([-72.55, -43.55, -72.2, -43.2]);

// Función para enmascarar nubes usando la máscara QA_PIXEL (Landsat 9) y QA (Landsat 5)
function maskLandsatSR(image) {
  var cloudShadowBitMask = (1 << 3); // sombra
  var cloudsBitMask = (1 << 5); // nubes
  var qa = image.select('QA_PIXEL');
  return image.updateMask(qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                          .and(qa.bitwiseAnd(cloudsBitMask).eq(0)));
}

// ----------------------------------------------
// IMAGEN 1: LANDSAT 5 - AÑO 1985
// ----------------------------------------------
var l5 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")
  .filterBounds(roi)
  .filterDate('1985-01-01', '1985-12-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 30))
  .map(function(image) {
    var opticalBands = image.select(['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4']).multiply(0.0000275).add(-0.2);
    return opticalBands.copyProperties(image, image.propertyNames());
  })
  .median()
  .clip(roi);

// ----------------------------------------------
// IMAGEN 2: LANDSAT 9 - AÑO 2023
// ----------------------------------------------
var l9 = ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
  .filterBounds(roi)
  .filterDate('2023-01-01', '2023-12-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 30))
  .map(maskLandsatSR)
  .map(function(image) {
    var opticalBands = image.select(['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5']).multiply(0.0000275).add(-0.2);
    return opticalBands.copyProperties(image, image.propertyNames());
  })
  .median()
  .clip(roi);

// ----------------------------------------------
// VISUALIZACIÓN (Color real)
// ----------------------------------------------
Map.centerObject(roi, 10);
Map.addLayer(l5.select(['SR_B3', 'SR_B2', 'SR_B1']), {min:0, max:0.3}, 'Landsat 5 (1985) - RGB');
Map.addLayer(l9.select(['SR_B4', 'SR_B3', 'SR_B2']), {min:0, max:0.3}, 'Landsat 9 (2023) - RGB');

// ----------------------------------------------
// EXPORTACIONES
// ----------------------------------------------

// 1. LANDSAT 5 - 1985 - COLOR REAL
Export.image.toDrive({
  image: l5.select(['SR_B3', 'SR_B2', 'SR_B1']),
  description: 'Yelcho_L5_1985_RGB',
  folder: 'GEE_exports',
  fileNamePrefix: 'Yelcho_L5_1985_RGB',
  region: roi,
  scale: 30,
  crs: 'EPSG:32718',
  fileFormat: 'GeoTIFF'
});

// 2. LANDSAT 9 - 2023 - COLOR REAL 
Export.image.toDrive({
  image: l9.select(['SR_B4', 'SR_B3', 'SR_B2']),
  description: 'Yelcho_L9_2023_RGB',
  folder: 'GEE_exports',
  fileNamePrefix: 'Yelcho_L9_2023_RGB',
  region: roi,
  scale: 30,
  crs: 'EPSG:32718',
  fileFormat: 'GeoTIFF'
});

// 3. LANDSAT 5 - 1985 - FALSO COLOR INFRARROJO
Export.image.toDrive({
  image: l5.select(['SR_B4', 'SR_B3', 'SR_B2']), // NIR, Red, Green
  description: 'Yelcho_L5_1985_NIR',
  folder: 'GEE_exports',
  fileNamePrefix: 'Yelcho_L5_1985_NIR',
  region: roi,
  scale: 30,
  crs: 'EPSG:32718',
  fileFormat: 'GeoTIFF'
});

// 4. LANDSAT 9 - 2023 - FALSO COLOR INFRARROJO
Export.image.toDrive({
  image: l9.select(['SR_B5', 'SR_B4', 'SR_B3']), // NIR, Red, Green
  description: 'Yelcho_L9_2023_NIR',
  folder: 'GEE_exports',
  fileNamePrefix: 'Yelcho_L9_2023_NIR',
  region: roi,
  scale: 30,
  crs: 'EPSG:32718',
  fileFormat: 'GeoTIFF'
});

Map.addLayer(l5.select(['SR_B4', 'SR_B3', 'SR_B2']), {min:0, max:0.3}, 'Landsat 5 (1985) - NIR');
Map.addLayer(l9.select(['SR_B5', 'SR_B4', 'SR_B3']), {min:0, max:0.3}, 'Landsat 9 (2023) - NIR');
