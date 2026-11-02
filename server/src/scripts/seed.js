import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Farm } from '../models/Farm.js';
import { Crop } from '../models/Crop.js';
import { SoilReport } from '../models/SoilReport.js';
import { WeatherRecord } from '../models/WeatherRecord.js';
import { PestAlert } from '../models/PestAlert.js';
import { Resource } from '../models/Resource.js';
import { Order } from '../models/Order.js';
import { Consultation } from '../models/Consultation.js';
import { CommunityPost } from '../models/CommunityPost.js';
import { FarmActivity } from '../models/FarmActivity.js';
import { Notification } from '../models/Notification.js';
import { generateSoilRecommendations, getIPMRecommendations } from '../services/agronomyService.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Connected to database. Preparing seed data...');

    const isForce = process.argv.includes('--force');

    if (isForce) {
      console.log('[Seeder] Force flag provided. Clearing existing collections...');
      await Promise.all([
        User.deleteMany({}),
        Farm.deleteMany({}),
        Crop.deleteMany({}),
        SoilReport.deleteMany({}),
        WeatherRecord.deleteMany({}),
        PestAlert.deleteMany({}),
        Resource.deleteMany({}),
        Order.deleteMany({}),
        Consultation.deleteMany({}),
        CommunityPost.deleteMany({}),
        FarmActivity.deleteMany({}),
        Notification.deleteMany({}),
      ]);
    }

    // Check if farmer already exists
    let farmer = await User.findOne({ email: 'farmer@agritech.com' });
    if (!farmer) {
      farmer = await User.create({
        name: 'Ramesh Sharma',
        email: 'farmer@agritech.com',
        password: 'Farmer@123456',
        phone: '+91 98112 34567',
        role: 'farmer',
        preferredLanguage: 'en',
        location: {
          address: 'Kisan Vihar, Village Sonipat',
          district: 'Sonipat',
          state: 'Haryana',
          country: 'India',
        },
      });
      console.log('[Seeder] Created demo farmer user: farmer@agritech.com / Farmer@123456');
    }

    let admin = await User.findOne({ email: 'admin@agritech.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Dr. Priya Patel (Admin & Agronomist)',
        email: 'admin@agritech.com',
        password: 'Admin@123456',
        phone: '+91 98765 43210',
        role: 'admin',
        preferredLanguage: 'en',
        location: {
          address: 'Agricultural Center of Excellence, Pusa Campus',
          district: 'New Delhi',
          state: 'Delhi',
          country: 'India',
        },
      });
      console.log('[Seeder] Created demo admin user: admin@agritech.com / Admin@123456');
    }

    // Create demonstration farms
    let greenValleyFarm = await Farm.findOne({ owner: farmer._id, farmName: 'Green Valley Organic Agro' });
    if (!greenValleyFarm) {
      greenValleyFarm = await Farm.create({
        owner: farmer._id,
        farmName: 'Green Valley Organic Agro',
        address: 'Plot 42, GT Road Sub-district, Karnal',
        region: 'North Plains',
        coordinates: { latitude: 29.6857, longitude: 76.9905 },
        totalArea: 18.5,
        areaUnit: 'acres',
        soilType: 'Alluvial',
        irrigationMethod: 'Drip',
      });
    }

    let suryaOrchard = await Farm.findOne({ owner: farmer._id, farmName: 'Surya Sunrise Orchard & Cash Crops' });
    if (!suryaOrchard) {
      suryaOrchard = await Farm.create({
        owner: farmer._id,
        farmName: 'Surya Sunrise Orchard & Cash Crops',
        address: 'Sector 9 Canal Road, Rohtak',
        region: 'Semi-Arid Basin',
        coordinates: { latitude: 28.8955, longitude: 76.6066 },
        totalArea: 12.0,
        areaUnit: 'acres',
        soilType: 'Loamy',
        irrigationMethod: 'Sprinkler',
      });
    }

    // Crops
    const cropsData = [
      {
        farm: greenValleyFarm._id,
        owner: farmer._id,
        cropName: 'Sharbati Wheat',
        variety: 'HD-2967 High Yield',
        plantingDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        expectedHarvestDate: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000),
        fieldArea: 8.0,
        growthStage: 'Vegetative',
        healthStatus: 'Excellent',
        notes: 'First irrigation completed; crown root initiation stage looking vigorous.',
      },
      {
        farm: greenValleyFarm._id,
        owner: farmer._id,
        cropName: 'Basmati Rice',
        variety: 'Pusa 1121 Premium',
        plantingDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
        expectedHarvestDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        fieldArea: 6.5,
        growthStage: 'Maturity',
        healthStatus: 'Good',
        notes: 'Panicle emergence uniform. Grain filling complete; monitoring water cut-off schedule.',
      },
      {
        farm: suryaOrchard._id,
        owner: farmer._id,
        cropName: 'Pusa Ruby Tomato',
        variety: 'Determinate Hybrid',
        plantingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        expectedHarvestDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        fieldArea: 4.0,
        growthStage: 'Flowering',
        healthStatus: 'Fair',
        notes: 'Mild whitefly observation noted on southern edge; bio-spray applied.',
      },
      {
        farm: suryaOrchard._id,
        owner: farmer._id,
        cropName: 'Yellow Mustard',
        variety: 'Pusa Bold',
        plantingDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        expectedHarvestDate: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
        fieldArea: 5.5,
        growthStage: 'Germination',
        healthStatus: 'Excellent',
        notes: '94% seedling emergence recorded. Good soil moisture retention.',
      },
    ];

    let createdCrops = [];
    for (const c of cropsData) {
      let cropDoc = await Crop.findOne({ farm: c.farm, cropName: c.cropName });
      if (!cropDoc) {
        cropDoc = await Crop.create(c);
      }
      createdCrops.push(cropDoc);
    }

    // Soil Reports
    const soilData = [
      {
        farm: greenValleyFarm._id,
        owner: farmer._id,
        crop: createdCrops[0]._id,
        pH: 6.8,
        nitrogen: 280,
        phosphorus: 22,
        potassium: 195,
        moisture: 48,
        organicMatter: 1.8,
        testDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        sourceOfMeasurements: 'laboratory',
        laboratoryName: 'Karnal Soil & Agronomy Testing Center (ISO 17025)',
      },
      {
        farm: suryaOrchard._id,
        owner: farmer._id,
        crop: createdCrops[2]._id,
        pH: 7.6,
        nitrogen: 180,
        phosphorus: 14,
        potassium: 240,
        moisture: 32,
        organicMatter: 1.2,
        testDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        sourceOfMeasurements: 'manual',
        laboratoryName: '',
      },
    ];

    for (const s of soilData) {
      const exists = await SoilReport.findOne({ farm: s.farm, testDate: s.testDate });
      if (!exists) {
        const recommendations = generateSoilRecommendations({
          pH: s.pH,
          nitrogen: s.nitrogen,
          phosphorus: s.phosphorus,
          potassium: s.potassium,
          moisture: s.moisture,
          organicMatter: s.organicMatter,
        });
        await SoilReport.create({ ...s, recommendations });
      }
    }

    // Pest Alerts
    const pestData = [
      {
        farm: suryaOrchard._id,
        owner: farmer._id,
        crop: createdCrops[2]._id,
        pestOrDiseaseName: 'Bemisia tabaci (Silverleaf Whitefly)',
        severity: 'Moderate',
        description: 'Clusters of whiteflies observed under lower leaf surfaces with minor honeydew secretion.',
        symptoms: ['Leaf curling', 'Yellow mottling on foliage', 'Sooty mold accumulation'],
        status: 'Active',
        source: 'Farmer Observation',
      },
      {
        farm: greenValleyFarm._id,
        owner: farmer._id,
        crop: createdCrops[0]._id,
        pestOrDiseaseName: 'Puccinia striiformis (Yellow Stripe Rust)',
        severity: 'Low',
        description: 'Isolated yellow-orange pustules detected on older flag leaves after cool humid spell.',
        symptoms: ['Linear yellow pustules', 'Chlorotic stripes'],
        status: 'Under Control',
        source: 'System Forecast',
      },
    ];

    for (const p of pestData) {
      const exists = await PestAlert.findOne({ farm: p.farm, pestOrDiseaseName: p.pestOrDiseaseName });
      if (!exists) {
        const actions = getIPMRecommendations(p.pestOrDiseaseName, p.severity);
        await PestAlert.create({ ...p, recommendedActions: actions });
      }
    }

    // Farm Activities
    const activitiesData = [
      {
        farm: greenValleyFarm._id,
        user: farmer._id,
        crop: createdCrops[0]._id,
        activityType: 'Fertilization',
        description: 'Applied top-dress neem-coated urea @ 45 kg/acre with balanced zinc sulfate.',
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        cost: 2100,
      },
      {
        farm: greenValleyFarm._id,
        user: farmer._id,
        crop: createdCrops[0]._id,
        activityType: 'Irrigation',
        description: 'Scheduled second irrigation cycle via drip system (duration: 3.5 hrs).',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        cost: 450,
      },
      {
        farm: suryaOrchard._id,
        user: farmer._id,
        crop: createdCrops[2]._id,
        activityType: 'Spraying',
        description: 'Foliar spray of Cold-Pressed Neem Oil (1500 ppm) with sticker solution.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        cost: 850,
      },
      {
        farm: suryaOrchard._id,
        user: farmer._id,
        crop: createdCrops[3]._id,
        activityType: 'Soil Testing',
        description: 'Collected 8-core composite soil samples across Plot B for micro-nutrient analysis.',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        cost: 600,
      },
    ];

    for (const a of activitiesData) {
      const exists = await FarmActivity.findOne({ farm: a.farm, description: a.description });
      if (!exists) {
        await FarmActivity.create(a);
      }
    }

    // Agricultural Marketplace Resources
    const resourcesData = [
      {
        name: 'Certified Sharbati Wheat Seeds (HD-2967)',
        category: 'Seeds',
        description: 'Breeder-certified high-yield wheat seeds with 98% germination guarantee and rust resistance.',
        price: 950,
        unit: '40 kg bag',
        stockQuantity: 45,
        imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop',
        approvalStatus: 'Approved',
        creator: admin._id,
      },
      {
        name: 'Bio-Enriched Neem-Coated Vermicompost',
        category: 'Fertilizers',
        description: 'Organic humus rich in beneficial micro-organisms, nitrogen, phosphorus, and humic acid.',
        price: 420,
        unit: '50 kg bag',
        stockQuantity: 120,
        imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600&auto=format&fit=crop',
        approvalStatus: 'Approved',
        creator: admin._id,
      },
      {
        name: 'Cold-Pressed Botanical Neem Oil (1500 PPM)',
        category: 'Bio-Protectants',
        description: 'Natural eco-friendly insect repellent and anti-feedant suitable for sucking pests.',
        price: 360,
        unit: '1 Litre',
        stockQuantity: 80,
        imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop',
        approvalStatus: 'Approved',
        creator: admin._id,
      },
      {
        name: 'Smart Drip Irrigation Emitter Kit (1 Acre)',
        category: 'Irrigation',
        description: 'Pressure compensating drip line kit with 16mm tubing, punch tool, connectors, and end-caps.',
        price: 7800,
        unit: 'Kit',
        stockQuantity: 15,
        imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=600&auto=format&fit=crop',
        approvalStatus: 'Approved',
        creator: admin._id,
      },
      {
        name: 'Precision Digital Soil NPK & Moisture Tester',
        category: 'Tools & Equipment',
        description: 'Fast handheld 4-in-1 agronomic probe testing pH, moisture, sunlight, and relative conductivity.',
        price: 2450,
        unit: 'Device',
        stockQuantity: 28,
        imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop',
        approvalStatus: 'Approved',
        creator: admin._id,
      },
      {
        name: 'Yellow Pest Monitoring Sticky Traps (Pack of 25)',
        category: 'Pesticides',
        description: 'UV-resistant non-toxic adhesive cards for trapping whiteflies, aphids, and fruit flies.',
        price: 290,
        unit: 'Pack of 25',
        stockQuantity: 90,
        imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600&auto=format&fit=crop',
        approvalStatus: 'Approved',
        creator: admin._id,
      },
    ];

    for (const r of resourcesData) {
      const exists = await Resource.findOne({ name: r.name });
      if (!exists) {
        await Resource.create(r);
      }
    }

    // Community Posts
    const communityData = [
      {
        author: farmer._id,
        title: 'Best results with organic mulching in semi-arid zones',
        content: 'Last season we used straw mulching (about 3 inches thick) across our tomato plots. We reduced irrigation requirements by nearly 35% and noticed zero crust formation after heavy showers. Would highly recommend fellow farmers to try local paddy straw or dry grass mulch!',
        category: 'Farming Tips',
        comments: [
          {
            user: admin._id,
            authorName: admin.name,
            comment: 'Great agronomic practice Ramesh! Straw mulch also builds organic carbon over time as it slowly decomposes.',
          },
        ],
      },
      {
        author: admin._id,
        title: 'Advisory on timely wheat crown-root irrigation',
        content: 'With the arrival of winter weather, ensure the first wheat irrigation takes place between 20-25 days after sowing (CRI stage). Delaying water at this point can reduce tiller count significantly. Check soil moisture probe readings beforehand.',
        category: 'Tech in Farming',
        comments: [],
      },
    ];

    for (const post of communityData) {
      const exists = await CommunityPost.findOne({ title: post.title });
      if (!exists) {
        await CommunityPost.create(post);
      }
    }

    // Consultations
    const consultationData = [
      {
        farmer: farmer._id,
        expert: admin._id,
        subject: 'Intercropping mustard with chickpea: Row ratios',
        category: 'Crop Health',
        question: 'What is the optimal row ratio for intercropping mustard with chickpea under irrigated alluvial conditions to avoid excessive shading?',
        response: 'For irrigated conditions, a 4:1 or 6:1 ratio (6 rows of chickpea to 1 row of mustard) is ideal. Use a tall mustard variety with erect branching (like Pusa Bold) to allow maximum sunlight penetration to the chickpea canopy.',
        status: 'Answered',
        respondedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        farmer: farmer._id,
        subject: 'Optimal timing for biological Trichoderma soil drench',
        category: 'Soil Fertility',
        question: 'Should Trichoderma viride be applied before sowing or along with the first irrigation water?',
        status: 'Open',
      },
    ];

    for (const c of consultationData) {
      const exists = await Consultation.findOne({ farmer: c.farmer, subject: c.subject });
      if (!exists) {
        await Consultation.create(c);
      }
    }

    // Notifications
    const notificationsData = [
      {
        user: farmer._id,
        title: 'Consultation Answered',
        message: 'Dr. Priya Patel has responded to your question regarding mustard & chickpea intercropping.',
        type: 'Consultation Reply',
        link: '/consultations',
        read: false,
      },
      {
        user: farmer._id,
        title: 'Pest Advisory Active',
        message: 'Active pest observation (Silverleaf Whitefly) recorded on Surya Sunrise Orchard.',
        type: 'Pest Alert',
        link: '/pest-alerts',
        read: false,
      },
      {
        user: farmer._id,
        title: 'Optimal Weather Window',
        message: 'Mild humidity and calm wind forecast for the next 48 hours. Favorable for planned field spray.',
        type: 'Weather Warning',
        link: '/weather',
        read: true,
      },
    ];

    for (const n of notificationsData) {
      const exists = await Notification.findOne({ user: n.user, title: n.title });
      if (!exists) {
        await Notification.create(n);
      }
    }

    console.log('[Seeder] Database seeding completed successfully!');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error(`[Seeder] Error during seed operation: ${err.message}`);
    await disconnectDB();
    process.exit(1);
  }
};

seedDatabase();
