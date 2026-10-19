import { Response, NextFunction } from 'express';
import { Report } from '../models/Report';
import { AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

const createReportSchema = z.object({
  reportedUserId: z.string().optional(),
  reportedRideId: z.string().optional(),
  category: z.enum(['safety', 'inappropriate_behaviour', 'no_show', 'pricing_fraud', 'spam', 'other']),
  explanation: z.string().trim().min(5, 'Please provide detailed explanation (at least 5 characters)').max(1000),
});

export const createReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const validated = createReportSchema.parse(req.body);

    const report = await Report.create({
      reporterId: req.user._id,
      reportedUserId: validated.reportedUserId,
      reportedRideId: validated.reportedRideId,
      category: validated.category,
      explanation: validated.explanation,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Your report has been received and escalated to our moderation team.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyReports = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const reports = await Report.find({ reporterId: req.user._id })
      .populate('reportedUserId', 'name email')
      .populate('reportedRideId', 'origin destination departureAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    next(error);
  }
};
