// SOLUTION 1: Direct Client-Side Gemini API Integration
// Update your src/lib/aiService.js with this:

// AI Bot user details
export const AI_BOT = {
  id: 'ai-assistant-bot',
  nickname: 'ChatBot',
  color: 'bg-amber-500',
};

// Direct Gemini API call (client-side)
export async function generateAIResponse(question) {
  try {
    // ⚠️ NOTE: You'll need to add your API key to Vercel environment variables
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 

    if (!apiKey) {
      return '❌ AI service not configured. Please add VITE_GEMINI_API_KEY to environment variables.';
    }

    console.log('🤖 Calling Gemini API directly...');

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ 
                text: `You are an AI assistant with humor and helpful responses. User's message: "${question}"` 
              }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.9,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);

      if (errorData.error?.message?.includes('API key')) {
        return '🔑 AI API key issue. Please check configuration.';
      } else {
        return `❌ AI Error: ${errorData.error?.message || 'Unknown error'}`;
      }
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      return '🤔 AI couldn\'t generate a response. Please try again.';
    }

    return aiText;

  } catch (error) {
    console.error('AI Error:', error);
    return '❌ AI service temporarily unavailable. Please try again.';
  }
}

// Same postAIResponse function as before
export async function postAIResponse(question, replyToMessage = null, roomId) {
  try {
    const { db } = await import('./firebase.js');
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

    // Post thinking message
    const thinkingMessageData = {
      text: '🤔 AI is thinking...',
      nickname: AI_BOT.nickname,
      userId: AI_BOT.id,
      timestamp: serverTimestamp(),
      color: AI_BOT.color,
      isAI: true,
      isThinking: true
    };

    if (replyToMessage) {
      thinkingMessageData.replyTo = {
        id: replyToMessage.id,
        text: replyToMessage.text,
        nickname: replyToMessage.nickname,
        userId: replyToMessage.userId
      };
    }

    await addDoc(collection(db, roomId), thinkingMessageData);

    // Generate AI response
    const aiResponse = await generateAIResponse(question);

    // Post AI response
    const messageData = {
      text: aiResponse,
      nickname: AI_BOT.nickname,
      userId: AI_BOT.id,
      timestamp: serverTimestamp(),
      color: AI_BOT.color,
      isAI: true
    };

    if (replyToMessage) {
      messageData.replyTo = {
        id: replyToMessage.id,
        text: replyToMessage.text,
        nickname: replyToMessage.nickname,
        userId: replyToMessage.userId
      };
    }

    await addDoc(collection(db, roomId), messageData);
    return true;

  } catch (error) {
    console.error('Error posting AI response:', error);
    return false;
  }
}