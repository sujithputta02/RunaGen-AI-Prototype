import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export class SimulationService {
  constructor() {
    this.sandboxDir = path.join(process.cwd(), 'temp', 'simulations');
    this.maxExecutionTime = 30000; // 30 seconds
    this.maxMemoryMB = 512; // 512MB
    this.supportedLanguages = ['python', 'javascript', 'sql'];
  }

  // Create sandboxed environment for code execution
  async createSandbox(sessionId) {
    const sandboxPath = path.join(this.sandboxDir, sessionId);
    await fs.mkdir(sandboxPath, { recursive: true });
    return sandboxPath;
  }

  // Clean up sandbox after execution
  async cleanupSandbox(sandboxPath) {
    try {
      await fs.rm(sandboxPath, { recursive: true, force: true });
    } catch (error) {
      console.error('Sandbox cleanup failed:', error);
    }
  }

  // Run Python code simulation
  async runPythonSimulation(code, testCases, sandboxPath) {
    const results = {
      success: false,
      output: '',
      errors: '',
      testResults: [],
      score: 0,
      executionTime: 0
    };

    const startTime = Date.now();
    
    try {
      // Write user code to file
      const codeFile = path.join(sandboxPath, 'solution.py');
      await fs.writeFile(codeFile, code);

      // Write test cases
      const testFile = path.join(sandboxPath, 'test_cases.py');
      const testCode = this.generatePythonTestCode(testCases);
      await fs.writeFile(testFile, testCode);

      // Execute with timeout and memory limits
      const { stdout, stderr, exitCode } = await this.executeWithLimits(
        'python', 
        [codeFile], 
        sandboxPath,
        this.maxExecutionTime,
        this.maxMemoryMB
      );

      results.executionTime = Date.now() - startTime;
      results.output = stdout;
      results.errors = stderr;

      if (exitCode === 0) {
        // Run test cases
        const testResults = await this.runPythonTests(testCases, sandboxPath);
        results.testResults = testResults;
        results.score = this.calculateScore(testResults);
        results.success = results.score >= 60; // Minimum passing score
      }

    } catch (error) {
      results.errors = error.message;
      results.executionTime = Date.now() - startTime;
    }

    return results;
  }

  // Run JavaScript code simulation
  async runJavaScriptSimulation(code, testCases, sandboxPath) {
    const results = {
      success: false,
      output: '',
      errors: '',
      testResults: [],
      score: 0,
      executionTime: 0
    };

    const startTime = Date.now();
    
    try {
      // Write user code to file
      const codeFile = path.join(sandboxPath, 'solution.js');
      await fs.writeFile(codeFile, code);

      // Write test cases
      const testFile = path.join(sandboxPath, 'test_cases.js');
      const testCode = this.generateJavaScriptTestCode(testCases);
      await fs.writeFile(testFile, testCode);

      // Execute with timeout and memory limits
      const { stdout, stderr, exitCode } = await this.executeWithLimits(
        'node', 
        [codeFile], 
        sandboxPath,
        this.maxExecutionTime,
        this.maxMemoryMB
      );

      results.executionTime = Date.now() - startTime;
      results.output = stdout;
      results.errors = stderr;

      if (exitCode === 0) {
        // Run test cases
        const testResults = await this.runJavaScriptTests(testCases, sandboxPath);
        results.testResults = testResults;
        results.score = this.calculateScore(testResults);
        results.success = results.score >= 60;
      }

    } catch (error) {
      results.errors = error.message;
      results.executionTime = Date.now() - startTime;
    }

    return results;
  }

  // Run SQL simulation
  async runSQLSimulation(sqlQuery, testCases, sandboxPath) {
    const results = {
      success: false,
      output: '',
      errors: '',
      testResults: [],
      score: 0,
      executionTime: 0
    };

    const startTime = Date.now();
    
    try {
      // Create SQLite database with test data
      const dbFile = path.join(sandboxPath, 'test.db');
      await this.setupSQLiteDatabase(testCases, dbFile);

      // Execute SQL query
      const { stdout, stderr, exitCode } = await this.executeWithLimits(
        'sqlite3', 
        [dbFile, sqlQuery], 
        sandboxPath,
        this.maxExecutionTime,
        this.maxMemoryMB
      );

      results.executionTime = Date.now() - startTime;
      results.output = stdout;
      results.errors = stderr;

      if (exitCode === 0) {
        // Validate results
        const testResults = await this.validateSQLResults(sqlQuery, testCases, dbFile);
        results.testResults = testResults;
        results.score = this.calculateScore(testResults);
        results.success = results.score >= 60;
      }

    } catch (error) {
      results.errors = error.message;
      results.executionTime = Date.now() - startTime;
    }

    return results;
  }

  // Execute code with resource limits
  async executeWithLimits(command, args, cwd, maxTime, maxMemory) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: maxTime
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        resolve({ stdout, stderr, exitCode: code });
      });

      process.on('error', (error) => {
        reject(error);
      });

      // Memory limit (simplified - in production use proper containerization)
      if (process.memoryUsage && process.memoryUsage().heapUsed > maxMemory * 1024 * 1024) {
        process.kill('SIGKILL');
        reject(new Error('Memory limit exceeded'));
      }
    });
  }

  // Generate Python test code
  generatePythonTestCode(testCases) {
    return `
import sys
import json
from solution import *

def run_tests():
    results = []
    ${testCases.map((test, index) => `
    try:
        result = ${test.function}(${test.input})
        expected = ${JSON.stringify(test.expected)}
        passed = result == expected
        results.append({
            "test": ${index},
            "passed": passed,
            "result": result,
            "expected": expected,
            "input": ${JSON.stringify(test.input)}
        })
    except Exception as e:
        results.append({
            "test": ${index},
            "passed": False,
            "error": str(e),
            "input": ${JSON.stringify(test.input)}
        })
    `).join('')}
    
    print(json.dumps(results))

if __name__ == "__main__":
    run_tests()
`;
  }

  // Generate JavaScript test code
  generateJavaScriptTestCode(testCases) {
    return `
const { exec } = require('child_process');
const fs = require('fs');

// Import user solution
const solution = require('./solution.js');

function runTests() {
    const results = [];
    ${testCases.map((test, index) => `
    try {
        const result = solution.${test.function}(${JSON.stringify(test.input)});
        const expected = ${JSON.stringify(test.expected)};
        const passed = JSON.stringify(result) === JSON.stringify(expected);
        results.push({
            test: ${index},
            passed: passed,
            result: result,
            expected: expected,
            input: ${JSON.stringify(test.input)}
        });
    } catch (error) {
        results.push({
            test: ${index},
            passed: false,
            error: error.message,
            input: ${JSON.stringify(test.input)}
        });
    }
    `).join('')}
    
    console.log(JSON.stringify(results));
}

runTests();
`;
  }

  // Run Python tests
  async runPythonTests(testCases, sandboxPath) {
    try {
      const { stdout } = await this.executeWithLimits(
        'python',
        ['test_cases.py'],
        sandboxPath,
        10000, // 10 second timeout for tests
        256   // 256MB for tests
      );
      
      return JSON.parse(stdout);
    } catch (error) {
      return testCases.map((_, index) => ({
        test: index,
        passed: false,
        error: error.message
      }));
    }
  }

  // Run JavaScript tests
  async runJavaScriptTests(testCases, sandboxPath) {
    try {
      const { stdout } = await this.executeWithLimits(
        'node',
        ['test_cases.js'],
        sandboxPath,
        10000, // 10 second timeout for tests
        256   // 256MB for tests
      );
      
      return JSON.parse(stdout);
    } catch (error) {
      return testCases.map((_, index) => ({
        test: index,
        passed: false,
        error: error.message
      }));
    }
  }

  // Setup SQLite database for SQL tests
  async setupSQLiteDatabase(testCases, dbFile) {
    const setupSQL = testCases.map(test => test.setupSQL || '').join('\n');
    await this.executeWithLimits('sqlite3', [dbFile, setupSQL], path.dirname(dbFile), 5000, 128);
  }

  // Validate SQL results
  async validateSQLResults(sqlQuery, testCases, dbFile) {
    const results = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      try {
        const { stdout } = await this.executeWithLimits(
          'sqlite3',
          [dbFile, testCase.validationQuery || sqlQuery],
          path.dirname(dbFile),
          5000,
          128
        );
        
        const passed = this.compareSQLResults(stdout, testCase.expected);
        results.push({
          test: i,
          passed,
          result: stdout.trim(),
          expected: testCase.expected
        });
      } catch (error) {
        results.push({
          test: i,
          passed: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Compare SQL results
  compareSQLResults(actual, expected) {
    // Simple string comparison - can be enhanced for more complex validation
    return actual.trim().toLowerCase() === expected.trim().toLowerCase();
  }

  // Calculate score from test results
  calculateScore(testResults) {
    if (testResults.length === 0) return 0;
    
    const passedTests = testResults.filter(test => test.passed).length;
    return Math.round((passedTests / testResults.length) * 100);
  }

  // Main simulation runner
  async runSimulation(simulationData) {
    const { language, code, testCases, userId } = simulationData;
    const sessionId = randomUUID();
    const sandboxPath = await this.createSandbox(sessionId);
    
    try {
      let results;
      
      switch (language.toLowerCase()) {
        case 'python':
          results = await this.runPythonSimulation(code, testCases, sandboxPath);
          break;
        case 'javascript':
        case 'js':
          results = await this.runJavaScriptSimulation(code, testCases, sandboxPath);
          break;
        case 'sql':
          results = await this.runSQLSimulation(code, testCases, sandboxPath);
          break;
        default:
          throw new Error(`Unsupported language: ${language}`);
      }
      
      // Add metadata
      results.sessionId = sessionId;
      results.userId = userId;
      results.language = language;
      results.timestamp = new Date().toISOString();
      
      return results;
      
    } finally {
      // Clean up sandbox
      await this.cleanupSandbox(sandboxPath);
    }
  }

  // Get available simulation templates
  getSimulationTemplates() {
    return [
      {
        id: 'python_basics',
        title: 'Python Fundamentals',
        language: 'python',
        description: 'Basic Python programming challenges',
        difficulty: 'beginner',
        testCases: [
          {
            function: 'add_numbers',
            input: [5, 3],
            expected: 8
          },
          {
            function: 'multiply',
            input: [4, 7],
            expected: 28
          }
        ]
      },
      {
        id: 'data_analysis',
        title: 'Data Analysis with Python',
        language: 'python',
        description: 'Analyze datasets and extract insights',
        difficulty: 'intermediate',
        testCases: [
          {
            function: 'calculate_mean',
            input: [[1, 2, 3, 4, 5]],
            expected: 3
          },
          {
            function: 'find_max',
            input: [[10, 5, 8, 12, 3]],
            expected: 12
          }
        ]
      },
      {
        id: 'sql_queries',
        title: 'SQL Query Practice',
        language: 'sql',
        description: 'Write SQL queries to extract data',
        difficulty: 'beginner',
        testCases: [
          {
            validationQuery: 'SELECT COUNT(*) FROM users;',
            expected: '5'
          }
        ]
      }
    ];
  }
}

export default SimulationService;

