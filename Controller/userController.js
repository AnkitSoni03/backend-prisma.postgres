import prisma from "../DB/db.config.js";

// * Fetch all users with post & comment count
export const fetchUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            post: true,
            comment: true,
          },
        },
      },
    });

    return res.json({ status: 200, data: users });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// * Create user
export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const findUser = await prisma.user.findUnique({
      where: { email },
    });

    if (findUser) {
      return res.json({
        status: 400,
        message: "Email Already Taken. Please use another email.",
      });
    }

    const newUser = await prisma.user.create({
      data: { name, email, password },
    });

    return res.json({ status: 200, data: newUser, msg: "User created." });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// * Show user
export const showUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await prisma.user.findFirst({
      where: { id: Number(userId) },
    });

    if (!user) {
      return res.json({ status: 404, message: "User not found" });
    }

    return res.json({ status: 200, data: user });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// * Update the user
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { name, email, password },
    });

    return res.json({
      status: 200,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// * Delete user
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    await prisma.user.delete({
      where: { id: Number(userId) },
    });

    return res.json({ status: 200, msg: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};
