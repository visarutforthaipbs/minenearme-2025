import re

# Read the file
with open('src/pages/CaseDetail.tsx', 'r') as f:
    content = f.read()

# Find the line with '</LayersControl>' and add content after it
missing_content = '''
            {activeMapLayers.miningArea && caseData.polygonGeoJSON && (
              <>
                <CustomPolygonRenderer data={caseData.polygonGeoJSON} />
              </>
            )}

            {activeMapLayers.villages &&
              caseData.villagesGeoJSON &&
              caseData.villagesGeoJSON.features.map(
                (village) =>
                  village.properties && (
                    <Marker
                      key={village.properties.name}
                      position={[
                        village.geometry.coordinates[1],
                        village.geometry.coordinates[0],
                      ]}
                      icon={createVillageIcon(village.properties.impact_level)}
                    >
                      <Popup>
                        <Box p={1}>
                          <Text fontWeight="bold">{village.properties.name}</Text>
                          <Text fontSize="sm">
                            ประชากร: {village.properties.population} คน
                          </Text>
                          <Text fontSize="sm">
                            ระดับผลกระทบ:{" "}
                            {village.properties.impact_level === "high"
                              ? "สูง"
                              : village.properties.impact_level === "medium"
                                ? "ปานกลาง"
                                : "ต่ำ"}
                          </Text>
                        </Box>
                      </Popup>
                    </Marker>
                  )
              )}'''

# Replace the pattern
pattern = r'(\s*</LayersControl>\s*\n)(\s*</MapContainer>)'
replacement = r'\1' + missing_content + r'\n\2'
new_content = re.sub(pattern, replacement, content)

# Write back to file
with open('src/pages/CaseDetail.tsx', 'w') as f:
    f.write(new_content)

print('Fixed JSX structure') 