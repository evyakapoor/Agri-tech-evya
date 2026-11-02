import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Farm } from '../models/Farm.js';
import { Crop } from '../models/Crop.js';
import { SoilReport } from '../models/SoilReport.js';
import { Resource } from '../models/Resource.js';

let farmerToken = '';
let adminToken = '';
let otherFarmerToken = '';
let farmerId = '';
let testFarmId = '';
let testCropId = '';
let testResourceId = '';

beforeAll(async () => {
  await connectDB();
  // Clear any existing test data
  await Promise.all([
    User.deleteMany({}),
    Farm.deleteMany({}),
    Crop.deleteMany({}),
    SoilReport.deleteMany({}),
    Resource.deleteMany({}),
  ]);
});

afterAll(async () => {
  await disconnectDB();
});

describe('Agri-Tech API Comprehensive Test Suite', () => {
  describe('1. API Health & Connectivity', () => {
    it('GET /api/health returns 200 with service status and database connectivity', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.database).toBeDefined();
      expect(res.body.database.connected).toBe(true);
    });
  });

  describe('2. Authentication & Authorization', () => {
    it('Registers a new farmer successfully and returns JWT', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Kisan Test Singh',
          email: 'kisansingh@example.com',
          password: 'Password@123',
          phone: '+91 99999 11111',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('farmer'); // Default role
      farmerToken = res.body.token;
      farmerId = res.body.user._id;
    });

    it('Rejects duplicate email registration with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Kisan',
          email: 'kisansingh@example.com',
          password: 'Password@123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('Rejects registration with invalid email or short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bad Input',
          email: 'not-an-email',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('Logs in registered farmer with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'kisansingh@example.com',
          password: 'Password@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('Rejects login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'kisansingh@example.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('Creates an administrator directly and tests admin login', async () => {
      const adminUser = await User.create({
        name: 'Admin Test Officer',
        email: 'admintest@example.com',
        password: 'AdminPassword@123',
        role: 'admin',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admintest@example.com',
          password: 'AdminPassword@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('admin');
      adminToken = res.body.token;
    });

    it('Creates a second farmer for cross-ownership testing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second Farmer',
          email: 'secondfarmer@example.com',
          password: 'Password@123',
        });

      expect(res.status).toBe(201);
      otherFarmerToken = res.body.token;
    });

    it('GET /api/auth/me returns current user info with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('kisansingh@example.com');
    });

    it('Denies access to protected routes without token', async () => {
      const res = await request(app).get('/api/farms');
      expect(res.status).toBe(401);
    });
  });

  describe('3. Farm Management & Ownership Enforcement', () => {
    it('Creates a new farm for authenticated farmer', async () => {
      const res = await request(app)
        .post('/api/farms')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          farmName: 'Shanti Agro Farm',
          address: 'Village Narela, North Delhi',
          totalArea: 10.5,
          areaUnit: 'acres',
          soilType: 'Alluvial',
          irrigationMethod: 'Drip',
        });

      expect(res.status).toBe(201);
      expect(res.body.farm.farmName).toBe('Shanti Agro Farm');
      expect(res.body.farm.owner).toBe(farmerId);
      testFarmId = res.body.farm._id;
    });

    it('Retrieves list of farms belonging to authenticated farmer', async () => {
      const res = await request(app)
        .get('/api/farms')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.farms.length).toBe(1);
      expect(res.body.farms[0]._id).toBe(testFarmId);
    });

    it('Prevents other farmer from modifying first farmer farm (Ownership Check)', async () => {
      const res = await request(app)
        .put(`/api/farms/${testFarmId}`)
        .set('Authorization', `Bearer ${otherFarmerToken}`)
        .send({
          farmName: 'Hacked Farm Name',
          address: 'Unauthorized address',
          totalArea: 5,
        });

      expect(res.status).toBe(403);
    });

    it('Allows the farm owner to update their farm', async () => {
      const res = await request(app)
        .put(`/api/farms/${testFarmId}`)
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          farmName: 'Shanti Organic Agro Farm',
          address: 'Village Narela, North Delhi',
          totalArea: 12.0,
        });

      expect(res.status).toBe(200);
      expect(res.body.farm.farmName).toBe('Shanti Organic Agro Farm');
      expect(res.body.farm.totalArea).toBe(12.0);
    });
  });

  describe('4. Crop Management CRUD', () => {
    it('Registers a new crop under the farm', async () => {
      const res = await request(app)
        .post('/api/crops')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          farm: testFarmId,
          cropName: 'Golden Wheat',
          variety: 'HD-3086',
          plantingDate: '2026-10-15',
          expectedHarvestDate: '2027-03-20',
          fieldArea: 6.0,
          growthStage: 'Vegetative',
          healthStatus: 'Good',
        });

      expect(res.status).toBe(201);
      expect(res.body.crop.cropName).toBe('Golden Wheat');
      testCropId = res.body.crop._id;
    });

    it('Rejects crop creation on a farm belonging to another user', async () => {
      const res = await request(app)
        .post('/api/crops')
        .set('Authorization', `Bearer ${otherFarmerToken}`)
        .send({
          farm: testFarmId,
          cropName: 'Unauthorized Crop',
          plantingDate: '2026-10-15',
          expectedHarvestDate: '2027-03-20',
          fieldArea: 2.0,
        });

      expect(res.status).toBe(403);
    });

    it('Retrieves crop by ID and includes growth stage recommendation', async () => {
      const res = await request(app)
        .get(`/api/crops/${testCropId}`)
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.crop.cropName).toBe('Golden Wheat');
      expect(res.body.stageRecommendation).toBeDefined();
    });
  });

  describe('5. Soil Health Analysis & Rule-based Recommendations', () => {
    it('Creates soil report and generates agronomic recommendations', async () => {
      const res = await request(app)
        .post('/api/soil-reports')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          farm: testFarmId,
          crop: testCropId,
          pH: 5.4, // Acidic
          nitrogen: 160, // Deficient
          phosphorus: 20,
          potassium: 180,
          moisture: 42,
          organicMatter: 1.4,
          sourceOfMeasurements: 'manual',
        });

      expect(res.status).toBe(201);
      expect(res.body.report.pH).toBe(5.4);
      expect(res.body.report.recommendations.length).toBeGreaterThan(0);
      // Verify rule-based detection for acidic pH
      const hasAcidicNotice = res.body.report.recommendations.some((r) => r.includes('acidic'));
      expect(hasAcidicNotice).toBe(true);
    });

    it('Rejects soil report with out-of-range pH value (> 14)', async () => {
      const res = await request(app)
        .post('/api/soil-reports')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          farm: testFarmId,
          pH: 15.5,
          nitrogen: 200,
          phosphorus: 20,
          potassium: 200,
          moisture: 50,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('6. Marketplace & Atomic Order Validation', () => {
    it('Admin creates an agricultural product in catalog', async () => {
      const res = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'High Purity Trichoderma Bio-Fungicide',
          category: 'Bio-Protectants',
          description: 'Prevents root rot and wilt pathogens',
          price: 350,
          unit: '1 kg packet',
          stockQuantity: 10,
          approvalStatus: 'Approved',
        });

      expect(res.status).toBe(201);
      expect(res.body.resource.name).toBe('High Purity Trichoderma Bio-Fungicide');
      testResourceId = res.body.resource._id;
    });

    it('Non-admin cannot create resource listing directly', async () => {
      const res = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          name: 'Farmer unauthorized listing',
          category: 'Seeds',
          description: 'Test',
          price: 100,
          stockQuantity: 5,
        });

      expect(res.status).toBe(403);
    });

    it('Farmer places order and stock decrements atomically', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          items: [{ resourceId: testResourceId, quantity: 3 }],
          deliveryDetails: {
            fullName: 'Kisan Test Singh',
            phone: '+91 99999 11111',
            address: 'Farm House No. 4, Village Narela',
            city: 'Delhi',
            postalCode: '110040',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.order.total).toBe(350 * 3);

      // Verify stock in database reduced from 10 to 7
      const updatedProduct = await Resource.findById(testResourceId);
      expect(updatedProduct.stockQuantity).toBe(7);
    });

    it('Rejects order if requested quantity exceeds available stock', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          items: [{ resourceId: testResourceId, quantity: 50 }], // Available is 7
          deliveryDetails: {
            fullName: 'Kisan Test Singh',
            phone: '+91 99999 11111',
            address: 'Village Narela',
            city: 'Delhi',
            postalCode: '110040',
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Insufficient stock/i);
    });
  });

  describe('7. Admin Authorization & Statistics', () => {
    it('Admin retrieves platform-wide statistics', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.stats.totalUsers).toBeGreaterThanOrEqual(3);
      expect(res.body.stats.totalFarms).toBeGreaterThanOrEqual(1);
      expect(res.body.stats.totalRevenue).toBe(1050);
    });

    it('Regular farmer is denied access to admin stats', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(403);
    });
  });
});
