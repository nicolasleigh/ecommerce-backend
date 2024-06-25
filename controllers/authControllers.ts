import bcrypt from "bcrypt";
import adminModel from "../models/adminModel";
import sellerModel from "../models/sellerModel";
import { responseReturn } from "../utils/response";
import createToken from "../utils/tokenCreate";

class authControllers {
  admin_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await adminModel.findOne({ email }).select("+password");
      if (admin) {
        const matched = await bcrypt.compare(password, admin.password);
        if (matched) {
          const token = await createToken({
            id: admin._id,
            role: admin.role,
          });
          res.cookie("accessToken", token, { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
          responseReturn(res, 200, { token, message: "Login success." });
        } else {
          responseReturn(res, 404, { error: "Password wrong." });
        }
      } else {
        responseReturn(res, 404, { error: "Email not found." });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  seller_register = async (req, res) => {
    const { email, name, password } = req.body;
    try {
      const user = await sellerModel.findOne({ email });
      if (user) {
        responseReturn(res, 404, { error: "Email Already Exists!" });
      } else {
        const seller = await sellerModel.create({
          name,
          email,
          password: await bcrypt.hash(password, 10),
          method: "manually",
          shopInfo: {},
        });
        console.log(seller);
      }
    } catch (error) {
      console.log(error);
    }
  };

  getUser = async (req, res) => {
    const { id, role } = req;

    try {
      if (role === "admin") {
        const user = await adminModel.findById(id);
        responseReturn(req, 200, { userInfo: user });
      } else {
        console.log("Seller info");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
}

export default new authControllers();
