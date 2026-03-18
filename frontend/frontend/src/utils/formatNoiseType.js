// Utility function to format noise type from class name to readable text
export const formatNoiseType = (noiseType) => {
  if (!noiseType) return "Unknown";
  
  // Common noise type mappings
  const noiseTypeMap = {
    'car_horn': 'Car Horn',
    'street_music': 'Street Music',
    'dog_bark': 'Dog Bark',
    'air_conditioner': 'Air Conditioner',
    'children_playing': 'Children Playing',
    'drilling': 'Drilling',
    'engine_idling': 'Engine Idling',
    'gun_shot': 'Gun Shot',
    'jackhammer': 'Jackhammer',
    'siren': 'Siren'
  };
  
  // Check if we have a specific mapping
  if (noiseTypeMap[noiseType.toLowerCase()]) {
    return noiseTypeMap[noiseType.toLowerCase()];
  }
  
  // Generic formatting: replace underscores with spaces and capitalize each word
  return noiseType
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};