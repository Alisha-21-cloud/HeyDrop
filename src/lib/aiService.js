export const AI_BOT = {
  id: 'ai-assistant-bot',
  nickname: 'ChatBot', 
  color: 'bg-amber-500',
};

export async function generateAIResponse(question) {
  try {
    const apiKey = 'AIzaSyAmbfnx3H9LwBf73NKiI2E-6576ax07hAg'; // Your key here
    
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: question }] }],
          generationConfig: { maxOutputTokens: 150 }
        })
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'AI couldn\'t respond';
  } catch (error) {
    return 'AI service temporarily unavailable';
  }
}

export async function postAIResponse(question, replyToMessage = null, roomId) {
  try {
    const { db } = await import('./firebase.js');
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    
    const aiResponse = await generateAIResponse(question);
    
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
