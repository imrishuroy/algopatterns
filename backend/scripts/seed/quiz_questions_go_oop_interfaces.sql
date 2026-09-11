-- Quiz Questions for Go OOP: Interfaces Section
-- Run this after the migration: psql -d algopatterns -f quiz_questions_go_oop_interfaces.sql

-- Clear existing go-oop interfaces questions first
DELETE FROM quiz_questions WHERE pattern_id = 'go-oop' AND section_slug = 'interfaces-polymorphism';

-- Interfaces
INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES

-- Q1: Interface definition
('go-oop', 'interfaces-polymorphism', 'multiple-choice', 'easy',
 'What does an interface define in Go?',
 NULL,
 '["A set of fields", "A set of method signatures", "A class blueprint", "A concrete implementation"]',
 '1',
 'An interface defines a set of method signatures that a type must implement. It specifies behavior, not data.',
 1),

-- Q2: Implicit implementation
('go-oop', 'interfaces-polymorphism', 'true-false', 'easy',
 'In Go, you must use the "implements" keyword to declare that a type implements an interface.',
 NULL,
 NULL,
 'false',
 'Go uses implicit implementation. If a type has all the methods an interface requires, it automatically implements that interface.',
 2),

-- Q3: Duck typing
('go-oop', 'interfaces-polymorphism', 'code-output', 'easy',
 'Does Robot implement Greeter?',
 'type Greeter interface {
    Greet() string
}

type Robot struct {
    Model string
}

func (r Robot) Greet() string {
    return "Beep boop"
}',
 '["Yes, it has the Greet() string method", "No, it does not declare implements", "No, Robot is not a Greeter type", "Compile error"]',
 '0',
 'Robot has Greet() string, so it implements Greeter. No explicit declaration needed - this is called duck typing.',
 3),

-- Q4: Polymorphism
('go-oop', 'interfaces-polymorphism', 'multiple-choice', 'easy',
 'What is polymorphism in Go?',
 NULL,
 '["Multiple inheritance", "Same interface, different implementations", "Method overloading", "Generic types"]',
 '1',
 'Polymorphism means one interface, many implementations. Different types can implement the same interface with different behavior.',
 4),

-- Q5: Empty interface
('go-oop', 'interfaces-polymorphism', 'code-output', 'medium',
 'Which values can be assigned to a variable of type any?',
 'var x any',
 '["Only nil", "Any value of any type", "Only interface types", "Only pointer types"]',
 '1',
 'The empty interface (any or interface{}) has zero methods, so every type implements it. It can hold any value.',
 5),

-- Q6: Type assertion safe form
('go-oop', 'interfaces-polymorphism', 'code-output', 'medium',
 'What is printed?',
 'var v any = "hello"

num, ok := v.(int)
fmt.Println(num, ok)',
 '["0 false", "panic", "hello false", "0 true"]',
 '0',
 'The two-value form returns the zero value and false when the assertion fails. No panic occurs.',
 6),

-- Q7: Type assertion panic
('go-oop', 'interfaces-polymorphism', 'code-output', 'medium',
 'What happens?',
 'var v any = "hello"
num := v.(int)
fmt.Println(num)',
 '["Prints 0", "panic: interface conversion", "Prints hello", "Compile error"]',
 '1',
 'Single-value type assertion panics if the type does not match. Always use the two-value form unless certain of the type.',
 7),

-- Q8: Type switch
('go-oop', 'interfaces-polymorphism', 'code-output', 'medium',
 'What is printed?',
 'func describe(v any) string {
    switch v.(type) {
    case int:
        return "integer"
    case string:
        return "string"
    default:
        return "unknown"
    }
}

func main() {
    fmt.Println(describe(42))
}',
 '["integer", "int", "unknown", "42"]',
 '0',
 'Type switch matches the underlying type. 42 is an int, so the int case returns "integer".',
 8),

-- Q9: Interface composition
('go-oop', 'interfaces-polymorphism', 'multiple-choice', 'medium',
 'How does io.ReadWriter combine Reader and Writer?',
 NULL,
 '["Inheritance", "Embedding both interfaces", "Implementing both separately", "Type assertion"]',
 '1',
 'Go uses interface embedding: type ReadWriter interface { Reader; Writer }. The type must implement all methods from both.',
 9),

-- Q10: fmt.Stringer
('go-oop', 'interfaces-polymorphism', 'code-output', 'medium',
 'What is printed?',
 'type User struct {
    Name string
}

func (u User) String() string {
    return "User: " + u.Name
}

func main() {
    u := User{Name: "Alice"}
    fmt.Println(u)
}',
 '["User: Alice", "{Alice}", "Alice", "&{Alice}"]',
 '0',
 'User implements fmt.Stringer (has String() string). fmt.Println automatically calls String() for such types.',
 10),

-- Q11: Compile-time interface check
('go-oop', 'interfaces-polymorphism', 'multiple-choice', 'hard',
 'What does this line do: var _ Storage = (*FileStorage)(nil)?',
 NULL,
 '["Creates a nil FileStorage", "Compile-time check that *FileStorage implements Storage", "Runtime type assertion", "Memory allocation"]',
 '1',
 'This is a compile-time assertion. If *FileStorage does not implement Storage, compilation fails. No runtime effect.',
 11),

-- Q12: Nil interface gotcha
('go-oop', 'interfaces-polymorphism', 'code-output', 'hard',
 'What is printed?',
 'type MyError struct{}

func (e *MyError) Error() string { return "error" }

func getError() error {
    var err *MyError = nil
    return err
}

func main() {
    err := getError()
    fmt.Println(err == nil)
}',
 '["true", "false", "panic", "compile error"]',
 '1',
 'The interface holds (*MyError, nil), which is NOT a nil interface. An interface is nil only when both type and value are nil.',
 12),

-- Q13: Interface best practice
('go-oop', 'interfaces-polymorphism', 'multiple-choice', 'medium',
 'What is the Go idiom about interface size?',
 NULL,
 '["Bigger interfaces are better", "Smaller interfaces are more reusable", "Interfaces should have exactly 3 methods", "Size does not matter"]',
 '1',
 'Go prefers small, focused interfaces. io.Reader has just one method. Smaller interfaces are easier to implement and compose.',
 13),

-- Q14: Accept interfaces, return structs
('go-oop', 'interfaces-polymorphism', 'true-false', 'medium',
 'Go idiom recommends: accept interfaces as parameters, return concrete types.',
 NULL,
 NULL,
 'true',
 'Functions should accept interfaces for flexibility but return concrete types so callers know exactly what they get.',
 14),

-- Q15: Consumer-defined interfaces
('go-oop', 'interfaces-polymorphism', 'multiple-choice', 'hard',
 'Where should interfaces be defined in Go?',
 NULL,
 '["In the package that implements them", "In the package that uses them (consumer)", "In a shared interfaces package", "In the main package only"]',
 '1',
 'Go convention: define interfaces where they are used, not where implemented. This keeps packages decoupled.',
 15);
