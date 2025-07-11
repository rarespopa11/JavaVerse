Feature: JavaVerse Code Execution API

Background:
  * url baseUrl
  # Login pentru a obține token
  * def loginRequest = { email: '#(testUser.email)', password: '#(testUser.password)' }
  * path '/api/users/login'
  * request loginRequest
  * method post
  * status 200
  * def authToken = response.token

Scenario: Execuția unui cod Java valid simplu
  Given path '/api/execute-code'
  And header Authorization = 'Bearer ' + authToken
  And request 
    """
    {
      "code": "public class HelloWorld { public static void main(String[] args) { System.out.println(\"Hello JavaVerse!\"); } }",
      "language": "java"
    }
    """
  When method post
  Then status 200
  And match response.success == true
  And match response.output contains 'Hello JavaVerse!'

Scenario: Execuția unui cod Java cu eroare de sintaxă
  Given path '/api/execute-code'
  And header Authorization = 'Bearer ' + authToken
  And request 
    """
    {
      "code": "public class Invalid { invalid syntax here }",
      "language": "java"
    }
    """
  When method post
  Then status 400
  And match response.success == false
  And match response.error == '#string'

Scenario: Execuția unui cod Java cu variabile
  Given path '/api/execute-code'
  And header Authorization = 'Bearer ' + authToken
  And request 
    """
    {
      "code": "public class Variables { public static void main(String[] args) { int x = 10; int y = 20; System.out.println(\"Sum: \" + (x + y)); } }",
      "language": "java"
    }
    """
  When method post
  Then status 200
  And match response.success == true
  And match response.output contains 'Sum: 30'

Scenario: Testarea analizei de cod cu AI
  Given path '/api/analyze-code'
  And header Authorization = 'Bearer ' + authToken
  And request 
    """
    {
      "code": "public class Test { public static void main(String[] args) { int x = \"string\"; } }",
      "language": "java"
    }
    """
  When method post
  Then status 200
  And match response.success == true
  And match response.feedback == '#string'

Scenario: Execuția fără autentificare
  Given path '/api/execute-code'
  And request 
    """
    {
      "code": "public class Test { public static void main(String[] args) { System.out.println(\"Test\"); } }",
      "language": "java"
    }
    """
  When method post
  Then status 401

Scenario: Execuția cu cod gol
  Given path '/api/execute-code'
  And header Authorization = 'Bearer ' + authToken
  And request 
    """
    {
      "code": "",
      "language": "java"
    }
    """
  When method post
  Then status 400
  And match response.success == false