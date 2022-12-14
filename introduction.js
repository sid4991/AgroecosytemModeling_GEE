// Let's load the Sentinel-2 Collection
// Open the following page, search for Sentinel-2
// Browse to Sentinel-2 Level 1C data and copy/paste the code snippet
// https://developers.google.com/earth-engine/datasets


// You can also search for collections
// Search for 'Sentinel-2' and load the Level 2A dataset

/**
 * Function to mask clouds using the Sentinel-2 QA band
 * @param {ee.Image} image Sentinel-2 image
 * @return {ee.Image} cloud masked Sentinel-2 image
 */
 function maskS2clouds(image) {
    var qa = image.select('QA60');
  
    // Bits 10 and 11 are clouds and cirrus, respectively.
    var cloudBitMask = 1 << 10;
    var cirrusBitMask = 1 << 11;
  
    // Both flags should be set to zero, indicating clear conditions.
    var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
        .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  
    return image.updateMask(mask).divide(10000);
  }
  
  var dataset = ee.ImageCollection('COPERNICUS/S2_SR')
                    .filterDate('2020-01-01', '2020-02-01')
                    // Pre-filter to get less cloudy granules.
                    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                    .map(maskS2clouds);
  
  var visualization = {
    min: 0.0,
    max: 0.3,
    bands: ['B4', 'B3', 'B2'],
  };
  
  Map.setCenter(-117.1801, 46.727, 12, 12);
  
  Map.addLayer(dataset.mean(), visualization, 'RGB');


// FILTERING IMAGE COLLECTION

var geometry = ee.Geometry.Point([-117.1801, 46.727, 12])
  Map.centerObject(geometry, 10)
  
  var s2 = ee.ImageCollection("COPERNICUS/S2");
  
  // Filter by metadata
  var filtered = s2.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  
  // Filter by date
  var filtered = s2.filter(ee.Filter.date('2019-01-01', '2020-01-01'))
  
  // Filter by location
  var filtered = s2.filter(ee.Filter.bounds(geometry))
  
  // Let's apply all the 3 filters together on the collection
  
  // First apply metadata fileter
  var filtered1 = s2.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  // Apply date filter on the results
  var filtered2 = filtered1.filter(
    ee.Filter.date('2019-01-01', '2020-01-01'))
  // Lastly apply the location filter
  var filtered3 = filtered2.filter(ee.Filter.bounds(geometry))
  
  // Instead of applying filters one after the other, we can 'chain' them
  // Use the . notation to apply all the filters together
  var filtered = s2.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
    .filter(ee.Filter.date('2019-01-01', '2020-01-01'))
    .filter(ee.Filter.bounds(geometry))
    
  print(filtered.size())

  
  
// MOSAIC AND COMPOSITES

  var geometry = ee.Geometry.Point([-117.1801, 46.727, 12])
var s2 = ee.ImageCollection("COPERNICUS/S2");

var rgbVis = {
  min: 0.0,
  max: 3000,
  bands: ['B4', 'B3', 'B2'],
};
var filtered = s2.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  .filter(ee.Filter.date('2019-01-01', '2020-01-01'))
  .filter(ee.Filter.bounds(geometry))
 
var mosaic = filtered.mosaic() 
 
var medianComposite = filtered.median();

Map.addLayer(filtered, rgbVis, 'Filtered Collection');
Map.addLayer(mosaic, rgbVis, 'Mosaic');
Map.addLayer(medianComposite, rgbVis, 'Median Composite')

// FEATURE COLLECTIONS

var admin2 = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017");

var japan = admin2.filter(ee.Filter.eq('country_na', 'Japan'))

var visParams = {'color': 'red'}
Map.addLayer(japan, visParams, 'Japan')

// IMPORT THE DATA IN ASSET

// Let's import some data to Earth Engine

// Download the 'Urban Areas' from Natural Earth
// https://www.naturalearthdata.com/downloads/10m-cultural-vectors/

// Unzip and upload the ne_10m_urban_areas shapefile

var urban = ee.FeatureCollection("users/sid4991/Urbanareas");

// Visualize the collection
Map.addLayer(urban, {color: 'blue'}, 'Urban Areas')

// CLIPPING

var s2 = ee.ImageCollection("COPERNICUS/S2")
var urban = ee.FeatureCollection("users/sid4991/Urbanareas")

// Find the feature id by adding the layer to the map and using Inspector.
var filtered = urban.filter(ee.Filter.eq('system:index', '00000000000000002bf8'))

var geometry = filtered.geometry()

var rgbVis = {
  min: 0.0,
  max: 3000,
  bands: ['B4', 'B3', 'B2'], 
};
var filtered = s2.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  .filter(ee.Filter.date('2019-01-01', '2020-01-01'))
  .filter(ee.Filter.bounds(geometry))

var image = filtered.median(); 

var clipped = image.clip(geometry)

Map.addLayer(clipped, rgbVis, 'Clipped')


// EXPORT

var s2 = ee.ImageCollection("COPERNICUS/S2")
var urban = ee.FeatureCollection("users/sid4991/Urbanareas")

var filtered = urban.filter(ee.Filter.eq('system:index', '00000000000000002bf8'))
var geometry = filtered.geometry()

var rgbVis = {
  min: 0.0,
  max: 3000,
  bands: ['B4', 'B3', 'B2'], 
};
var filtered = s2.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  .filter(ee.Filter.date('2019-01-01', '2020-01-01'))
  .filter(ee.Filter.bounds(geometry))

var image = filtered.median(); 

var clipped = image.clip(geometry)

Map.addLayer(clipped, rgbVis, 'Clipped') 

var exportImage = clipped.select('B.*')

Export.image.toDrive({
    image: exportImage,
    description: 'WA_Composite_Raw',
    folder: 'earthengine',
    fileNamePrefix: 'WA_composite_raw',
    region: geometry,
    scale: 10,
    maxPixels: 1e9
})

// Rather than exporting raw bands, we can apply a rendered image
// visualize() function allows you to apply the same parameters 
// that are used in earth engine which exports a 3-band RGB image
print(clipped)
var visualized = clipped.visualize(rgbVis)
print(visualized)
// Now the 'visualized' image is RGB image, no need to give visParams
Map.addLayer(visualized, {}, 'Visualized Image') 

Export.image.toDrive({
    image: visualized,
    description: 'WA_Composite_Visualized',
    folder: 'earthengine',
    fileNamePrefix: 'WA_composite_visualized',
    region: geometry,
    scale: 10,
    maxPixels: 1e9
})