import prisma from "../DB/db.config.js";

// * Fetch all comments
export const fetchComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        user: true,
        post: {
          include: {
            user: true,
          },
        },
      },
    });

    return res.json({ status: 200, data: comments });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// * Create comment
export const createComment = async (req, res) => {
  try {
    const { user_id, post_id, comment } = req.body;

    // increase the comment counter
    await prisma.post.update({
      where: { id: Number(post_id) },
      data: {
        comment_count: {
          increment: 1,
        },
      },
    });

    const newComment = await prisma.comment.create({
      data: {
        user_id: Number(user_id),
        post_id: Number(post_id),
        comment,
      },
    });

    return res.json({
      status: 200,
      data: newComment,
      msg: "Comment created successfully.",
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// * Show comment
export const showComment = async (req, res) => {
  try {
    const commentId = req.params.id;

    const comment = await prisma.comment.findFirst({
      where: { id: Number(commentId) },
    });

    if (!comment) {
      return res.json({ status: 404, message: "Comment not found" });
    }

    return res.json({ status: 200, data: comment });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// * Delete comment
export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;

    // pehle comment fetch karo taki post_id mil sake
    const comment = await prisma.comment.findUnique({
      where: { id: Number(commentId) },
    });

    if (!comment) {
      return res.json({ status: 404, message: "Comment not found" });
    }

    // decrement the comment counter
    await prisma.post.update({
      where: { id: comment.post_id },
      data: {
        comment_count: {
          decrement: 1,
        },
      },
    });

    // delete the comment
    await prisma.comment.delete({
      where: { id: Number(commentId) },
    });

    return res.json({ status: 200, msg: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};
