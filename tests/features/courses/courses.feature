Feature: Courses management tests
  As a logged-in user
  I want to access and interact with courses
  So that I can learn Java programming

  Background:
    * url baseUrl
    # Login and get token
    * path 'users/login'
    * request { email: '#(testUsers.valid.email)', password: '#(testUsers.valid.password)' }
    * method POST
    * def authToken = response.token
    * def userId = karate.jwt(authToken).id || karate.jwt(authToken).userId
    * header Authorization = 'Bearer ' + authToken

  Scenario: Get all courses
    Given path 'courses'
    When method GET
    Then status 200
    And match response.courses == '#array'
    And match each response.courses contains
      """
      {
        _id: '#string',
        name: '#string',
        description: '#string',
        totalLessons: '#number',
        content: '#array',
        questions: '#array'
      }
      """

  Scenario: Get specific course details
    # First get all courses
    Given path 'courses'
    When method GET
    Then status 200
    And def firstCourse = response.courses[0]
    # Get specific course
    Given path 'courses', firstCourse._id
    When method GET
    Then status 200
    And match response.course._id == firstCourse._id
    And match response.course.name == firstCourse.name
    And match response.course.content == '#array'
    And match response.course.content.length == response.course.totalLessons

  Scenario: Get non-existent course
    Given path 'courses/123456789012345678901234'
    When method GET
    Then status 404
    And match response.message == 'Course not found'

  Scenario: Create new course (admin only - should fail for regular user)
    Given path 'courses'
    And request
      """
      {
        "name": "Test Course",
        "description": "Test Description",
        "content": [
          {
            "title": "Lesson 1",
            "content": "Content 1",
            "examples": [
              {
                "code": "System.out.println('Hello');",
                "explanation": "Prints hello"
              }
            ]
          }
        ],
        "totalLessons": 1
      }
      """
    When method POST
    Then status 403 || status 401

  Scenario: Verify course content structure
    Given path 'courses'
    When method GET
    Then status 200
    And def course = response.courses[0]
    Given path 'courses', course._id
    When method GET
    Then status 200
    And match response.course.content[0] contains
      """
      {
        title: '#string',
        content: '#string',
        examples: '#array',
        _id: '#string'
      }
      """
    And match response.course.content[0].examples[0] contains
      """
      {
        code: '#string',
        explanation: '#string'
      }
      """