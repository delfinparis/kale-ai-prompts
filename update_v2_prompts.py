"""
Update the 5 key roleplay prompts in prompts.json to V2 quality.
Extracts prompt text from the V2 markdown files and replaces the existing prompts.
"""
import json
import re

PROMPTS_FILE = "data/prompts.json"
WEBINAR_DIR = "/Users/djparis/Desktop/ai-webinar-promos"

def extract_main_prompt(filepath):
    """Extract the main prompt text from a V2 markdown file (first ``` block after '## THE PROMPT')."""
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the section after "## THE PROMPT" or "## START" and extract first code block
    # Look for the first ``` block that contains the actual roleplay prompt
    blocks = re.findall(r'```\n(.*?)```', content, re.DOTALL)

    if blocks:
        # The first (longest) code block is the main prompt
        main = max(blocks, key=len)
        return main.strip()
    return None

# Map prompt IDs to V2 files
updates = {
    "ch8-1": {
        "file": f"{WEBINAR_DIR}/PROMPT-ROLEPLAY-V2-OVERPRICED-SELLER.md",
        "title": "Seller Who Thinks Their Home Is a Palace",
        "bestFor": "Agents who struggle with pricing conversations — practice until you can navigate overpriced sellers without getting defensive, lecturing, or losing trust",
        "whatYouGet": "A 3-phase coaching session with escalating difficulty, hidden motivation discovery, trap questions, principles-based coaching notes after every exchange, and a full performance scorecard at the end",
    },
    "ch8-2": {
        "file": f"{WEBINAR_DIR}/PROMPT-ROLEPLAY-V2-DISCOUNT-BROKER.md",
        "title": "Discount Broker Shopper",
        "bestFor": "Agents who freeze when commission gets challenged by a competitor's low rate — practice articulating your value in specific, measurable terms",
        "whatYouGet": "A 3-phase coaching session against a sharp, analytical seller who demands proof. Includes value specificity coaching, the $12,000 answer framework, competitor discipline training, and a full scorecard",
    },
    "ch8-3": {
        "file": f"{WEBINAR_DIR}/PROMPT-ROLEPLAY-V2-FSBO.md",
        "title": "Stubborn FSBO",
        "bestFor": "Agents prospecting For Sale By Owners — practice having a genuine, non-salesy conversation that earns a follow-up meeting",
        "whatYouGet": "A 3-phase cold call coaching session where the win condition is a MEETING, not a listing. Includes script-detection coaching, ego management, respect tests, and a full scorecard",
    },
    "ch8-4": {
        "file": f"{WEBINAR_DIR}/PROMPT-ROLEPLAY-V2-EXPIRED-LISTING.md",
        "title": "Burned Expired Listing",
        "bestFor": "Agents working expired listings who need to handle anger, rebuild trust, and have the courage to be honest about pricing",
        "whatYouGet": "A 3-phase coaching session focused on trust-building with an emotionally burned seller. Includes honesty tests, emotional intelligence coaching, and a deeply moving hidden layer that changes everything",
    },
    "ch8-7": {
        "file": f"{WEBINAR_DIR}/PROMPT-ROLEPLAY-V2-FIRST-TIME-BUYER.md",
        "title": "Terrified First-Time Buyer",
        "bestFor": "Agents who work with first-time buyers — practice calming genuine fear with honest answers, not condescending reassurance",
        "whatYouGet": "A 3-phase coaching session with an anxious but intelligent buyer. Includes anxiety spiral management, honesty tests, condescension detection, and a hidden generational story that shifts the conversation",
    },
}

# Load prompts
with open(PROMPTS_FILE, 'r') as f:
    prompts = json.load(f)

updated = 0
for prompt in prompts:
    if prompt['id'] in updates:
        info = updates[prompt['id']]
        new_text = extract_main_prompt(info['file'])
        if new_text:
            old_len = len(prompt['prompt'])
            prompt['prompt'] = new_text
            prompt['bestFor'] = info['bestFor']
            prompt['whatYouGet'] = info['whatYouGet']
            new_len = len(new_text)
            print(f"Updated {prompt['id']}: {prompt['title']}")
            print(f"  Prompt: {old_len} → {new_len} chars ({new_len/old_len:.1f}x longer)")
            print(f"  bestFor: {info['bestFor'][:80]}...")
            print(f"  whatYouGet: {info['whatYouGet'][:80]}...")
            updated += 1
        else:
            print(f"WARNING: Could not extract prompt from {info['file']}")

# Save
with open(PROMPTS_FILE, 'w') as f:
    json.dump(prompts, f, indent=2, ensure_ascii=False)

print(f"\nDone. Updated {updated}/5 prompts in {PROMPTS_FILE}")
