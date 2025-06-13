import { NextFunction, Request, Response } from 'express';
import { User, IUser } from '../model/user.model';
import { Article, IArticle } from '../model/article.model';
import { ArticleVersion } from '../model/articleVersion.model';
import { Types } from 'mongoose';
import validator from 'validator';
import { AuthenticatedRequest } from '../middleware/verifyAccessToken';
import { JwtPayload } from 'jsonwebtoken';
import { CustomError } from '../utils/customError';
const registerUser = async (req: Request, res: Response) => {
  try {
        const { name, email, password } : IUser = req.body;
        // Check if user already exists
        if(!name || !email || !password) {
          throw new Error('Name, email, and password are required');
        }
        if (!validator.isEmail(email)) {
          throw new Error('Invalid email format');
        }
      
        const existingUser = await User.find({ email });
        await User.findOne({ email }).then((user) => { 
            if (user) {
                throw new Error("User already exists with this email");
            }
        })
        // Create new user
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } : IUser = req.body;
        // Check if user exists
        if(!email || !password) {
        throw new Error('Email and password are required');
        }
        if (!validator.isEmail(email)) {
        throw new Error('Invalid email format');
        }
    
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
    
        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid password');
        }
    
        // Generate access token
        const accessToken = user.generateAccessToken();
    
        res
            .cookie('accessToken', accessToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 1 days
            })
            .status(200).json({
                message: 'User logged in successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const logoutUser = async (req: Request, res: Response) => {
    try {
        if (!req.cookies.accessToken) {
            throw new Error('No user is logged in');
        }
        res
            .clearCookie('accessToken')
            .status(200)
            .json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const createArticle = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userInfo = req.user as JwtPayload; // Assuming req.user is set by auth middleware
        if (!userInfo || !userInfo.id) {
            throw new Error('User not authenticated');
        }
        const userId: JwtPayload = userInfo.id; // Assumes req.user is set by auth middleware
        const { title, description } = req.body;

        if (!title || !description) {
            throw new Error('Title and description are required');
        }

        // Step 1: Create the article (without versions initially)
        const article: IArticle = new Article({
            title,
            description,
            user: userId,
        });

        await article.save();

        // Step 2: Create the first version
        const version = new ArticleVersion({
            article: article._id,
            description,
        });

        await version.save();

        article.versions.push(version._id as Types.ObjectId);
        await article.save();

        // Step 4: Link article to user
        await User.findByIdAndUpdate(userId, {
            $push: { articles: article._id },
        });

        res.status(201).json({
        message: 'Article created successfully',
        articleId: article._id,
        });
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const listArticles = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userInfo = req.user as JwtPayload; // Assuming req.user is set by auth middleware
        if (!userInfo || !userInfo.id) {
            throw new Error('User not authenticated');
        }
        const userId: JwtPayload = userInfo.id; // Assumes req.user is set by auth middleware
        const articles = await Article.find({ user: userId }, { __v: 0, versions: 0, user: 0 }) 
            .sort({ createdAt: -1 }); // Sort by creation date, most recent first
        res.status(200).json({
            message: 'Articles retrieved successfully',
            articles: articles
        });
    }
    catch (error) {
        console.error('Error retrieving articles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const updateArticle = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>  => {
    try {
      const userInfo = req.user as JwtPayload; // Assuming req.user is set by auth middleware
      const userId = userInfo?.id;
    const articleId = req.params.id;
    const { title, description } = req.body;

    if (!userId) {
      return next(new CustomError('User not authenticated', 401));
    }

    if (!title && !description) {
      return next(new CustomError('At least one of title or description must be provided', 400));
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return next(new CustomError('Article not found', 404));
    }

    if (article.user.toString() !== userId) {
      return next(new CustomError('You do not have permission to update this article', 403));
    }

    // 💡 1. If description provided
    if (description) {
      const trimmedNewDescription = description.trim();
      const trimmedCurrentDescription = article.description.trim();

      // 🔁 Case 1: Same as current → no need to update
      if (trimmedNewDescription === trimmedCurrentDescription) {
          res.status(200).json({ message: 'No changes made to the article' });
          return;
      }

      // 🔍 Case 2: Check if already exists in older versions
      const duplicateVersion = await ArticleVersion.findOne({
        article: article._id,
        description: trimmedNewDescription,
      });

        if (duplicateVersion) {
          return next(new CustomError('This description already exists in an older version of the article', 400));
        }

      // ✅ Save current as new version
      const newVersion = new ArticleVersion({
        article: article._id,
        description: trimmedCurrentDescription,
        updatedAt: new Date(),
      });

      await newVersion.save();
      article.versions.push(newVersion._id as Types.ObjectId);

      // ✅ Update with new description
      article.description = trimmedNewDescription;
    }

    // 💡 Update title if provided
    if (title) {
      article.title = title.trim();
    }

    await article.save();

    res.status(200).json({
      message: 'Article updated successfully',
      articleId: article._id,
      title: article.title,
      description: article.description,
    });

  } catch (error: any) {
    console.error('Error updating article:', error);
    return next(new CustomError(error.message || 'Internal server error', 500));
  }
};

const listOlderVersions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userInfo = req.user as JwtPayload; // Assuming req.user is set by auth middleware
        if (!userInfo || !userInfo.id) {
            throw new Error('User not authenticated');
        }
        const articleId = req.params.id;
        const article = await Article.findById(articleId)
        if (!article) {
            return next(new CustomError('Article not found', 404));
        }
        const versions = await ArticleVersion.find({ article: article._id }).sort({ updatedAt: -1 }).skip(1);
        res.status(200).json({
            message: 'Older versions retrieved successfully',
            versions: versions
        })
    } catch (error) {
        return next(new CustomError('Internal server error', 500));
    }
}


export {
    registerUser,
    loginUser,
    logoutUser,
    createArticle,
    listArticles,
    updateArticle,
    listOlderVersions
};