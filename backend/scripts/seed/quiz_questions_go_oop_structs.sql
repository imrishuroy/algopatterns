-- Quiz Questions for Go OOP: Structs Section
-- Run this after the migration: psql -d algopatterns -f quiz_questions_go_oop_structs.sql

-- Clear existing go-oop structs questions first
DELETE FROM quiz_questions WHERE pattern_id = 'go-oop' AND section_slug = 'structs-custom-types';

-- Structs: Define Custom Types and Data Structures
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES

-- Q1: Basic struct definition
('go-oop', 'structs-custom-types', 'multiple-choice', 'easy',
 'What keyword is used to define a custom type in Go?',
 NULL,
 '["struct", "type", "class", "define"]',
 '1',
 'The "type" keyword is used to define custom types in Go. You write "type Name struct {...}" to create a struct type.',
 1),

-- Q2: Zero values
('go-oop', 'structs-custom-types', 'code-output', 'easy',
 'What is printed for the Port field?',
 'type Config struct {
    Host string
    Port int
}

func main() {
    var cfg Config
    fmt.Println(cfg.Port)
}',
 '["0", "nil", "undefined", "panic: nil pointer"]',
 '0',
 'In Go, uninitialized struct fields get their zero values. For int, the zero value is 0.',
 2),

-- Q3: Named fields
('go-oop', 'structs-custom-types', 'true-false', 'easy',
 'When using named fields in struct literals, the field order must match the struct definition.',
 NULL,
 NULL,
 'false',
 'Named fields can be in any order. That is one of their main advantages over positional initialization.',
 3),

-- Q4: Positional initialization
('go-oop', 'structs-custom-types', 'multiple-choice', 'easy',
 'What is a disadvantage of using positional struct initialization like Point{1, 2}?',
 NULL,
 '["It is slower at runtime", "Code breaks if fields are reordered in the struct definition", "It uses more memory", "It cannot be used with exported types"]',
 '1',
 'Positional initialization depends on field order. If someone reorders fields in the struct definition, your code breaks silently or fails to compile.',
 4),

-- Q5: Zero value for slice
('go-oop', 'structs-custom-types', 'code-output', 'easy',
 'What is the zero value of the Tags field?',
 'type Config struct {
    Tags []string
}

func main() {
    var cfg Config
    fmt.Println(cfg.Tags == nil)
}',
 '["true", "false", "[]", "panic"]',
 '0',
 'Slices have a zero value of nil. An uninitialized slice field is nil, not an empty slice.',
 5),

-- Q6: Struct comparison
('go-oop', 'structs-custom-types', 'code-output', 'medium',
 'What does this comparison print?',
 'type Point struct {
    X, Y int
}

func main() {
    p1 := Point{1, 2}
    p2 := Point{1, 2}
    fmt.Println(p1 == p2)
}',
 '["true", "false", "compile error", "runtime panic"]',
 '0',
 'Structs with comparable fields can be compared with ==. Two structs are equal if all their fields are equal.',
 6),

-- Q7: Non-comparable struct
('go-oop', 'structs-custom-types', 'multiple-choice', 'medium',
 'Which field type makes a struct non-comparable with ==?',
 NULL,
 '["int", "string", "[]int (slice)", "*int (pointer)"]',
 '2',
 'Slices, maps, and functions are not comparable. A struct containing any of these cannot use == for comparison.',
 7),

-- Q8: Embedded struct access
('go-oop', 'structs-custom-types', 'code-output', 'medium',
 'What is printed?',
 'type Address struct {
    City string
}

type Person struct {
    Name string
    Address  // embedded
}

func main() {
    p := Person{Name: "Alice", Address: Address{City: "NYC"}}
    fmt.Println(p.City)
}',
 '["NYC", "compile error: p.City undefined", "{NYC}", ""]',
 '0',
 'Embedded struct fields are promoted. You can access p.City directly instead of p.Address.City.',
 8),

-- Q9: Anonymous struct
('go-oop', 'structs-custom-types', 'true-false', 'medium',
 'Anonymous structs can only be used for one-time local variables, not as function parameters.',
 NULL,
 NULL,
 'false',
 'Anonymous structs can be used anywhere: variables, function parameters, return values, and even struct fields.',
 9),

-- Q10: JSON struct tag
('go-oop', 'structs-custom-types', 'code-output', 'medium',
 'What JSON key will be used for the Name field?',
 'type User struct {
    Name string `json:"username"`
}

func main() {
    u := User{Name: "Alice"}
    data, _ := json.Marshal(u)
    fmt.Println(string(data))
}',
 '["{\\\"Name\\\":\\\"Alice\\\"}", "{\\\"username\\\":\\\"Alice\\\"}", "{\\\"name\\\":\\\"Alice\\\"}", "compile error"]',
 '1',
 'The json:"username" tag tells the JSON encoder to use "username" as the key instead of the field name.',
 10),

-- Q11: omitempty tag
('go-oop', 'structs-custom-types', 'multiple-choice', 'medium',
 'What does the json:",omitempty" tag option do?',
 NULL,
 '["Makes the field required", "Omits the field from JSON if it has its zero value", "Allows null values", "Validates the field is not empty"]',
 '1',
 'The omitempty option excludes the field from JSON output when it contains the zero value for its type.',
 11),

-- Q12: Constructor pattern
('go-oop', 'structs-custom-types', 'multiple-choice', 'medium',
 'What is the conventional name for a constructor function that creates a User struct?',
 NULL,
 '["CreateUser()", "NewUser()", "MakeUser()", "User.New()"]',
 '1',
 'Go convention is NewTypeName() for constructor functions. They return either the value or a pointer.',
 12),

-- Q13: Pointer return from constructor
('go-oop', 'structs-custom-types', 'identify-bug', 'hard',
 'What is wrong with this code?',
 'type Server struct {
    host string
    port int
}

func NewServer(host string, port int) Server {
    s := Server{host: host, port: port}
    return s
}

func main() {
    srv := NewServer("localhost", 8080)
    // Later: modify srv.host
}',
 '["Constructor should return *Server for modification", "Fields should be exported (capitalized)", "Missing error return", "Nothing is wrong"]',
 '0',
 'Returning a value means callers get a copy. To allow modification, return *Server. This also avoids copying large structs.',
 13),

-- Q14: Copy vs modify
('go-oop', 'structs-custom-types', 'code-output', 'hard',
 'What is printed for original user?',
 'type User struct {
    Name string
    Age  int
}

func birthday(u User) {
    u.Age++
}

func main() {
    user := User{Name: "Alice", Age: 30}
    birthday(user)
    fmt.Println(user.Age)
}',
 '["30", "31", "0", "compile error"]',
 '0',
 'Go passes structs by value. The birthday function receives a copy, so incrementing Age does not affect the original.',
 14),

-- Q15: Structs vs maps
('go-oop', 'structs-custom-types', 'multiple-choice', 'medium',
 'When should you prefer a struct over a map[string]interface{}?',
 NULL,
 '["When fields are unknown at compile time", "When you need type safety and known fields", "When you need dynamic key names", "When working with JSON from external APIs"]',
 '1',
 'Structs provide compile-time type safety and are faster. Use them when the shape of data is known. Maps are for dynamic or unknown keys.',
 15);
