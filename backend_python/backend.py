import os
import sys
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

load_dotenv()  # Load .env file immediately

from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import create_tool_calling_agent, AgentExecutor
from serpapi import GoogleSearch

# ==========================================
# 1. API KEYS
# ==========================================
if not os.environ.get("GROQ_API_KEY") or not os.environ.get("SERPAPI_API_KEY"):
    print("❌ Error: Missing API keys in .env file. Please check GROQ_API_KEY and SERPAPI_API_KEY.")
    # In a real server, we might not want to exit, but for now it's safer to fail fast if config is bad.
    # sys.exit(1) 

app = FastAPI()

class SearchRequest(BaseModel):
    query: str

# ==========================================
# 2. THE IMPROVED TOOL
# ==========================================
@tool
def get_medicine_prices(medicine_name: str):
    """
    Searches for current prices of ONE specific medicine using regular Google search.
    This finds Jan Aushadhi, pharmacy websites, and other sources better than Shopping.
    Call this multiple times if you need to check different medicines.
    Example Input: "Dolo 650", "Jan Aushadhi Paracetamol 650"
    """
    print(f"\n🔎 [Tool] Searching prices for: {medicine_name}...")
    
    import re
    
    # Jan Aushadhi known prices (government fixed prices)
    JAN_AUSHADHI_PRICES = {
        "pantoprazole 40": "₹15",
        "pantoprazole 40mg": "₹15",
        "paracetamol 650": "₹0.50",
        "paracetamol 650mg": "₹0.50",
        "paracetamol 500": "₹0.35",
        "vitamin c 500": "₹15",
        "vitamin c 500mg": "₹15",
        "aspirin 75": "₹5",
        "aspirin 325": "₹5",
        "omeprazole 20": "₹10",
        "atorvastatin 10": "₹10",
        "metformin 500": "₹5",
    }
    
    # Check if this is a Jan Aushadhi search
    is_jan_aushadhi = "jan aushadhi" in medicine_name.lower()
    
    # If Jan Aushadhi, try to find known price
    if is_jan_aushadhi:
        for key, price in JAN_AUSHADHI_PRICES.items():
            if key in medicine_name.lower():
                print(f"   💊 Jan Aushadhi known price: {price}")
                return f"Store: Jan Aushadhi Kendra (Government) | Price: {price} | URL: https://janaushadhi.gov.in/"
    
    # Use regular Google search to find pharmacy websites and Jan Aushadhi
    params = {
        "engine": "google",
        "q": f"{medicine_name} price India pharmacy",
        "location": "India", 
        "hl": "en",
        "gl": "in",
        "num": 10,  # Get more results
        "api_key": os.environ["SERPAPI_API_KEY"]
    }

    try:
        search = GoogleSearch(params)
        results = search.get_dict()
        organic_results = results.get("organic_results", [])
        
        if not organic_results:
            # If Jan Aushadhi and no results, still return known price if available
            if is_jan_aushadhi:
                return f"Store: Jan Aushadhi Kendra | Price: Check local store | URL: https://janaushadhi.gov.in/"
            return f"No results found for {medicine_name}."
        
        # Extract price information from results
        output_list = []
        found_prices = []
        
        for item in organic_results[:8]:  # Check more results
            title = item.get("title", "")
            snippet = item.get("snippet", "")
            link = item.get("link", "N/A")
            
            # Combine title and snippet for better price detection
            text = f"{title} {snippet}"
            
            # Enhanced price regex patterns
            price_patterns = [
                r'₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)',  # ₹123.45 or ₹1,234
                r'Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)',  # Rs. 123 or Rs 123
                r'INR\s*(\d+(?:,\d+)*(?:\.\d{2})?)',  # INR 123
                r'Price:\s*₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)',  # Price: 123
                r'MRP:?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)',  # MRP: ₹123
            ]
            
            price = None
            for pattern in price_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    price_num = match.group(1).replace(',', '')
                    price = f"₹{price_num}"
                    break
            
            # Extract store/source name
            source = title
            # Clean up common patterns
            source = re.sub(r'\s*-\s*.*$', '', source)  # Remove everything after dash
            source = re.sub(r'\s*\|.*$', '', source)  # Remove everything after pipe
            source = source[:50]  # Limit length
            
            if price:
                output_list.append(f"Store: {source} | Price: {price} | URL: {link}")
                found_prices.append(price)
        
        if not output_list:
            # If no prices found, return top results anyway with indication
            for item in organic_results[:3]:
                title = item.get("title", "Unknown")[:50]
                link = item.get("link", "N/A")
                output_list.append(f"Store: {title} | Price: Check website | URL: {link}")
        
        
        result = "\n".join(output_list[:5])  # Return top 5
        print(f"   ✓ Found {len(output_list)} results with {len(found_prices)} prices")
        
        # Log URLs for debugging
        for item in output_list[:3]:
            if "URL:" in item:
                url_part = item.split("URL:")[-1].strip()
                if url_part != "N/A":
                    print(f"   🔗 URL found: {url_part[:60]}...")
        
        return result

    except Exception as e:
        print(f"   ❌ Error: {e}")
        return f"Error: {e}"

