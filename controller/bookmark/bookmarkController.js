const BookMarkModel = require("../../models/bookmarks/bookmarkModel");

const bookmarkCollab = async (req, res) => {
  const { action, collab_id, user_id, timestamp } = req.body;

  const findUser = await BookMarkModel.findOne({ where: { user_id: user_id } });

  if (action === 0) {
    let UpdatedbookmarkArr = findUser.dataValues.bookmarks;

    let findIfBookmarkExists = UpdatedbookmarkArr.filter(
      (ele) => ele.collab_id === collab_id
    );

    if (findIfBookmarkExists.length === 0) {
      return res
        .status(200)
        .json({ message: "collab is not present in bookmarks", status: 200 });
    }

    let updateArr=UpdatedbookmarkArr.filter((ele) => ele.collab_id !== collab_id);

    await BookMarkModel.update(
      {
        bookmarks: updateArr,
      },
      { where: { user_id: user_id } }
    );

    return res.status(200).json({ message: "Bookmark removed", status: 200 });
  } else {
    let updatedArr = findUser.dataValues.bookmarks;

    updatedArr.push({
      collab_id: collab_id,
      timestamp: timestamp,
    });

    await BookMarkModel.update(
      {
        bookmarks: updatedArr,
      },
      {
        where: { user_id: user_id },
      }
    );

    return res.status(200).json({ message: "bookmark added", status: 200 });
  }
};

module.exports = { bookmarkCollab };
