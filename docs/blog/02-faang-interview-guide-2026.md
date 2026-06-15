# What Nobody Tells You About FAANG Interviews

*Lessons from failing Google twice before getting offers from 4 Big Tech companies.*

---

I bombed my first Google interview spectacularly.

I had solved 400+ LeetCode problems. I knew all the "patterns." I thought I was ready.

The interviewer asked a graph problem. I recognized it as BFS. I started coding confidently. Thirty minutes later, I had a buggy solution that handled 60% of test cases, and zero time left to fix it.

Rejection email: 2 days later.

Here's what I learned after that failure, and the two after it, before I finally figured out what actually matters.

---

## The Uncomfortable Truth

Most interview prep advice focuses on the wrong things.

**What people focus on:** Solving more problems, memorizing solutions, learning obscure algorithms.

**What actually matters:** Communication, problem decomposition, writing bug-free code under pressure.

I've now been on both sides of the table. Let me tell you what interviewers actually evaluate.

---

## What Interviewers Write Down

After each interview, we fill out feedback forms. Here's what those forms actually ask:

### 1. Problem Solving (Not Just "Did They Solve It")

- Did they ask clarifying questions before coding?
- Did they consider edge cases upfront?
- Did they identify the right approach, even if execution was imperfect?
- When stuck, did they have strategies to get unstuck?

**The insight:** I've given "Strong Hire" ratings to candidates who didn't fully complete the solution but demonstrated excellent problem-solving process. I've given "No Hire" to candidates who got the right answer but couldn't explain why it worked.

### 2. Code Quality

- Is the code readable without heavy explanation?
- Are variable names meaningful?
- Is the logic clear, or is it clever-but-confusing?
- Did they modularize, or write one giant function?

**The insight:** Clean code that's 80% complete beats hacky code that's 100% complete.

### 3. Communication

- Did they think out loud?
- Did they explain trade-offs?
- Did they ask for feedback before diving deep into an approach?
- Could I follow their reasoning?

**The insight:** Silence is deadly. If you're thinking, say "I'm thinking about whether to use BFS or DFS here because..." An interviewer can't give hints if they don't know where you are.

### 4. Testing and Debugging

- Did they trace through an example before saying "done"?
- When they found a bug, did they debug systematically or change things randomly?
- Did they consider edge cases?

**The insight:** The candidate who says "Let me trace through [1,2,3] to verify" before claiming they're done impresses me every time. It shows maturity.

---

## The Actual Interview Timeline

Forget the generic advice. Here's what actually happens and how to prepare for each stage.

### Recruiter Screen (Week 1-2 after applying)

**What happens:** 30-minute call. They're checking if you can speak coherently about your background and if you meet basic requirements.

**What they're really asking:**
- "Tell me about yourself" → Can you communicate clearly?
- "Why this company?" → Did you do basic research?
- "What are you looking for?" → Are our expectations aligned?

**How to prepare:** Have a 90-second story about your background. Practice it until it's natural. Research 2-3 specific things about the company you're genuinely interested in.

### Technical Phone Screen (Week 3-4)

**What happens:** 45-60 minutes. One coding problem, sometimes two shorter ones.

**The real challenge:** You're coding in a shared doc or basic IDE without autocomplete, syntax highlighting, or the ability to run code.

**How to prepare:** 
- Practice coding in Google Docs. Seriously. It's uncomfortable, and that's the point.
- Time yourself: 5 min to understand, 5 min to plan, 20 min to code, 10 min to test.
- Practice explaining while typing. This is a skill.

### Onsite (Week 5-8)

**What happens:** 4-6 rounds, usually:
- 2-3 coding rounds
- 1 system design (if mid-level or above)
- 1 behavioral
- Maybe a "culture fit" or "googleyness" round

**The real challenge:** Mental stamina. You're performing for 5+ hours straight.

**How to prepare:**
- Do mock interviews back-to-back. 3 in one day.
- Practice after being tired. Your day-3-of-onsite self is not your fresh-Saturday-morning self.
- Eat well, sleep well the night before. This matters more than last-minute studying.

---

## The Coding Interview: A Realistic Breakdown

