Feature: Achievements system tests
  As a JavaVerse user
  I want to earn achievements
  So that I can track my learning milestones

  Background:
    * url baseUrl
    # Login and get token
    * path 'users/login'
    * request { email: '#(testUsers.valid.email)', password: '#(testUsers.valid.password)' }
    * method POST
    * def authToken = response.token
    * def userId = karate.jwt(authToken).id || karate.jwt(authToken).userId
    * header Authorization = 'Bearer ' + authToken

  Scenario: Get user achievements
    Given path 'achievements', userId
    When method GET
    Then status 200
    And match response.success == true
    And match response.achievements == '#array'
    And match each response.achievements contains
      """
      {
        _id: '#string',
        userId: '#string',
        name: '#string',
        description: '#string',
        icon: '#string',
        category: '#string',
        isUnlocked: '#boolean',
        progress: {
          current: '#number',
          target: '#number'
        },
        dateEarned: '##string'
      }
      """

  Scenario: Check for new achievements
    Given path 'achievements/check'
    And request { userId: '#(userId)' }
    When method POST
    Then status 200
    And match response.success == true
    And match response contains
      """
      {
        success: true,
        message: '#string',
        newAchievements: '#array',
        totalAchievements: '#number'
      }
      """

  Scenario: Verify achievement categories
    Given path 'achievements', userId
    When method GET
    Then status 200
    And def achievements = response.achievements
    And def categories = karate.jsonPath(achievements, '$[*].category')
    And match categories contains any ['course', 'test', 'general', 'special']

  Scenario: Verify achievement progress tracking
    Given path 'achievements', userId
    When method GET
    Then status 200
    And def lockedAchievements = karate.jsonPath(response.achievements, '$[?(@.isUnlocked==false)]')
    And match each lockedAchievements contains
      """
      {
        progress: {
          current: '#number',
          target: '#number'
        }
      }
      """
    And def progressValues = karate.jsonPath(lockedAchievements, '$[*].progress.current')
    And match each progressValues == '#? _ >= 0'

  Scenario: Earn "First Step" achievement
    # Create a new user
    * def newEmail = 'achievement' + java.lang.System.currentTimeMillis() + '@test.com'
    * def newUsername = 'achievement' + java.lang.System.currentTimeMillis()
    Given path 'users/register'
    And request
      """
      {
        "username": "#(newUsername)",
        "email": "#(newEmail)",
        "password": "Test123!"
      }
      """
    When method POST
    Then status 200
    # Login as new user
    Given path 'users/login'
    And request { email: '#(newEmail)', password: 'Test123!' }
    When method POST
    Then status 200
    And def newToken = response.token
    And def newUserId = karate.jwt(newToken).id || karate.jwt(newToken).userId
    And header Authorization = 'Bearer ' + newToken
    # Get courses
    Given path 'courses'
    When method GET
    Then status 200
    And def courseId = response.courses[0]._id
    # Enroll in course (save progress)
    Given path 'user/progress'
    And request
      """
      {
        "userId": "#(newUserId)",
        "courseId": "#(courseId)",
        "completedLessons": 0,
        "totalLessons": 5,
        "testScore": null
      }
      """
    When method POST
    Then status 200
    # Check achievements
    Given path 'achievements/check'
    And request { userId: '#(newUserId)' }
    When method POST
    Then status 200
    And match response.newAchievements contains deep { name: 'Primul pas' }

  Scenario: Earn "First Lesson" achievement
    # Get courses and complete first lesson
    Given path 'courses'
    When method GET
    Then status 200
    And def courseId = response.courses[0]._id
    And def totalLessons = response.courses[0].totalLessons
    # Save progress with 1 completed lesson
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
    # Check for achievements
    Given path 'achievements/check'
    And request { userId: '#(userId)' }
    When method POST
    Then status 200
    # Verify achievement exists
    Given path 'achievements', userId
    When method GET
    Then status 200
    And def firstLessonAchievement = karate.jsonPath(response.achievements, "$[?(@.name=='Prima lecție')]")[0]
    And match firstLessonAchievement.isUnlocked == true

  Scenario: Track "Student Sârguincios" achievement progress
    # Get current progress
    Given path 'achievements', userId
    When method GET
    Then status 200
    And def studentAchievement = karate.jsonPath(response.achievements, "$[?(@.name=='Student sârguincios')]")[0]
    And def currentProgress = studentAchievement.progress.current
    # Complete more lessons
    Given path 'courses'
    When method GET
    Then status 200
    And def courseId = response.courses[0]._id
    And def totalLessons = response.courses[0].totalLessons
    # Update progress
    Given path 'user/progress'
    And request
      """
      {
        "userId": "#(userId)",
        "courseId": "#(courseId)",
        "completedLessons": #(currentProgress + 1),
        "totalLessons": #(totalLessons),
        "testScore": null
      }
      """
    When method POST
    Then status 200
    # Check achievements again
    Given path 'achievements/check'
    And request { userId: '#(userId)' }
    When method POST
    Then status 200
    # Verify progress updated
    Given path 'achievements', userId
    When method GET
    Then status 200
    And def updatedAchievement = karate.jsonPath(response.achievements, "$[?(@.name=='Student sârguincios')]")[0]
    And match updatedAchievement.progress.current == '#? _ >= currentProgress'

  Scenario: Check achievement without authentication
    Given path 'achievements/check'
    And remove header Authorization
    And request { userId: '#(userId)' }
    When method POST
    Then status 401
    And match response.success == false

  Scenario: Get achievements for invalid user
    Given path 'achievements/invaliduserid123'
    When method GET
    Then status 400
    And match response.success == false
    And match response.message contains 'Invalid user ID'