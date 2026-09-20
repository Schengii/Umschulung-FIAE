import{r as e}from"./rolldown-runtime-hePW80VL.js";import{h as t}from"./vendor-charts-LpGij_Qu.js";import{n}from"./vendor-react-CYlvDiRg.js";import{Qt as r,hn as i,nn as a,y as o}from"./vendor-ui-Cq2y2VJf.js";var s=e(t(),1),c=[{id:`python`,name:`Python Masterclass (W3Schools Style)`,icon:`🐍`,badge:`Sehr beliebt`,summary:`Eine der vielseitigsten Sprachen für KI, Data Science, Webdev (Django/FastAPI) und Automatisierung.`,topics:[{title:`1. Syntax, Datentypen & Variablen`,desc:`Python ist dynamisch typisiert und nutzt Einrückungen (Indentation) anstelle von geschweiften Klammern.`,code:`# Variablen & Datentypen
x = 10          # int
pi = 3.14159    # float
name = "Dev"    # str
is_active = True# bool

print(f"Hallo {name}, x = {x}")`},{title:`2. Datenstrukturen: Lists, Tuples, Sets & Dicts`,desc:`Listen (veränderbar), Tuples (unveränderbar), Sets (eindeutig) und Dictionaries (Key-Value Paare).`,code:`# List (geordnet, veränderbar)
fruits = ["Apfel", "Banane", "Kirsche"]
fruits.append("Orange")

# Dictionary (Key-Value)
user = {"name": "Alex", "role": "Admin", "level": 5}
print(user["name"]) # -> Alex`},{title:`3. Funktionen, Lambda & Exceptions`,desc:`Definiere modulare Funktionen mit def, anomyme Lambda-Funktionen und fange Fehler mit try-except ab.`,code:`def calculate_tax(amount: float, rate: float = 0.19) -> float:
    return amount * rate

try:
    result = 100 / 0
except ZeroDivisionError as e:
    print("Fehler: Division durch Null ist nicht erlaubt!")`},{title:`4. Objektorientierung (OOP: Klassen & Vererbung)`,desc:`Erstelle Objekte mit __init__ Konstruktor, Methoden und Kapselung.`,code:`class Hero:
    def __init__(self, name, hp):
        self.name = name
        self.hp = hp
        
    def attack(self):
        return f"{self.name} greift an!"

hero = Hero("Knight", 100)
print(hero.attack())`}]},{id:`javascript`,name:`JavaScript Modern ES6+ (W3Schools Style)`,icon:`⚡`,badge:`Web Standard`,summary:`Die Sprache des Webs für dynamische Frontend-UIs und serverseitige Node.js Backends.`,topics:[{title:`1. Variables (let / const) & Arrow Functions`,desc:`Verwende const für unveränderliche Referenzen und let für veränderliche Variablen. Arrow Functions verkürzen die Syntax.`,code:`const multiply = (a, b) => a * b;
let score = 100;
score += 50;

console.log(\`Gesamtscore: \${score}\`);`},{title:`2. Modern Array Methods (map, filter, reduce)`,desc:`Funktionale Datenverarbeitung ohne explizite for-Schleifen.`,code:`const numbers = [1, 2, 3, 4, 5, 6];

const evens = numbers.filter(n => n % 2 === 0);
const doubled = evens.map(n => n * 2);
const sum = numbers.reduce((acc, curr) => acc + curr, 0);`},{title:`3. Promises & Async/Await`,desc:`Asynchrone Operationen (HTTP Fetches) ohne Callback-Hell verarbeiten.`,code:`async function fetchUserData(userId) {
  try {
    const res = await fetch(\`https://api.devgame.it/users/\${userId}\`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Fetch Fehler:", err);
  }
}`}]},{id:`typescript`,name:`TypeScript (Typisierte JS-Mastery)`,icon:`🔷`,badge:`Enterprise Standard`,summary:`Erweitert JavaScript um statische Typisierung für skalierbare Großprojekte.`,topics:[{title:`1. Interfaces, Type Aliases & Union Types`,desc:`Definiere präzise Datenverträge für Objekte und kombiniere Typen mit Union (|) und Intersection (&).`,code:`type Status = 'pending' | 'active' | 'archived';

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
};`},{title:`2. Generics & Type Constraints`,desc:`Erstelle typsichere, wiederverwendbare Datenstrukturen und Funktionen.`,code:`// Generische API-Response Wrapper
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

const userRes = wrapData<User>(currentUser);`},{title:`3. Utility Types (Partial, Pick, Omit, Readonly)`,desc:`Nutze TypeScript-Standard-Hilfstypen, um bestehende Schnittstellen flexibel zu transformieren.`,code:`// UpdateUserDto erlaubt nur ausgewählte Felder
type UpdateUserDto = Partial<Omit<User, 'id'>>;

const changes: UpdateUserDto = {
  username: "new_ninja_name"
};`}]},{id:`java`,name:`Java & Spring Boot Masterclass`,icon:`☕`,badge:`Enterprise Standard`,summary:`Robuste, plattformunabhängige Sprache für hochperformante Enterprise-Backends, Microservices & Android.`,topics:[{title:`1. Klassen, Kapselung & Record Types`,desc:`Strenge statische Typisierung mit modernen Java 17+ Records für unveränderliche Daten.`,code:`public record CustomerDto(Long id, String email, boolean active) {}

public class BankAccount {
    private double balance; // Kapselung (private)

    public synchronized void deposit(double amount) {
        if (amount > 0) {
            this.balance += amount;
        }
    }
}`},{title:`2. Streams API & Lambda-Ausdrücke`,desc:`Deklarative Datenfilterung und -transformation mit Java Streams.`,code:`import java.util.List;

List<String> names = List.of("Anna", "Bernd", "Clara", "Alex");

List<String> aNames = names.stream()
    .filter(n -> n.startsWith("A"))
    .map(String::toUpperCase)
    .sorted()
    .toList(); // -> ["ALEX", "ANNA"]`}]},{id:`csharp`,name:`C# & .NET Core Ecosystem`,icon:`🎯`,badge:`Enterprise & Gaming`,summary:`Moderne, elegante Sprache von Microsoft für Cloud-Services, Web-APIs mit ASP.NET Core und Unity Game Development.`,topics:[{title:`1. LINQ (Language Integrated Query)`,desc:`SQL-ähnliche relationale Datenabfragen direkt im C#-Code.`,code:`var developers = new List<Developer> {
    new("Max", 5), new("Sarah", 8), new("Timo", 2)
};

// LINQ Abfrage
var seniorDevs = developers
    .Where(d => d.YearsOfExperience >= 5)
    .OrderByDescending(d => d.YearsOfExperience)
    .Select(d => d.Name);`},{title:`2. Async / Await & Task Parallel Library`,desc:`Hocheffiziente asynchrone I/O-Programmierung mit Tasks.`,code:`public async Task<string> DownloadReportAsync(string url)
{
    using var client = new HttpClient();
    var response = await client.GetStringAsync(url);
    return response;
}`}]},{id:`golang`,name:`Go (Golang) Cloud Native`,icon:`🐹`,badge:`DevOps & Microservices`,summary:`Entwickelt von Google für extreme Nebenläufigkeit, Docker-, Kubernetes- und Microservice-Entwicklung.`,topics:[{title:`1. Goroutines & Channels (Concurrency)`,desc:`Leichtgewichtige Threads (Goroutines) und typsichere Nachrichtenkanäle (Channels).`,code:`package main
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
}`}]},{id:`rust`,name:`Rust (Systems & WebAssembly)`,icon:`🦀`,badge:`Maximale Performance`,summary:`Garantierte Speichersicherheit ohne Garbage Collector durch das innovative Ownership- & Borrowing-System.`,topics:[{title:`1. Ownership, Borrowing & Lifetimes`,desc:`Vermeidet Memory Leaks, NullPointerExceptions und Data Races zur Compile-Zeit.`,code:`fn main() {
    let s1 = String::from("Hello Rust");
    let len = calculate_length(&s1); // Unveränderliche Referenz (Borrowing)
    println!("Länge von '{}' ist {}.", s1, len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}`}]}],l=n();function u(){let[e,t]=(0,s.useState)(c[0].id),[n,u]=(0,s.useState)(null),d=c.find(t=>t.id===e)||c[0],f=(e,t)=>{navigator.clipboard.writeText(e),u(t),setTimeout(()=>u(null),2e3)};return(0,l.jsxs)(`div`,{style:{maxWidth:`1080px`,margin:`0 auto`,paddingBottom:`60px`},children:[(0,l.jsx)(`div`,{className:`glass-panel`,style:{padding:`32px`,marginBottom:`24px`,border:`2px solid var(--accent-primary)`},children:(0,l.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`12px`,marginBottom:`8px`},children:[(0,l.jsx)(`div`,{style:{width:`42px`,height:`42px`,borderRadius:`10px`,background:`var(--gradient-cyber)`,display:`flex`,alignItems:`center`,justifyContent:`center`,color:`#fff`},children:(0,l.jsx)(a,{size:24})}),(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`h1`,{style:{fontSize:`2rem`,fontWeight:`900`,color:`var(--text-main)`,margin:0},children:`Programmiersprachen & Frameworks Academy`}),(0,l.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`0.95rem`,margin:0,marginTop:`2px`},children:`Praxisorientierte Leitfäden im W3Schools-Stil für Python, JavaScript, TypeScript, Java, C#, Go und Rust.`})]})]})}),(0,l.jsx)(`div`,{style:{display:`flex`,gap:`10px`,marginBottom:`28px`,overflowX:`auto`,paddingBottom:`6px`},children:c.map(n=>(0,l.jsxs)(`button`,{onClick:()=>t(n.id),style:{minHeight:`44px`,padding:`8px 18px`,borderRadius:`var(--radius-md)`,fontWeight:`700`,fontSize:`0.92rem`,background:e===n.id?`var(--accent-primary)`:`var(--bg-card)`,color:e===n.id?`#ffffff`:`var(--text-main)`,border:e===n.id?`2px solid var(--accent-primary)`:`1px solid var(--border-color)`,cursor:`pointer`,whiteSpace:`nowrap`,display:`flex`,alignItems:`center`,gap:`8px`,transition:`all 0.15s ease`,boxShadow:e===n.id?`0 4px 12px rgba(99, 102, 241, 0.3)`:`none`},children:[(0,l.jsx)(`span`,{style:{fontSize:`1.2rem`},children:n.icon}),(0,l.jsx)(`span`,{children:n.name.split(`(`)[0].trim()})]},n.id))}),(0,l.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`,marginBottom:`24px`},children:[(0,l.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`14px`,flexWrap:`wrap`,gap:`8px`},children:[(0,l.jsx)(`span`,{className:`badge badge-teal`,style:{fontSize:`0.82rem`,fontWeight:800},children:d.badge||`Enterprise Standard`}),(0,l.jsxs)(`span`,{style:{fontSize:`0.82rem`,color:`var(--text-muted)`,fontWeight:600},children:[d.topics?.length||0,` didaktische Kernmodule`]})]}),(0,l.jsxs)(`h2`,{style:{fontSize:`1.8rem`,fontWeight:`900`,marginBottom:`8px`,color:`var(--text-main)`},children:[d.icon,` `,d.name]}),(0,l.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.02rem`,lineHeight:`1.6`,marginBottom:`28px`},children:d.summary||d.description}),(0,l.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`},children:d.topics&&d.topics.map((e,t)=>(0,l.jsxs)(`div`,{style:{background:`var(--bg-secondary)`,border:`1px solid var(--border-color)`,borderRadius:`var(--radius-lg)`,padding:`24px`,boxShadow:`var(--shadow-sm)`},children:[(0,l.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,marginBottom:`10px`},children:[(0,l.jsx)(`h3`,{style:{fontSize:`1.15rem`,fontWeight:`800`,color:`var(--text-main)`,margin:0},children:e.title}),(0,l.jsxs)(`button`,{onClick:()=>f(e.code,t),style:{background:`transparent`,border:`1px solid var(--border-color)`,borderRadius:`6px`,padding:`4px 8px`,color:n===t?`var(--accent-teal)`:`var(--text-muted)`,cursor:`pointer`,fontSize:`0.78rem`,fontWeight:700,display:`flex`,alignItems:`center`,gap:`4px`},title:`Code kopieren`,children:[n===t?(0,l.jsx)(i,{size:14}):(0,l.jsx)(r,{size:14}),n===t?`Kopiert!`:`Kopieren`]})]}),(0,l.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`0.92rem`,lineHeight:`1.6`,marginBottom:`16px`},children:e.desc}),(0,l.jsxs)(`div`,{className:`code-window`,style:{margin:0},children:[(0,l.jsxs)(`div`,{className:`code-header`,style:{padding:`8px 14px`,fontSize:`0.78rem`},children:[(0,l.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,l.jsx)(o,{size:14,color:`var(--accent-primary)`}),` Syntax & Ausführung`]}),(0,l.jsx)(`span`,{children:d.name.split(` `)[0]})]}),(0,l.jsx)(`pre`,{className:`code-body`,style:{margin:0,padding:`16px`,fontSize:`0.88rem`,lineHeight:`1.5`},children:(0,l.jsx)(`code`,{children:e.code})})]})]},t))})]})]})}export{u as default};