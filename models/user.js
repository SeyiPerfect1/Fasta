"use strict";
const { Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      User.hasOne(models.Wallet, { foreignKey: "user_id" });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Please enter your first name",
          },
        },
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: "Please enter your last name",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [1, 255],
          isEmail: true, // Use Sequelize's built-in email validation
        },
        lowercase: true, // Convert email to lowercase before saving
        trim: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [8, 255],
          is: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, // regular expression to enforce password complexity
        },
      },
      confirmation_code: {
        type: DataTypes.STRING,
        unique: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Pending",
        validate: {
          isIn: [["Pending", "Active"]],
        },
      },
      transaction_pin: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        // Define a pre-hook to hash the password before saving
        async beforeCreate(user) {
          try {
            const hashedPassword = await bcrypt.hash(
              user.password,
              +process.env.HASH_SALT
            );
            user.password = hashedPassword;
          } catch (error) {
            console.error("Error in before create hook:", error);
            throw error;
          }
        },
      },
    }
  );
  return User;
};
