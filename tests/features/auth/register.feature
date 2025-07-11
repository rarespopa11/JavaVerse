Feature: User registration functionality tests
  As a new user of JavaVerse
  I want to be able to register for an account
  So that I can start learning Java programming

  Background:
    * print 'Available variables:', karate.get('baseUrl', 'NOT_FOUND')
    * def baseUrl = karate.get('baseUrl', 'http://localhost:5000/api')
    * url baseUrl
    * print 'Using baseUrl:', baseUrl
    * def randomEmail = 'test' + java.lang.System.currentTimeMillis() + '@mail.com'
    * def randomUsername = 'user' + java.lang.System.currentTimeMillis()

  Scenario: Successful registration with valid data
    Given path 'users/register'
    And request { email: '#(randomEmail)', password: 'Password123!', username: '#(randomUsername)' }
    When method POST
    Then status 200
    And match response == { success: true, message: 'User registered successfully', token: '#string' }
    And def authToken = response.token

  Scenario: Failed registration with existing email
    Given path 'users/register'
    And request { email: 'test3@mail.com', password: 'Password123!', username: '#(randomUsername)' }
    When method POST
    Then status 200
    And match response == { success: false, message: '#string' }

  Scenario: Failed registration with weak password
    Given path 'users/register'
    And request { email: '#(randomEmail)', password: '123', username: '#(randomUsername)' }
    When method POST
    Then status 200
    And match response.success == false

  Scenario: Failed registration with missing email
    Given path 'users/register'
    And request { password: 'Password123!', username: '#(randomUsername)' }
    When method POST
    Then status 200
    And match response.success == false

  Scenario: Failed registration with missing password
    Given path 'users/register'
    And request { email: '#(randomEmail)', username: '#(randomUsername)' }
    When method POST
    Then status 200
    And match response.success == false

  Scenario: Failed registration with missing username
    Given path 'users/register'
    And request { email: '#(randomEmail)', password: 'Password123!' }
    When method POST
    Then status 200
    And match response.success == false
