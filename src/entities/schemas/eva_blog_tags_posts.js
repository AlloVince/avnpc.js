export default DataTypes => ({
  columns: {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
      autoIncrement: true,
      comment: 'ID'
    },
    tagId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
      comment: 'TAG ID'
    },
    postId: {
      allowNull: false,
      type: DataTypes.INTEGER(10).UNSIGNED,
      comment: 'POST ID'
    }
  },
  table: {
    tableName: 'eva_blog_tags_posts',
    freezeTableName: true,
    indexes: [
      {
        name: 'tagId',
        unique: true,
        fields: ['tagId', 'postId']
      }
    ],
    timestamps: false
  }
});
