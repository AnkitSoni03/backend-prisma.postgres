import prisma from "../DB/db.config.js";

// * Fetch all posts with pagination
export const fetchPosts = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;

    if (page <= 0) page = 1;
    if (limit <= 0 || limit > 100) limit = 10;

    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      skip: skip,
      take: limit,
      include: {
        comment: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { id: "desc" },
      where: {
        NOT: {
          title: { endsWith: "Blog" },
        },
      },
    });

    // total count for pagination
    const totalPosts = await prisma.post.count();
    const totalPages = Math.ceil(totalPosts / limit);

    return res.json({
      status: 200,
      data: posts,
      meta: { totalPages, currentPage: page, limit: limit },
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// * Create post
export const createPost = async (req, res) => {
  try {
    const { user_id, title, description } = req.body;

    const newPost = await prisma.post.create({
      data: {
        user_id: Number(user_id),
        title,
        description,
      },
    });

    return res.json({ status: 200, data: newPost, msg: "Post created." });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// * Show post
export const showPost = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await prisma.post.findFirst({
      where: { id: Number(postId) },
    });

    if (!post) {
      return res.json({ status: 404, message: "Post not found" });
    }

    return res.json({ status: 200, data: post });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// * Delete post
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    await prisma.post.delete({
      where: { id: Number(postId) },
    });

    return res.json({ status: 200, msg: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// * Search post
export const searchPost = async (req, res) => {
  try {
    const query = req.query.q;

    const posts = await prisma.post.findMany({
      where: {
        description: {
          search: query,
        },
      },
    });

    return res.json({ status: 200, data: posts });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};
