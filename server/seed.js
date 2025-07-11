const mongoose = require('mongoose');
const Course = require('./models/course');  // Asigură-te că ai modelul corect
require('dotenv').config();

// Conectare la MongoDB
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/JavaVerseDB')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Cursurile pe care vrem să le adăugăm
const seedCourses = [
    {
        name: "Introducere în Java",
        description: "Acest curs te va învăța bazele limbajului Java, de la sintaxă și tipuri de date până la controlul fluxului și funcții.",
        content: [
          {
            title: "Lecția 1: Instalarea Java și Setarea Mediului de Dezvoltare",
            content: "În această lecție, vom învăța cum să instalezi Java și să configurezi mediul de dezvoltare folosind un IDE precum IntelliJ IDEA sau Eclipse.",
            examples: [{ code: "java -version", explanation: "Comanda care verifică dacă Java este instalat corect pe sistem." }]
          },
          {
            title: "Lecția 2: Tipuri de Date în Java",
            content: "Învață despre tipurile de date fundamentale în Java, cum ar fi int, double, char și String.",
            examples: [
              { code: "int x = 10;", explanation: "Declarația unei variabile de tip întreg." },
              { code: "double pi = 3.14159;", explanation: "Declarația unei variabile de tip double." }
            ]
          },
          {
            title: "Lecția 3: Variabile și Operatori",
            content: "Vom explora cum să folosim variabile și operatori pentru a manipula date în Java.",
            examples: [
              { code: "int sum = 5 + 3;", explanation: "Adunarea a două variabile de tip int." },
              { code: "double area = pi * r * r;", explanation: "Calculul ariei unui cerc folosind variabilele." }
            ]
          },
          {
            title: "Lecția 4: Controlul Fluxului",
            content: "În această lecție, vom învăța cum să folosim instrucțiuni condiționale (`if`, `else`, `switch`) pentru a face decizii în programele noastre.",
            examples: [
              { code: "if (x > 10) { System.out.println('x este mare'); }", explanation: "Exemplu de structură `if` care verifică dacă x este mai mare decât 10." },
              { code: "switch (day) { case 1: System.out.println('Luni'); break; }", explanation: "Exemplu de structură `switch` pentru a verifica ziua săptămânii." }
            ]
          },
          {
            title: "Lecția 5: Buclă `for` și `while`",
            content: "Vom învăța cum să folosești buclele `for` și `while` pentru a repeta acțiuni în Java.",
            examples: [
              { code: "for (int i = 0; i < 5; i++) { System.out.println(i); }", explanation: "Bucla `for` pentru a itera de 5 ori." },
              { code: "while (x < 10) { System.out.println(x); x++; }", explanation: "Bucla `while` pentru a repeta acțiuni cât timp condiția este adevărată." }
            ]
          }
        ],
        totalLessons: 5,
        questions: [
          {
            question: "Ce comandă folosești pentru a verifica versiunea Java instalată?",
            options: ["java -version", "javac -version", "java -check", "version -java"],
            correctAnswerIndex: 0
          },
          {
            question: "Care este tipul de date care poate conține valori zecimale în Java?",
            options: ["int", "double", "char", "String"],
            correctAnswerIndex: 1
          }
        ]
      },      
      {
        name: "Programare Orientată pe Obiecte în Java",
        description: "Acest curs te va învăța conceptele fundamentale ale programării orientate pe obiecte (OOP), inclusiv clase, obiecte, moștenire și polimorfism.",
        content: [
          {
            title: "Lecția 1: Introducere în OOP și Clasele în Java",
            content: "Vom explora ce este programarea orientată pe obiecte și vom învăța cum să definim clase și să creăm obiecte în Java.",
            examples: [
              { code: "class Car { String make; String model; }", explanation: "Definirea unei clase `Car` cu câmpuri pentru `make` și `model`." },
              { code: "Car myCar = new Car();", explanation: "Crearea unui obiect `myCar` din clasa `Car`." }
            ]
          },
          {
            title: "Lecția 2: Constructori și Metode",
            content: "Învață cum să definești constructori pentru a inițializa obiectele și cum să adaugi metode pentru a manipula datele din clase.",
            examples: [
              { code: "class Car { String make; String model; Car(String make, String model) { this.make = make; this.model = model; } }", explanation: "Definirea unui constructor pentru clasa `Car`." },
              { code: "void startEngine() { System.out.println('Engine started'); }", explanation: "Definirea unei metode pentru a porni motorul." }
            ]
          },
          {
            title: "Lecția 3: Moștenire în Java",
            content: "Vom învăța despre moștenirea în Java, cum să creezi clase derivate care moștenesc comportamentele și proprietățile unei clase părinte.",
            examples: [
              { code: "class ElectricCar extends Car { boolean isElectric; }", explanation: "Definirea unei clase `ElectricCar` care moștenește de la clasa `Car`." }
            ]
          },
          {
            title: "Lecția 4: Polimorfism în Java",
            content: "În această lecție, vom explora polimorfismul, o caracteristică OOP care permite obiectelor să se comporte diferit în funcție de context.",
            examples: [
              { code: "Car myCar = new ElectricCar(); myCar.startEngine();", explanation: "Utilizarea polimorfismului pentru a apela metoda `startEngine` la un obiect `ElectricCar`." }
            ]
          },
          {
            title: "Lecția 5: Incapsularea și Abstracția",
            content: "Vom învăța cum să folosim incapsularea pentru a ascunde detaliile interne ale unui obiect și cum să folosim abstracția pentru a crea interfețe clare.",
            examples: [
              { code: "class Car { private String make; public String getMake() { return make; } }", explanation: "Incapsularea prin protejarea câmpurilor și oferirea de metode publice pentru acces." }
            ]
          }
        ],
        totalLessons: 5,
        questions: [
          {
            question: "Ce înseamnă OOP în Java?",
            options: ["Object Oriented Programming", "Object Operator Programming", "Object Optimization Process", "None of the above"],
            correctAnswerIndex: 0
          },
          {
            question: "Ce cuvânt cheie este folosit pentru a crea o clasă în Java?",
            options: ["class", "create", "object", "define"],
            correctAnswerIndex: 0
          }
        ]
      },   
      {
        name: "Java pentru Aplicații Web cu Spring",
        description: "În acest curs, vei învăța să construiești aplicații web în Java folosind framework-ul Spring, care include Spring Boot, Spring MVC și Spring Data.",
        content: [
          {
            title: "Lecția 1: Introducere în Spring",
            content: "Vom explora framework-ul Spring și de ce este folosit în dezvoltarea aplicațiilor web.",
            examples: [
              { code: "import org.springframework.boot.SpringApplication; import org.springframework.boot.autoconfigure.SpringBootApplication; @SpringBootApplication public class Application { public static void main(String[] args) { SpringApplication.run(Application.class, args); } }", explanation: "Un exemplu simplu de aplicație Spring Boot." }
            ]
          },
          {
            title: "Lecția 2: Spring MVC și Controlere",
            content: "Învață cum să creezi controlere folosind Spring MVC pentru a gestiona cererile HTTP și pentru a răspunde cu vizualizări (views).",
            examples: [
              { code: "@Controller public class HomeController { @GetMapping('/') public String home() { return 'home'; } }", explanation: "Un controler simplu care răspunde la cererile GET la ruta `/`." }
            ]
          },
          {
            title: "Lecția 3: Spring Boot și Configurare",
            content: "Vom învăța cum să folosim Spring Boot pentru a configura rapid aplicații Java cu setări implicite și personalizabile.",
            examples: [
              { code: "@SpringBootApplication public class Application { public static void main(String[] args) { SpringApplication.run(Application.class, args); } }", explanation: "Crearea unei aplicații Spring Boot simplificate." }
            ]
          },
          {
            title: "Lecția 4: Conectarea la o Bază de Date cu Spring Data JPA",
            content: "Vom explora cum să folosim Spring Data JPA pentru a interacționa cu o bază de date relațională, folosind entități și repo-uri.",
            examples: [
              { code: "@Entity public class User { @Id private Long id; private String name; } @Repository public interface UserRepository extends JpaRepository<User, Long> {}", explanation: "Definirea unei entități și a unui repository pentru accesul la date." }
            ]
          },
          {
            title: "Lecția 5: Securizarea Aplicației Web cu Spring Security",
            content: "În această lecție, vom învăța cum să securizăm aplicațiile web Java folosind Spring Security.",
            examples: [
              { code: "@EnableWebSecurity public class WebSecurityConfig extends WebSecurityConfigurerAdapter { @Override protected void configure(HttpSecurity http) throws Exception { http.formLogin(); } }", explanation: "Configurarea securității de bază pentru aplicațiile web cu Spring Security." }
            ]
          }
        ],
        totalLessons: 5,
        questions: [
          {
            question: "Ce este Spring Boot?",
            options: ["Un framework de dezvoltare pentru aplicații Java", "Un server web", "Un limbaj de programare", "O bibliotecă JavaScript"],
            correctAnswerIndex: 0
          },
          {
            question: "Care este rolul Spring Security?",
            options: ["Securizarea aplicațiilor web Java", "Gestionarea bazelor de date", "Crearea interfețelor de utilizator", "Compilarea codului Java"],
            correctAnswerIndex: 0
          }
        ]
      }      
];

