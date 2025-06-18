// import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import PropTypes from "prop-types";
import InputPassword from "~/components/common/InputPassword";
import { useLogin } from "~/hooks/useLogin";
import { useState } from "react";
import { RotatingLines } from "react-loader-spinner";
import { useSignup } from "~/hooks/useSignup";
import { useNavigate } from "react-router-dom";
import { sendOTP } from "~/services/UserService";
import Notification from "~/components/common/Notification";

const LoginRegister_Model = ({
  isLoginOpen,
  setIsLoginOpen,
  isRegister,
  setIsRegister,
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullname, setFullname] = useState("");

  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otp, setOtp] = useState();

  const { login, isLoading: loginLoading } = useLogin();
  const { signup, isLoading: signupLoading } = useSignup();
  const [errorMessage, setErrorMessage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showLoginForm = () => {
    setIsRegister(false);
    setIsOtpOpen(false);
    resetInput();
    setErrorMessage(null);
  };
  const showRegisterForm = () => {
    setIsRegister(true);
    setIsOtpOpen(false);
    resetInput();
    setErrorMessage(null);
  };
  const closeForm = () => {
    setIsLoginOpen(false);
    setIsRegister(false);
    setIsOtpOpen(false);
    resetInput();
    setErrorMessage(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await login(email, password);

    // if (loginError) setErrorMessage(loginError)
    // else {
    //     setIsLoginOpen(false)
    //     setIsRegister(false)
    // }
    if (!res.success) setErrorMessage(res.error);
    else {
      setIsLoginOpen(false);
      setIsRegister(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setErrorMessage(null);

    if (password != confirmPassword) {
      setErrorMessage("Mật khẩu không trùng khớp");
      return;
    }

    const res = await signup(email, password, fullname, otp);

    if (!res.success) setErrorMessage(res.error);
    else {
      resetInput();
      setIsOtpOpen(false);
      setIsRegister(false);
      // setIsLoginOpen(true)
      setNotification({
        type: "success",
        message:
          "Bạn đã đăng kí tài khoản thành công. Vui lòng đăng nhập để sử dụng.",
      });
    }
  };

  const handleForgetPassword = () => {
    setIsLoginOpen(false);
    setIsRegister(false);
    navigate("/forget-password"); // Sau đó mới chuyển trang
  };

  const resetInput = () => {
    setPassword("");
    setConfirmPassword("");
    setEmail("");
    setFullname("");
    setOtp(null);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      setErrorMessage(null);

      const result = await sendOTP(email);
      if (result) {
        setIsOtpOpen(true);
        // setIsLoginOpen(false)
        setIsRegister(false);
      }
    } catch (error) {
      setErrorMessage(error.message || "Không thể gửi mã xác thực.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md animate-fadeIn">
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="text-lg font-semibold">
                {isRegister
                  ? "Tạo tài khoản mới"
                  : isOtpOpen
                  ? "Xác thực mã OTP"
                  : "Đăng nhập tài khoản"}
              </h4>
              <IconButton onClick={() => closeForm()}>
                <CloseIcon className="text-gray-600 hover:text-gray-800" />
              </IconButton>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {!isOtpOpen && (
                  <div>
                    <div className="flex justify-center space-x-4">
                      {/* <div className="w-10 h-10 flex items-center justify-center bg-gray-800 text-white rounded-full hover:bg-gray-900 transition">
                        <GitHubIcon />
                      </div> */}
                      <button
                        onClick={() => {
                          window.location.href =
                            "https://final-pbl-8czd.onrender.com/oauth2/authorization/google";
                        }}
                        className="w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                      >
                        <GoogleIcon />
                      </button>
                      <button
                        onClick={() => {
                          window.location.href =
                            "https://final-pbl-8czd.onrender.com/oauth2/authorization/facebook";
                        }}
                        className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                      >
                        <FacebookIcon />
                      </button>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-px bg-gray-300 w-16" />
                      <span className="text-gray-500">hoặc</span>
                      <div className="h-px bg-gray-300 w-16" />
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="text-red-500 text-center mb-4">
                    {errorMessage}
                  </div>
                )}

                {!isRegister && !isOtpOpen && (
                  <div className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <InputPassword
                      password={password}
                      setPassword={setPassword}
                    />
                    <div className="button-forget-password">
                      <button
                        onClick={handleForgetPassword}
                        className="text-blue-500 hover:underline"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                    <button
                      onClick={(e) => handleLogin(e)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition duration-300"
                    >
                      ĐĂNG NHẬP
                    </button>
                    {loginLoading && (
                      <div className="w-full flex justify-center">
                        <RotatingLines
                          visible={true}
                          height="40"
                          width="40"
                          strokeColor="#a8dadc"
                          strokeWidth="5"
                          animationDuration="0.5"
                          ariaLabel="rotating-lines-loading"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isRegister && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Fullname"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={(e) => handleSendOtp(e)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition duration-300"
                  >
                    XÁC THỰC
                  </button>

                  {loading && (
                    <div className="w-full flex justify-center">
                      <RotatingLines
                        visible={true}
                        height="40"
                        width="40"
                        strokeColor="#457b9d"
                        strokeWidth="5"
                        animationDuration="0.5"
                        ariaLabel="rotating-lines-loading"
                      />
                    </div>
                  )}
                </div>
              )}

              {isOtpOpen && (
                <div className="space-y-4">
                  <input
                    type="number"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Mã OTP"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <InputPassword
                    placeholder="Mật khẩu"
                    setPassword={setPassword}
                    password={password}
                  />
                  <InputPassword
                    placeholder="Nhập lại mật khẩu"
                    password={confirmPassword}
                    setPassword={setConfirmPassword}
                  />
                  <button
                    onClick={(e) => handleRegister(e)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition duration-300"
                  >
                    ĐĂNG KÝ
                  </button>
                  {signupLoading && (
                    <div className="w-full flex justify-center">
                      <RotatingLines
                        visible={true}
                        height="40"
                        width="40"
                        strokeColor="#457b9d"
                        strokeWidth="5"
                        animationDuration="0.5"
                        ariaLabel="rotating-lines-loading"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* {!isOtpOpen && ( */}
            <div className="p-4 border-t text-center">
              {!isRegister && !isOtpOpen ? (
                <span>
                  Bạn chưa có tài khoản?{" "}
                  <a
                    href="#"
                    onClick={showRegisterForm}
                    className="text-blue-500 hover:underline"
                  >
                    Đăng kí
                  </a>
                </span>
              ) : (
                <span>
                  Bạn đã có tài khoản?{" "}
                  <a
                    href="#"
                    onClick={showLoginForm}
                    className="text-blue-500 hover:underline"
                  >
                    Đăng nhập
                  </a>
                </span>
              )}
            </div>
            {/* )} */}
          </div>
        </div>
      )}

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          duration={3000}
        />
      )}
    </div>
  );
};

LoginRegister_Model.propTypes = {
  isLoginOpen: PropTypes.bool.isRequired,
  setIsLoginOpen: PropTypes.func.isRequired,
  isRegister: PropTypes.bool.isRequired,
  setIsRegister: PropTypes.func.isRequired,
};

export default LoginRegister_Model;