Let me walk through how a 45-minute coding interview actually goes:

**Minutes 0-5: Problem Reading**
- Read the problem fully. Twice.
- Identify: What are the inputs? What's the output? What are the constraints?
- Ask: "Just to confirm, we're returning X when Y, right?"

**Minutes 5-10: Clarification**
- Edge cases: "What if the array is empty?" "Can there be negative numbers?"
- Scale: "What's the expected size of input?" (This hints at required complexity)
- Ambiguity: "When you say 'substring', do you mean contiguous?"

**Minutes 10-15: Approach Discussion**
- State your initial thought: "My first instinct is to use a hash map because..."
- Mention brute force: "A naive approach would be O(n²) by checking all pairs..."
- Propose optimization: "But we can reduce this to O(n) by..."
- State complexity: "This would be O(n) time and O(n) space."
- **Ask:** "Does this approach sound reasonable, or should I consider something else?"

**Minutes 15-35: Coding**
- Write clean code. Use meaningful names.
- Comment only if something is non-obvious.
- If you need a helper function, say "I'll write a helper for X" and either write it or stub it.
- Talk through what you're doing: "Now I need to handle the case where..."

**Minutes 35-45: Testing and Discussion**
- Trace through a simple example manually.
- Test an edge case: empty input, single element, all same elements.
- Fix bugs calmly. Don't panic.
- Discuss optimizations if time permits.

---

## What Actually Trips People Up

### 1. The "I Know This Problem" Trap

You've seen a similar problem. You start coding immediately. But this version has a twist. You're now 20 minutes in, realizing your memorized solution doesn't quite work, and you've wasted time.

**Fix:** Even if you've seen it before, go through the clarification and approach discussion. It takes 5 minutes and often reveals the twist.

### 2. The Silent Spiral

You're stuck. You go quiet. The interviewer has no idea if you're thinking productively or completely lost. Time passes. Panic sets in.

**Fix:** Verbalize your stuck-ness. "I'm trying to figure out how to handle the case where X happens. I'm considering either A or B, but A has this issue..." This often prompts useful hints.

### 3. The Complexity Blindness

You propose an O(n²) solution. The input size is 10^5. You code it anyway. It won't pass.

**Fix:** Always check constraints first. If n = 10^5 and you're proposing nested loops, stop and reconsider.

### 4. The "It Works" Delusion

You finish coding. You say "I think this works." You don't test it. There's a bug in line 12. The interviewer sees it but waits to see if you catch it. You don't.

**Fix:** Always trace through an example manually before saying you're done. Always.

---

## System Design: The Real Game

For mid-level and above, system design is where decisions are made.

### What They're Really Testing

Not whether you know exactly how to build Twitter. They're testing:

1. **Can you handle ambiguity?** The problem is intentionally vague. Can you ask the right questions to scope it?

2. **Can you make trade-offs?** There's no perfect design. Can you articulate why you chose X over Y?

3. **Do you understand scale?** There's a difference between designing for 1K users and 1B users.

4. **Can you go deep?** When pushed on a component, can you explain how it actually works?

### A Better Framework

Forget the generic "requirements, high-level design, detailed design" advice. Here's how to actually think about it:

**First 5 minutes: Scope Aggressively**
- "For this 45-minute discussion, I'd like to focus on X and Y. We can touch on Z if time permits."
- "I'll assume we're designing for scale of roughly N users, does that sound right?"
- "Let me confirm the core features: users can do A, B, and C. Is there anything else critical?"

**Minutes 5-15: Start with Data**
- What data do we need to store?
- What are the access patterns? Read-heavy? Write-heavy?
- What's the data volume? Growth rate?

This drives most architectural decisions.

**Minutes 15-30: Build Outward from Data**
- What database(s) fit these patterns?
- How does data flow in and out?
- Where are the bottlenecks at scale?

**Minutes 30-40: Deep Dive on One Component**
- The interviewer will push on something: "Tell me more about how the feed is generated."
- Go deep. Discuss caching strategies, consistency models, failure modes.

**Minutes 40-45: Trade-offs and Alternatives**
- "We could have used X instead of Y, which would give us better Z but worse W."
- Show you know there are multiple valid approaches.

