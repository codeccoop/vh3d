import os.path
from osgeo import ogr

driver = ogr.GetDriverByName("GeoJSON")
src_ds = driver.Open("ways.geojson", 0)
src_layer = src_ds.GetLayer()

if os.path.exists("paths.geojson"):
    driver.DeleteDataSource("paths.geojson")

dst_ds = driver.CreateDataSource("paths.geojson")
dst_layer = dst_ds.CreateLayer("paths", geom_type=ogr.wkbPolygon)

src_defn = src_layer.GetLayerDefn()
for i in range(src_defn.GetFieldCount()):
    field_defn = src_defn.GetFieldDefn(i)
    dst_layer.CreateField(field_defn)

dst_defn = dst_layer.GetLayerDefn()

for feat in src_layer:
    new = ogr.Feature(dst_defn)
    
    for i in range(dst_defn.GetFieldCount()):
        field_defn = dst_defn.GetFieldDefn(i)
        new.SetField(field_defn.GetNameRef(), feat.GetField(i))

    geom = feat.GetGeometryRef()
    buffered = geom.Buffer(5., 1)
    new.SetGeometry(buffered)
    dst_layer.CreateFeature(new)
    new = None
