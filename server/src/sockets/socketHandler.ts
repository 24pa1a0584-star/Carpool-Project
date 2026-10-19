import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/token';
import { Conversation, Message } from '../models/Conversation';

export const setupSocketHandlers = (io: Server): void => {
  // Socket authentication middleware
  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (token) {
        const payload = verifyToken(token);
        (socket as any).userId = payload.userId;
      }
      next();
    } catch (err) {
      // Allow guest socket connection for public updates if needed, or proceed
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;

    if (userId) {
      // User joins personal notification room
      socket.join(`user_${userId}`);
    }

    // Join a specific ride conversation room
    socket.on('join_conversation', async (conversationId: string) => {
      try {
        if (!conversationId) return;

        // If authenticated, check if user is a participant
        if (userId) {
          const convo = await Conversation.findById(conversationId);
          if (convo && convo.participants.some((p) => p.toString() === userId)) {
            socket.join(`convo_${conversationId}`);
          }
        } else {
          socket.join(`convo_${conversationId}`);
        }
      } catch (err) {
        console.error('Socket join error:', err);
      }
    });

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`convo_${conversationId}`);
    });

    // Client sends message through socket
    socket.on(
      'send_message',
      async (data: { conversationId: string; content: string }) => {
        try {
          if (!userId || !data.conversationId || !data.content?.trim()) return;

          const conversation = await Conversation.findById(data.conversationId);
          if (!conversation) return;

          const isParticipant = conversation.participants.some(
            (p) => p.toString() === userId
          );
          if (!isParticipant) return;

          const message = await Message.create({
            conversationId: conversation._id,
            senderId: userId,
            content: data.content.trim(),
            readBy: [userId],
          });

          conversation.lastMessage = data.content.trim();
          conversation.lastMessageAt = new Date();
          await conversation.save();

          await message.populate('senderId', 'name avatar');

          // Broadcast to everyone in this conversation room
          io.to(`convo_${data.conversationId}`).emit('new_message', message);

          // Also broadcast to the other participant's personal room for notification badge
          const otherParticipant = conversation.participants.find(
            (p) => p.toString() !== userId
          );
          if (otherParticipant) {
            io.to(`user_${otherParticipant.toString()}`).emit('message_notification', {
              conversationId: conversation._id,
              senderId: userId,
              snippet: data.content.substring(0, 50),
            });
          }
        } catch (error) {
          console.error('Socket send_message error:', error);
        }
      }
    );

    // Typing indicators
    socket.on('typing', (data: { conversationId: string; userName: string }) => {
      socket.to(`convo_${data.conversationId}`).emit('user_typing', data);
    });

    socket.on('stop_typing', (data: { conversationId: string }) => {
      socket.to(`convo_${data.conversationId}`).emit('user_stop_typing', data);
    });

    socket.on('disconnect', () => {
      // Handled cleanly
    });
  });
};