# ==========================================
# 3. THE MULTI-MEDICINE AGENT SETUP
# ==========================================
def get_agent_executor():
    # 1. Setup LLM
    llm = ChatGroq(
        temperature=0,
        model_name="openai/gpt-oss-120b"
    )

    tools = [get_medicine_prices]

    # 2. The Logic Prompt
    system_instruction = """
    You are a Medical Buying Assistant focused on finding **REAL CHEAPER GENERIC ALTERNATIVES** available in India.

    ### CRITICAL RULES:
    1. **NEVER MAKE UP PRICES** - Only use prices that come from the tool results
    2. **NEVER INVENT MEDICINE NAMES** - Only use actual products found by the tool
    3. **GENERICS MUST BE CHEAPER** - If a generic is more expensive, don't include it
    4. If you cannot find cheaper alternatives, say so honestly

    ### STEP 1: ANALYSIS
    When the user searches for a medicine (e.g., "Limcee", "Dolo 650"):
    - Identify the **active salt/composition** (e.g., "Vitamin C 500mg", "Paracetamol 650mg")
    - Think of SPECIFIC REAL BRANDS to search for:
      * Jan Aushadhi stores (government generic brand)
      * Other known generic manufacturers in India
      * The same composition with different brand names

    ### STEP 2: SEARCH STRATEGY
    - **FIRST**: Call `get_medicine_prices` for the **USER'S ORIGINAL MEDICINE**
    - **SECOND**: Call `get_medicine_prices` with "Jan Aushadhi [composition]" 
      Example: If user searches "Pan 40", search "Jan Aushadhi Pantoprazole 40mg"
    - **THIRD**: Search for other specific generic brands or the composition name
      Example: "Pantoprazole 40mg generic", "Paracetamol 650mg tablets"
    - **You MUST call the tool at least 3 times** (1 original + Jan Aushadhi + 1 other)

    ### STEP 3: PRICE SELECTION
    - From each tool result, pick the **LOWEST VALID PRICE** you see
    - Extract the exact price string from the tool output (e.g., "₹18.51")
    - **PRESERVE THE EXACT URL** from the tool output - do NOT change it to "N/A"
    - **DO NOT modify or estimate prices**
    - If the tool returns "No results found", skip that medicine

    ### STEP 4: VALIDATION - CRITICAL
    - **ONLY include generics that are CHEAPER than the original**
    - **REMOVE any generic that costs MORE than the original** - this is impossible
    - If you find NO cheaper alternatives, report only the original
    - Double-check: Generic price < Original price (numerically)

    ### STEP 5: REPORT FORMAT
    
    ACTIVE_COMPOSITION: [Name of the salt/composition]
    
    MEDICINES:
    - NAME: [Exact medicine name from tool] | TYPE: Original | PRICE: [Exact lowest price from tool] | URL: [EXACT URL from tool - do NOT change to N/A]
    - NAME: [Exact medicine name from tool] | TYPE: Generic | PRICE: [Exact lowest price from tool] | URL: [EXACT URL from tool - do NOT change to N/A]
    
    **CRITICAL**: Copy the URL EXACTLY as it appears in the tool output. If tool says "N/A", use "N/A". If tool has a link, use that link.
    
    **If no cheaper alternatives found:**
    ACTIVE_COMPOSITION: [composition]
    
    MEDICINES:
    - NAME: [Original] | TYPE: Original | PRICE: [price] | URL: [url]
    
    NOTE: No cheaper generic alternatives found in search results.
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_instruction),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])

    agent = create_tool_calling_agent(llm, tools, prompt)
    return AgentExecutor(agent=agent, tools=tools, verbose=True)

agent_executor = get_agent_executor()

@app.post("/search")
async def search_medicine(request: SearchRequest):
    try:
        response = agent_executor.invoke({"input": request.query})
        output_str = response['output']
        
        import json
        import re
        
        # Parse the structured text format
        medicines = []
        active_composition = "Unknown"
        
        # Extract active composition
        comp_match = re.search(r'ACTIVE_COMPOSITION:\s*(.+)', output_str)
        if comp_match:
            active_composition = comp_match.group(1).strip()
        
        # Extract medicines
        medicine_pattern = r'NAME:\s*(.+?)\s*\|\s*TYPE:\s*(.+?)\s*\|\s*PRICE:\s*(.+?)\s*\|\s*URL:\s*(.+?)(?:\n|$)'
        for match in re.finditer(medicine_pattern, output_str):
            name = match.group(1).strip()
            med_type = match.group(2).strip()
            price = match.group(3).strip()
            url = match.group(4).strip()
            
            # Clean up URL
            if url.lower() in ['n/a', 'na', 'none', '#']:
                url = '#'
            
            medicines.append({
                "name": name,
                "type": med_type,
                "price": price,
                "url": url
            })
        
        # If parsing failed, return raw text
        if not medicines:
            print(f"FAILED TO PARSE OUTPUT: {output_str}")
            return {"result": {
                "active_composition": "Unknown",
                "medicines": [],
                "raw_text": output_str
            }}
        
        # CRITICAL: Validate that generics are actually cheaper
        def extract_price_number(price_str):
            """Extract numeric value from price string like '₹18.51' or '₹20'"""
            import re
            match = re.search(r'[\d,]+(?:\.\d+)?', price_str.replace(',', ''))
            if match:
                try:
                    return float(match.group(0))
                except:
                    return None
            return None
        
        # Find the original medicine price
        original_price = None
        for med in medicines:
            if med['type'].lower() == 'original':
                original_price = extract_price_number(med['price'])
                break
        
        # Filter out generics that are more expensive than the original
        if original_price is not None:
            print(f"\n   💰 Original price detected: ₹{original_price}")
            filtered_medicines = []
            removed_count = 0
            
            for med in medicines:
                if med['type'].lower() == 'original':
                    # Always keep the original
                    filtered_medicines.append(med)
                    print(f"   ✓ Keeping original: {med['name']} (₹{original_price})")
                else:
                    # For generics, only keep if cheaper
                    generic_price = extract_price_number(med['price'])
                    print(f"   🔍 Checking generic: {med['name']} - Price: ₹{generic_price}")
                    
                    if generic_price is not None and generic_price < original_price:
                        filtered_medicines.append(med)
                        savings = ((original_price - generic_price) / original_price) * 100
                        print(f"   ✅ KEEPING: {med['name']} (₹{generic_price}) - {savings:.1f}% cheaper!")
                    else:
                        removed_count += 1
                        if generic_price is not None:
                            print(f"   ❌ REMOVING: {med['name']} (₹{generic_price}) - NOT cheaper than ₹{original_price}")
                        else:
                            print(f"   ❌ REMOVING: {med['name']} - Invalid price: {med['price']}")
            
            medicines = filtered_medicines
            
            if removed_count > 0:
                print(f"\n   🗑️  Removed {removed_count} expensive 'generic(s)'\n")
        
        return {"result": {
            "active_composition": active_composition,
            "medicines": medicines
        }}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("--- 🏥 GenRx Python API Server Starting ---")
    uvicorn.run(app, host="0.0.0.0", port=8000)