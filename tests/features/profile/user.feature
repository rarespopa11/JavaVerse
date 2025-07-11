Feature: User profile tests
  As a JavaVerse user
  I want to manage my profile
  So that I can update my information and track my progress

  Background:
    * url baseUrl
    # Login and get token
    * path 'users/login'
    * request { email: '#(testUsers.valid.email)', password: '#(testUsers.valid.password)' }
    * method POST
    * def authToken = response.token
    * def userId = karate.jwt(authToken).id || karate.jwt(authToken).userId
    * header Authorization = 'Bearer ' + authToken

  Scenario: Get user profile information
    Given path 'users', userId
    When method GET
    Then status 200
    And match response.success == true
    And match response.user contains
      """
      {
        _id: '#(userId)',
        username: '#string',
        email: '#(testUsers.valid.email)',
        avatar: '#string',
        avatarType: '#string'
      }
      """

  Scenario: Update username
    Given path 'users', userId, 'username'
    And request { username: 'updatedusername' }
    When method PUT
    Then status 200
    And match response.success == true
    And match response.user.username == 'updatedusername'

  Scenario: Update username with invalid data
    Given path 'users', userId, 'username'
    And request { username: 'ab' }
    When method PUT
    Then status 400
    And match response.success == false
    And match response.message contains '3 characters'

  Scenario: Change password successfully
    Given path 'users', userId, 'change-password'
    And request 
      """
      {
        "currentPassword": "#(testUsers.valid.password)",
        "newPassword": "NewPassword123!"
      }
      """
    When method PUT
    Then status 200
    And match response.success == true
    And match response.message == 'Password changed successfully'

  Scenario: Change password with wrong current password
    Given path 'users', userId, 'change-password'
    And request 
      """
      {
        "currentPassword": "WrongPassword123!",
        "newPassword": "NewPassword123!"
      }
      """
    When method PUT
    Then status 400
    And match response.success == false
    And match response.message contains 'incorrect'

  Scenario: Get user progress
    Given path 'user/progress', userId
    When method GET
    Then status 200
    And match response == '#array'
    And match each response contains
      """
      {
        _id: '#string',
        userId: '#string',
        courseId: {
          _id: '#string',
          name: '#string',
          description: '#string',
          totalLessons: '#number'
        },
        completedLessons: '#number',
        totalLessons: '#number',
        testScore: '##number'
      }
      """

  Scenario: Save user progress
    # Get first course
    Given path 'courses'
    When method GET
    Then status 200
    And def courseId = response.courses[0]._id
    And def totalLessons = response.courses[0].totalLessons
    # Save progress
    Given path 'user/progress'
    And request
      """
      {
        "userId": "#(userId)",
        "courseId": "#(courseId)",
        "completedLessons": 2,
        "totalLessons": #(totalLessons),
        "testScore": null
      }
      """
    When method POST
    Then status 200
    And match response.success == true

  Scenario: Update existing progress
    # Get first course
    Given path 'courses'
    When method GET
    Then status 200
    And def courseId = response.courses[0]._id
    And def totalLessons = response.courses[0].totalLessons
    # Save initial progress
    Given path 'user/progress'
    And request
      """
      {
        "userId": "#(userId)",
        "courseId": "#(courseId)",
        "completedLessons": 1,
        "totalLessons": #(totalLessons),
        "testScore": null
      }
      """
    When method POST
    Then status 200
    # Update progress
    Given path 'user/progress'
    And request
      """
      {
        "userId": "#(userId)",
        "courseId": "#(courseId)",
        "completedLessons": 3,
        "totalLessons": #(totalLessons),
        "testScore": 85
      }
      """
    When method POST
    Then status 200
    And match response.success == true