public class KarateTestRunner {
    
    @com.intuit.karate.junit5.Karate.Test
    com.intuit.karate.junit5.Karate testAuthentication() {
        return com.intuit.karate.junit5.Karate.run("authentication.feature").relativeTo(getClass());
    }
    
    @com.intuit.karate.junit5.Karate.Test
    com.intuit.karate.junit5.Karate testCourses() {
        return com.intuit.karate.junit5.Karate.run("courses.feature").relativeTo(getClass());
    }
    
    @com.intuit.karate.junit5.Karate.Test
    com.intuit.karate.junit5.Karate testCodeExecution() {
        return com.intuit.karate.junit5.Karate.run("code-execution.feature").relativeTo(getClass());
    }
    
    @com.intuit.karate.junit5.Karate.Test
    com.intuit.karate.junit5.Karate testAll() {
        return com.intuit.karate.junit5.Karate.run().relativeTo(getClass());
    }
}