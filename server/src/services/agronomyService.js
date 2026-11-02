/**
 * Agronomic reference ranges and rule-based diagnostic engine.
 * Based on standard agricultural extension parameters (FAO and ICAR guidelines).
 */

export const generateSoilRecommendations = ({ pH, nitrogen, phosphorus, potassium, moisture, organicMatter, cropName }) => {
  const recommendations = [];

  // 1. pH evaluation (Optimal range typically 6.0 - 7.5 for most cereal/vegetable crops)
  if (pH < 5.5) {
    recommendations.push(
      'Strongly acidic soil (pH < 5.5): Apply agricultural lime (calcium carbonate) or dolomite at 1.5 - 2 tons/hectare to improve nutrient availability.'
    );
  } else if (pH < 6.0) {
    recommendations.push(
      'Moderately acidic soil (pH 5.5 - 6.0): Incorporate well-decomposed farmyard manure and avoid heavy use of ammonium-based fertilizers.'
    );
  } else if (pH > 8.5) {
    recommendations.push(
      'Alkaline/saline soil (pH > 8.5): Apply agricultural gypsum (calcium sulfate) and green manuring (e.g., Sesbania/Dhaincha) to lower alkalinity.'
    );
  } else if (pH > 7.5) {
    recommendations.push(
      'Slightly alkaline soil (pH 7.5 - 8.5): Supplement with zinc and iron chelates, as micronutrient uptake may be restricted.'
    );
  } else {
    recommendations.push(
      'Optimal soil pH (6.0 - 7.5): Excellent nutrient availability. Maintain balance with regular compost amendments.'
    );
  }

  // 2. Nitrogen (N) (Low: < 240 kg/ha or < 140 mg/kg; Medium: 240-480; High: > 480)
  if (nitrogen < 200) {
    recommendations.push(
      'Nitrogen deficiency detected: Top-dress with urea in split doses or apply enriched neem-coated vermicompost (2-3 tonnes/acre).'
    );
  } else if (nitrogen > 500) {
    recommendations.push(
      'Excessive nitrogen level: Suspend additional nitrogenous fertilizers to prevent vegetative lodging and increased susceptibility to sucking pests.'
    );
  } else {
    recommendations.push('Available nitrogen is within healthy agronomic levels.');
  }

  // 3. Phosphorus (P) (Low: < 11 kg/ha; Medium: 11-25; High: > 25)
  if (phosphorus < 15) {
    recommendations.push(
      'Phosphorus deficit: Apply Single Super Phosphate (SSP) or rock phosphate near root zone during basal dressing to stimulate root development.'
    );
  } else if (phosphorus > 35) {
    recommendations.push('Phosphorus is high: Skip additional phosphatic fertilizers this season.');
  } else {
    recommendations.push('Phosphorus availability is balanced for root and flower development.');
  }

  // 4. Potassium (K) (Low: < 110 kg/ha; Medium: 110-280; High: > 280)
  if (potassium < 120) {
    recommendations.push(
      'Potassium deficit: Apply Muriate of Potash (MOP) or Sulfate of Potash (SOP) to boost drought tolerance and grain/fruit quality.'
    );
  } else if (potassium > 320) {
    recommendations.push('Potassium reserve is plentiful; monitor magnesium balance.');
  } else {
    recommendations.push('Potassium is in ideal range for cellular turgor and pest resistance.');
  }

  // 5. Moisture (0 - 100%)
  if (moisture < 30) {
    recommendations.push(
      'Critical soil moisture deficit (< 30%): Immediate irrigation recommended. Consider drip irrigation and mulching to conserve moisture.'
    );
  } else if (moisture > 75) {
    recommendations.push(
      'High soil saturation (> 75%): Ensure adequate field drainage to avoid root hypoxia and fungal damping-off.'
    );
  } else {
    recommendations.push('Soil moisture is within favorable field capacity (35% - 70%).');
  }

  // 6. Organic Matter (Optimal > 2%)
  if (organicMatter < 1.0) {
    recommendations.push(
      'Low organic carbon (< 1.0%): Add biomass, biochar, or cover crops (cowpea/sunn hemp) to enhance soil structure and microbial diversity.'
    );
  }

  if (cropName) {
    recommendations.push(
      `Crop-specific advisory for ${cropName}: Monitor vegetative transitions closely and cross-reference with seasonal irrigation scheduling.`
    );
  }

  return recommendations;
};

// IPM (Integrated Pest Management) rule-based guidance
export const getIPMRecommendations = (pestName, severity) => {
  const normalized = (pestName || '').toLowerCase();
  const tips = [];

  if (normalized.includes('aphid') || normalized.includes('whitefly') || normalized.includes('thrip')) {
    tips.push('Install yellow sticky traps (10-12 per acre) at canopy height.');
    tips.push('Foliar spray of neem seed kernel extract (NSKE 5%) or cold-pressed neem oil (1500 ppm).');
    if (severity === 'High' || severity === 'Critical') {
      tips.push('For severe infestations, consult local extension office before systemic chemical spray (e.g. Imidacloprid/Acetamiprid).');
    }
  } else if (normalized.includes('borer') || normalized.includes('caterpillar') || normalized.includes('armyworm')) {
    tips.push('Deploy pheromone traps (5 per acre) for monitoring adult moth populations.');
    tips.push('Release Trichogramma egg parasitoids @ 50,000/ha at 7-10 day intervals.');
    tips.push('Apply Bacillus thuringiensis (Bt) @ 2g/litre of water in late afternoon.');
  } else if (normalized.includes('blight') || normalized.includes('rot') || normalized.includes('rust') || normalized.includes('mildew')) {
    tips.push('Prune infected leaves and dispose of them outside the field; avoid overhead sprinkler irrigation.');
    tips.push('Apply Trichoderma viride or Pseudomonas fluorescens as soil and foliar bio-fungicide.');
    if (severity === 'High' || severity === 'Critical') {
      tips.push('Apply copper oxychloride or systemic fungicide as per verified label instructions.');
    }
  } else {
    tips.push('Remove and burn severely infected crop debris to prevent vector spread.');
    tips.push('Introduce beneficial predator insects (e.g. ladybird beetles, lacewings).');
    tips.push('Maintain optimal row spacing and weed-free field borders.');
  }

  tips.push('Note: This guidance provides agronomic best practices. Verify diagnoses with certified regional agricultural specialists.');
  return tips;
};
