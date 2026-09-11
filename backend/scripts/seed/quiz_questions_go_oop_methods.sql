-- Quiz Questions for Go OOP: Methods Section
-- Run this after the migration: psql -d algopatterns -f quiz_questions_go_oop_methods.sql

-- Clear existing go-oop methods questions first
DELETE FROM quiz_questions WHERE pattern_id = 'go-oop' AND section_slug = 'methods-receivers';

-- Methods: Value and Pointer Receivers Explained
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES

-- Q1: Basic method syntax
('go-oop', 'methods-receivers', 'multiple-choice', 'easy',
 'What is the receiver in this method definition: func (c Counter) Value() int?',
 NULL,
 '["Counter", "c", "Value", "int"]',
 '1',
 'The receiver is "c Counter" - the variable name (c) followed by its type (Counter). It appears in parentheses before the method name.',
 1),

-- Q2: Method call
('go-oop', 'methods-receivers', 'code-output', 'easy',
 'What is printed?',
 'type Greeter struct {
    Name string
}

func (g Greeter) Hello() string {
    return "Hello, " + g.Name
}

func main() {
    gr := Greeter{Name: "World"}
    fmt.Println(gr.Hello())
}',
 '["Hello, World", "Hello, ", "World", "compile error"]',
 '0',
 'The method Hello() is called on gr, which has Name set to "World". The method returns "Hello, World".',
 2),

-- Q3: Value receiver behavior
('go-oop', 'methods-receivers', 'code-output', 'medium',
 'What is printed?',
 'type Counter struct {
    count int
}

func (c Counter) Increment() {
    c.count++
}

func main() {
    counter := Counter{count: 0}
    counter.Increment()
    fmt.Println(counter.count)
}',
 '["0", "1", "compile error", "runtime panic"]',
 '0',
 'Value receivers get a copy of the struct. The Increment method modifies the copy, not the original. The original count stays 0.',
 3),

-- Q4: Pointer receiver behavior
('go-oop', 'methods-receivers', 'code-output', 'medium',
 'What is printed?',
 'type Counter struct {
    count int
}

func (c *Counter) Increment() {
    c.count++
}

func main() {
    counter := Counter{count: 0}
    counter.Increment()
    fmt.Println(counter.count)
}',
 '["0", "1", "compile error", "runtime panic"]',
 '1',
 'Pointer receivers operate on the original struct. The *Counter receiver modifies the actual counter, so count becomes 1.',
 4),

-- Q5: Automatic pointer conversion
('go-oop', 'methods-receivers', 'true-false', 'medium',
 'You must explicitly write (&counter).Increment() to call a pointer receiver method on a value.',
 NULL,
 NULL,
 'false',
 'Go automatically converts counter.Increment() to (&counter).Increment() when calling a pointer receiver method on a value.',
 5),

-- Q6: When to use pointer receiver
('go-oop', 'methods-receivers', 'multiple-choice', 'medium',
 'Which is NOT a valid reason to use a pointer receiver?',
 NULL,
 '["The method needs to modify the receiver", "The struct is large and copying is expensive", "You want to be consistent with other methods", "The method only reads data from a small struct"]',
 '3',
 'For small read-only structs, a value receiver is fine and clearly signals the method does not modify the struct.',
 6),

-- Q7: Nil pointer receiver
('go-oop', 'methods-receivers', 'code-output', 'hard',
 'What happens when this code runs?',
 'type Logger struct {
    prefix string
}

func (l *Logger) Log(msg string) {
    if l == nil {
        fmt.Println("[nil] " + msg)
        return
    }
    fmt.Println(l.prefix + msg)
}

func main() {
    var log *Logger
    log.Log("hello")
}',
 '["panic: nil pointer", "[nil] hello", "hello", "compile error"]',
 '1',
 'In Go, you can call methods on nil pointers. The method can check for nil and handle it gracefully.',
 7),

