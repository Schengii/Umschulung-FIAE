export const LANGUAGE_MODULES = [
  {
    id: 'python',
    name: 'Python Masterclass (W3Schools Style)',
    icon: '🐍',
    badge: 'Sehr beliebt',
    summary: 'Eine der vielseitigsten Sprachen für KI, Data Science, Webdev (Django/FastAPI) und Automatisierung.',
    topics: [
      {
        title: '1. Syntax, Datentypen & Variablen',
        desc: 'Python ist dynamisch typisiert und nutzt Einrückungen (Indentation) anstelle von geschweiften Klammern.',
        code: `# Variablen & Datentypen
x = 10          # int
pi = 3.14159    # float
name = "Dev"    # str
is_active = True# bool

print(f"Hallo {name}, x = {x}")`
      },
      {
        title: '2. Datenstrukturen: Lists, Tuples, Sets & Dicts',
        desc: 'Listen (veränderbar), Tuples (unveränderbar), Sets (eindeutig) und Dictionaries (Key-Value Paare).',
        code: `# List (geordnet, veränderbar)
fruits = ["Apfel", "Banane", "Kirsche"]
fruits.append("Orange")

# Dictionary (Key-Value)
user = {"name": "Alex", "role": "Admin", "level": 5}
print(user["name"]) # -> Alex`
      },
      {
        title: '3. Funktionen, Lambda & Exceptions',
        desc: 'Definiere modulare Funktionen mit def, anomyme Lambda-Funktionen und fange Fehler mit try-except ab.',
        code: `def calculate_tax(amount: float, rate: float = 0.19) -> float:
    return amount * rate

try:
    result = 100 / 0
except ZeroDivisionError as e:
    print("Fehler: Division durch Null ist nicht erlaubt!")`
      },
      {
        title: '4. Objektorientierung (OOP: Klassen & Vererbung)',
        desc: 'Erstelle Objekte mit __init__ Konstruktor, Methoden und Kapselung.',
        code: `class Hero:
    def __init__(self, name, hp):
        self.name = name
        self.hp = hp
        
    def attack(self):
        return f"{self.name} greift an!"

hero = Hero("Knight", 100)
print(hero.attack())`
      }
    ]
  },
  {
    id: 'javascript',
    name: 'JavaScript Modern ES6+ (W3Schools Style)',
    icon: '⚡',
    badge: 'Web Standard',
    summary: 'Die Sprache des Webs für dynamische Frontend-UIs und serverseitige Node.js Backends.',
    topics: [
      {
        title: '1. Variables (let / const) & Arrow Functions',
        desc: 'Verwende const für unveränderliche Referenzen und let für veränderliche Variablen. Arrow Functions verkürzen die Syntax.',
        code: `const multiply = (a, b) => a * b;
let score = 100;
score += 50;

console.log(\`Gesamtscore: \${score}\`);`
      },
      {
        title: '2. Modern Array Methods (map, filter, reduce)',
        desc: 'Funktionale Datenverarbeitung ohne explizite for-Schleifen.',
        code: `const numbers = [1, 2, 3, 4, 5, 6];

const evens = numbers.filter(n => n % 2 === 0);
const doubled = evens.map(n => n * 2);
const sum = numbers.reduce((acc, curr) => acc + curr, 0);`
      },
      {
        title: '3. Promises & Async/Await',
        desc: 'Asynchrone Operationen (HTTP Fetches) ohne Callback-Hell verarbeiten.',
        code: `async function fetchUserData(userId) {
  try {
    const res = await fetch(\`https://api.devgame.it/users/\${userId}\`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Fetch Fehler:", err);
  }
}`
      }
    ]
  },
  {
    id: 'typescript',
    name: 'TypeScript (Typisierte JS-Mastery)',
    icon: '🔷',
    badge: 'Enterprise Standard',
    summary: 'Erweitert JavaScript um statische Typisierung für skalierbare Großprojekte.',
    topics: [
      {
        title: '1. Interfaces, Type Aliases & Union Types',
        desc: 'Definiere präzise Datenverträge für Objekte und kombiniere Typen mit Union (|) und Intersection (&).',
        code: `type Status = 'pending' | 'active' | 'archived';

interface User {
  id: number;
  username: string;
  email?: string; // Optionales Feld
  status: Status;
}

const currentUser: User = {
  id: 42,
  username: "code_ninja",
  status: "active"
};`
      },
      {
        title: '2. Generics & Type Constraints',
        desc: 'Erstelle typsichere, wiederverwendbare Datenstrukturen und Funktionen.',
        code: `// Generische API-Response Wrapper
interface ApiResponse<T> {
  data: T;
  status: number;
  timestamp: string;
}

function wrapData<T>(payload: T): ApiResponse<T> {
  return {
    data: payload,
    status: 200,
    timestamp: new Date().toISOString()
  };
}

const userRes = wrapData<User>(currentUser);`
      },
      {
        title: '3. Utility Types (Partial, Pick, Omit, Readonly)',
        desc: 'Nutze TypeScript-Standard-Hilfstypen, um bestehende Schnittstellen flexibel zu transformieren.',
        code: `// UpdateUserDto erlaubt nur ausgewählte Felder
type UpdateUserDto = Partial<Omit<User, 'id'>>;

const changes: UpdateUserDto = {
  username: "new_ninja_name"
};`
      }
    ]
  },
  {
    id: 'java',
    name: 'Java & Spring Boot Masterclass',
    icon: '☕',
    badge: 'Enterprise Standard',
    summary: 'Robuste, plattformunabhängige Sprache für hochperformante Enterprise-Backends, Microservices & Android.',
    topics: [
      {
        title: '1. Klassen, Kapselung & Record Types',
        desc: 'Strenge statische Typisierung mit modernen Java 17+ Records für unveränderliche Daten.',
        code: `public record CustomerDto(Long id, String email, boolean active) {}

public class BankAccount {
    private double balance; // Kapselung (private)

    public synchronized void deposit(double amount) {
        if (amount > 0) {
            this.balance += amount;
        }
    }
}`
      },
      {
        title: '2. Streams API & Lambda-Ausdrücke',
        desc: 'Deklarative Datenfilterung und -transformation mit Java Streams.',
        code: `import java.util.List;

List<String> names = List.of("Anna", "Bernd", "Clara", "Alex");

List<String> aNames = names.stream()
    .filter(n -> n.startsWith("A"))
    .map(String::toUpperCase)
    .sorted()
    .toList(); // -> ["ALEX", "ANNA"]`
      }
    ]
  },
  {
    id: 'csharp',
    name: 'C# & .NET Core Ecosystem',
    icon: '🎯',
    badge: 'Enterprise & Gaming',
    summary: 'Moderne, elegante Sprache von Microsoft für Cloud-Services, Web-APIs mit ASP.NET Core und Unity Game Development.',
    topics: [
      {
        title: '1. LINQ (Language Integrated Query)',
        desc: 'SQL-ähnliche relationale Datenabfragen direkt im C#-Code.',
        code: `var developers = new List<Developer> {
    new("Max", 5), new("Sarah", 8), new("Timo", 2)
};

// LINQ Abfrage
var seniorDevs = developers
    .Where(d => d.YearsOfExperience >= 5)
    .OrderByDescending(d => d.YearsOfExperience)
    .Select(d => d.Name);`
      },
      {
        title: '2. Async / Await & Task Parallel Library',
        desc: 'Hocheffiziente asynchrone I/O-Programmierung mit Tasks.',
        code: `public async Task<string> DownloadReportAsync(string url)
{
    using var client = new HttpClient();
    var response = await client.GetStringAsync(url);
    return response;
}`
      }
    ]
  },
  {
    id: 'golang',
    name: 'Go (Golang) Cloud Native',
    icon: '🐹',
    badge: 'DevOps & Microservices',
    summary: 'Entwickelt von Google für extreme Nebenläufigkeit, Docker-, Kubernetes- und Microservice-Entwicklung.',
    topics: [
      {
        title: '1. Goroutines & Channels (Concurrency)',
        desc: 'Leichtgewichtige Threads (Goroutines) und typsichere Nachrichtenkanäle (Channels).',
        code: `package main
import ("fmt"; "time")

func worker(id int, ch chan string) {
    time.Sleep(time.Millisecond * 500)
    ch <- fmt.Sprintf("Worker %d fertig!", id)
}

func main() {
    ch := make(chan string)
    go worker(1, ch)
    msg := <-ch
    fmt.Println(msg)
}`
      }
    ]
  },
  {
    id: 'rust',
    name: 'Rust (Systems & WebAssembly)',
    icon: '🦀',
    badge: 'Maximale Performance',
    summary: 'Garantierte Speichersicherheit ohne Garbage Collector durch das innovative Ownership- & Borrowing-System.',
    topics: [
      {
        title: '1. Ownership, Borrowing & Lifetimes',
        desc: 'Vermeidet Memory Leaks, NullPointerExceptions und Data Races zur Compile-Zeit.',
        code: `fn main() {
    let s1 = String::from("Hello Rust");
    let len = calculate_length(&s1); // Unveränderliche Referenz (Borrowing)
    println!("Länge von '{}' ist {}.", s1, len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}`
      }
    ]
  }
];

export const PROGRAMMING_LANGUAGES = LANGUAGE_MODULES;
