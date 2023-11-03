import PostModel from "../models/Post.js";

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "No tags found.",
    });
  }
};

export const getPopularTags = async (req, res) => {
  try {
    const popularTags = await PostModel.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const popularTagNames = popularTags.map((tagObj) => tagObj._id);
    res.json(popularTagNames);
  } catch (error) {
    console.error("Error fetching popular tags:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPostsByTag = async (req, res) => {
  try {
    const tag = req.params.tag;
    const posts = await PostModel.find({ tags: tag }).exec();
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts by tag:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAll = async (req, res) => {
  try {
    const sorting = req.query.sorting || "new";
    let sortCriteria = {};
    if (sorting === "new") {
      sortCriteria = { createdAt: -1 };
    } else if (sorting === "popular") {
      sortCriteria = { viewsCount: -1 };
    }

    const posts = await PostModel.find().populate("user").sort(sortCriteria).exec();
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "No posts found.",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await PostModel.findById(postId)
      .populate("user")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          model: "User",
        },
      });

    if (!post) {
      return res.status(404).json({ message: "The post is not found" });
    }

    if (!req.query.incrementView) {
      post.viewsCount++;
      await post.save();
    }

    post.commentsCount = post.comments.length;

    await post.save();

    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while fetching the post.",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findByIdAndDelete({ _id: postId })
      .then((doc) => res.json(doc))
      .catch((error) => res.status(404).json({ message: "Post deletion failed" }));
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "No posts found.",
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(","),
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Post creation failed.",
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;
    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.body.user,
        tags: req.body.tags.split(","),
      },
      { new: true }
    );
    res.json({
      success: true,
    });
  } catch (error) {
    console.log(err);
    res.status(500).json({
      message: "Post updating failed.",
    });
  }
};
