import { Response, NextFunction } from 'express';
import { Conversation, Message } from '../models/Conversation';
import { AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

const sendMessageSchema = z.object({
  content: z.string().trim().min(1, 'Message cannot be empty').max(1000),
});

export const getConversations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name avatar city')
      .populate({
        path: 'rideId',
        select: 'origin destination departureAt status',
      })
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    // Check authorization: must be participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user!._id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to view this conversation.',
      });
      return;
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      {
        $addToSet: { readBy: req.user._id },
      }
    );

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { conversationId } = req.params;
    const validated = sendMessageSchema.parse(req.body);

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    // Check participation
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user!._id.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to send messages in this conversation.',
      });
      return;
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.user._id,
      content: validated.content,
      readBy: [req.user._id],
    });

    conversation.lastMessage = validated.content;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    await message.populate('senderId', 'name avatar');

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};
