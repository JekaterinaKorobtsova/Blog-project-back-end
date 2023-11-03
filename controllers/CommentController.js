import CommentModel from '../models/Comments.js';
import PostModel from '../models/Post.js';

export const createComment = async (req, res) => {
  try {
      const postId = req.params.id;

      const doc = new CommentModel({
          text: req.body.text,
          user: req.userId,
          post: postId, 
      });
      const comment = await doc.save();

      await PostModel.findByIdAndUpdate(
        postId,
        {
          $push: { comments: comment._id },
          $inc: { commentsCount: 1 }, 
        },
        { new: true }
      );

      res.json(comment);
  } catch (error) {
      console.log(error);
      res.status(500).json({
          message: 'Comment creation failed',
      });
  }
};


export const getAllComments = async (req, res) => {
    try {
      const comments = await CommentModel.find()
        .populate('user', 'fullName avatarUrl')
        .select('text user createdAt') 
        .exec();
  
      res.json(comments);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'No comments found',
      });
    }
  };

