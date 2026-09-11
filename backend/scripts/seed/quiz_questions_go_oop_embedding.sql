-- Quiz Questions for Go OOP: Embedding and Generics Section
DELETE FROM quiz_questions WHERE pattern_id = 'go-oop' AND section_slug = 'embedding-generics';

INSERT INTO quiz_questions (pattern_id, section_slug, question_type, difficulty, question_text, code_snippet, options, correct_answer, explanation, display_order) VALUES

('go-oop', 'embedding-generics', 'multiple-choice', 'easy',
 'What is struct embedding in Go?',
 NULL,
 '["Inheritance from a parent class", "Including one struct inside another without a field name", "Creating a copy of a struct", "Implementing an interface"]',
 '1',
 'Struct embedding includes one struct inside another without giving it an explicit field name. Fields and methods are promoted.',
 1),

('go-oop', 'embedding-generics', 'code-output', 'easy',
 'What is printed?',
 'type Engine struct {
    Power int
}

type Car struct {
    Engine
    Model string
}

func main() {
    c := Car{Engine: Engine{Power: 200}, Model: "Tesla"}
    fmt.Println(c.Power)
}',
 '["200", "0", "compile error", "{200}"]',
 '0',
 'Embedded struct fields are promoted. c.Power accesses the embedded Engine''s Power field directly.',
 2),

('go-oop', 'embedding-generics', 'true-false', 'medium',
 'Struct embedding in Go provides inheritance like in Java or Python.',
 NULL,
 NULL,
 'false',
 'Embedding provides composition, not inheritance. There is no "is-a" relationship, only field and method promotion.',
 3),

('go-oop', 'embedding-generics', 'code-output', 'medium',
 'What is printed? (method shadowing)',
 'type Base struct{}
func (b Base) Name() string { return "Base" }

type Derived struct { Base }
func (d Derived) Name() string { return "Derived" }

func main() {
    d := Derived{}
    fmt.Println(d.Name())
}',
 '["Derived", "Base", "compile error", "Base Derived"]',
 '0',
 'When both outer and embedded type have the same method, the outer type''s method shadows the embedded one.',
 4),

('go-oop', 'embedding-generics', 'multiple-choice', 'medium',
 'How do you call the embedded type''s shadowed method?',
 NULL,
 '["super.Method()", "base.Method()", "d.Base.Method() using the type name", "Cannot call shadowed methods"]',
 '2',
 'Access the shadowed method explicitly through the embedded type name: d.Base.Name().',
 5),

('go-oop', 'embedding-generics', 'code-output', 'medium',
 'Does Car implement Mover?',
 'type Mover interface {
    Move() string
}

type Engine struct{}
func (e Engine) Move() string { return "vroom" }

type Car struct {
    Engine
}',
 '["Yes, Engine''s Move is promoted", "No, Car needs its own Move method", "Compile error", "Only *Car implements Mover"]',
 '0',
 'Embedded methods are promoted. Since Engine has Move(), Car automatically implements Mover.',
 6),

('go-oop', 'embedding-generics', 'multiple-choice', 'medium',
 'When should you embed a pointer vs a value?',
 NULL,
 '["Always embed values for safety", "Embed pointer when the embedded type has pointer receiver methods", "Pointers cannot be embedded", "It makes no difference"]',
 '1',
 'Embed a pointer when the embedded type''s methods use pointer receivers, or when you need nil-ability.',
 7),

('go-oop', 'embedding-generics', 'code-output', 'hard',
 'What is the type constraint?',
 'func Min[T constraints.Ordered](a, b T) T {
    if a < b {
        return a
    }
    return b
}',
 '["T must be comparable with ==", "T must support < operator (ordered)", "T can be any type", "T must be numeric"]',
 '1',
 'constraints.Ordered means T must support ordering operators (<, >, <=, >=). This includes numeric types and strings.',
 8),

('go-oop', 'embedding-generics', 'code-output', 'medium',
 'What is printed?',
 'func First[T any](items []T) T {
    return items[0]
}

func main() {
    nums := []int{10, 20, 30}
    fmt.Println(First(nums))
}',
 '["10", "0", "compile error", "[10 20 30]"]',
 '0',
 'The generic function First works with any slice type. Type inference determines T is int from the argument.',
 9),

('go-oop', 'embedding-generics', 'true-false', 'easy',
 'In Go generics, "any" is an alias for interface{}.',
 NULL,
 NULL,
 'true',
 'Since Go 1.18, "any" is a predeclared alias for interface{}, usable as a type constraint meaning no restrictions.',
 10),

('go-oop', 'embedding-generics', 'multiple-choice', 'hard',
 'What does the ~ symbol mean in a type constraint?',
 NULL,
 '["Approximately equal", "Includes types with underlying type", "Negation", "Optional type"]',
 '1',
 'The ~ operator means "types whose underlying type is". ~int includes int and any type defined as "type MyInt int".',
 11),

('go-oop', 'embedding-generics', 'code-output', 'medium',
 'Is this valid Go code?',
 'type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}',
 '["Yes, generic types can have methods", "No, methods cannot use type parameters", "Yes, but only with pointer receiver", "Compile error: missing constraint"]',
 '0',
 'Generic types can have methods. The type parameter T is available in method definitions.',
 12),

('go-oop', 'embedding-generics', 'multiple-choice', 'medium',
 'When should you prefer generics over interface{}?',
 NULL,
 '["When you need runtime type flexibility", "When you want compile-time type safety", "When working with reflection", "When types are unknown at compile time"]',
 '1',
 'Generics provide compile-time type safety. Use interface{} only when types truly cannot be known at compile time.',
 13),

('go-oop', 'embedding-generics', 'identify-bug', 'hard',
 'What is wrong with this generic function?',
 'func Sum[T any](nums []T) T {
    var total T
    for _, n := range nums {
        total += n  // Error here
    }
    return total
}',
 '["Nothing wrong", "T any does not guarantee + operator; need numeric constraint", "Should use *T", "Missing return statement"]',
 '1',
 'The constraint "any" allows any type, but + requires numeric types. Use a constraint like constraints.Integer or constraints.Float.',
 14),

('go-oop', 'embedding-generics', 'multiple-choice', 'medium',
 'What is comparable in Go generics?',
 NULL,
 '["Types that can be compared with <", "Types that can be compared with ==", "Types that implement Comparable interface", "All types"]',
 '1',
 'The comparable constraint allows types that support == and !=. Used for map keys and equality checks.',
 15);
