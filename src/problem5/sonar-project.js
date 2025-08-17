require('dotenv').config();
const scanner = require('sonarqube-scanner').default;

scanner(
  {
    serverUrl: process.env.SONAR_URL || 'http://localhost:9000',
    options: {
      'sonar.projectKey': 'bookstore-api',
      'sonar.projectName': 'Bookstore API',
      'sonar.login': process.env.SONAR_TOKEN,
      'sonar.sources': 'src',
      'sonar.tests': 'tests',
      'sonar.inclusions': '**/*.ts',
      'sonar.exclusions': '**/node_modules/**,**/dist/**',
      'sonar.test.inclusions': '**/tests/**/*.test.ts',
      'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.coverage.exclusions':
        '**/tests/**,**/*.test.ts,src/app.ts,src/server.ts,src/database/migrations/**,src/database/seeds/**',
    },
  },
  () => {
    console.log('✅ SonarQube analysis completed!');
    process.exit();
  }
);
