import org.junit.jupiter.api.Test;

public class JUnitTestRunner {
    
    @Test
    public void testAuthentication() {
        com.intuit.karate.Results results = com.intuit.karate.Runner.path("authentication.feature").relativeTo(getClass()).parallel(1);
        System.out.println("Authentication tests: " + results.getFailCount() + " failed");
    }
    
    @Test
    public void testCourses() {
        com.intuit.karate.Results results = com.intuit.karate.Runner.path("courses.feature").relativeTo(getClass()).parallel(1);
        System.out.println("Courses tests: " + results.getFailCount() + " failed");
    }
    
    @Test
    public void testCodeExecution() {
        com.intuit.karate.Results results = com.intuit.karate.Runner.path("code-execution.feature").relativeTo(getClass()).parallel(1);
        System.out.println("Code execution tests: " + results.getFailCount() + " failed");
    }
}