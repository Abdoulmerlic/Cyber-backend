import { Request, Response } from 'express';
import SecurityTip from '../models/SecurityTip';

export const getSecurityTips = async (req: Request, res: Response) => {
  try {
    const tips = await SecurityTip.find().sort({ createdAt: -1 });
    res.json(tips);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSecurityTipById = async (req: Request, res: Response) => {
  try {
    const tip = await SecurityTip.findById(req.params.id);
    if (!tip) {
      return res.status(404).json({ message: 'Security tip not found' });
    }
    res.json(tip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createSecurityTip = async (req: Request, res: Response) => {
  try {
    const { content, category } = req.body;
    
    const tip = new SecurityTip({
      content,
      category
    });

    await tip.save();
    res.status(201).json(tip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSecurityTip = async (req: Request, res: Response) => {
  try {
    const { content, category } = req.body;
    
    const tip = await SecurityTip.findById(req.params.id);
    if (!tip) {
      return res.status(404).json({ message: 'Security tip not found' });
    }

    tip.content = content || tip.content;
    tip.category = category || tip.category;

    await tip.save();
    res.json(tip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteSecurityTip = async (req: Request, res: Response) => {
  try {
    const tip = await SecurityTip.findById(req.params.id);
    if (!tip) {
      return res.status(404).json({ message: 'Security tip not found' });
    }

    await SecurityTip.deleteOne({ _id: tip._id });
    res.json({ message: 'Security tip deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRandomTip = async (req: Request, res: Response) => {
  try {
    const count = await SecurityTip.countDocuments();
    const random = Math.floor(Math.random() * count);
    const tip = await SecurityTip.findOne().skip(random);
    
    if (!tip) {
      return res.status(404).json({ message: 'No security tips found' });
    }
    
    res.json(tip);
  } catch (error) {
    console.error('Get random tip error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching random tip',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 