---

## Behavioral Interviews: The Hidden Decider

Many people underprepare for behavioral rounds. Big mistake.

At most companies, behavioral performance can override coding performance. A "Strong Hire" on coding can become "No Hire" if behavioral reveals red flags.

### What They're Really Asking

Every behavioral question is really asking: "Will I want to work with this person?"

| They Ask | They're Evaluating |
|----------|-------------------|
| "Tell me about a conflict" | Do you handle disagreements professionally? |
| "Tell me about a failure" | Do you take responsibility? Do you learn? |
| "Tell me about a time you led" | Can you influence without authority? |
| "Tell me about a tough decision" | How do you handle ambiguity? |

### The Actual Formula

Not STAR. That's too mechanical. Instead:

**Situation:** One sentence. Set the scene.
**Problem:** What was actually hard about this?
**What YOU Did:** Specific actions. "I" not "we."
**Result:** Quantifiable if possible. What changed?
**Learning:** What would you do differently?

### The Stories You Need

Prepare 5-6 stories that you can adapt. Each story should demonstrate multiple qualities:

1. **A project you led:** Shows leadership, technical depth, delivery
2. **A conflict you resolved:** Shows communication, empathy, professionalism
3. **A failure you learned from:** Shows humility, growth mindset
4. **A time you disagreed with your manager:** Shows conviction, professionalism
5. **A time you helped someone:** Shows teamwork, mentorship
6. **A time you had to learn something quickly:** Shows adaptability, learning speed

---

## Company-Specific Realities

### Google

- Very high bar on problem solving. You need to handle curveballs.
- "Googleyness" matters more than people think. They're looking for low-ego, collaborative people.
- System design: They go very deep. Know your fundamentals thoroughly.

### Amazon

- Leadership Principles are not optional. Every question will tie back to them.
- They love data. "How did you measure success?" is coming.
- Bar raiser round is pass/fail for the entire interview, regardless of other rounds.

### Meta

- Speed matters. They expect two problems in a coding round, sometimes three.
- System design: They care a lot about scale. Know your numbers.
- Culture: They value moving fast and "being bold."

### Microsoft

- More collaborative interviews. They sometimes pair with you on the problem.
- Design rounds can be lower-level: "Design a hash map" rather than "Design Twitter."
- Culture: They evaluate for growth mindset explicitly.

### Apple

- More secrecy in interview process. Questions vary widely.
- They care about product intuition. You might be asked about design decisions in Apple products.
- Culture: Attention to detail matters.

---

## The Week Before Your Interview

**Don't:**
- Cram new topics
- Do hard problems you've never seen
- Stay up late studying
- Change your approach

**Do:**
- Review problems you've already solved
- Practice explaining your approach out loud
- Do easy/medium problems to build confidence
- Sleep 8 hours
- Exercise (reduces anxiety, improves cognitive function)

---

## The Day Of

- Eat a good breakfast
- Arrive/log in 10 minutes early
- Have water nearby
- Keep a notepad for jotting notes
- Remember: The interviewer wants you to succeed. They're rooting for you.

---

## After the Interview

- Send a brief thank you email (optional but nice)
- Don't overanalyze what happened
- Don't check your email every 5 minutes
- Expect 3-7 business days for a decision
- If rejected, ask for feedback. Not all companies provide it, but some do.

---

## The Mindset Shift

Here's what I wish someone told me earlier:

**The interview is a conversation, not an exam.**

You're not being tested on whether you can produce the perfect solution in isolation. You're demonstrating how you work through problems, how you communicate, how you handle being stuck.

**The interviewer is your collaborator, not your judge.**

They want to see you succeed. They're often willing to give hints if you ask. They're evaluating how you'd be to work with.

**One interview does not define you.**

I failed Google twice. Then I got offers from Google, Meta, Amazon, and Microsoft. Every successful engineer has rejection stories. The difference is they kept going.

---

*Practice patterns interactively at [AlgoPatterns](https://algopatterns.in)*

---

**Tags:** #faang #google #amazon #meta #microsoft #apple #interview #codinginterview #systemdesign #careeradvice