// Funcția pentru a adăuga cursurile în baza de date
async function seedDatabase() {
    try {
      for (const course of seedCourses) {
        console.log(`Verifying course "${course.name}"...`);
        const existingCourse = await Course.findOne({ name: course.name });
  
        if (existingCourse) {
          console.log(`Course "${course.name}" already exists. Skipping.`);
          
          // Actualizează lecțiile existente sau adaugă lecțiile noi
          for (const lesson of course.content) {
            const existingLesson = existingCourse.content.find(existingLesson => existingLesson.title === lesson.title);
  
            if (existingLesson) {
              console.log(`Updating lesson "${lesson.title}" in course "${course.name}".`);
              await Course.updateOne(
                { _id: existingCourse._id, "content.title": existingLesson.title },
                { 
                  $set: {
                    "content.$.content": lesson.content,
                    "content.$.examples": lesson.examples
                  }
                });
            } else {
              existingCourse.content.push(lesson);
              console.log(`Adding new lesson "${lesson.title}" to course "${course.name}".`);
            }
          }
  
          await existingCourse.save();
          console.log(`Course "${course.name}" updated.`);
        } else {
          console.log(`Creating new course "${course.name}"...`);
          const newCourse = new Course(course);
          await newCourse.save();
          console.log(`Course "${course.name}" added to the database.`);
        }
      }
  
      mongoose.connection.close();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error seeding the database:', error);
      mongoose.connection.close();
    }
  }
  
  // Rulează seedDatabase pentru a adăuga cursurile
  seedDatabase();