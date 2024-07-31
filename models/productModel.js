const mongoose = require("mongoose"); // Erase if already required
const Schema = mongoose.Schema;

// Declare the Schema of the Mongo model
if (!mongoose.models.Product) {
  const productSchema = Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
      },
      description: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: String,
        required: true,
      },
      // color: [
      //   {
      //     hex: {
      //       type: String,
      //       required: true,
      //     },
      //     title: {
      //       type: String,
      //       required: true,
      //     },
      //   },
      // ],
      category: String,
      images: {
        type: [String]
      },
      video: {
        type: [String]
      },
      procedures: {
        type: [String],
      },
      available: {
        type: Boolean,
        default: true,
      },
    },
    { timestamps: true }
  );

  mongoose.model("Product", productSchema);
}

//Export the model
module.exports = mongoose.model("Product");