-- Q8: Nil receiver without check
('go-oop', 'methods-receivers', 'code-output', 'hard',
 'What happens?',
 'type User struct {
    Name string
}

func (u *User) Greet() string {
    return "Hello, " + u.Name
}

func main() {
    var u *User
    fmt.Println(u.Greet())
}',
 '["Hello, ", "panic: nil pointer dereference", "compile error", "empty string"]',
 '1',
 'Calling a method on nil is allowed, but accessing u.Name dereferences nil, causing a panic.',
 8),

-- Q9: Method on non-struct type
('go-oop', 'methods-receivers', 'code-output', 'medium',
 'What is printed?',
 'type Celsius float64

func (c Celsius) ToFahrenheit() float64 {
    return float64(c)*9/5 + 32
}

func main() {
    temp := Celsius(100)
    fmt.Println(temp.ToFahrenheit())
}',
 '["212", "100", "compile error", "180"]',
 '0',
 'Methods can be defined on any named type, not just structs. Celsius(100) converts to 212 Fahrenheit.',
 9),

-- Q10: Method chaining
('go-oop', 'methods-receivers', 'identify-bug', 'medium',
 'Why does this method chaining NOT work?',
 'type Builder struct {
    value string
}

func (b Builder) Add(s string) {
    b.value += s
}

func main() {
    var b Builder
    b.Add("Hello").Add(" World")
}',
 '["Add() should return *Builder for chaining", "Should use pointer receiver", "Both: pointer receiver AND return *Builder", "Method chaining is not supported in Go"]',
 '2',
 'Method chaining requires: 1) pointer receiver to modify the struct, and 2) returning the receiver for the next call.',
 10),

-- Q11: Correct builder pattern
('go-oop', 'methods-receivers', 'code-output', 'medium',
 'What is printed?',
 'type Builder struct {
    value string
}

func (b *Builder) Add(s string) *Builder {
    b.value += s
    return b
}

func main() {
    var b Builder
    b.Add("A").Add("B").Add("C")
    fmt.Println(b.value)
}',
 '["ABC", "", "CBA", "compile error"]',
 '0',
 'The builder pattern uses pointer receiver and returns *Builder. Each Add modifies and returns the same builder.',
 11),

-- Q12: Value receiver with interface
('go-oop', 'methods-receivers', 'true-false', 'hard',
 'A type with only value receiver methods can satisfy an interface when used as a pointer.',
 NULL,
 NULL,
 'true',
 'A pointer to a type has access to both value and pointer receiver methods. *T can call methods defined on T.',
 12),

-- Q13: Receiver naming convention
('go-oop', 'methods-receivers', 'multiple-choice', 'easy',
 'What is the Go convention for naming receivers?',
 NULL,
 '["this", "self", "Short 1-2 letter abbreviation of type name", "Full type name in lowercase"]',
 '2',
 'Go convention is short names like c for Counter, u for User. Avoid this or self from other languages.',
 13),

-- Q14: Embedded method promotion
('go-oop', 'methods-receivers', 'code-output', 'medium',
 'What is printed?',
 'type Engine struct{}

func (e Engine) Start() string {
    return "Vroom!"
}

type Car struct {
    Engine  // embedded
}

func main() {
    c := Car{}
    fmt.Println(c.Start())
}',
 '["Vroom!", "compile error: c.Start undefined", "", "panic"]',
 '0',
 'Methods on embedded types are promoted. Car embeds Engine, so c.Start() calls the Engine''s Start method.',
 14),

-- Q15: Large struct receiver choice
('go-oop', 'methods-receivers', 'multiple-choice', 'medium',
 'A struct has 20 fields and a read-only method. Which receiver should you use?',
 NULL,
 '["Value receiver - it only reads", "Pointer receiver - avoid copying 20 fields", "Either works the same", "Depends on field types"]',
 '1',
 'For large structs, use pointer receiver even for read-only methods to avoid expensive copying on each call.',
 15);
