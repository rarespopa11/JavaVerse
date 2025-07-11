Feature: JavaVerse Courses API

Background:
  * url baseUrl
  # Get auth token first
  * def loginRequest = { email: '#(testUser.email)', password: '#(testUser.password)' }
  * path '/api/users/login'
  * request loginRequest
  * method post
  * status 200
  * def authToken = response.token
  * def userId = response.user._id

Scenario: Obținerea listei de cursuri
  Given path '/api/courses'
  When method get
  Then status 200
  And match response == '#array'
  And match response[0].name == '#string'
  And match response[0].description == '#string'

Scenario: Obținerea unui curs specific
  Given path '/api/courses'
  When method get
  Then status 200
  * def courseId = response[0]._id
  
  Given path '/api/courses/' + courseId
  When method get
  Then status 200
  And match response._id == courseId
  And match response.name == '#string'
  And match response.content == '#array'

Scenario: Înscrierea la un curs
  # Obține primul curs disponibil
  Given path '/api/courses'
  When method get
  Then status 200
  * def courseId = response[0]._id
  
  # Înscrie-te la curs
  Given path '/api/courses/enroll'
  And header Authorization = 'Bearer ' + authToken
  And request { courseId: '#(courseId)', userId: '#(userId)' }
  When method post
  Then status 200
  And match response.success == true

Scenario: Salvarea progresului utilizatorului
  # Obține primul curs
  Given path '/api/courses'
  When method get
  Then status 200
  * def courseId = response[0]._id
  
  # Salvează progresul
  Given path '/api/user/progress'
  And header Authorization = 'Bearer ' + authToken
  And request 
    """
    {
      "userId": "#(userId)",
      "courseId": "#(courseId)",
      "completedLessons": 1,
      "totalLessons": 5
    }
    """
  When method post
  Then status 200
  And match response.success == true

Scenario: Obținerea progresului utilizatorului
  Given path '/api/user/progress/' + userId
  And header Authorization = 'Bearer ' + authToken
  When method get
  Then status 200
  And match response == '#array'