const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const crypto = require('crypto');

const prisma = new PrismaClient();
const BACKEND_URL = 'http://127.0.0.1:4000';
const TEST_EVENT_ID = 'event-seed-001';

async function runTest() {
  console.log('--- STARTING FORM BUILDER & CUSTOM FIELD VALIDATION TESTING ---');

  // 1. Reset and configure the event to use a CUSTOM form with specific fields
  console.log('Step 1: Setting up CUSTOM form fields for event:', TEST_EVENT_ID);
  
  // Clean existing form fields
  await prisma.formField.deleteMany({ where: { eventId: TEST_EVENT_ID } });

  // Update event status and registration form type
  await prisma.event.update({
    where: { id: TEST_EVENT_ID },
    data: {
      status: 'REGISTRATION_OPEN',
      registrationFormType: 'CUSTOM',
    },
  });

  // Create FormField items:
  // - Name: Required
  // - Roll Number: Required
  // - Email: Required
  // - Department: Optional (isRequired: false)
  // - Year of Study: Required custom field
  // - T-Shirt Size: Optional custom field
  const fields = [
    { label: 'Name', type: 'TEXT', isRequired: true, fieldOrder: 1 },
    { label: 'Roll Number', type: 'TEXT', isRequired: true, fieldOrder: 2 },
    { label: 'Email', type: 'TEXT', isRequired: true, fieldOrder: 3 },
    { label: 'Department', type: 'TEXT', isRequired: false, fieldOrder: 4 },
    { label: 'Year of Study', type: 'TEXT', isRequired: true, fieldOrder: 5 },
    { label: 'T-Shirt Size', type: 'TEXT', isRequired: false, fieldOrder: 6 },
  ];

  for (const f of fields) {
    await prisma.formField.create({
      data: {
        eventId: TEST_EVENT_ID,
        label: f.label,
        type: f.type,
        isRequired: f.isRequired,
        fieldOrder: f.fieldOrder,
      },
    });
  }
  console.log('Form fields setup complete.');

  // Create a clean dummy user to avoid unique constraint violations
  const userId = crypto.randomUUID();
  const testEmail = `testuser_${Date.now()}@rajalakshmi.edu.in`;
  await prisma.user.create({
    data: {
      id: userId,
      email: testEmail,
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      role: 'enthusiasts',
    },
  });

  // Load created fields to fetch their dynamic database IDs
  const createdFields = await prisma.formField.findMany({
    where: { eventId: TEST_EVENT_ID },
  });
  const yearOfStudyField = createdFields.find(f => f.label === 'Year of Study');
  const tShirtField = createdFields.find(f => f.label === 'T-Shirt Size');

  console.log('\nStep 2: Running Validation Test Cases...');

  // Test Case A: Missing required base field (Name)
  try {
    console.log('Test Case A: Sending registration with missing required base field "Name"...');
    await axios.post(`${BACKEND_URL}/api/registrations`, {
      userId,
      eventId: TEST_EVENT_ID,
      roll_number: '2023CS001',
      email: testEmail,
      department: 'CSE',
      answers: [
        { fieldId: yearOfStudyField.id, value: '3rd Year' },
      ],
    });
    console.error('FAIL: Test Case A passed but should have failed!');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('SUCCESS: Validation failed as expected with 400 Bad Request:', err.response.data.message);
    } else {
      console.error('FAIL: Unexpected error in Test Case A:', err.message);
    }
  }

  // Test Case B: Missing required custom field (Year of Study)
  try {
    console.log('Test Case B: Sending registration with missing required custom field "Year of Study"...');
    await axios.post(`${BACKEND_URL}/api/registrations`, {
      userId,
      eventId: TEST_EVENT_ID,
      name: 'Test Student',
      roll_number: '2023CS001',
      email: testEmail,
      department: 'CSE',
      answers: [
        { fieldId: tShirtField.id, value: 'L' },
      ],
    });
    console.error('FAIL: Test Case B passed but should have failed!');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('SUCCESS: Validation failed as expected with 400 Bad Request:', err.response.data.message);
    } else {
      console.error('FAIL: Unexpected error in Test Case B:', err.message);
    }
  }

  // Test Case C: Valid registration with all required fields answered
  try {
    console.log('Test Case C: Sending valid registration with all required fields answered...');
    const res = await axios.post(`${BACKEND_URL}/api/registrations`, {
      userId,
      eventId: TEST_EVENT_ID,
      name: 'Test Student',
      roll_number: '2023CS001',
      email: testEmail,
      department: 'CSE',
      answers: [
        { fieldId: yearOfStudyField.id, value: '3rd Year' },
        { fieldId: tShirtField.id, value: 'L' },
      ],
    });
    if (res.status === 201) {
      console.log('SUCCESS: Registration completed successfully with 201 Created!');
    } else {
      console.error('FAIL: Unexpected status code in Test Case C:', res.status);
    }
  } catch (err) {
    console.error('FAIL: Test Case C failed:', err.response ? err.response.data : err.message);
  }

  // Clean up created test data
  console.log('\nCleaning up test data...');
  await prisma.registrationAnswer.deleteMany({
    where: { registration: { userId } },
  });
  await prisma.registration.deleteMany({
    where: { userId },
  });
  await prisma.user.delete({
    where: { id: userId },
  });
  console.log('Cleanup finished.');
}

runTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
