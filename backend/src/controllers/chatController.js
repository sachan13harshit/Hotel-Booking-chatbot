// src/controllers/chatController.js
const Conversation = require('../models/conversation');
const openaiService = require('../services/openaiService');
const roomService = require('../services/roomService');

async function handleChat(req, res) {
  const { message, sessionId } = req.body;

  try {
    let conversation = await Conversation.findOne({ where: { sessionId } });
    if (!conversation) {
      conversation = await Conversation.create({ sessionId, messages: [] });
    }

    conversation.messages.push({ role: 'user', content: message });

    const messages = [
      { role: 'system', content: 'You are a helpful assistant primarily for hotel bookings. If the user asks about something unrelated to hotel bookings, politely inform them that you specialize in hotel bookings and offer to assist with that' },
      ...conversation.messages,
    ];

    const functions = [
      {
        name: 'getRoomOptions',
        description: 'Get available room options',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'getRoomDetails',
        description: 'Get details for a specific room',
        parameters: {
          type: 'object',
          properties: {
            roomId: { type: 'number' },
          },
          required: ['roomId'],
        },
      },
      {
        name: 'bookRoom',
        description: 'Book a room',
        parameters: {
          type: 'object',
          properties: {
            roomId: { type: 'number' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            nights: { type: 'number' },
          },
          required: ['roomId', 'fullName', 'email', 'nights'],
        },
      },
    ];

    const completion = await openaiService.createChatCompletion(messages, functions);
    let assistantResponse = completion.choices[0].message;

    if (assistantResponse.function_call) {
      const functionName = assistantResponse.function_call.name;
      const functionArgs = JSON.parse(assistantResponse.function_call.arguments);

      let functionResult;
      if (functionName === 'getRoomOptions') {
        functionResult = await roomService.getRoomOptions();
      } else if (functionName === 'getRoomDetails') {
        functionResult = await roomService.getRoomDetails(functionArgs.roomId);
      } else if (functionName === 'bookRoom') {
        functionResult = await roomService.bookRoom(
          functionArgs.roomId,
          functionArgs.fullName,
          functionArgs.email,
          functionArgs.nights
        );
      }

      if (functionName === 'bookRoom' && functionResult.bookingId) {
        const secondCompletion = await openaiService.createChatCompletion([
          ...messages,
          assistantResponse,
          {
            role: 'function',
            name: functionName,
            content: JSON.stringify(functionResult),
          },
          {
            role: 'system',
            content: `The booking was successful. Inform the user that their booking is confirmed and provide them with the booking ID: ${functionResult.bookingId}.`
          }
        ]);

        assistantResponse = secondCompletion.choices[0].message;
      } else {
        const secondCompletion = await openaiService.createChatCompletion([
          ...messages,
          assistantResponse,
          {
            role: 'function',
            name: functionName,
            content: JSON.stringify(functionResult),
          },
        ]);

        assistantResponse = secondCompletion.choices[0].message;
      }
    }

    conversation.messages.push(assistantResponse);
    await conversation.save();

    res.json({ response: assistantResponse.content });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
}

module.exports = { handleChat };