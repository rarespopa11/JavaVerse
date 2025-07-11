Feature: JavaVerse Authentication API

Background:
  * url baseUrl

Scenario: Login cu credentiale valide
  Given path '/api/users/login'
  And request 
    """
    {
      "email": "#(testUser.email)",
      "password": "#(testUser.password)"
    }
    """
  When method post
  Then status 200
  And match response.success == true
  And match response.token == '#present'
  And match response.user.email == testUser.email

Scenario: Login cu credentiale invalide
  Given path '/api/users/login'
  And request 
    """
    {
      "email": "wrong@email.com",
      "password": "wrongpassword"
    }
    """
  When method post
  Then status 401
  And match response.success == false
  And match response.message == '#string'

Scenario: Login fără email
  Given path '/api/users/login'
  And request 
    """
    {
      "password": "somepassword"
    }
    """
  When method post
  Then status 400

Scenario: Login fără parolă
  Given path '/api/users/login'
  And request 
    """
    {
      "email": "test@example.com"
    }
    """
  When method post
  Then status 400

Scenario: Verificarea endpoint-ului de status
  Given path '/api/config/check'
  When method get
  Then status 200
  And match response.mongoConnected == true
  And match response.env == '#string'