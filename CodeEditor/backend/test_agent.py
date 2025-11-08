"""
Quick test script to verify agents are working
Run this to test the system without starting the full server
"""
import asyncio
from agents.idea_agent import IdeaAgent
from agents.planning_agent import PlanningAgent
from agents.code_agent import CodeAgent
from config import settings


async def test_agents():
    """Test the agent workflow"""
    
    print("=" * 60)
    print("Testing AI Code Editor Agents")
    print("=" * 60)
    
    # Test prompt
    test_prompt = "Create a simple counter app with React. Include increment and decrement buttons."
    
    print(f"\n📝 Test Prompt: {test_prompt}\n")
    
    try:
        # Test 1: Idea Agent
        print("🤖 Stage 1: Testing Idea Agent...")
        idea_agent = IdeaAgent()
        spec = await idea_agent.generate_spec(test_prompt)
        
        print("✅ Idea Agent Success!")
        print(f"   Tech Stack: {spec.tech_stack.value}")
        print(f"   Features: {', '.join(spec.features[:3])}...")
        print(f"   Description: {spec.description[:100]}...")
        
        # Test 2: Planning Agent
        print("\n🤖 Stage 2: Testing Planning Agent...")
        planning_agent = PlanningAgent()
        plan = await planning_agent.create_plan(spec)
        
        print("✅ Planning Agent Success!")
        print(f"   Files to generate: {len(plan.file_structure)}")
        print(f"   Dependencies: {len(plan.dependencies)}")
        print(f"   Implementation steps: {len(plan.todos)}")
        
        # Test 3: Code Agent (generate one file)
        print("\n🤖 Stage 3: Testing Code Agent...")
        code_agent = CodeAgent()
        
        # Find a component file to generate
        test_file = None
        for node in plan.file_structure:
            if node.type == "file" and (node.name.endswith(".jsx") or node.name.endswith(".tsx")):
                test_file = node
                break
        
        if test_file:
            generated_file = await code_agent.generate_file(
                test_file.path,
                spec,
                plan,
                []
            )
            
            print("✅ Code Agent Success!")
            print(f"   Generated: {generated_file.path}")
            print(f"   Language: {generated_file.language}")
            print(f"   Size: {len(generated_file.content)} characters")
            print(f"   Preview: {generated_file.content[:150]}...")
        
        print("\n" + "=" * 60)
        print("✅ All Agents Working Successfully!")
        print("=" * 60)
        print("\nYou can now start the full application:")
        print("  Backend:  python main.py")
        print("  Frontend: cd frontend && npm run dev")
        print("\n")
        
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()
        print("\nPlease check:")
        print("  1. GROQ_API_KEY is set in .env")
        print("  2. All dependencies are installed")
        print("  3. Internet connection is working")


if __name__ == "__main__":
    # Check if API key is configured
    if not settings.groq_api_key or settings.groq_api_key == "your_groq_api_key_here":
        print("❌ Error: GROQ_API_KEY not configured!")
        print("\nPlease:")
        print("  1. Copy .env.example to .env")
        print("  2. Edit .env and add your Groq API key")
        print("  3. Get a free API key at https://console.groq.com")
        exit(1)
    
    asyncio.run(test_agents())

