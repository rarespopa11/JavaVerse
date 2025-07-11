Feature: Avatar management tests
  As a JavaVerse user
  I want to manage my avatar
  So that I can personalize my profile

  Background:
    * url baseUrl
    # Login and get token
    * path 'users/login'
    * request { email: '#(testUsers.valid.email)', password: '#(testUsers.valid.password)' }
    * method POST
    * def authToken = response.token
    * def userId = karate.jwt(authToken).id || karate.jwt(authToken).userId
    * header Authorization = 'Bearer ' + authToken

  Scenario: Get user avatar
    Given path 'users', userId, 'avatar'
    When method GET
    Then status 200
    And match response.success == true
    And match response.avatar contains
      """
      {
        data: '#string',
        type: '#string',
        username: '#string'
      }
      """

  Scenario: Update to preset avatar
    Given path 'users', userId, 'avatar'
    And request
      """
      {
        "avatar": "ninja",
        "avatarType": "preset"
      }
      """
    When method PUT
    Then status 200
    And match response.success == true
    And match response.user.avatar == 'ninja'
    And match response.user.avatarType == 'preset'

  Scenario: Update to invalid preset avatar
    Given path 'users', userId, 'avatar'
    And request
      """
      {
        "avatar": "invalidpreset",
        "avatarType": "preset"
      }
      """
    When method PUT
    Then status 400
    And match response.success == false
    And match response.message contains 'Invalid preset avatar'

  Scenario: Update to custom avatar with base64 image
    * def base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    Given path 'users', userId, 'avatar'
    And request
      """
      {
        "avatar": "#(base64Image)",
        "avatarType": "custom"
      }
      """
    When method PUT
    Then status 200
    And match response.success == true
    And match response.user.avatarType == 'custom'
    And match response.user.avatar contains 'data:image/'

  Scenario: Update with invalid avatar type
    Given path 'users', userId, 'avatar'
    And request
      """
      {
        "avatar": "test",
        "avatarType": "invalidtype"
      }
      """
    When method PUT
    Then status 400
    And match response.success == false
    And match response.message contains 'Invalid avatar type'

  Scenario: Update custom avatar without image data
    Given path 'users', userId, 'avatar'
    And request
      """
      {
        "avatar": "notbase64data",
        "avatarType": "custom"
      }
      """
    When method PUT
    Then status 400
    And match response.success == false
    And match response.message contains 'Invalid custom avatar data'

  Scenario: Reset avatar to default
    Given path 'users', userId, 'avatar'
    When method DELETE
    Then status 200
    And match response.success == true
    And match response.user.avatar == 'default-avatar.png'
    And match response.user.avatarType == 'default'

  Scenario: Update avatar for another user (should fail)
    * def fakeUserId = '123456789012345678901234'
    Given path 'users', fakeUserId, 'avatar'
    And request
      """
      {
        "avatar": "wizard",
        "avatarType": "preset"
      }
      """
    When method PUT
    Then status 403
    And match response.success == false
    And match response.message contains 'own avatar'

  Scenario: Get all preset avatars
    Given path 'users', userId, 'avatar'
    When method GET
    Then status 200
    # Verify current avatar
    And def currentAvatar = response.avatar
    # Test switching between different presets
    * def presets = ['dev1', 'dev2', 'student1', 'student2', 'ninja', 'wizard', 'robot']
    * def preset = presets[0]
    Given path 'users', userId, 'avatar'
    And request { avatar: '#(preset)', avatarType: 'preset' }
    When method PUT
    Then status 200
    And match response.user.avatar == preset