Feature: Login functionality tests
  As a user of JavaVerse
  I want to be able to login to my account
  So that I can access my courses and progress

  Background:
    * print 'Available variables:', karate.get('baseUrl', 'NOT_FOUND')
    * print 'Test users:', karate.get('testUsers', 'NOT_FOUND')
    * def baseUrl = karate.get('baseUrl', 'http://localhost:5000/api')
    * def testUsers = karate.get('testUsers', { valid: { email: 'test3@mail.com', password: 'testul3', username: 'test5' } })
    * url baseUrl
    * def testUser = testUsers.valid
    * print 'Using baseUrl:', baseUrl
    * print 'Using testUser:', testUser

  Scenario: Successful login with valid credentials
    Given path 'users/login'
    And request { email: '#(testUser.email)', password: '#(testUser.password)' }
    When method POST
    Then status 200
    And match response == { success: true, token: '#string' }
    And def authToken = response.token

  Scenario: Failed login with invalid email
    Given path 'users/login'
    And request { email: 'invalid@mail.com', password: 'parola123' }
    When method POST
    Then status 200
    And match response == { success: false, message: 'User not found' }

  Scenario: Failed login with invalid password
    Given path 'users/login'
    And request { email: '#(testUser.email)', password: 'WrongPassword123' }
    When method POST
    Then status 200
    And match response == { success: false, message: 'Invalid credentials' }

  Scenario: Failed login with missing email
    Given path 'users/login'
    And request { password: '#(testUser.password)' }
    When method POST
    Then status 200
    And match response.success == false

  Scenario: Failed login with missing password
    Given path 'users/login'
    And request { email: '#(testUser.email)' }
    When method POST
    Then status 200
    And match response.success == false
