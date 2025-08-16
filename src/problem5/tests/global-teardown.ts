export default async function globalTeardown() {
  console.log('🐳 Stopping PostgreSQL test container...');

  // Get container reference from global setup
  const container = (global as any).__TEST_CONTAINER__;

  if (container) {
    await container.stop();
    console.log('🐳 PostgreSQL test container stopped');
  }

  console.log('🧹 Global test cleanup completed');
}
