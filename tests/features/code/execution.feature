Feature: Code execution functionality tests
  As a logged-in user of JavaVerse
  I want to execute Java code
  So that I can practice and test my programming skills

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

  Scenario: Execute valid Java code successfully
    Given path 'execute-code'
    And header Authorization = 'Bearer ' + authToken
    And request { code: 'public class Main { public static void main(String[] args) { System.out.println("Hello, JavaVerse!"); } }' }
    When method POST
    Then status 200
    And match response.success == true
    And match response.output == '#string'

  Scenario: Execute Java code with compilation error
    Given path 'execute-code'
    And header Authorization = 'Bearer ' + authToken
    And request { code: 'public class Main { public static void main(String[] args) { System.out.println("Missing semicolon") } }' }
    When method POST
    Then status 200
    And match response.success == false
    And match response.error == '#string'

  Scenario: Execute code without authentication
    Given path 'execute-code'
    And request { code: 'public class Main { public static void main(String[] args) { System.out.println("Hello!"); } }' }
    When method POST
    Then status 200
    And match response.success == false

  Scenario: Execute empty code
    Given path 'execute-code'
    And header Authorization = 'Bearer ' + authToken
    And request { code: '' }
    When method POST
    Then status 200
    And match response.success == false