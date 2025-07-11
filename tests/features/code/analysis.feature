Feature: AI feedback functionality tests
  As a logged-in user of JavaVerse
  I want to get AI feedback on my code
  So that I can improve my programming skills

  Background:
    * print 'Available variables:', karate.get('baseUrl', 'NOT_FOUND')
    * def baseUrl = karate.get('baseUrl', 'http://localhost:5000/api')
    * def testUsers = karate.get('testUsers', { valid: { email: 'test3@mail.com', password: 'testul3', username: 'test5' } })
    * url baseUrl
    * def testUser = testUsers.valid
    * print 'Using baseUrl:', baseUrl

    # Login to get auth token
    Given path 'users/login'
    And request { email: '#(testUser.email)', password: '#(testUser.password)' }
    When method POST
    Then status 200
    And match response.success == true
    And def authToken = response.token

  Scenario: Get AI feedback for valid Java code
    Given path 'analyze-code'
    And header Authorization = 'Bearer ' + authToken
    And request { code: 'public class Main { public static void main(String[] args) { System.out.println("Hello, World!"); } }' }
    When method POST
    Then status 200
    And match response.success == true
    And match response.feedback == '#string'

  Scenario: Get AI feedback for code with issues
    Given path 'analyze-code'
    And header Authorization = 'Bearer ' + authToken
    And request { code: 'public class main { public static void main(string[] args) { system.out.println("hello"); } }' }
    When method POST
    Then status 200
    And match response.success == true
    And match response.feedback == '#string'

  Scenario: Request feedback without authentication
    Given path 'analyze-code'
    And request { code: 'public class Main { public static void main(String[] args) { System.out.println("Hello!"); } }' }
    When method POST
    Then status 200
    And match response.success == false

  Scenario: Request feedback with empty code
    Given path 'analyze-code'
    And header Authorization = 'Bearer ' + authToken
    And request { code: '' }
    When method POST
    Then status 200
    And match response.success == false
