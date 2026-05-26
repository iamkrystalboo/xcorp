/**
 * test-todo12.js — AI Assistant Page Verification
 * Run: node test/test-todo12.js
 */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'xcorp-merged.html'), 'utf8');

let pass = 0;
let fail = 0;

function test(name, condition) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    pass++;
  } else {
    console.log(`  ❌ ${name}`);
    fail++;
  }
}

console.log('\n🤖 TODO-12: AI Assistant Page Tests\n');

// ==================== 1. PAGE EXISTS ====================
console.log('📄 AI Assistant Page Structure:');
test('page-ai section exists', html.includes('id="page-ai"'));
test('page-ai has hero section', html.includes('id="page-ai"') && html.indexOf('class="hero"', html.indexOf('id="page-ai"')) < html.indexOf('</section>', html.indexOf('id="page-ai"')));
test('page has "AI Assistant" eyebrow', html.includes('<div class="eyebrow">AI Assistant</div>'));
test('page has headline', html.includes('Ask XCorp anything.'));
test('page has pain section', html.includes('Managers waste 30+ minutes'));
test('page has feature strips - Instant Answers', html.includes('Instant Answers'));
test('page has feature strips - Smart Summaries', html.includes('Smart Summaries'));
test('page has feature strips - Task & OKR Q&A', html.includes('Task &amp; OKR Q&amp;A') || html.includes('Task & OKR Q&A'));
test('page has feature strips - Proactive Alerts', html.includes('Proactive Alerts'));
test('page has bottom CTA', html.includes('Ready to work smarter with AI?'));

// ==================== 2. INTERACTIVE DEMO ====================
console.log('\n💬 Interactive Chatbot Demo:');
test('demo section exists with heading', html.includes('Try the XCorp AI Assistant'));
test('ai-demo container exists', html.includes('class="ai-demo"'));
test('ai-sidebar exists', html.includes('class="ai-sidebar"'));
test('prompt chip - leave', html.includes('data-prompt="Who\'s on leave this week?"') || html.includes("data-prompt=\"Who's on leave this week?\""));
test('prompt chip - OKR', html.includes('data-prompt="Show my OKR progress"'));
test('prompt chip - overdue', html.includes('data-prompt="What tasks are overdue?"'));
test('prompt chip - sprint', html.includes('data-prompt="Summarize Sprint 24"'));
test('prompt chip - workload', html.includes('data-prompt="Check team workload"'));
test('chat messages container exists', html.includes('id="aiChatMessages"'));
test('chat input exists', html.includes('id="aiChatInput"'));
test('chat send button exists', html.includes('id="aiChatSend"'));
test('welcome message exists', html.includes("I'm your XCorp AI Assistant") || html.includes("I\\'m your XCorp AI Assistant"));

// ==================== 3. CHATBOT JS LOGIC ====================
console.log('\n🧠 Chatbot JavaScript:');
test('aiResponses object defined', html.includes('const aiResponses'));
test('aiResponses has leave key', html.includes('"leave":'));
test('aiResponses has okr key', html.includes('"okr":'));
test('aiResponses has overdue key', html.includes('"overdue":'));
test('aiResponses has sprint key', html.includes('"sprint":'));
test('aiResponses has workload key', html.includes('"workload":'));
test('matchAiResponse function defined', html.includes('function matchAiResponse'));
test('addAiMessage function defined', html.includes('function addAiMessage'));
test('showAiTyping function defined', html.includes('function showAiTyping'));
test('sendAiMessage function defined', html.includes('function sendAiMessage'));
test('typing indicator has bounce animation', html.includes('aiTypingBounce'));

// ==================== 4. ROLE TABS ====================
console.log('\n👥 AI Role Tabs:');
test('aiRoleTabs container exists', html.includes('id="aiRoleTabs"'));
test('aiRolePanel container exists', html.includes('id="aiRolePanel"'));
test('aiRoleContent JS object defined', html.includes('const aiRoleContent'));
test('CEO role data exists', html.includes("ceo: ["));
test('Lead role data exists', html.includes("lead: ["));
test('HR role data exists', html.includes("hr: ["));
test('uses standard renderRole function', html.includes("renderRole('aiRolePanel',"));

// ==================== 5. NAVIGATION ====================
console.log('\n🔗 Navigation Wiring:');
test('nav dropdown uses data-page="ai" (no alert)', html.includes('data-page="ai"'));
test('nav dropdown does NOT use alert for AI', !html.includes("alert('AI Assistant page coming soon')"));

// ==================== 6. PAGES CONFIG ====================
console.log('\n⚙️ Pages Config:');
test('pages config includes ai', html.includes("'ai': document.getElementById('page-ai')"));

// ==================== 7. FOOTER ====================
console.log('\n🦶 Footer Link:');
test('footer links to ai page', html.includes("switchPage('ai')") && html.includes('AI Assistant'));
test('footer does NOT use alert for AI', !html.includes("alert('XCorp AI Assistant is coming soon!')"));

// ==================== 8. SEE ALL FEATURES ====================
console.log('\n📋 See All Features — AI Category:');
const allFeaturesStart = html.indexOf('id="page-all-features"');
const allFeaturesEnd = html.indexOf('</section>', allFeaturesStart);
const allFeaturesSection = html.substring(allFeaturesStart, allFeaturesEnd);
test('AI Assistant category exists in All Features', allFeaturesSection.includes('AI Assistant'));
test('Has Natural Language Q&A card', allFeaturesSection.includes('Natural Language Q'));
test('Has Auto-generated Summaries card', allFeaturesSection.includes('Auto-generated Summaries'));
test('Has Proactive Risk Alerts card', allFeaturesSection.includes('Proactive Risk Alerts'));
test('Has Context-aware Suggestions card', allFeaturesSection.includes('Context-aware Suggestions'));
test('Uses purple color scheme', allFeaturesSection.includes('#8B5CF6'));

// ==================== 9. HOMEPAGE ====================
console.log('\n🏠 Homepage AI Card:');
const homeStart = html.indexOf('id="page-home"');
const homeEnd = html.indexOf('</section>', homeStart);
const homeSection = html.substring(homeStart, homeEnd);
test('AI feature card exists on homepage', homeSection.includes('AI that answers before you ask'));
test('Card has sparkles icon', homeSection.includes('sparkles_3d.png') || homeSection.includes('Sparkles'));
test('Card has pain tag', homeSection.includes('I spent 20 minutes finding a simple number'));

// ==================== 10. CSS ====================
console.log('\n🎨 CSS Styles:');
test('.ai-demo CSS exists', html.includes('.ai-demo'));
test('.ai-sidebar CSS exists', html.includes('.ai-sidebar'));
test('.ai-prompt-chip CSS exists', html.includes('.ai-prompt-chip'));
test('.ai-chat-panel CSS exists', html.includes('.ai-chat-panel'));
test('.ai-msg CSS exists', html.includes('.ai-msg'));
test('.ai-typing-dot CSS exists', html.includes('.ai-typing-dot'));
test('.ai-chat-input CSS exists', html.includes('.ai-chat-input'));
test('@keyframes aiFadeIn exists', html.includes('@keyframes aiFadeIn'));
test('@keyframes aiTypingBounce exists', html.includes('@keyframes aiTypingBounce'));

// ==================== SUMMARY ====================
console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${pass} passed, ${fail} failed, ${pass + fail} total`);
if (fail === 0) {
  console.log('🎉 All tests passed!\n');
} else {
  console.log(`⚠️  ${fail} test(s) failed.\n`);
  process.exit(1);
}
